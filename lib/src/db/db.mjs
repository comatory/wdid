import path from 'path'
import { cwd } from 'process'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { promises } from 'fs'

import { isDebug } from '../config/env.mjs'
import {
  createEntryTypesTable,
  seedEntryTypesTable,
  createEntriesTable,
  createAnswersTable,
} from './tables.mjs'
import { ENTRY_TYPES } from '../constants.mjs'
import { getDatabasePath, createDatabaseFile } from '../config/config.mjs'

/**
 * @typedef {import('../constants.mjs').EntryTypes} EntryTypes
 * @typedef {import('../constants.mjs').NewEntryType} NewEntryType
 * @typedef {import('../constants.mjs').RemindEntryType} RemindEntryType
 */

/**
 * obtained directly from database
 * @typedef {Object} RawEntry
 * @property {number} id
 * @property {string} value
 * @property {string} type
 * @property {Date} created_at
 * @property {?Date} updated_at
 *
 * deserialized entry entity
 * @typedef {Object} Entry
 * @property {number} id
 * @property {string} key
 * @property {(string|boolean)} value
 * @property {(NewEntryType|RemindEntryType)} type
 * @property {Date} createdAt
 * @property {?Date} updatedAt
 */

/**
 * @typedef {Object} WriteAnswersOptions
 * @property {(NewEntryType|RemindEntryType)} type
 * @property {Record<string, string>[]} answers
 */

/** 
 * Database function object
 * @typedef {Object} DBService
 * @property {() => void} initialize - initialize database singleton
 * @property {function(WriteAnswersOptions): Promise<void>} writeAnswers - write answers to database
 * @property {() => Promise<Array<Entry>>} readEntries - read all answers
 * @property {() => Promise<?Array<Entry>>} getTodaysAnswers - get answers for today
 * @property {() => void} close - close and reset database singleton
 */

if (isDebug()) {
  sqlite3.verbose()
}

/**
 * @private
 * @type {?sqlite3.Database}
 */
let dbSingleton = null

/**
 * Opens database connection
 * @private
 * @returns {Promise<sqlite3.Database>} database object
 */
const get = async () => {
  /* TODO: provide correct path */
  if (!dbSingleton) {
    const dbPath = await getDatabasePath()
    dbSingleton = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    attachListeners(dbSingleton)
  }
  return dbSingleton
}

/**
 * @private
 * @returns {Promise<void>} empty promise
 */
const initialize = async () => {
  await createDatabaseFile()
  const db = await get()

  await createEntryTypesTable(db)
  await seedEntryTypesTable(db)
  await createEntriesTable(db)
  await createAnswersTable(db)

  await close()
}

/**
 * @private
 * @param {WriteAnswersOptions} options
 * @returns {Promise<void>} empty promise
 */
const writeAnswers = async (options) => {
  const db = await get()
  const now = new Date()
  const { type, answers } = options
  const valuesWithoutEntryId = Object.keys(answers).map((key) => {
    if (typeof answers[key] === 'boolean') {
      return [ key, String(answers[key]) ]
    }

    return [ key, answers[key]]
  })

  const entryType = await db.get(`
    SELECT * FROM entry_types
    WHERE type = ?;
  `, type)

  const entry = await db.get(`
    INSERT INTO entries
    (created_at, type_id)
    VALUES ($created_at, $type_id)
    RETURNING *;
  `, {
    $created_at: now,
    $type_id: entryType.id,
  })

  const values = valuesWithoutEntryId.map((value) => [
    ...value,
    entry.id,
  ])

  await Promise.all(values.map((value) => (
    db.run(`
      INSERT INTO answers
      (key, value, entry_id) 
      VALUES ($0,  $1, $2);
    `, value)
  )))
}

/**
 * @private
 * @returns {Promise<Array<Entry>>} entries
 */
const readEntries = async () => {
  const db = await get()

  const rows = await db.all(`
    SELECT answers.id, answers.value, entry_types.type, entries.created_at
    FROM answers
    INNER JOIN entries ON entries.id = answers.entry_id
    INNER JOIN entry_types ON entry_types.id = entries.type_id
    WHERE entry_types.type = ?
    ORDER BY entries.created_at ASC
    ;
  `, ENTRY_TYPES.NEW
  )

  const transformedRows = rows.map((row) => ({
    ...row,
    'created_at': new Date(row['created_at']).toLocaleString(),
  }))

  return transformedRows
}

/**
 * get today's entry
 * @returns {Promise<?Array<Entry>>} entry
 */
const getTodaysAnswers = async () => {
  const db = await get()
  const now = new Date()
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  const type = await db.get(`
    SELECT * FROM entry_types
    WHERE type = ?;
  `, ENTRY_TYPES.NEW)

  if (!type) {
    return null
  }

  const rows = await db.all(`
    SELECT answers.*, entries.created_at, entries.updated_at FROM answers
    INNER JOIN entries ON answers.entry_id = entries.id
    WHERE entries.type_id = $type AND
    entries.created_at BETWEEN $today_start AND $today_end;
  `, {
    '$type': type.id,
    '$today_start': new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0, 0, 0
    ).getTime(),
    '$today_end': new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23, 59, 59
    ).getTime(),
  })

  if (rows.length === 0) {
    return null
  }

  return deserializeEntries(rows)
}

/**
 * deserialize answers
 * @private
 * @param {Array<RawEntry>} rows
 * @returns {Array<Entry>} deserialized entries
 */
const deserializeEntries = (rows) => {
  return rows.map((row) => ({
    id: row.id,
    key: row.key,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    value: containsBooleanValue(row.value)
      ? castToBoolean(row.value)
      : row.value,
    type: row.type === 'NEW' ? ENTRY_TYPES.NEW : ENTRY_TYPES.REMIND,
  }))
}

/**
 * check whether value is boolean string
 * @private
 * @param {string} value
 * @returns {boolean} true or false
 */
const containsBooleanValue = (value) => (
  value === 'true' || value === 'false'
)

/**
 * cast string to boolean
 * @private
 * @param {string} value
 * @returns {boolean} boolean value
 */
const castToBoolean = (value) => {
  return value === 'true'
}

/**
 * @private
 * @returns {Promise<void>} empty promise
 */
const close = async () => {
  const db = await get()
  removeListeners(db)
  
  await db.close()
  dbSingleton = null
}

/**
 * Add listeners to database
 * @private
 * @param {sqlite3.Database} db - database instance
 * @returns {Promise<void>} empty promise
 */
const attachListeners = (db) => {
  if (isDebug()) {
    db.on('profile', (sql, ms) => {
      console.info(sql)
      console.info(`Finished in ${ms}ms`)
    })
  }
}

/**
 * Remove listeners to database
 * @private
 * @param {sqlite3.Database} db - database instance
 * @returns {Promise<void>}
 */
const removeListeners = (db) => {
  /* TODO */
}

/** @type {DBService} */
export const dbService = {
  initialize,
  writeAnswers,
  readEntries,
  getTodaysAnswers,
  close,
}

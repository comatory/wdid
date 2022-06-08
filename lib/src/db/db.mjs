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
 * @typedef {Object} Entry
 * @property {number} id
 * @property {string} value
 * @property {(NewEntryType | RemindEntryType)} type
 * @property {Date} created_at
 * @property {?Date} updated_at
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
  close,
}

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
import { deserializeEntries } from '../entities.mjs'

/**
 * @typedef {import('../entities.mjs').Entry} Entry
 * @typedef {import('../constants.mjs').EntryTypes} EntryTypes
 * @typedef {import('../constants.mjs').NewEntryType} NewEntryType
 * @typedef {import('../constants.mjs').RemindEntryType} RemindEntryType
 */

/**
 * @typedef {Object} WriteAnswersOptions
 * @property {(NewEntryType|RemindEntryType)} type
 * @property {Record<string, string>[]} answers
 *
 * @typedef {Object} UpdateAnswersOptions
 * @property {(NewEntryType|RemindEntryType)} type
 * @property {Record<string, string>[]} answers
 * @property {number} entryId
 */

/** 
 * Database function object
 * @typedef {Object} DBService
 * @property {() => void} initialize - initialize database singleton
 * @property {function(WriteAnswersOptions): Promise<void>} writeAnswers - write answers to database
 * @property {() => Promise<Array<Entry>>} readEntries - read all answers
 * @property {() => Promise<?Array<Entry>>} getTodaysAnswers - get answers for today
 * @property {() => Promise<?Array<Entry>>} getTodaysReminders - get reminders for today
 * @property {function(UpdateAnswersOptions): Promise<void>} updateAnswers - update answers in database
 * @property {function(number): Promise<void>} removeAnswers - remove answers from database
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

  await db.run('BEGIN')

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

  return await db.run('COMMIT')
}

/**
 * @param {UpdateAnswersOptions} options
 * @returns {Promise<void>}
 */
const updateAnswers = async (options) => {
  const db = await get()
  const now = new Date()
  const {
    entryId,
    type,
    answers,
  } = options

  await db.run('BEGIN')

  const entryType = await db.get(`
    SELECT * FROM entry_types
    WHERE type = ?;
  `, type)
  const existingAnswers = await db.all(`
    SELECT * FROM answers
    WHERE entry_id = ?;
  `, entryId)

  const values = Object.keys(answers).reduce((list, key) => {
    const value = answers[key]
    const existingAnswer = existingAnswers.find((answer) => answer.key === key)

    if (!existingAnswer) {
      return list
    }

    return [
      ...list,
      {
        '$value': typeof value === 'boolean'
          ? String(value)
          : value,
        '$id': existingAnswer.id,
      }
    ]
  }, [])

  await Promise.all(values.map((value) => (
    db.run(`
      UPDATE answers
      SET value = $value
      WHERE id = $id;
    `, value)
  )))

  await db.run(`
    UPDATE entries
    SET updated_at = $updated_at
    WHERE id = $id;
  `, {
    '$updated_at': now,
    '$id': entryId,
  })

  const answersToRemove = existingAnswers.filter((answer) => (
    !Object.keys(answers).includes(answer.key)
  ))
  const existingAnswerKeys = existingAnswers.map((answer) => answer.key)
  const answersToAdd = Object.keys(answers).reduce((list, key) => {
    const alreadyExists = existingAnswerKeys.includes(key)

    if (alreadyExists) {
      return list
    }

    return [
      ...list,
      {
        key,
        value: answers[key],
      }
    ]
  }, [])

  if (answersToRemove.length > 0) {
    await Promise.all(answersToRemove.map((answer) => (
      db.run(`DELETE FROM answers WHERE answers.id = ?`, answer.id)
    )))
  }

  if (answersToAdd.length > 0) {
    await Promise.all(answersToAdd.map((answer) => (
      db.run(`
        INSERT INTO entries (id) VALUES ($id);
        INSERT INTO answers (key, value, entry_id)
        VALUES ($key, $value, $entry_id);
      `, {
          '$id': entryId,
          '$key': answer.key,
          '$value': answer.value,
          '$entry_id': entryId,
      })
    )))
  }

  return await db.run('COMMIT')
}

/**
 * @param {number} entryId - id of entry belonging to answers
 * @returns {Promise<void>}
 */
export const removeAnswers = async (entryId) => {
  const db = await get()

  await db.run('BEGIN;')

  await db.run('DELETE FROM answers WHERE entry_id = ?;', entryId)
  await db.run('DELETE FROM entries WHERE id = ?;', entryId)

  await db.run('COMMIT;')
}

/**
 * @private
 * @returns {Promise<Array<Entry>>} entries
 */
const readEntries = async () => {
  const db = await get()

  const rows = await db.all(`
    SELECT
      answers.id, answers.value, entry_types.type,
      entries.created_at, entries.updated_at
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
    'updated_at': row['updated_at']
      ? new Date(row['updated_at']).toLocaleString()
      : null,
  }))

  return transformedRows
}

/**
 * get today's entry
 * @returns {Promise<?Array<Entry>>} entry
 */
const getTodaysAnswers = async () => {
  return getTodayAnswersByType(ENTRY_TYPES.NEW)
}

/**
 * get today's reminders
 * @returns {Promise<?Array<Entry>>} entry
 */
const getTodaysReminders = () => {
  return getTodayAnswersByType(ENTRY_TYPES.REMIND)
}

/**
 * get answers between start and end time
 * @private
 * @param {(NewEntryType|RemindEntryType)} type - type of answer
 * @returns {Promise<?Array<Entry>>} entry
 */
const getTodayAnswersByType = async (type) => {
  const db = await get()
  const now = new Date()
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  const entryType = await db.get(`
    SELECT * FROM entry_types
    WHERE type = ?;
  `, type)

  if (!entryType) {
    return null
  }

  const rows = await db.all(`
    SELECT answers.*, entries.created_at, entries.updated_at FROM answers
    INNER JOIN entries ON answers.entry_id = entries.id
    WHERE entries.type_id = $type AND
    entries.created_at BETWEEN $today_start AND $today_end;
  `, {
    '$type': entryType.id,
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
  updateAnswers,
  removeAnswers,
  readEntries,
  getTodaysAnswers,
  getTodaysReminders,
  close,
}

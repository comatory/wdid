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
  createEntriesGroupedViewByCreatedAt,
} from './tables.mjs'
import { ENTRY_TYPES } from '../constants.mjs'
import { getDatabasePath, createDatabaseFile } from '../config/config.mjs'
import { deserializeEntry, deserializeEntries } from '../entities.mjs'

/**
 * @typedef {import('../entities.mjs').Entry} Entry
 * @typedef {import('../constants.mjs').EntryTypes} EntryTypes
 * @typedef {import('../constants.mjs').StandUpEntryType} StandUpEntryType
 * @typedef {import('../constants.mjs').RemindEntryType} RemindEntryType
 */

/**
 * @typedef {Object} WriteAnswersOptions
 * @property {(StandUpEntryType|RemindEntryType)} type
 * @property {Record<string, string>[]} answers
 *
 * @typedef {Object} UpdateAnswersOptions
 * @property {(StandUpEntryType|RemindEntryType)} type
 * @property {Record<string, string>[]} answers
 * @property {number} entryId
 */

/** 
 * @typedef {Object} ReadEntriesOptions
 * @property {boolean} includeReminders - should include reminders
 * @property {boolean} onlyReminders - should include reminders
 * @property {boolean} last - display last entry
 *
 * Database function object
 * @typedef {Object} DBService
 * @property {() => Promise<void>} initialize - initialize database singleton
 * @property {function(WriteAnswersOptions): Promise<void>} writeAnswers - write answers to database
 * @property {(ReadEntriesOptions) => Promise<Array<Entry>>} readEntries - read all answers
 * @property {() => Promise<?Entry>} getStandupEntry - get stand-up entry
 * @property {() => Promise<?Entry>} getStandupRemindersEntry - get stand-up reminders entry
 * @property {() => Promise<?Entry>} getPreviousWorkingDayStandupReminder - get stand-up reminder entry based on stand-up entry creation date
 * @property {function(UpdateAnswersOptions): Promise<void>} updateAnswers - update answers in database
 * @property {function(number): Promise<void>} removeEntry - remove entry and related answers from the database 
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
 * @returns {Promise<?string>} path to db file if it exists
 */
const initialize = async () => {
  const existingDatabaseFilePath = await createDatabaseFile()

  if (existingDatabaseFilePath) {
    return Promise.resolve(existingDatabaseFilePath)
  }

  // TODO - allow to run migrations

  const db = await get()

  await createEntryTypesTable(db)
  await seedEntryTypesTable(db)
  await createEntriesTable(db)
  await createAnswersTable(db)
  await createEntriesGroupedViewByCreatedAt(db)

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
        INSERT INTO answers (key, value, entry_id)
        VALUES ($key, $value, $entry_id);
      `, {
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
export const removeEntry = async (entryId) => {
  const db = await get()

  await db.run('BEGIN;')

  await db.run('DELETE FROM answers WHERE entry_id = ?;', entryId)
  await db.run('DELETE FROM entries WHERE id = ?;', entryId)

  await db.run('COMMIT;')
}

/**
 * get types for reading entries
 * @private
 * @param {boolean} onlyEntries
 * @param {boolean} onlyReminders
 * @param {boolean} includeReminders
 * @returns {Array<EntryTypes>} types
 */
const getReadEntrytypes = (onlyEntries, onlyReminders, includeReminders) => {
  if (onlyEntries) {
    return [ ENTRY_TYPES.STANDUP ]
  }

  if (onlyReminders) {
    return [ ENTRY_TYPES.REMIND ]
  }

  return [ ENTRY_TYPES.STANDUP, ENTRY_TYPES.REMIND ]
}

/**
 * @private
 * @param {ReadEntriesOptions} options
 * @returns {Promise<Array<Entry>>} entries
 */
const readEntries = async (options = {}) => {
  const {
    includeReminders,
    onlyReminders,
    last,
  } = options
  const db = await get()

  const statement = await db.prepare(
    last ? READ_LAST_ENTRIES_SQL : READ_ALL_ENTRIES_SQL,
    getReadEntrytypes(
      !includeReminders && !onlyReminders,
      onlyReminders,
      includeReminders,
    )
  )
  const rows = await statement.all()
  await statement.finalize()

  return deserializeEntries(rows)
}

/**
 * get today's entry
 * @returns {Promise<?Entry>} entry
 */
const getStandupEntry = async () => {
  return getTodayEntryByType(ENTRY_TYPES.STANDUP)
}

/**
 * get today's reminders
 * @returns {Promise<?Entry>} entry
 */
const getStandupRemindersEntry = () => {
  return getTodayEntryByType(ENTRY_TYPES.REMIND)
}

/**
 * get related standup-reminder based on
 * stand-up entry
 * @returns {Promise<?Entry>} entry
 */
export const getPreviousWorkingDayStandupReminder = async () => {
  const db = await get()
  const today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  today.setMilliseconds(0)
  const previousDay = new Date(today - 1)

  const entryType = await db.get(`
    SELECT * FROM entry_types
    WHERE type = ?;
  `, ENTRY_TYPES.REMIND)

  if (!entryType) {
    return null
  }

  const rows = await db.all(READ_ENTRY_SQL, {
    '$type': entryType.id,
    '$today_start': 0,
    '$today_end': previousDay.getTime(),
  })

  if (rows.length === 0) {
    return null
  }

  return deserializeEntry(rows)
}

/**
 * get entry object by type
 * @private
 * @param {(StandUpEntryType|RemindEntryType)} type - type of answer
 * @returns {Promise<?Entry>} entry
 */
const getTodayEntryByType = async (type) => {
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

  const rows = await db.all(READ_ENTRY_SQL, {
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

  return deserializeEntry(rows)
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

const READ_ALL_ENTRIES_SQL = `
SELECT
  answers.id, answers.value, answers.key, entry_types.type,
  entries.id as entry_id,
  entries.created_at, entries.updated_at
FROM answers
INNER JOIN entries ON entries.id = answers.entry_id
INNER JOIN entry_types ON entry_types.id = entries.type_id
WHERE entry_types.type IN (?, ?)
ORDER BY entries.created_at ASC;
`
const READ_LAST_ENTRIES_SQL = `
SELECT
  answers.id, answers.value, answers.key, entry_types.type,
  entries_grouped_by_type_id_created_at.id as entry_id,
  entries_grouped_by_type_id_created_at.created_at,
  entries_grouped_by_type_id_created_at.updated_at
FROM answers
INNER JOIN entries_grouped_by_type_id_created_at
  ON answers.entry_id = entries_grouped_by_type_id_created_at.id
INNER JOIN entry_types
  ON entry_types.id = entries_grouped_by_type_id_created_at.type_id
WHERE entry_types.type in (?, ?);
`
const READ_ENTRY_SQL = `
SELECT
  answers.id, answers.value, answers.key, entry_types.type,
  entries_grouped_by_type_id_created_at.id as entry_id,
  entries_grouped_by_type_id_created_at.created_at as created_at,
  entries_grouped_by_type_id_created_at.updated_at as updated_at
FROM answers
INNER JOIN entries_grouped_by_type_id_created_at
  ON answers.entry_id = entries_grouped_by_type_id_created_at.id
INNER JOIN entry_types
  ON entry_types.id = entries_grouped_by_type_id_created_at.type_id
WHERE entry_types.id = $type
AND created_at BETWEEN $today_start AND $today_end;
`

/** @type {DBService} */
export const dbService = {
  initialize,
  writeAnswers,
  updateAnswers,
  removeEntry,
  readEntries,
  getStandupEntry,
  getStandupRemindersEntry,
  getPreviousWorkingDayStandupReminder,
  close,
}

import path from 'path'
import { cwd } from 'process'
import sqlite3 from 'sqlite3'

import { isDebug } from './utils.mjs'

/** 
 * Database function object
 * @typedef {Object} DBService
 * @property {() => void} initialize - initialize database singleton
 * @property {function(Record<string, string>[]): Promise<void>} writeAnswers - write answers to database
 * @property {function(Record<string, string>[]): Promise<void>} writeSummary - write summaries to database
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
    dbSingleton = new sqlite3.Database(path.join(cwd(), 'db.sqlite'))
    attachListeners(dbSingleton)
  }
  return dbSingleton
}

/**
 * @private
 * @returns {Promise<void>} empty promise
 */
const initialize = async () => {
  const db = await get()

  await createAnswersTable(db)
  await createSummariesTable(db)

  await close()
}

/**
 * Create table for storing today standup answers
 * @private
 * @param {sqlite3.Database} db - database instance
 * @returns {Promise<void>} empty promise
 */
const createAnswersTable = (db) => {
  return db.exec(`
    CREATE TABLE answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NULL
    );
  `)
}

/**
 * Create table for storing today summaries
 * @private
 * @param {sqlite3.Database} db - database instance
 * @returns {Promise<void>} empty promise
 */
const createSummariesTable = (db) => {
  return db.exec(`
    CREATE TABLE summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NULL
    );
  `)
}

/**
 * @private
 * @param {Record<string, string>[]} answers
 * @returns {Promise<void>} empty promise
 */
const writeAnswers = async (answers) => {
  const db = await get()
  const now = new Date()
  const values = Object.keys(answers).map((key) => {
    if (typeof answers[key] === 'boolean') {
      return [ key, String(answers[key]), now ]
    }

    return [ key, answers[key], now]
  })

  const statement = await db.prepare(`
    INSERT INTO answers
    (key, value, created_at) 
    VALUES (?, ?, ?);
  `)

  return db.serialize(() => {
    for (const i in values) {
      statement.run(
        values[i][0],
        values[i][1],
        values[i][2],
      )
    }

    statement.finalize()
  })
}

/**
 * @private
 * @param {Record<string, string>[]} summaries
 * @returns {Promise<void>} empty promise
 */
const writeSummary = async (summaries) => {
  const db = await get()
  const now = new Date()
  const values = Object.keys(summaries).map((key) => {
    if (typeof summaries[key] === 'boolean') {
      return [ key, String(summaries[key]), now ]
    }

    return [ key, summaries[key], now]
  })

  const statement = await db.prepare(`
    INSERT INTO summaries
    (key, value, created_at) 
    VALUES (?, ?, ?);
  `)

  return db.serialize(() => {
    for (const i in values) {
      statement.run(
        values[i][0],
        values[i][1],
        values[i][2],
      )
    }

    statement.finalize()
  })
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
  writeSummary,
  close,
}

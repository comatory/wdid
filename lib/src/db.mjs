import path from 'path'
import { cwd } from 'process'
import sqlite3 from 'sqlite3'

import { isDebug } from './utils.mjs'

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
const getDB = async () => {
  /* TODO: provide correct path */
  if (!dbSingleton) {
    dbSingleton = new sqlite3.Database(path.join(cwd(), 'db.sqlite'))
    attachListeners(dbSingleton)
  }
  return dbSingleton
}

/** Initialize database and create tables 
 * @returns {Promise<void>} empty promise
 */
export const initialize = async () => {
  const db = await getDB()

  await createAnswersTable(db)

  await closeDB()
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
 * Write answers to database
 * @param {Record<string, string>[]} answers
 * @returns {Promise<void>} empty promise
 */
export const writeAnswers = async (answers) => {
  const db = await getDB()
  const now = new Date()
  const values = Object.keys(answers).reduce((list, key) => {
    if (typeof answers[key] === 'boolean') {
      return [ ...list, [ key, '', now ] ]
    }
      
    return [
      ...list,
      [ key, answers[key], now],
    ]
  }, [])

  return db.run(`
    INSERT INTO answers
    (key, value, created_at) 
    VALUES ($0, $1, $2);
    `,
    values
  )
}

/**
 * Close and reset database singleton
 * @returns {Promise<void>} empty promise
 */
export const closeDB = async () => {
  const db = await getDB()
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

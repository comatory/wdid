import { ENTRY_TYPES } from '../constants.mjs'

/**
 * Create table for storing types of entries
 * @private
 * @param {sqlite3.Database} db - database instance
 * @returns {Promise<void>} empty promise
 */
export const createEntryTypesTable = (db) => {
  return db.exec(`
    CREATE TABLE entry_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type VARCHAR(8) NOT NULL
    );
  `)
}

export const seedEntryTypesTable = async (db) => {
  const types = Object.values(ENTRY_TYPES)

  const statement = await db.prepare(`
    INSERT INTO entry_types
    (type) 
    VALUES (?);
  `)

  return db.serialize(() => {
    for (const i in types) {
      statement.run(types[i])
    }

    statement.finalize()
  })
}

/**
 * Create table for storing both type of entries
 * @private
 * @param {sqlite3.Database} db - database instance
 * @returns {Promise<void>} empty promise
 */
export const createEntriesTable = (db) => {
  return db.exec(`
    CREATE TABLE entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_id INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NULL,
      FOREIGN KEY (type_id)
        REFERENCES entry_types(id)
    );
  `)
}

/**
 * Create table for storing answers belonging to
 * an entry of specific type
 * @private
 * @param {sqlite3.Database} db - database instance
 * @returns {Promise<void>} empty promise
 */
export const createAnswersTable = (db) => {
  return db.exec(`
    CREATE TABLE answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      FOREIGN KEY (entry_id)
        REFERENCES entries (id)
    );
  `)
}

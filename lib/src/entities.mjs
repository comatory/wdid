import { ENTRY_TYPES } from './constants.mjs'

/**
 * @typedef {import('../constants.mjs').NewEntryType} NewEntryType
 * @typedef {import('../constants.mjs').RemindEntryType} RemindEntryType
 * @typedef {import('./constants.mjs').ModificationActionTypes} ModificationActionTypes
 *
 * obtained directly from database
 * @typedef {Object} RawEntry
 * @property {number} id
 * @property {string} key
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
 *
 * question descriptor
 * @typedef {Object} QuestionDesc
 * @property {string} message - value of the question
 * @property {string} name - ID for the question
 * @property {?string} default - default value of the question
 *
 * choices descriptor
 * @typedef {Object} ChoiceDesc
 * @property {string} key - keyboard for the choice
 * @property {string} message - value of the choice
 * @property {string} name - ID for the choice
 *
 * Choice modification descriptor
 * @typedef {Object} ModificationDesc
 * @property {keyof typeof ModificationActionTypes} action
 */

/**
 * deserialize answers
 * @param {Array<RawEntry>} rows
 * @returns {Array<Entry>} deserialized entries
 */
export const deserializeEntries = (rows) => {
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

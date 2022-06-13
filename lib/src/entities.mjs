import { ENTRY_TYPES } from './constants.mjs'

/**
 * @typedef {import('../constants.mjs').StandUpEntryType} StandUpEntryType
 * @typedef {import('../constants.mjs').RemindEntryType} RemindEntryType
 * @typedef {import('./constants.mjs').ModificationActionTypes} ModificationActionTypes
 *
 * obtained directly from database
 * @typedef {Object} RawEntryAnswerRow
 * @property {number} id
 * @property {number} entry_id
 * @property {string} key
 * @property {string} value
 * @property {string} type
 * @property {Date} created_at
 * @property {?Date} updated_at
 *
 * deserialized answer entity
 * @typedef {Object} Answer
 * @property {number} id
 * @property {string} key
 * @property {(string|boolean)} value
 *
 * deserialized entry entity
 * @typedef {Object} Entry
 * @property {number} id
 * @property {(StandUpEntryType|RemindEntryType)} type
 * @property {Date} createdAt
 * @property {?Date} updatedAt
 * @property {Array<Answer>} answers
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
 * @param {Array<RawEntryAnswerRow>} rows
 * @returns {Entry} deserialized entries
 */
export const deserializeEntries = (rows) => {
  if (rows.length === 0) {
    return []
  }

  const entry = createEntry(rows[0])

  const answers = rows.map((row) => createAnswer(row))

  return {
    ...entry,
    answers,
  }
}

/**
 * create entry object
 * @private
 * @param {RawEntryAnswerRow} firstRow
 * @returns {Entry} entry with empty answers array
 */
const createEntry = (firstRow) => ({
  id: firstRow['entry_id'],
  type: firstRow.type === 'STANDUP'
    ? ENTRY_TYPES.STANDUP
    : ENTRY_TYPES.REMIND,
    createdAt: new Date(firstRow['created_at']),
    updatedAt: firstRow['updated_at']
      ? new Date(firstRow['updated_at'])
      : null,
})

/**
 * create answer object
 * @private
 * @param {RawEntryAnswerRow} row
 * @returns {Answer} answer
 */
const createAnswer = (row) => ({
  id: row['id'],
  key: row['key'],
  value: containsBooleanValue(row['value'])
    ? castToBoolean(row['value'])
    : row['value'],
})

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

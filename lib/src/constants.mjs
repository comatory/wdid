/**
 * Types of entry
 * NEW - today's entry
 * REMIND - summarize day's work to be reminded on
 *          next day
 *
 * @typedef {NEW} NewEntryType
 * @typedef {REMIND} RemindEntryType
 * 
 * @typedef {Object} EntryTypes
 * @property {NewEntryType} NEW
 * @property {RemindEntryType} REMIND
 */

/** @type {NewEntryType} */
export const NEW_ENTRY_TYPE = 'NEW'
/** @type {RemindEntryType} */
export const REMIND_ENTRY_TYPE = 'REMIND'


/** 
 * @type {EntryTypes}
 */
export const ENTRY_TYPES = {
  [NEW_ENTRY_TYPE]: NEW_ENTRY_TYPE,
  [REMIND_ENTRY_TYPE]: REMIND_ENTRY_TYPE,
}

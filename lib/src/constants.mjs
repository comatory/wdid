/**
 * Types of entry
 * STANDUP - stand-up entry
 * REMIND - stand-up reminder entry
 *
 * @typedef {STANDUP} StandUpEntryType
 * @typedef {REMIND} RemindEntryType
 * 
 * @typedef {Object} EntryTypes
 * @property {StandUpEntryType} STANDUP
 * @property {RemindEntryType} REMIND
 *
 * @typedef {ABORT_ACTION} AbortActionType
 * @typedef {EDIT_ACTION} EditActionType
 * @typedef {DELETE_ACTION} DeleteActionType
 *
 * @typedef {Object} ModificationActionTypes
 * @property {AbortActionType} ABORT
 * @property {EditActionType} EDIT
 * @property {DeleteActionType} DELETE
 */

/** @type {StandUpEntryType} */
export const STANDUP_ENTRY_TYPE = 'STANDUP'
/** @type {RemindEntryType} */
export const REMIND_ENTRY_TYPE = 'REMIND'

/** @type {AbortActionType} */
export const ABORT_ACTION_TYPE = 'ABORT'
/** @type {EditActionType} */
export const EDIT_ACTION_TYPE = 'EDIT'
/** @type {DeleteActionType} */
export const DELETE_ACTION_TYPE = 'DELETE'

/** 
 * @type {EntryTypes}
 */
export const ENTRY_TYPES = {
  [STANDUP_ENTRY_TYPE]: STANDUP_ENTRY_TYPE,
  [REMIND_ENTRY_TYPE]: REMIND_ENTRY_TYPE,
}

/** @type {ModificationActionTypes} */
export const MODIFICATION_ACTION_TYPES = {
  [ABORT_ACTION_TYPE]: ABORT_ACTION_TYPE,
  [EDIT_ACTION_TYPE]: EDIT_ACTION_TYPE,
  [DELETE_ACTION_TYPE]: DELETE_ACTION_TYPE,
}

/**
 * @typedef {import('./entities.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('./entities.mjs').ChoiceDesc} ChoiceDesc
 *
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

const STANDUP_QUESTION_1 = 'STANDUP_QUESTION_1'
const STANDUP_QUESTION_2 = 'STANDUP_QUESTION_2'
const STANDUP_QUESTION_3 = 'STANDUP_QUESTION_3'
const STANDUP_QUESTION_OPTIONAL_1 = 'STANDUP_QUESTION_OPTIONAL_1'
const STANDUP_QUESTION_1_MESSAGE = 'What did you do on previous working day?'
const STANDUP_QUESTION_2_MESSAGE = 'What will you do today?'
const STANDUP_QUESTION_3_MESSAGE = 'Is there anything blocking you today?'
const STANDUP_QUESTION_OPTIONAL_1_MESSAGE = 'What is it?'

const REMINDER_QUESTION_1 = 'REMINDER_QUESTION_1'
const REMINDER_QUESTION_2 = 'REMINDER_QUESTION_2'
const REMINDER_QUESTION_3 = 'REMINDER_QUESTION_3'
const REMINDER_QUESTION_OPTIONAL_1 = 'REMINDER_QUESTION_OPTIONAL_1'
const REMINDER_QUESTION_1_MESSAGE = 'What did you do today?'
const REMINDER_QUESTION_2_MESSAGE = 'What will you work on next working day?'
const REMINDER_QUESTION_3_MESSAGE = 'Were there any blockers today?'
const REMINDER_QUESTION_OPTIONAL_1_MESSAGE = 'What were they?'

export const QUESTION_MESSAGES = {
  [STANDUP_QUESTION_1]: STANDUP_QUESTION_1_MESSAGE,
  [STANDUP_QUESTION_2]: STANDUP_QUESTION_2_MESSAGE,
  [STANDUP_QUESTION_3]: STANDUP_QUESTION_3_MESSAGE,
  [STANDUP_QUESTION_OPTIONAL_1]: STANDUP_QUESTION_OPTIONAL_1_MESSAGE,
  [REMINDER_QUESTION_1]: REMINDER_QUESTION_1_MESSAGE,
  [REMINDER_QUESTION_2]: REMINDER_QUESTION_2_MESSAGE,
  [REMINDER_QUESTION_3]: REMINDER_QUESTION_3_MESSAGE,
  [REMINDER_QUESTION_OPTIONAL_1]: REMINDER_QUESTION_OPTIONAL_1_MESSAGE,
}

/** @type {Set<string>} */
export const ORDERED_STANDUP_QUESTIONS = new Set([
  STANDUP_QUESTION_1,
  STANDUP_QUESTION_2,
  STANDUP_QUESTION_3,
  STANDUP_QUESTION_OPTIONAL_1,
])

/** @type {Set<string>} */
export const ORDERED_REMINDER_QUESTIONS = new Set([
  REMINDER_QUESTION_1,
  REMINDER_QUESTION_2,
  REMINDER_QUESTION_3,
  REMINDER_QUESTION_OPTIONAL_1,
])

/** @type {QuestionDesc} */
export const standupQuestion1 = {
  name: STANDUP_QUESTION_1,
  message: STANDUP_QUESTION_1_MESSAGE,
}
/** @type {QuestionDesc} */
export const standupQuestion2 = {
  name: STANDUP_QUESTION_2,
  message: STANDUP_QUESTION_2_MESSAGE,
}
/** @type {QuestionDesc} */
export const standupQuestion3 = {
  name: STANDUP_QUESTION_3,
  message: STANDUP_QUESTION_3_MESSAGE,
}
/** @type {QuestionDesc} */
export const standupQuestionOptional1 = {
  name: STANDUP_QUESTION_OPTIONAL_1,
  message: STANDUP_QUESTION_OPTIONAL_1_MESSAGE,
}
/** @type {QuestionDesc} */
export const reminderQuestion1 = {
  name: REMINDER_QUESTION_1,
  message: REMINDER_QUESTION_1_MESSAGE,
}
/** @type {QuestionDesc} */
export const reminderQuestion2 = {
  name: REMINDER_QUESTION_2,
  message: REMINDER_QUESTION_2_MESSAGE,
}
/** @type {QuestionDesc} */
export const reminderQuestion3 = {
  name: REMINDER_QUESTION_3,
  message: REMINDER_QUESTION_3_MESSAGE,
}
/** @type {QuestionDesc} */
export const reminderQuestionOptional1 = {
  name: REMINDER_QUESTION_OPTIONAL_1,
  message: REMINDER_QUESTION_OPTIONAL_1_MESSAGE,
}
/** @type {ChoiceDesc} */
export const todayModificationChoice1 = {
  key: 'a',
  name: 'abort',
  value: MODIFICATION_ACTION_TYPES.ABORT,
}
/** @type {ChoiceDesc} */
export const todayModificationChoice2 = {
  key: 'e',
  name: 'edit',
  value: MODIFICATION_ACTION_TYPES.EDIT,
}
/** @type {ChoiceDesc} */
export const todayModificationChoice3 = {
  key: 'd',
  name: 'delete',
  value: MODIFICATION_ACTION_TYPES.DELETE,
}

/** @type {Array<ChoiceDesc>} */
export const modificationChoices = [
  todayModificationChoice1,
  todayModificationChoice2,
  todayModificationChoice3,
]

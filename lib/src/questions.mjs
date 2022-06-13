import { MODIFICATION_ACTION_TYPES } from './constants.mjs'

/**
 * @typedef {import('./entities.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('./entities.mjs').ChoiceDesc} ChoiceDesc
 */

const STANDUP_QUESTION_1 = 'STANDUP_QUESTION_1'
const STANDUP_QUESTION_2 = 'STANDUP_QUESTION_2'
const STANDUP_QUESTION_3 = 'STANDUP_QUESTION_3'
const STANDUP_QUESTION_OPTIONAL_1 = 'STANDUP_QUESTION_OPTIONAL_1'
const STANDUP_QUESTION_1_MESSAGE = 'What did you do yesterday?'
const STANDUP_QUESTION_2_MESSAGE = 'What will you do today?'
const STANDUP_QUESTION_3_MESSAGE = 'Is there anything blocking you today?'
const STANDUP_QUESTION_OPTIONAL_1_MESSAGE = 'What are they?'

const REMINDER_QUESTION_1 = 'REMINDER_QUESTION_1'
const REMINDER_QUESTION_2 = 'REMINDER_QUESTION_2'
const REMINDER_QUESTION_3 = 'REMINDER_QUESTION_3'
const REMINDER_QUESTION_OPTIONAL_1 = 'REMINDER_QUESTION_OPTIONAL_1'
const REMINDER_QUESTION_1_MESSAGE = 'What did you do today?'
const REMINDER_QUESTION_2_MESSAGE = 'What will you work on tomorrow?'
const REMINDER_QUESTION_3_MESSAGE = 'Were there any blockers today?'
const REMINDER_QUESTION_OPTIONAL_1_MESSAGE = 'What were they?'

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

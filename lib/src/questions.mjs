const TODAY_QUESTION_1 = 'TODAY_QUESTION_1'
const TODAY_QUESTION_2 = 'TODAY_QUESTION_2'
const TODAY_QUESTION_3 = 'TODAY_QUESTION_3'
const TODAY_QUESTION_OPTIONAL_1 = 'TODAY_QUESTION_OPTIONAL_1'
const TODAY_QUESTION_1_MESSAGE = 'What did you do yesterday?'
const TODAY_QUESTION_2_MESSAGE = 'What will you do today?'
const TODAY_QUESTION_3_MESSAGE = 'Is there anything blocking you today?'
const TODAY_QUESTION_OPTIONAL_1_MESSAGE = 'What are they?'
const SUMMARY_QUESTION_1 = 'SUMMARY_QUESTION_1'
const SUMMARY_QUESTION_2 = 'SUMMARY_QUESTION_2'
const SUMMARY_QUESTION_3 = 'SUMMARY_QUESTION_3'
const SUMMARY_QUESTION_OPTIONAL_1 = 'SUMMARY_QUESTION_OPTIONAL_1'
const SUMMARY_QUESTION_1_MESSAGE = 'What did you do today?'
const SUMMARY_QUESTION_2_MESSAGE = 'What will you work on tomorrow?'
const SUMMARY_QUESTION_3_MESSAGE = 'Were there any blockers today?'
const SUMMARY_QUESTION_OPTIONAL_1_MESSAGE = 'What were they?'

/**
 * Question descriptor
 * @typedef {Object} QuestionDesc
 * @property {string} message - value of the question
 * @property {string} name - ID for the question
 */

/**
 * @type {QuestionDesc}
 */
export const todayQuestion1 = {
  name: TODAY_QUESTION_1,
  message: TODAY_QUESTION_1_MESSAGE,
}
/**
 * @type {QuestionDesc}
 */
export const todayQuestion2 = {
  name: TODAY_QUESTION_2,
  message: TODAY_QUESTION_2_MESSAGE,
}
/**
 * @type {QuestionDesc}
 */
export const todayQuestion3 = {
  name: TODAY_QUESTION_3,
  message: TODAY_QUESTION_3_MESSAGE,
}
/**
 * @type {QuestionDesc}
 */
export const todayQuestionOptional1 = {
  name: TODAY_QUESTION_OPTIONAL_1,
  message: TODAY_QUESTION_OPTIONAL_1_MESSAGE,
}

/**
 * @type {QuestionDesc}
 */
export const summaryQuestion1 = {
  name: SUMMARY_QUESTION_1,
  message: SUMMARY_QUESTION_1_MESSAGE,
}
/**
 * @type {QuestionDesc}
 */
export const summaryQuestion2 = {
  name: SUMMARY_QUESTION_2,
  message: SUMMARY_QUESTION_2_MESSAGE,
}
/**
 * @type {QuestionDesc}
 */
export const summaryQuestion3 = {
  name: SUMMARY_QUESTION_3,
  message: SUMMARY_QUESTION_3_MESSAGE,
}
/**
 * @type {QuestionDesc}
 */
export const summaryQuestionOptional1 = {
  name: SUMMARY_QUESTION_OPTIONAL_1,
  message: SUMMARY_QUESTION_OPTIONAL_1_MESSAGE,
}

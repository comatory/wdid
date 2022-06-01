const TODAY_QUESTION_1 = 'TODAY_QUESTION_1'
const TODAY_QUESTION_2 = 'TODAY_QUESTION_2'
const TODAY_QUESTION_3 = 'TODAY_QUESTION_3'
const TODAY_QUESTION_OPTIONAL_1 = 'TODAY_QUESTION_3'
const TODAY_QUESTION_1_MESSAGE = 'What did you do yesterday?'
const TODAY_QUESTION_2_MESSAGE = 'What will you do today?'
const TODAY_QUESTION_3_MESSAGE = 'Is there anything blocking you today?'
const TODAY_QUESTION_OPTIONAL_1_MESSAGE = 'What are they?'

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

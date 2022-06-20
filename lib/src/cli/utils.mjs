import inquirer from 'inquirer'
import chalk from 'chalk'

import { dbService } from '../db/db.mjs'
import {
  ORDERED_STANDUP_QUESTIONS,
  ORDERED_REMINDER_QUESTIONS,
  ENTRY_TYPES,
} from '../constants.mjs'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 * @typedef {import('../entities.mjs').Entry} Entry
 * @typedef {import('../entities.mjs').Answer} Answer
 * @typedef {import('../entities.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('../entities.mjs').ChoiceDesc} ChoiceDesc
 * @typedef {import('../entities.mjs').ModificationDesc} ModificationDesc
 * @typedef {import('../constants.mjs').StandUpEntryType} StandUpEntryType
 * @typedef {import('../constants.mjs').RemindEntryType} RemindEntryType
 */

/**
 * @typedef {Object} PrompForAnswersOptions
 * @property {Array<QuestionDesc>} initialQuestionPrompts - basic set of prompts
 * @property {QuestionDesc} optionalPrompt - optionalPrompt
 * @property {DBService} dbService - database service
 *
 * @typedef {Object} PrompForUpdatedAnswersOptions
 * @property {number} entryId
 * @property {Array<QuestionDesc>} initialQuestionPrompts - basic set of prompts
 * @property {QuestionDesc} optionalPrompt - optionalPrompt
 * @property {DBService} dbService - database service
 *
 */

/**
 * Provides DB service to command
 * @param {function(Object)} fn - callback
 * @returns {function(Object): function(Object, DBService): Promise<void>} function
 */
export const injectDbService = (fn) => (args) => fn(args, dbService)

/**
 * ask modification questions
 * @param {string} message - modification question message
 * @param {Array<ChoiceDesc>} choices - choices object
 * @returns {ModificationDesc} picked choice action
 */
export const askModifications = (message, choices) => {
  return inquirer.prompt({
    type: 'expand',
    message,
    name: 'action',
    choices,
  })
}

/**
 * prepares prompts with default values
 * @param {QuestionDesc} prompt - prompt to be transformed
 * @param {Array<Entry>} entries - stored entries
 * @returns {QuestionDesc} transformed prompt
 */
export const createPrefilledQuestionPrompt = (prompt, entries) => {
  const entry = entries.find((entry) => entry.key === prompt.name)

  return {
    ...prompt,
    default: entry?.value,
  }
}

/**
 * order answers by entry type
 * @param {(StandUpEntryType|RemindEntryType)} entryType
 * @param {Array<Answer>} answers
 * @returns {Array<Answer>} ordered answers
 */
export const orderEntryAnswers = (entryType, answers) => {
  switch (entryType) {
    case ENTRY_TYPES.REMIND:
      return orderReminderAnswers(answers)
    case ENTRY_TYPES.STANDUP:
    default:
      return orderStandupAnswers(answers)
  }
}

/**
 * order stand-up answers
 * @private
 * @param {Array<Answer>} answers
 * @returns {Array<Answer>} ordered answers
 */
const orderStandupAnswers = (answers) => {
  return orderAnswersByKey(answers, ORDERED_STANDUP_QUESTIONS)
}

/**
 * order stand-up reminder answers
 * @private
 * @param {Array<Answer>} answers
 * @returns {Array<Answer>} ordered answers
 */
const orderReminderAnswers = (answers) => {
  return orderAnswersByKey(answers, ORDERED_REMINDER_QUESTIONS)
}

/**
 * order any type of answer
 * @param {Array<Answer>} answers
 * @param {Set<string>} orderedKeys
 * @returns {Array<Answer>} ordered aorderedAnswersnswers
 */
const orderAnswersByKey = (answers, orderedKeys) => {
  return answers
    .reduce((orderedList, answer) => {
      const index = Array.from(orderedKeys).findIndex((key) => answer.key === key)
      return [
        ...orderedList.slice(0, index),
        answer,
        ...orderedList.slice(index + 1),
      ]
    }, new Array(answers.length))
    .filter((answer) => answer !== undefined)
}

/**
 * prepare warning logging
 * @type {import('chalk').yellow}
 */
export const info = chalk.yellow

/**
 * prepare success logging
 * @type {import('chalk').green}
 */
export const success = chalk.green

/**
 * prepare error logging
 * @type {import('chalk').red}
 */
export const error = chalk.red

/**
 * prepare main/emphasized logging
 * @type {import('chalk').bold}
 */
export const main = chalk.bold

/**
 * prepare secondary logging
 * @type {import('chalk').dim}
 */
export const secondary = chalk.underline

/**
 * prepare highlighted logging
 * @type {import('chalk').cyan}
 */
export const highlight = chalk.cyan

/**
 * prepare detail logging
 * @type {import('chalk').dim}
 */
export const detail = chalk.dim

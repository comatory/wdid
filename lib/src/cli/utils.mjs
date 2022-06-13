import inquirer from 'inquirer'
import chalk from 'chalk'

import { dbService } from '../db/db.mjs'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 * @typedef {import('../entities.mjs').Entry} Entry
 * @typedef {import('../entities.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('../entities.mjs').ChoiceDesc} ChoiceDesc
 * @typedef {import('../entities.mjs').ModificationDesc} ModificationDesc
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
 * prepare warning logging
 * @type {import('chalk').yellow}
 */
export const info = chalk.yellow

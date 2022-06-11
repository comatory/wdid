import inquirer from 'inquirer'

import { dbService } from '../db/db.mjs'

/**
 * @typedef {import('../entities.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('../entities.mjs').ChoiceDesc} ChoiceDesc
 * @typedef {import('../entities.mjs').ModificationDesc} ModificationDesc
 */

/**
 * Provides DB service to command
 * @param {function(Object)} fn - callback
 * @returns {function(Object): function(Object, DBService): Promise<void>} function
 */
export const injectDbService = (fn) => (args) => fn(args, dbService)

/**
 * Ask initial three questions and get their answers
 * @param {Array<QuestionDesc>} prompts - prompt descriptors with questions
 * @returns {Record<string, string>[]} answer object
 */
export const askQuestions = (prompts) => {
  return inquirer.prompt(prompts)
}

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

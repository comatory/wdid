import inquirer from 'inquirer'

import { dbService } from '../db/db.mjs'

/**
 * Provides DB service to command
 * @param {function(Object)} fn - callback
 * @returns {function(Object): function(Object, DBService): Promise<void>} function
 */
export const injectDbService = (fn) => (args) => fn(args, dbService)

/**
 * Ask initial three questions and get their answers
 * @param {QuestionDesc[]} prompts - prompt descriptors with questions
 * @returns {Record<string, string>[]} answer object
 */
export const askQuestions = (prompts) => {
  return inquirer.prompt(prompts)
}

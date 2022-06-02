import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import inquirer from 'inquirer'

import { configure } from './initialize.mjs'
import { dbService } from './db.mjs'
import {
  todayQuestion1,
  todayQuestion2,
  todayQuestion3,
  todayQuestionOptional1,
} from './questions.mjs'

/**
 * @typedef {import('./db.mjs').DBService} DBService
 */

/**
  * Creates CLI parser
  * @param {string[]} args - reference to arguments array (process.argv)
  * @returns {Object} parsed argument object
  */
export const constructParser = (args) => {
  return yargs(hideBin(args))
    .default('today')
    .command('today', 'record an entry', injectDbService(processTodayCommand))
    .command('init', 'initialize required data', injectDbService(configure))
    .command('summary', 'end of day entry')
    .command('list', 'show entries')
    .option('amend', {
      alias: 'a',
      type: 'string',
      description: 'fix last entry'
    })
    .argv
}

/**
 * Provides DB service to command
 * @private
 * @param {function(Object)} fn - callback
 * @returns {function(Object): function(Object, DBService): Promise<void>} function
 */
const injectDbService = (fn) => (args) => fn(args, dbService)

/**
 * Adds new entry for today
 * @private
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
const processTodayCommand = async (args, dbService) => {
  const initialAnswers = await askQuestions()

  if (initialAnswers[todayQuestion3.name]) {
    const question3DetailAnswer = await askQuestion3Details()

    await dbService.writeAnswers({ ...initialAnswers, ...question3DetailAnswer })
    await dbService.close()
  }

  await dbService.writeAnswers(initialAnswers)
  await dbService.close()
}

/**
 * Ask initial three questions and get their answers
 * @private
 * @returns {Record<string, string>[]} answer object
 */
const askQuestions = () => {
    return inquirer
      .prompt([
        {
          type: 'input',
          ...todayQuestion1,
        },
        {
          type: 'input',
          ...todayQuestion2,
        },
        {
          type: 'confirm',
          ...todayQuestion3,
        },
      ])
}

/**
 * Ask additional question
 * @private
 * @returns {Record<string, string>} answer object
 */
const askQuestion3Details = () => {
  return inquirer
    .prompt([
      {
        type: 'input',
        ...todayQuestionOptional1
      }
    ])
}

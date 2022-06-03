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
  summaryQuestion1,
  summaryQuestion2,
  summaryQuestion3,
  summaryQuestionOptional1,
} from './questions.mjs'

/**
 * @typedef {import('./db.mjs').DBService} DBService
 * @typedef {import('./questions.mjs').QuestionDesc} QuestionDesc
 */

const todayQuestionPrompts = [
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
]

const summaryQuestionPrompts = [
  {
    type: 'input',
    ...summaryQuestion1,
  },
  {
    type: 'input',
    ...summaryQuestion2,
  },
  {
    type: 'confirm',
    ...summaryQuestion3,
  },
]

/**
  * Creates CLI parser
  * @param {string[]} args - reference to arguments array (process.argv)
  * @returns {Object} parsed argument object
  */
export const constructParser = (args) => {
  return yargs(hideBin(args))
    .command('new', 'record today\'s entry', injectDbService(processNewCommand))
    .command('remind', 'summarize day\'s work to remind you next day', injectDbService(processRemindCommand))
    .command('init', 'initialize required data', injectDbService(configure))
    .command('log', 'show entries', injectDbService(processLogCommand))
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
const processNewCommand = async (args, dbService) => {
  const initialAnswers = await askQuestions(todayQuestionPrompts)

  if (initialAnswers[todayQuestion3.name]) {
    const question3DetailAnswer = await inquirer
      .prompt([
        {
          type: 'input',
          ...todayQuestionOptional1
        }
      ])

    await dbService.writeAnswers({ ...initialAnswers, ...question3DetailAnswer })
    await dbService.close()
    return
  }

  await dbService.writeAnswers(initialAnswers)
  await dbService.close()
}

/**
 * Summarize day's work to remind you next day
 * @private
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
const processRemindCommand = async (args, dbService) => {
  const initialAnswers = await askQuestions(summaryQuestionPrompts)

  if (initialAnswers[summaryQuestion3.name]) {
    const question3DetailAnswer = await inquirer
      .prompt([
        {
          type: 'input',
          ...summaryQuestionOptional1,
        }
      ])

    await dbService.writeSummary({ ...initialAnswers, ...question3DetailAnswer })
    await dbService.close()
    return
  }

  await dbService.writeSummary(initialAnswers)
  await dbService.close()
}

/**
 * Logs entries
 * @private
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
const processLogCommand = async (args, dbService) => {
  const entries = await dbService.readEntries()
  await dbService.close()

  if (!entries) {
    console.info('EMPTY')
    return
  }

  console.info(JSON.stringify(entries, null, 4))
}

/**
 * Ask initial three questions and get their answers
 * @private
 * @param {QuestionDesc[]} prompts - prompt descriptors with questions
 * @returns {Record<string, string>[]} answer object
 */
const askQuestions = (prompts) => {
  return inquirer.prompt(prompts)
}

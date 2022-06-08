import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import inquirer from 'inquirer'

import { configure } from './initialize.mjs'
import { dbService } from './db/db.mjs'
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
import { ENTRY_TYPES } from './constants.mjs'

/**
 * @typedef {import('./db/db.mjs').DBService} DBService
 * @typedef {import('./db/db.mjs').Entry} Entry
 * @typedef {import('./questions.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('./constants.mjs').EntryTypes} EntryTypes
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
    .command(
      'new',
      'record today\'s entry',
      (y) => y
        .option('amend', {
          alias: 'a',
          boolean: true,
          describe: 'Edit last entry',
        })
        .example('$0 new --amend', 'fix recorded entry'),
      injectDbService(processNewCommand)
    )
    .command(
      'remind',
      'summarize day\'s work to remind you next day',
      (y) => y
        .option('amend', {
          alias: 'a',
          boolean: true,
          describe: 'Edit last reminder',
        })
        .example('$0 remind --amend', 'fix recorded reminder'),
      injectDbService(processRemindCommand)
    )
    .command('init', 'initialize required data', injectDbService(configure))
    .command(
      'log',
      'show entries',
      (y) => y
        .option('pretty', {
          alias: 'p',
          boolean: true,
          default: true,
          describe: 'Pretty tabularized output',
        })
        .option('raw', {
          alias: 'x',
          boolean: true,
          describe: 'Output separated by newlines',
        })
        .option('last', {
          alias: 'l',
          boolean: true,
          describe: 'Show last entry',
        })
        .option('include-reminders', {
          alias: 'r',
          boolean: true,
          describe: 'Add reminders to output',
        })
        .option('only-reminders', {
          alias: 'R',
          boolean: true,
          describe: 'List reminders instead of entries',
        })
        .example('$0 log --include-reminders --last', 'will list last entry including the reminder belonging to that entry'),
      injectDbService(processLogCommand)
    )
    .demandCommand()
    .showHelpOnFail(true)
    .epilogue('GPL-3.0 or later license, Ondřej Synáček (2022)')
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

    await dbService.writeAnswers({
      type: ENTRY_TYPES.NEW,
      answers: { ...initialAnswers, ...question3DetailAnswer },
    })
    await dbService.close()
    return
  }

  await dbService.writeAnswers({
    type: ENTRY_TYPES.NEW,
    answers: initialAnswers,
  })
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

    await dbService.writeAnswers({
      type: ENTRY_TYPES.REMIND,
      answers: { ...initialAnswers, ...question3DetailAnswer },
    })
    await dbService.close()
    return
  }

  await dbService.writeAnswers({
    type: ENTRY_TYPES.REMIND,
    answers: initialAnswers,
  })
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

  console.table(formatEntries(entries))
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

/**
 * format entries into a table
 * @param {Array<Entry>} entries
 * @returns {Array<Object>} formatted entries
 */
const formatEntries = (entries) => {
  return entries.reduce((formattedList, entry) => [
    ...formattedList, {
      'ID': entry.id,
      'Answer': entry.value,
      'Created at': entry.created_at,
      'Updated at': entry.updated_at ?? 'N/A',
    },
  ], [])
}

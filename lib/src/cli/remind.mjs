import inquirer from 'inquirer'

import { askQuestions } from './utils.mjs'
import {
  summaryQuestion1,
  summaryQuestion2,
  summaryQuestion3,
  summaryQuestionOptional1,
} from '../questions.mjs'
import { ENTRY_TYPES } from '../constants.mjs'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 */

/**
 * Summarize day's work to remind you next day
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
export const processRemindCommand = async (args, dbService) => {
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


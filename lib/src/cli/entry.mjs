import { askQuestions } from './utils.mjs'
import {
  todayQuestion1,
  todayQuestion2,
  todayQuestion3,
  todayQuestionOptional1,
} from '../questions.mjs'
import { ENTRY_TYPES } from '../constants.mjs'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 */

/**
 * Adds new entry for today
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
export const processNewCommand = async (args, dbService) => {
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

import inquirer from 'inquirer'

import {
  todayQuestion1,
  todayQuestion2,
  todayQuestion3,
  todayQuestionOptional1,
} from './questions.mjs'
import { writeAnswers, closeDB } from './db.mjs'

/**
 * Adds new entry for today
 * @param {Object} args - flag arguments
 * @returns {void}
 */
export const createEntry = async (args) => {
  const initialAnswers = await askQuestions()

  if (initialAnswers[todayQuestion3.name]) {
    const question3DetailAnswer = await askQuestion3Details()

    await writeAnswers({ ...initialAnswers, ...question3DetailAnswer })
    await closeDB()
  }

  await writeAnswers(initialAnswers)
  await closeDB()
}

/**
 * Ask initial three questions and get their answers
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

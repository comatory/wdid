const inquirer = require('inquirer')

const {
  todayQuestion1,
  todayQuestion2,
  todayQuestion3,
  todayQuestionOptional1,
} = require('./questions')

/**
 * Adds new entry for today
 * @param {Object} args - flag arguments
 * @returns {void}
 */
const createEntry = async (args) => {
  const initialAnswers = await askQuestions()

  if (initialAnswers[todayQuestion3.name]) {
    const question3DetailAnswer = await askQuestion3Details()

    return { ...initialAnswers, ...question3DetailAnswer }
  }

  return initialAnswers
}

/**
 * Answer object where keys are question IDs
 * and values are the answers.
 * @typedef {Object} AnswerObject
 */

/**
 * Ask initial three questions and get their answers
 * @returns {AnswerObject[]} answer object
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

const askQuestion3Details = () => {
  return inquirer
    .prompt([
      {
        type: 'input',
        ...todayQuestionOptional1
      }
    ])
}

module.exports = {
  createEntry,
}

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
const createEntry = (args) => {
  askQuestions().then((answers) => {
    console.info(JSON.stringify(answers))

    if (answers[todayQuestion3.name]) {
      askQuestion3Details().then((answer) => console.info(JSON.stringify(answer)))
    }
  })
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
  return new Promise((resolve, reject) => {
    inquirer
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
      .then(resolve)
      .catch(reject)
  })
}

const askQuestion3Details = () => {
  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: 'input',
          ...todayQuestionOptional1
        }
      ])
      .then((answers) => resolve(answers?.[0] ?? null))
      .catch(reject)
  })
}

module.exports = {
  createEntry,
}

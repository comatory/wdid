import inquirer from 'inquirer'

import { askModifications } from './utils.mjs'
import {
  todayQuestion1,
  todayQuestion2,
  todayQuestion3,
  todayQuestionOptional1,
  todayModificationChoice1,
  todayModificationChoice2,
  todayModificationChoice3,
} from '../questions.mjs'
import { ENTRY_TYPES, MODIFICATION_ACTION_TYPES } from '../constants.mjs'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 * @typedef {import('../entities.mjs').Entry} Entry
 * @typedef {import('../entities.mjs').QuestionDesc} QuestionDesc
 */

/**
 * Adds new entry for today
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
export const processNewCommand = async (args, dbService) => {
  const todayAnswers = await dbService.getTodaysAnswers()

  if (todayAnswers) {
    const { action } = await askModifications(
      'You have already recorded your stand-up today.',
      modificationChoices,
    )

    if (action === MODIFICATION_ACTION_TYPES.ABORT) {
      process.exit(0)
    }

    return await promptForAnswers({
      initialQuestionPrompts: todayQuestionPrompts.map((prompt) => createPrefilledQuestionPrompt(prompt, todayAnswers)),
      optionalPrompt: createPrefilledQuestionPrompt(todayQuestionOptional1, todayAnswers),
      dbService,
    })
  }

  return await promptForAnswers({
    initialQuestionPrompts: todayQuestionPrompts,
    optionalPrompt: todayQuestionOptional1,
    dbService,
  })
}

/**
 * @typedef {Object} PrompForAnswersOptions
 * @property {Array<QuestionDesc>} initialQuestionPrompts - basic set of prompts
 * @property {QuestionDesc} optionalPrompt - optionalPrompt
 * @property {DBService} dbService - database service
 *
 * perform prompts
 * @private
 * @param {PrompForAnswersOptions} options
 * @returns {void}
 */
const promptForAnswers = async (options) => {
  const {
    initialQuestionPrompts,
    optionalPrompt,
    dbService,
  } = options

  const initialAnswers = await inquirer.prompt(initialQuestionPrompts)

  if (initialAnswers[todayQuestion3.name]) {
    const question3DetailAnswer = await inquirer
      .prompt([ optionalPrompt ])

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

const todayQuestionOptional1Prompt = {
  type: 'input',
  ...todayQuestionOptional1,
}

/**
 * prepares prompts with default values
 * @private
 * @param {QuestionDesc} prompt - prompt to be transformed
 * @param {Array<Entry>} entries - stored entries
 * @returns {QuestionDesc} transformed prompt
 */
const createPrefilledQuestionPrompt = (prompt, entries) => {
  const entry = entries.find((entry) => entry.key === prompt.name)

  return {
    ...prompt,
    default: entry?.value,
  }
}

const modificationChoices = [
  todayModificationChoice1,
  todayModificationChoice2,
  todayModificationChoice3,
]

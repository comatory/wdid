import inquirer from 'inquirer'

import { askModifications } from './utils.mjs'
import {
  standupQuestion1,
  standupQuestion2,
  standupQuestion3,
  standupQuestionOptional1,
  modificationChoices,
} from '../questions.mjs'
import { ENTRY_TYPES, MODIFICATION_ACTION_TYPES } from '../constants.mjs'
import { createPrefilledQuestionPrompt } from './utils.mjs'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 * @typedef {import('../entities.mjs').Entry} Entry
 * @typedef {import('../entities.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('./utils.mjs').PrompForAnswersOptions} PrompForAnswersOptions
 * @typedef {import('./utils.mjs').PrompForUpdatedAnswersOptions} PrompForUpdatedAnswersOptions
 */

/**
 * adds new stand-up
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
export const processNewCommand = async (args, dbService) => {
  const existingStandupAnswers = await dbService.getStandupAnswers()

  if (existingStandupAnswers) {
    const { action } = await askModifications(
      'You have already recorded your stand-up today.',
      modificationChoices,
    )

    if (action === MODIFICATION_ACTION_TYPES.ABORT) {
      process.exit(0)
    }

    if (action === MODIFICATION_ACTION_TYPES.DELETE) {
      await dbService.removeAnswers(existingStandupAnswers[0].entryId)
      process.exit(0)
    }

    return await promptForUpdatedAnswers({
      entryId: existingStandupAnswers[0].entryId,
      initialQuestionPrompts: standupQuestionPrompts.map((prompt) => createPrefilledQuestionPrompt(prompt, existingStandupAnswers)),
      optionalPrompt: createPrefilledQuestionPrompt(standupQuestionOptional1, existingStandupAnswers),
      dbService,
    })
  }

  return await promptForAnswers({
    initialQuestionPrompts: standupQuestionPrompts,
    optionalPrompt: standupQuestionOptional1,
    dbService,
  })
}

/**
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

  if (initialAnswers[standupQuestion3.name]) {
    const question3DetailAnswer = await inquirer
      .prompt([ optionalPrompt ])

    await dbService.writeAnswers({
      type: ENTRY_TYPES.STANDUP,
      answers: { ...initialAnswers, ...question3DetailAnswer },
    })
    await dbService.close()
    return
  }

  await dbService.writeAnswers({
    type: ENTRY_TYPES.STANDUP,
    answers: initialAnswers,
  })
  await dbService.close()
}

/**
 * perform updated prompts
 * @private
 * @param {PrompForUpdatedAnswersOptions} options
 * @returns {void}
 */
const promptForUpdatedAnswers = async (options) => {
  const {
    entryId,
    initialQuestionPrompts,
    optionalPrompt,
    dbService,
  } = options

  const initialAnswers = await inquirer.prompt(initialQuestionPrompts)

  if (initialAnswers[standupQuestion3.name]) {
    const question3DetailAnswer = await inquirer
      .prompt([ optionalPrompt ])

    await dbService.updateAnswers({
      entryId,
      type: ENTRY_TYPES.STANDUP,
      answers: { ...initialAnswers, ...question3DetailAnswer },
    })
    await dbService.close()
    return
  }

  await dbService.updateAnswers({
    entryId,
    type: ENTRY_TYPES.STANDUP,
    answers: initialAnswers,
  })
  await dbService.close()
}

const standupQuestionPrompts = [
  {
    type: 'input',
    ...standupQuestion1,
  },
  {
    type: 'input',
    ...standupQuestion2,
  },
  {
    type: 'confirm',
    ...standupQuestion3,
  },
]

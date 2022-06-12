import inquirer from 'inquirer'

import { askQuestions } from './utils.mjs'
import {
  summaryQuestion1,
  summaryQuestion2,
  summaryQuestion3,
  summaryQuestionOptional1,
  modificationChoices,
} from '../questions.mjs'
import { ENTRY_TYPES, MODIFICATION_ACTION_TYPES } from '../constants.mjs'
import { askModifications, createPrefilledQuestionPrompt } from './utils.mjs'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 * @typedef {import('./utils.mjs').PrompForAnswersOptions} PrompForAnswersOptions
 * @typedef {import('./utils.mjs').PrompForUpdatedAnswersOptions} PrompForUpdatedAnswersOptions
 */

/**
 * Summarize day's work to remind you next day
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
export const processRemindCommand = async (args, dbService) => {
  const todayReminders = await dbService.getTodaysReminders()

  if (todayReminders) {
    const { action } = await askModifications(
      'You have already recorded your stand-up reminders today.',
      modificationChoices,
    )

    if (action === MODIFICATION_ACTION_TYPES.ABORT) {
      process.exit(0)
    }

    if (action === MODIFICATION_ACTION_TYPES.DELETE) {
      await dbService.removeAnswers(todayReminders[0].entryId)
      process.exit(0)
    }

    return await promptForUpdatedAnswers({
      entryId: todayReminders[0].entryId,
      initialQuestionPrompts: summaryQuestionPrompts.map((prompt) => createPrefilledQuestionPrompt(prompt, todayReminders)),
      optionalPrompt: createPrefilledQuestionPrompt(summaryQuestionOptional1, todayReminders),
      dbService,
    })
  }

  return await promptForAnswers({
    initialQuestionPrompts: summaryQuestionPrompts,
    optionalPrompt: summaryQuestionOptional1,
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

  const initialAnswers = await askQuestions(initialQuestionPrompts)

  if (initialAnswers[summaryQuestion3.name]) {
    const question3DetailAnswer = await inquirer
      .prompt([ optionalPrompt ])

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

  if (initialAnswers[summaryQuestion3.name]) {
    const question3DetailAnswer = await inquirer
      .prompt([ optionalPrompt ])

    await dbService.updateAnswers({
      entryId,
      type: ENTRY_TYPES.REMIND,
      answers: { ...initialAnswers, ...question3DetailAnswer },
    })
    await dbService.close()
    return
  }

  await dbService.updateAnswers({
    entryId,
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


import inquirer from 'inquirer'

import {
  reminderQuestion1,
  reminderQuestion2,
  reminderQuestion3,
  reminderQuestionOptional1,
  modificationChoices,
} from '../constants.mjs'
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
  const existingStandupReminders = await dbService.getStandupReminders()

  if (existingStandupReminders) {
    const { action } = await askModifications(
      'You have already recorded your stand-up reminders today.',
      modificationChoices,
    )

    if (action === MODIFICATION_ACTION_TYPES.ABORT) {
      process.exit(0)
    }

    if (action === MODIFICATION_ACTION_TYPES.DELETE) {
      await dbService.removeEntry(existingStandupReminders[0].entryId)
      process.exit(0)
    }

    return await promptForUpdatedAnswers({
      entryId: existingStandupReminders[0].entryId,
      initialQuestionPrompts: reminderQuestionPrompts.map((prompt) => createPrefilledQuestionPrompt(prompt, existingStandupReminders)),
      optionalPrompt: createPrefilledQuestionPrompt(reminderQuestionOptional1, existingStandupReminders),
      dbService,
    })
  }

  return await promptForAnswers({
    initialQuestionPrompts: reminderQuestionPrompts,
    optionalPrompt: reminderQuestionOptional1,
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

  if (initialAnswers[reminderQuestion3.name]) {
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

  if (initialAnswers[reminderQuestion3.name]) {
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

const reminderQuestionPrompts = [
  {
    type: 'input',
    ...reminderQuestion1,
  },
  {
    type: 'input',
    ...reminderQuestion2,
  },
  {
    type: 'confirm',
    ...reminderQuestion3,
  },
]


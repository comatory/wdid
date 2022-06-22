import inquirer from 'inquirer'

import {
  askModifications,
  createPrefilledQuestionPrompt,
  info,
  main,
  success,
} from './utils.mjs'
import { prettyFormatEntry, printEntryDescriptor } from './log.mjs'
import {
  standupQuestion1,
  standupQuestion2,
  standupQuestion3,
  standupQuestionOptional1,
  modificationChoices,
  standupReminderMapping,
} from '../constants.mjs'
import { ENTRY_TYPES, MODIFICATION_ACTION_TYPES } from '../constants.mjs'
import { shouldUseReminders } from '../config/config.mjs'

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
  const existingStandupEntry = await dbService.getStandupEntry()
  const useReminders = await shouldUseReminders()
  const willAmend = args['amend']
  const previousReminderEntry = useReminders
    ? await dbService.getPreviousWorkingDayStandupReminder()
    : null

  if (existingStandupEntry) {
    const { action } = willAmend
      ? { action: MODIFICATION_ACTION_TYPES.EDIT }
      : await askModifications(
        'You have already recorded your stand-up today.',
        modificationChoices,
      )

    if (action === MODIFICATION_ACTION_TYPES.ABORT) {
      process.exit(0)
    }

    if (action === MODIFICATION_ACTION_TYPES.DELETE) {
      await dbService.removeEntry(existingStandupEntry.id)
      process.exit(0)
    }

    if (willAmend) {
      console.log(info(`Amending stand-up #${existingStandupEntry.id}`))
    }

    return await promptForUpdatedAnswers({
      entryId: existingStandupEntry.id,
      initialQuestionPrompts: standupQuestionPrompts,
      optionalPrompt: createPrefilledQuestionPrompt(
        standupQuestionOptional1,
        existingStandupEntry.answers
      ),
      existingStandupEntry,
      dbService,
    })
  }

  return await promptForAnswers({
    initialQuestionPrompts: standupQuestionPrompts,
    optionalPrompt: standupQuestionOptional1,
    reminder: previousReminderEntry ?? null,
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
    reminder,
    dbService,
  } = options

  if (reminder) {
    console.log(success(main('Reminder found!')))
  }

  if (reminder) {
    console.log(getStandupReminderAnswer(reminder, standupReminderMapping[standupQuestion1.name])?.value)
  }
  const initialAnswer1 = await inquirer.prompt(initialQuestionPrompts[standupQuestion1.name])

  if (reminder) {
    console.log(getStandupReminderAnswer(reminder, standupQuestion2.name)?.value)
  }
  const initialAnswer2 = await inquirer.prompt(initialQuestionPrompts[standupQuestion2.name])

  if (reminder) {
    console.log(getStandupReminderAnswer(reminder, standupQuestion3.name)?.value)
  }
  const initialAnswer3 = await inquirer.prompt(initialQuestionPrompts[standupQuestion3.name])

  const initialAnswers = {
    [standupQuestion1.name]: initialAnswer1,
    [standupQuestion2.name]: initialAnswer2,
    [standupQuestion3.name]: initialAnswer3,
  }

  if (initialAnswers[standupQuestion3.name]) {
    if (reminder) {
      console.log(getStandupReminderAnswer(reminder, standupQuestionOptional1.name)?.value)
    }
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
    existingStandupEntry,
    dbService,
  } = options

  const orderedInitialQuestionPrompts = getOrderedStandupQuestionPrompts(
    initialQuestionPrompts
  )
  const prefilledInitialQuestionPrompts = orderedInitialQuestionPrompts
    .map((prompt) => (
      createPrefilledQuestionPrompt(prompt, existingStandupEntry.answers)))

  const initialAnswers = await inquirer.prompt(prefilledInitialQuestionPrompts)

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

const standupQuestionPrompts = {
  [standupQuestion1.name]: {
    type: 'input',
    ...standupQuestion1,
  },
  [standupQuestion2.name]: {
    type: 'input',
    ...standupQuestion2,
  },
  [standupQuestion3.name]: {
    type: 'confirm',
    ...standupQuestion3,
  },
}

const getStandupReminderAnswer = (reminder, name) => (
  reminder.answers.find(({ key }) => key === name)
)

const getOrderedStandupQuestionPrompts = (prompts) => ([
  prompts[standupQuestion1.name],
  prompts[standupQuestion2.name],
  prompts[standupQuestion3.name],
])

import { highlight, info, main, secondary } from './utils.mjs'
import { QUESTION_MESSAGES } from '../constants.mjs'
import { containsBooleanValue } from '../entities.mjs'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 * @typedef {import('../db/db.mjs').Entry} Entry
 * @typedef {import('../constants.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('../constants.mjs').EntryTypes} EntryTypes
 *
 * @typedef {Object} FormattedEntryDesc
 * @property {string} answers
 * @property {string} title
 */

/**
 * log entries to output
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
export const processLogCommand = async (args, dbService) => {
  const raw = args['raw']
  const entries = await dbService.readEntries({
    includeReminders: args['include-reminders'],
    onlyReminders: args['only-reminders'],
    last: args['last'],
  })
  await dbService.close()

  if (!entries || entries.length === 0) {
    if (raw) {
      process.exit(0)
    }

    console.log(info('No entries available'))
    process.exit(0)
  }

  if (raw) {
    rawPrint(entries)
    process.exit(0)
  }

  prettyPrint(entries)
  process.exit(0)
}

/**
 * pretty output
 * @private
 * @param {Array<Entry>} entries
 * @returns {void}
 */
const prettyPrint = (entries) => {
  const descriptors = prettyFormatEntries(entries)

  descriptors.forEach((entryDesc) => {
    printEntryDescriptor(entryDesc)
    console.log('\n')
  })
}

/**
 * raw output
 * @private
 * @param {Array<Entry>} entries
 * @returns {void}
 */
const rawPrint = (entries) => {
  const descriptors = formatEntries(entries)

  descriptors.forEach((entryDesc) => {
    const { title, answers } = entryDesc
    console.log(title)
    console.log('')
    console.log(answers)
    console.log('\n')
  })
}

/**
 * pretty format entries into a table
 * @private
 * @param {Array<Entry>} entries
 * @returns {Array<FormattedEntryDesc>} formatted entries
 */
const prettyFormatEntries = (entries) => {
  return entries.reduce((logs, entry) => {
    return [
      ...logs,
      prettyFormatEntry(entry),
    ]
  }, [])
}

/**
 *
 * format entries into a table
 * @private
 * @param {Array<Entry>} entries
 * @returns {Array<FormattedEntryDesc>} formatted entries
 */
const formatEntries = (entries) => {
  return entries.reduce((logs, entry) => {
    return [
      ...logs,
      formatEntry(entry),
    ]
  }, [])
}

/** pretty format entry
 * @param {Entry} entry
 * @returns {FormattedEntryDesc} formatted entry
 */
export const prettyFormatEntry = (entry) => {
  const answers = entry.answers.reduce((list, answer) => ([
    ...list,
    `${secondary(QUESTION_MESSAGES[answer.key])}\n${highlight(formatValue(answer.value))}`
  ]), []).join('\n')

  const entryTitle = main(`${entry.type} #${entry.id}`)
  const title = [
    entryTitle,
    entry.createdAt.toLocaleDateString(),
    entry.updatedAt ? `[update @ ${entry.updatedAt.toLocaleString()}]` : '',
  ].join('\t')

  return {
    answers,
    title,
  }
}

/** format entry
 * @param {Entry} entry
 * @returns {FormattedEntryDesc} formatted entry
 */
export const formatEntry = (entry) => {
  const answers = entry.answers.reduce((list, answer) => ([
    ...list,
    `${answer.key};${formatValue(answer.value)}`,
  ]), []).join('\n')

  const title = [
    entry.type,
    entry.id,
    entry.createdAt.getTime(),
    entry.updatedAt?.getTime() ?? '',
  ].join(';')

  return {
    answers,
    title,
  }
}

/**
 * print out formatted entry descriptor
 * @param {FormattedEntryDesc} entryDescriptor
 * @returns {void}
 */
export const printEntryDescriptor = (entryDescriptor) => {
  const { answers, title } = entryDescriptor

  console.log(title)
  console.log(answers)
}

/**
 * format value for output
 * @param {(string|boolean)} value
 * @returns {string} stringified value
 */
const formatValue = (value) => {
  if (containsBooleanValue(value)) {
    return value ? 'Yes' : 'No'
  }
  return value
}

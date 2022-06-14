import { highlight, info, main, secondary } from './utils.mjs'
import { QUESTION_MESSAGES } from '../constants.mjs'
import { containsBooleanValue } from '../entities.mjs'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 * @typedef {import('../db/db.mjs').Entry} Entry
 * @typedef {import('../constants.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('../constants.mjs').EntryTypes} EntryTypes
 */

/**
 * log entries to output
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
export const processLogCommand = async (args, dbService) => {
  const entries = await dbService.readEntries({
    includeReminders: args['include-reminders'],
    onlyReminders: args['only-reminders'],
    last: args['last'],
  })
  await dbService.close()

  if (!entries || entries.length === 0) {
    console.log(info('No entries available'))
    return
  }

  const descriptors = formatEntries(entries)

  descriptors.forEach(({ title, answers }) => {
    console.log(title)
    console.log(answers)
  })
}

/**
 * @typedef {Object} FormattedEntryDesc
 * @property {string} answers
 * @property {string} title
 *
 * format entries into a table
 * @param {Array<Entry>} entries
 * @returns {Array<FormattedEntryDesc>} formatted entries
 */
const formatEntries = (entries) => {
  return entries.reduce((logs, entry) => {
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

    return [
      ...logs,
      {
        answers,
        title,
      },
    ]
  }, [])
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

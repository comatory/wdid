import { info, main } from './utils.mjs'
import Table from 'cli-table3'

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

  const { title, answersTable } = formatEntries(entries)
  console.log(title.toString())
  console.log(answersTable.toString())
}

/**
 * @typedef {Object} FormattedEntryDesc
 * @property {import('cli-table3')} answersTable
 * @property {string} title
 *
 * format entries into a table
 * @param {Entry} entry
 * @returns {FormattedEntryDesc} formatted entries
 */
const formatEntries = (entry) => {
  const answersTable = new Table({
    head: [ 'Key', 'Answer' ]
  })

  for (const index in entry.answers) {
    const answer = entry.answers[index]
    answersTable.push([
      answer.key,
      answer.value,
    ])
  }

  const entryTitle = main(`${entry.type} #${entry.id}`)
  const title = [
    entryTitle,
    entry.createdAt.toLocaleDateString(),
    entry.updatedAt ? `[update @ ${entry.updatedAt.toLocaleString()}]` : '',
  ].join('\t')

  return {
    answersTable,
    title,
  }
}

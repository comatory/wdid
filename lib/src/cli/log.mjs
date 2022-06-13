import { info } from './utils.mjs'
import Table from 'cli-table3'

/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 * @typedef {import('../db/db.mjs').Entry} Entry
 * @typedef {import('../questions.mjs').QuestionDesc} QuestionDesc
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

  const table = formatEntries(entries)
  console.log(table.toString())
}

/**
 * format entries into a table
 * @param {Array<Entry>} entries
 * @returns {Array<Object>} formatted entries
 */
const formatEntries = (entries) => {
  const table = new Table({
    head: [ 'Answer', 'Created at', 'Updated at' ]
  })

  for (const index in entries) {
    const entry = entries[index]
    table.push([
      entry.value,
      entry.created_at,
      entry.updated_at ?? 'N/A',
    ])
  }

  return table
}

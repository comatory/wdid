/**
 * @typedef {import('../db/db.mjs').DBService} DBService
 * @typedef {import('../db/db.mjs').Entry} Entry
 * @typedef {import('../questions.mjs').QuestionDesc} QuestionDesc
 * @typedef {import('../constants.mjs').EntryTypes} EntryTypes
 */

/**
 * Logs entries
 * @param {Object} args - flag arguments
 * @param {DBService} dbService - flag arguments
 * @returns {Promise<void>} empty promise
 */
export const processLogCommand = async (args, dbService) => {
  const entries = await dbService.readEntries({
    includeReminders: args['include-reminders'],
    onlyReminders: args['only-reminders'],
  })
  await dbService.close()

  if (!entries || entries.length === 0) {
    console.info('No entries available')
    return
  }

  console.table(formatEntries(entries))
}

/**
 * format entries into a table
 * @param {Array<Entry>} entries
 * @returns {Array<Object>} formatted entries
 */
const formatEntries = (entries) => {
  return entries.reduce((formattedList, entry) => [
    ...formattedList, {
      'ID': entry.id,
      'Answer': entry.value,
      'Created at': entry.created_at,
      'Updated at': entry.updated_at ?? 'N/A',
    },
  ], [])
}

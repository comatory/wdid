import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import { configure } from './initialize.mjs'
import { createEntry } from './create-entry.mjs'

/**
  * Creates CLI parser
  * @param {string[]} args - reference to arguments array (process.argv)
  * @returns {Object} parsed argument object
  */
export const constructParser = (args) => {
  return yargs(hideBin(args))
    .default('today')
    .command('today', 'record an entry', createEntry)
    .command('init', 'initialize required data', configure)
    .command('summary', 'end of day entry')
    .command('list', 'show entries')
    .option('amend', {
      alias: 'a',
      type: 'string',
      description: 'fix last entry'
    })
    .argv
}

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const { createEntry } = require('./create-entry')

/**
  * Creates CLI parser
  * @param {string[]} args - reference to arguments array (process.argv)
  * @returns {Object} parsed argument object
  */
const constructParser = (args) => {
  return yargs(hideBin(args))
    .default('today')
    .command('today', 'record an entry', createEntry)
    .command('summary', 'end of day entry')
    .command('list', 'show entries')
    .option('amend', {
      alias: 'a',
      type: 'string',
      description: 'fix last entry'
    })
    .argv
}

module.exports = {
  constructParser,
}

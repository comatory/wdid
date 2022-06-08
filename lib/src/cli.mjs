import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import inquirer from 'inquirer'

import { configure } from './initialize.mjs'
import { dbService } from './db/db.mjs'
import { processNewCommand } from './cli/entry.mjs'
import { processRemindCommand } from './cli/remind.mjs'
import { processLogCommand } from './cli/log.mjs'
import { injectDbService } from './cli/utils.mjs'
import { ENTRY_TYPES } from './constants.mjs'

/**
  * Creates CLI parser
  * @param {string[]} args - reference to arguments array (process.argv)
  * @returns {Object} parsed argument object
  */
export const constructParser = (args) => {
  return yargs(hideBin(args))
    .command(
      'new',
      'record today\'s entry',
      (y) => y
        .option('amend', {
          alias: 'a',
          boolean: true,
          describe: 'Edit last entry',
        })
        .example('$0 new --amend', 'fix recorded entry'),
      injectDbService(processNewCommand)
    )
    .command(
      'remind',
      'summarize day\'s work to remind you next day',
      (y) => y
        .option('amend', {
          alias: 'a',
          boolean: true,
          describe: 'Edit last reminder',
        })
        .example('$0 remind --amend', 'fix recorded reminder'),
      injectDbService(processRemindCommand)
    )
    .command('init', 'initialize required data', injectDbService(configure))
    .command(
      'log',
      'show entries',
      (y) => y
        .option('pretty', {
          alias: 'p',
          boolean: true,
          default: true,
          describe: 'Pretty tabularized output',
        })
        .option('raw', {
          alias: 'x',
          boolean: true,
          describe: 'Output separated by newlines',
        })
        .option('last', {
          alias: 'l',
          boolean: true,
          describe: 'Show last entry',
        })
        .option('include-reminders', {
          alias: 'r',
          boolean: true,
          describe: 'Add reminders to output',
        })
        .option('only-reminders', {
          alias: 'R',
          boolean: true,
          describe: 'List reminders instead of entries',
        })
        .example('$0 log --include-reminders --last', 'will list last entry including the reminder belonging to that entry'),
      injectDbService(processLogCommand)
    )
    .demandCommand()
    .showHelpOnFail(true)
    .epilogue('GPL-3.0 or later license, Ondřej Synáček (2022)')
    .argv
}

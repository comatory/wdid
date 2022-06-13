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
      'record today\'s stand-up',
      (y) => y
        .option('amend', {
          alias: 'a',
          boolean: true,
          describe: 'Edit last stand-up.',
        })
        .example('$0 new --amend', 'fix last stand-up'),
      injectDbService(processNewCommand)
    )
    .command(
      'remind',
      'create reminder for tomorrow\'s stand-up',
      (y) => y
        .option('amend', {
          alias: 'a',
          boolean: true,
          describe: 'Edit last reminder.',
        })
        .example('$0 remind --amend', 'fix last reminder'),
      injectDbService(processRemindCommand)
    )
    .command('init', 'configure wdid', injectDbService(configure))
    .command(
      'log',
      'show recorded entries',
      (y) => y
        .option('pretty', {
          alias: 'p',
          boolean: true,
          default: true,
          describe: 'Formatted output using tables.',
        })
        .option('raw', {
          alias: 'x',
          boolean: true,
          describe: 'Output entries separated by newline(s).',
        })
        .option('last', {
          alias: 'l',
          boolean: true,
          describe: 'Show last entry.',
        })
        .option('include-reminders', {
          alias: 'r',
          boolean: true,
          describe: 'Include stand-up reminder entries.',
        })
        .option('only-reminders', {
          alias: 'R',
          boolean: true,
          describe: 'Show only stand-up reminder entries.',
        })
        .example('$0 log --include-reminders --last', 'will list last stand-up including the last reminder'),
      injectDbService(processLogCommand)
    )
    .demandCommand()
    .showHelpOnFail(true)
    .epilogue('GPL-3.0 or later license, Ondřej Synáček (2022)')
    .argv
}

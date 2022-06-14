#!/usr/bin/env node
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import inquirer from 'inquirer'

import {
  processNewCommand,
  processRemindCommand,
  processInitCommand,
  processLogCommand,
} from '../lib/cli.mjs'

yargs(hideBin(process.argv))
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
    processNewCommand
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
    processRemindCommand
  )
  .command('init', 'configure wdid', processInitCommand)
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
    processLogCommand
  )
  .demandCommand()
  .showHelpOnFail(true)
  .epilogue('GPL-3.0 or later license, Ondřej Synáček (2022)')
  .argv

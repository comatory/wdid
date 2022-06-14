#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import {
  showStandupReminderNotification,
  showStandupNotification,
} from '../lib/cli.mjs'

yargs(hideBin(process.argv))
  .command(
    'standup',
    'stand-up notification',
    showStandupNotification,
  )
  .command(
    'reminder',
    'stand-up reminder notificaiton',
    showStandupReminderNotification,
  )
  .demandCommand()
  .showHelpOnFail(true)
  .argv

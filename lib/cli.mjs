import {
  showStandupReminderNotification,
  showStandupNotification,
} from './src/notification/index.mjs'
import { dbService } from './src/db/db.mjs'
import { injectDbService } from './src/cli/utils.mjs'
import { configure as configureFn } from './src/cli/initialize.mjs'
import { processNewCommand as newFn } from './src/cli/standup.mjs'
import { processRemindCommand as remindFn } from './src/cli/reminder.mjs'
import { processLogCommand as logFn } from './src/cli/log.mjs'

const processNewCommand = injectDbService(newFn)
const processRemindCommand = injectDbService(remindFn)
const processInitCommand = injectDbService(configureFn)
const processLogCommand = injectDbService(logFn)

export {
  showStandupNotification,
  showStandupReminderNotification,
  processNewCommand,
  processRemindCommand,
  processInitCommand,
  processLogCommand,
}

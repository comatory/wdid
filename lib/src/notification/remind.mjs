import process from 'process'

import { DEFAULT_NOTIFICATION_CONFIG } from './config.mjs'

/**
 * notify user's desktop it's time to write up
 * stand-up reminder
 * @param {import('node-notifier').NotificationCenter} notifier - notifier instance
 * @returns {void}
 */
export const notifyStandupReminder = (notifier) => {
  notifier.notify({
    ...DEFAULT_NOTIFICATION_CONFIG,
    title: 'WDID',
    subtitle: 'It\'s time to set up your stand-up reminder.',
    message: 'Run "wdid remind" in the console.',
  }, () => {
    process.stdout.write('Run "wdid remind".\n')
    process.exit(0)
  })
}

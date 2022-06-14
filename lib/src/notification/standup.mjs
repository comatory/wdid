import process from 'process'

import { DEFAULT_NOTIFICATION_CONFIG } from './config.mjs'

/**
 * notify user's desktop it's time to write up
 * stand-up reminder
 * @param {import('node-notifier').NotificationCenter} notifier - notifier instance
 * @returns {void}
 */
export const notifyStandup = (notifier) => {
  notifier.notify({
    ...DEFAULT_NOTIFICATION_CONFIG,
    title: 'WDID',
    subtitle: 'It\'s time to write down your stand-up.',
    message: 'Run "wdid new" in the console.',
  }, () => {
    process.stdout.write('Run "wdid new".\n')
    process.exit(0)
  })
}

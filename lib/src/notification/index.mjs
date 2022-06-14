import { NotificationCenter } from 'node-notifier'

import { notifyStandupReminder } from "./remind.mjs";
import { notifyStandup } from './standup.mjs'

/**
 * display notification for stand-up reminder
 */
export const showStandupReminderNotification = () => notifyStandupReminder(new NotificationCenter())

/**
 * display notification for stand-up
 */
export const showStandupNotification = () => notifyStandup(new NotificationCenter())

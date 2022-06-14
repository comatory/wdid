import inquirer from 'inquirer'

import { error, main, info, success } from './utils.mjs'
import { initializeConfig, setConfig } from '../config/config.mjs'

/**
 * @typedef {import('./db.mjs').DBService} DBService
 */

/**
 * configures application
 * @param {Object} args
 * @param {DBService} dbService - database service
 * @returns {Promise<void>} empty promise
 */
export const configure = async (args, dbService) => {
  try {
    const existingConfigPath = await initializeConfig()

    if (existingConfigPath) {
      console.log(info(`Config file found: ${existingConfigPath}`))
    }

    console.log(success('Config file initialized.'))

    const existingDatabaseFilePath = await dbService.initialize()

    if (existingDatabaseFilePath) {
      console.log(info(`Database file found: ${existingDatabaseFilePath}`))
    }

    console.log(success('Database initialized.'))

    const { USE_REMINDERS } = await inquirer.prompt([
      {
        name: 'USE_REMINDERS',
        type: 'confirm',
        message: 'Do you want to use stand-up reminders?',
        default: true,
      }
    ])

    await setConfig('remindersOn', USE_REMINDERS)

    console.log(success(main('OK')))
    process.exit(0)
  } catch (err) {
    console.log(error(err))
    process.exit(1)
  }
}

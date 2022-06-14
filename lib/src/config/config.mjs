import XDGAppPaths from 'xdg-app-paths'
import path from 'path'
import { promises } from 'fs'
import process from 'process'

import { getOverridenConfigurationFilePath } from './env.mjs'

/**
 * @typedef {Object} Configuration
 * @property {string} dbPath
 * @property {boolean} remindersOn
 * @property {string} entryCron
 * @property {string} reminderCron
 */

/**
 * @typedef {Object} InitialConfiguration
 * @property {string} dbPath
 * @property {boolean} remindersOn
 */

const defaultConfigurationDirectory = XDGAppPaths.config()
const defaultDataDirectory = XDGAppPaths.data()
const defaultConfigurationFileName = 'config.json'

const defaultConfigurationFilePath = path.join(
  defaultConfigurationDirectory,
  defaultConfigurationFileName,
)

const defaultDatabaseFilePath = path.join(
  defaultDataDirectory,
  'db.sqlite',
)

/** @type {Configuration} */
const CONFIGURATION_FILE_DEFAULTS = Object.freeze({
  dbPath: defaultDatabaseFilePath,
  remindersOn: true,
  entryCron: '* 8 * * 1-5',
  reminderCron: '* 17 * * 1-5',
})

/**
 * get path of configuration file
 * @returns {string} path
 */
export const getConfigurationFilePath = () => (
  getOverridenConfigurationFilePath() ?? defaultConfigurationFilePath)

/**
 * read and parse application configuration file
 * @private
 * @param {?string} configPath - path to config file
 * @returns {Promise<Configuration>} application configuration
 */
const readConfigurationFile = async () => {
  try {
    const configPath = getConfigurationFilePath()
    const contents = await promises.readFile(
      configPath,
      { encoding: 'utf8' }
    )
    return JSON.parse(contents)
  } catch (error) {
    throw new Error(`Unable to read configuration file. ${error.message}`)
  }
}

/**
 * setup default application configuration file
 * @param {?InitialConfiguration} - configuration options
 * @returns {Promise<?string>} - configuration file path if config alread exists
 */
export const initializeConfig = async (
  options,
) => {
  const configPath = getConfigurationFilePath()
  const configuration = {
    ...CONFIGURATION_FILE_DEFAULTS,
    dbPath: options?.dbPath ?? CONFIGURATION_FILE_DEFAULTS.dbPath,
    remindersOn: options?.remindersOn ?? CONFIGURATION_FILE_DEFAULTS.remindersOn,
  }

  try {
    const fileExists = await promises.stat(configPath)
    return Promise.resolve(configPath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Unable to initialize configuration file. ${error.message}`)
    }

    if (customConfigPath) {
      throw error
    }

    await writeConfiguration(configuration)
  }
}

export const setConfig = async (key, value) => {
  const configuration = await readConfigurationFile()
  const nextConfiguration = {
    ...configuration,
    [key]: value,
  }

  await writeConfiguration(nextConfiguration)
}

/**
 * write configuration file to disk
 * @private
 * @param {Configuration} configuration - application configuration
 * @returns {Promise<void>}
 */
const writeConfiguration = async (configuration) => {
  try {
    const configPath = getConfigurationFilePath()
    const configDirectory = path.parse(configPath).dir

    await promises.mkdir(configDirectory, { recursive: true })
    return await promises.writeFile(
      configPath,
      JSON.stringify(configuration),
      { flag: 'w+' }
    )
  } catch (error) {
    throw new Error(`Unable to create configuration file. ${error.message}`)
  }
}

/**
 * get path to database file
 * @returns {string}
 */
export const getDatabasePath = async () => {
  const configuration = await readConfigurationFile()
  return configuration.dbPath
}

/**
 * create database file
 * @returns {Promise<?string>} - path to db if it exists
 */
export const createDatabaseFile = async () => {
  const configuration = await readConfigurationFile()
  const { dbPath } = configuration
  const directoryPath = path.parse(dbPath).dir

  try {
    await promises.stat(dbPath)
    return Promise.resolve(dbPath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
    return writeDatabaseFile(directoryPath, dbPath)
  }
}

/**
 * write database file
 * @private
 * @param {string} directoryPath - path to database file directory
 * @param {string} filePath - path to database file
 * @returns {Promise<void>}
 */
const writeDatabaseFile = async (directoryPath, filePath) => {
  try {
    await promises.mkdir(directoryPath, { recursive: true })
    const file = await promises.open(filePath, 'w')
    return file.close()
  } catch (error) {
    throw new Error(`Unable to create database at ${directoryPath}. ${error. message}`)
  }
}

/**
 * should load stand-up reminder
 * @returns {Promise<boolean>} whether to use stand-up reminders
 */
export const shouldUseReminders = async () => {
  const configuration = await readConfigurationFile()

  return Boolean(configuration.remindersOn)
}

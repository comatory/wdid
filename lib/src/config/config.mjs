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
 * read and parse application configuration file
 * @private
 * @param {?string} configPath - path to config file
 * @returns {Promise<Configuration>} application configuration
 */
const readConfigurationFile = async (
  configPath = getOverridenConfigurationFilePath() ?? defaultConfigurationFilePath
) => {
  try {
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
 * @param {?string} configPath - path to config file
 * @param {?InitialConfiguration} - configuration options
 * @returns {Promise<void>}
 */
export const initializeConfig = async (
  customConfigPath,
  options,
) => {
  const configPath = customConfigPath ?? defaultConfigurationFilePath
  const configuration = {
    ...CONFIGURATION_FILE_DEFAULTS,
    dbPath: options?.dbPath ?? CONFIGURATION_FILE_DEFAULTS.dbPath,
    remindersOn: options?.remindersOn ?? CONFIGURATION_FILE_DEFAULTS.remindersOn,
  }

  try {
    const fileExists = await promises.stat(configPath)
    return Promise.resolve()
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Unable to initialize configuration file. ${error.message}`)
    }

    if (customConfigPath) {
      throw error
    }

    await writeConfiguration(configPath, configuration)
  }
}

/**
 * write configuration file to disk
 * @private
 * @param {string} configPath - path to config file
 * @param {Configuration} configuration - application configuration
 * @returns {Promise<void>}
 */
const writeConfiguration = async (configPath, configuration) => {
  const configDirectory = path.parse(configPath).dir
  try {
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
 * @returns {Promise<void>}
 */
export const createDatabaseFile = async () => {
  const configuration = await readConfigurationFile()
  const { dbPath } = configuration
  const pathDescriptor = path.parse(dbPath)
  const databaseDirectory = pathDescriptor.dir
  const databaseFile = `${pathDescriptor.name}.${pathDescriptor.ext}`

  try {
    await promises.stat(dbPath)
    return Promise.resolve()
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
    writeDatabaseFile(databaseDirectory, databaseFile)
  }
}

/**
 * write database file
 * @private
 * @param {string} directory - directory of database file
 * @param {string} file - database file
 * @returns {Promise<void>}
 */
const writeDatabaseFile = async (directory, file) => {
  try {
    await promises.mkdir(directory, { recursive: true })
    await promises.writeFile(file, 'w+')
  } catch (error) {
    throw new Error(`Unable to create database at ${directory}. ${error. message}`)
  }
}

import { initializeConfig } from './config/config.mjs'
import { getOverridenConfigurationFilePath } from './config/env.mjs'

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
  await initializeConfig(getOverridenConfigurationFilePath())
  await dbService.initialize()
}

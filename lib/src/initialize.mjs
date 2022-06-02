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
  await dbService.initialize()
}

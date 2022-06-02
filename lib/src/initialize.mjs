import { initialize } from './db.mjs'

/**
 * configures application
 * @returns {Promise<void>} empty promise
 */
export const configure = async () => {
  await initialize()
}

import process from 'process'

/**
 * retrieve configuration file path that is
 * overriden by env var
 * @returns {string|undefined}
 */
export const getOverridenConfigurationFilePath = () =>
  process.env.WDID_CONFIG_FILE_PATH

/** Check whether debugging is turned on
 * @returns {boolean} flag
 */
export const isDebug = () => process.env.DEBUG === '1'

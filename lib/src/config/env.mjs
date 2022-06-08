/**
 * retrieve configuration file path that is
 * overriden by env var
 * @returns {string|undefined}
 */
export const getOverridenConfigurationFilePath = () =>
  process.env.WDID_CONFIG_FILE_PATH

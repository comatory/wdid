import process from 'process'

/** Check whether debugging is turned on
 * @returns {boolean} flag
 */
export const isDebug = () => process.env.DEBUG === '1'

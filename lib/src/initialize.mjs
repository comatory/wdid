import { initialize } from './db.mjs'

export const configure = async () => {
  await initialize()
}

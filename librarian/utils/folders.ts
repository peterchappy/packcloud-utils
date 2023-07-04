import * as fs from 'fs'
import { log } from './logs';

export const writeDirectoryIfNotExits = (directoryPath: string): Promise<boolean> => {
  const promise = new Promise<boolean>((resolve, reject) => {
    if (!fs.existsSync(directoryPath)) {
      try {
        fs.mkdirSync(directoryPath);
        resolve(true)
      } catch (error) {
        log(`ERROR: creating directory ${directoryPath}`);
        log(`ERROR: ${error}`);
        reject(false)
      }
    } else {
      resolve(true)
    }
  })

  return promise
}
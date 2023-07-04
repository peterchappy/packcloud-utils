import * as fs from 'fs'
import * as path from 'path'
import * as R from 'ramda';
import { FileExtensionKind } from '../types';
import { log, verboseLog } from './logs';

export const isDirectory = (filePath: string): Promise<boolean> => {
  const promise = new Promise<boolean>((resolve, reject) => {
    fs.stat(filePath, async (error, stats) => {
      if (error) {
        verboseLog(`ERROR: getting stats for ${filePath}: ${error.message}`);
        reject(error)
      }

      resolve(stats.isDirectory())
    });
  })

  return promise
}

export const deleteFile = (filePath: string) => {
  const promise = new Promise<boolean>((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        log(`ERROR: ${err}`);
        reject();
      }
    
      resolve(true)
    });
  })

  return promise
}

export const moveFile = (sourcePath: string, destinationPath: string): Promise<boolean> => {
  const promise = new Promise<boolean>((resolve, reject) => {
    fs.copyFile(sourcePath, destinationPath, (error) => {
      if (error) {
        verboseLog(`ERROR: copying file ${sourcePath} to ${destinationPath}`);
        verboseLog('ERROR:', error);
        reject(false)
      } else {
        fs.unlink(sourcePath, (error) => {
          if (error) {
            verboseLog(`ERROR: deleting original file ${sourcePath}`);
            verboseLog('ERROR:', error);
            reject(false)
          } else {
            resolve(true)
          }
        });
      }
    });
  })

  return promise
}

export const writeJSON = <T extends Record<string | number, any>>(filePath: string, data: T): Promise<boolean> => {
  const promise = new Promise<boolean>((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
      if (error) {
        verboseLog(`ERROR: writing ${filePath}`);
        verboseLog(`ERROR: ${JSON.stringify(data, null, 2)}`);
        verboseLog('ERROR:', error);
        reject(false)
      } else {
        resolve(true)
      }
    });
  })

  return promise
}

export const isFileExtension = (extension: FileExtensionKind) => (filePath: string) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  return fileExtension === extension
}

export const isMobi = isFileExtension('.mobi')
export const isImage = R.either(isFileExtension('.jpg'), isFileExtension('.jpeg'))
export const isAmazonBook = R.either(isFileExtension('.azw'), isFileExtension('.azw3'))

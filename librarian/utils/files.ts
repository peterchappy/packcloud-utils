import * as fs from 'fs'
import * as path from 'path'
import * as R from 'ramda';
import { FileExtensionKind } from '../types';
import { log } from './logs';

export const isDirectory = (filePath: string): Promise<boolean> => {
  const promise = new Promise<boolean>((resolve, reject) => {
    fs.stat(filePath, async (error, stats) => {
      if (error) {
        console.error(`Error getting stats for ${filePath}: ${error.message}`);
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

export const isFileExtension = (extension: FileExtensionKind) => (filePath: string) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  return fileExtension === extension
}

export const isMobi = isFileExtension('.mobi')
export const isImage = R.either(isFileExtension('.jpg'), isFileExtension('.jpeg'))
export const isAmazonBook = R.either(isFileExtension('.azw'), isFileExtension('.azw3'))

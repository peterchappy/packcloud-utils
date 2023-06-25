import * as fs from 'fs'
import * as path from 'path'
import { FileExtensionKind } from '../types';

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

export const isFileExtension = (extension: FileExtensionKind) => (filePath: string) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  return fileExtension === extension
}

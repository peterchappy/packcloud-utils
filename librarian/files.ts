import * as fs from 'fs'

export const isDirectory = (filePath: string) => {
  const promise = new Promise((resolve, reject) => {
    fs.stat(filePath, async (error, stats) => {
      if (error) {
        console.error(`Error getting stats for ${filePath}: ${error.message}`);
        reject(error)
      }

      resolve(() => stats.isDirectory())
    });
  })

  return promise
}
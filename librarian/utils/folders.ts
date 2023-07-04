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


export const deleteFolder = (folderPath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(folderPath)) {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        const deletePromises: Promise<boolean>[] = [];

        files.forEach((file) => {
          const currentPath = `${folderPath}/${file}`;

          if (fs.lstatSync(currentPath).isDirectory()) {
            deletePromises.push(deleteFolder(currentPath));
          } else {
            deletePromises.push(new Promise<boolean>((resolve, reject) => {
              fs.unlink(currentPath, (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(true);
                }
              });
            }));
          }
        });

        Promise.all(deletePromises)
          .then(() => {
            fs.rmdir(folderPath, (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(`Folder "${folderPath}" deleted successfully.`);
                resolve(true);
              }
            });
          })
          .catch((err) => reject(err));
      });
    } else {
      console.log(`Folder "${folderPath}" does not exist.`);
      resolve(false);
    }
  });
}

import * as fs from 'fs';
import * as path from 'path';
import { AUDIOBOOK_EXTENSIONS, COMIC_BOOK_EXTENSIONS, EBOOK_EXTENSIONS } from './constants';
import { getFolderToRunIn } from './utils';

require('dotenv').config();

const audiobooksFolder = process.env.AUDIOBOOKS_FOLDER;
const comicbooksFolder = process.env.COMICBOOKS_FOLDER;
const booksFolder = process.env.BOOKS_FOLDER;

export async function moveFileToFolder(filePath: string, folderPath: string) {
  const normalizedFilePath = filePath.replace(/\s/g, "_");
  const fileBasename = path.basename(normalizedFilePath);
  const newFilePath = path.join(folderPath, fileBasename);

  fs.rename(filePath, newFilePath, (error) => {
    if (error) {
      console.error(`Error moving file ${filePath}: ${error.message}`);
    } else {
      console.log(`Moved ${filePath}`);
      console.log(`to`);
      console.log(`${newFilePath}`);
      console.log(`-----------------------`);
    }
  });
}


export const processFile = async (filePath: string) => {
  const fileExtension = path.extname(filePath).toLowerCase();

  if (AUDIOBOOK_EXTENSIONS.includes(fileExtension)) {
    if (audiobooksFolder) {
      await moveFileToFolder(filePath, audiobooksFolder);
    } else {
      console.log(`No audiobooks folder configured in the .env file. Skipping ${filePath}`);
    }
  } else if (COMIC_BOOK_EXTENSIONS.includes(fileExtension)) {
    if (comicbooksFolder) {
      await moveFileToFolder(filePath, comicbooksFolder);
    } else {
      console.log(`No comicbooks folder configured in the .env file. Skipping ${filePath}`);
    }
  } else if (EBOOK_EXTENSIONS.includes(fileExtension)) {
    if (booksFolder) {
      await moveFileToFolder(filePath, booksFolder);
    } else {
      console.log(`No books folder configured in the .env file. Skipping ${filePath}`);
    }
  } else {
    console.log(`No matching sort for ${filePath}`);
  }
}

export const processFolder = (folderPath: string, isRoot = false) => {
  fs.readdir(folderPath, (error, files) => {
    if (error) {
      console.error(`Error reading folder ${folderPath}: ${error.message}`);
      return;
    }

    let containsAudiobook = false;
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const fileExtension = path.extname(filePath).toLowerCase();

      if (AUDIOBOOK_EXTENSIONS.includes(fileExtension)) {
        containsAudiobook = true;
      }
    });


    if (containsAudiobook && audiobooksFolder && !isRoot) {
      fs.rename(folderPath, path.join(audiobooksFolder, path.basename(folderPath)), (error) => {
        if (error) {
          console.error(`Error moving folder ${folderPath}: ${error.message}`);
        } else {
          console.log(`Moved ${folderPath} to ${path.join(audiobooksFolder, path.basename(folderPath))}`);
        }
      });
      
      return
    }

    files.forEach(async (file) => {
      const filePath = path.join(folderPath, file);

      fs.stat(filePath, async (error, stats) => {
        console.log(`PROCESSING: ${filePath}`)
        if (error) {
          console.error(`Error getting stats for ${filePath}: ${error.message}`);
          return;
        }

        if (stats.isDirectory()) {
          return processFolder(filePath);
        }else{
          return await processFile(filePath)
        }
      });
    });
  });
}

const rootFolder = getFolderToRunIn()

if (rootFolder) {
  processFolder(rootFolder, true);
} else {
  console.error('Please provide a root folder as a command line argument.');
}

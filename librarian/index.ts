import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as Tesseract from 'tesseract.js';

require('dotenv').config();

const audiobooksFolder = process.env.AUDIOBOOKS_FOLDER;
const comicbooksFolder = process.env.COMICBOOKS_FOLDER;
const booksFolder = process.env.BOOKS_FOLDER;

export async function moveFileToFolder(filePath: string, folderPath: string) {
  const fileBasename = path.basename(filePath);
  const newFilePath = path.join(folderPath, fileBasename);

  fs.rename(filePath, newFilePath, (error) => {
    if (error) {
      console.error(`Error moving file ${filePath}: ${error.message}`);
    } else {
      console.log(`Moved ${filePath} to ${newFilePath}`);
    }
  });
}



export async function retrieveISBN(filePath: string): Promise<string> {
  try {
    const extractedText = await performOCR(filePath);
    const isbn = await fetchISBNFromText(extractedText);
    return isbn;
  } catch (error) {
    throw new Error(`Error retrieving ISBN for ${filePath}: ${error.message}`);
  }
}

export async function performOCR(filePath: string): Promise<string> {
  const imageBuffer = fs.readFileSync(filePath);

  const { data } = await Tesseract.recognize(imageBuffer, 'eng');
  const extractedText = data.text.trim();

  return extractedText;
}

export const  fetchISBNFromText = async (text: string): Promise<string> => {
  // Implement your logic to find and extract the ISBN from the extracted text
  // You can use regular expressions or other techniques to identify and retrieve the ISBN

  // Example regular expression to extract ISBN-10 or ISBN-13:
  const isbnRegex = /(?:ISBN(?:-10)?:? |ISBN(?:-13)?:?\r?\n?)((?=[0-9X]{10}$|(?=(?:[0-9]+[-\ ]){3})[-\ 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-\ ]){4})[-\ 0-9]{17}$)[0-9]{1,5}[-\ 0-9X]{10,13}[-\ 0-9]{0,5})/i;
  const match = text.match(isbnRegex);
  
  if (match) {
    return match[1].replace(/-/g, ''); // Remove any dashes from the ISBN
  } else {
    throw new Error('ISBN not found');
  }
}

export const  fetchGoogleBooksMetadata = async (isbn: string) => {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`;

  const response = await axios.get(url);
  const data = response.data;

  if (data && data.items && data.items.length > 0) {
    const book = data.items[0];
    const { title, authors, description } = book.volumeInfo;
    return { title, authors, description };
  }

  throw new Error(`No metadata found for ISBN ${isbn}`);
}

export const retrieveAndProcessMetadata = async (filePath: string) => {
  try {
    const isbn = await retrieveISBN(filePath);
    const metadata = await fetchGoogleBooksMetadata(isbn);

    // Process the retrieved metadata
    console.log('Metadata:', metadata);

    // Write the metadata to a file
    const metadataFilePath = `${filePath}.metadata.json`;
    fs.writeFile(metadataFilePath, JSON.stringify(metadata), (error) => {
      if (error) {
        console.error(`Error writing metadata for ${filePath}:`, error);
      } else {
        console.log(`Metadata for ${filePath} has been written to ${metadataFilePath}`);
      }
    });
  } catch (error) {
    console.error(`Error retrieving metadata for ${filePath}:`, error);
  }
}

export const processFile = async (filePath: string) => {
  const fileExtension = path.extname(filePath).toLowerCase();

  if (['.mp3', '.mp4'].includes(fileExtension)) {
    if (audiobooksFolder) {
      await moveFileToFolder(filePath, audiobooksFolder);
    } else {
      console.log(`No audiobooks folder configured in the .env file. Skipping ${filePath}`);
    }
  } else if (['.cbz', '.cbr'].includes(fileExtension)) {
    if (comicbooksFolder) {
      await moveFileToFolder(filePath, comicbooksFolder);
    } else {
      console.log(`No comicbooks folder configured in the .env file. Skipping ${filePath}`);
    }
  } else if (['.mobi', '.epub', ".pdf"].includes(fileExtension)) {
    if (booksFolder) {
      await moveFileToFolder(filePath, booksFolder);
      await retrieveAndProcessMetadata(`${filePath}.metadata.json`);
    } else {
      console.log(`No books folder configured in the .env file. Skipping ${filePath}`);
    }
  } else {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(`Where would you like to move ${filePath}? `, async (answer) => {
      readline.close();

      await moveFileToFolder(filePath, answer);
    });
  }
}

export const processFolder = (folderPath: string) => {
  fs.readdir(folderPath, (error, files) => {
    if (error) {
      console.error(`Error reading folder ${folderPath}: ${error.message}`);
      return;
    }

    let containsAudiobook = false;
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const fileExtension = path.extname(filePath).toLowerCase();

      if (['.mp3', '.mp4'].includes(fileExtension)) {
        containsAudiobook = true;
      }
    });


    if (containsAudiobook && audiobooksFolder) {
        fs.rename(folderPath, path.join(audiobooksFolder, path.basename(folderPath)), (error) => {
          if (error) {
            console.error(`Error moving folder ${folderPath}: ${error.message}`);
          } else {
            console.log(`Moved ${folderPath} to ${path.join(audiobooksFolder, path.basename(folderPath))}`);
          }
        });
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

const rootFolder = process.argv[2];

console.log(`ROOT FOLDER: ${rootFolder}`)
if (rootFolder) {
  processFolder(rootFolder);
} else {
  console.error('Please provide a root folder as a command line argument.');
}

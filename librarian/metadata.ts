import * as fs from 'fs';
import * as path from 'path';
import * as Tesseract from 'tesseract.js';
import { fetchGoogleBooksMetadata } from './services';
import { getFolderToRunIn, isEpub, isPDF } from './utils';
import { isDirectory } from './utils/files';
import { getIsbnFromEpub } from './utils/epub';
import { extractISBNFromPDF } from './utils/pdf';
import { verboseLog } from './utils/logs';
import * as R from 'ramda'
import { log } from 'console';

const pdf = require('pdf-parse');

require('dotenv').config()


export async function performOCR(filePath: string): Promise<string> {
  const imageBuffer = fs.readFileSync(filePath);

  const { data } = await Tesseract.recognize(imageBuffer, 'eng');
  const extractedText = data.text.trim();

  return extractedText;
}

export const fetchISBNFromText = async (text: string): Promise<string> => {
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

const BACKOFF_TIME_MULTIPLE = 100
const AMOUNT_OF_BACKOFFS = 5

export const retrieveAndProcessMetadata = async (isbn: string, backoffs = 0) => {
  try {
    const metadata = await fetchGoogleBooksMetadata(isbn);
    // Write the metadata to a file
    // const metadataFilePath = `${filePath}.metadata.json`;
    // fs.writeFile(metadataFilePath, JSON.stringify(metadata), (error) => {
    //   if (error) {
    //     console.error(`Error writing metadata for ${filePath}:`, error);
    //   } else {
    //     console.log(`Metadata for ${filePath} has been written to ${metadataFilePath}`);
    //   }
    // });
    return metadata
  } catch (error) {

    if (error.response.status !== 429) {
      log(`ERROR: retrieving metadata for ${isbn} -`, String(error));
      return
    }
    log(`ERROR: Rate Limited while fetching ${isbn}`);

    if (backoffs > AMOUNT_OF_BACKOFFS) {
      log(`ERROR: Backoff count of ${AMOUNT_OF_BACKOFFS} reached`);
      return
    }

    const backoffTime = BACKOFF_TIME_MULTIPLE * (backoffs + 1)

    log(`PROCESSING: Attemtping again in ${backoffTime}ms. (Attempt ${backoffs})`);

    await new Promise((resolve) => setTimeout(resolve, backoffTime));

    return retrieveAndProcessMetadata(isbn, backoffs + 1)
  }
}

type ProcessFolderReturn = Record<string, string[]>

export const processFolder = (folderPath: string): Promise<ProcessFolderReturn> => {

  return new Promise((resolve) => {
    const lookup: ProcessFolderReturn = {}

    fs.readdir(folderPath, async (error, files) => {

      if (error) {
        console.error(`Error reading folder ${folderPath}: ${error.message}`);
        resolve({});
      }

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        log(`PROCESSING: ${filePath}`);

        try {
          const directory = await isDirectory(filePath);
    
          if (directory) {
            const nestedLookup = processFolder(filePath)
            R.mergeLeft(lookup, nestedLookup)
            continue;
          }

          let isbn = undefined;

          if (isPDF(filePath)) {
            isbn = await extractISBNFromPDF(filePath)
          }
    
    
          if (isEpub(filePath)) {
            isbn = await getIsbnFromEpub(filePath);
          } 

          if (isbn) {
            log(`PROCESSING: ISBN found for ${filePath} - ${isbn}`);
            await new Promise((resolve) => setTimeout(resolve, 100));

            log(`PROCESSING: Fetching metadata for ${filePath} - ${isbn}`)
            const metaData = await retrieveAndProcessMetadata(isbn)

            if (!metaData) {
              log(`ERROR: Unable to retrieve metadata for ${filePath} with matched ISBN ${isbn}`)
              log(`ERROR: Unable to retrieve metadata for ${filePath}`)
            } else {
              log(`PROCESSING: SUCCESS!!!`)
            }

            const primaryCategory = metaData?.volumeInfo?.categories[0];

            if (!primaryCategory) {
              continue
            }

            if (lookup[primaryCategory]) {
              lookup[primaryCategory].push(metaData.title)
            } else {
              lookup[primaryCategory] = [metaData.title]
            }
          } else {
            verboseLog(`ERROR: ISBN NOT FOUND for ${filePath}`)
          }


        } catch (e) {
          console.log('ERROR: UNABEL TO HANDLE', filePath)
          console.log(e)
          console.log('------------')
        }
      }
    });

    resolve(lookup);
  })
}

const rootFolder = getFolderToRunIn()

if (rootFolder) {
  processFolder(rootFolder);
} else {
  console.error('Please provide a root folder as a command line argument.');
}

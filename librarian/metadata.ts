import * as fs from 'fs';
import * as path from 'path';
import * as Tesseract from 'tesseract.js';
import { fetchGoogleBooksMetadata } from './services';
import { isEpub, isPDF } from './utils';
import { TOP_CATEGORIES, findMatchingCategory, isTopCategory } from './utils/categories';
import { getFolderArg } from './utils/commandline';
import { getIsbnFromEpub } from './utils/epub';
import { deleteFile, isAmazonBook, isDirectory, isImage, isMobi, moveFile } from './utils/files';
import { log, verboseLog } from './utils/logs';
import { extractISBNFromPDF, isMagazine } from './utils/pdf';
import { BasicBookInfo, BookType, VolumeInfo } from './types';
import { writeBookMetaData } from './utils/metadata';
import { deleteFolder, writeDirectoryIfNotExits } from './utils/folders';

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

const BACKOFF_TIME_MULTIPLE = 200
const AMOUNT_OF_BACKOFFS = 10

export const retrieveAndProcessMetadata = async (isbn: string, backoffs = 0): Promise<VolumeInfo> => {
  try {
    const metadata = await fetchGoogleBooksMetadata(isbn);
    return metadata
  } catch (error: any) {

    if (error && error?.response && error?.response?.status === undefined || error?.response?.status !== 429) {
      log(`ERROR: retrieving metadata for ${isbn} -`, String(error));
      return Promise.reject()
    }

    log(`ERROR: Rate Limited while fetching ${isbn}`);

    if (backoffs > AMOUNT_OF_BACKOFFS) {
      log(`ERROR: Backoff count of ${AMOUNT_OF_BACKOFFS} reached`);
      return Promise.reject()
    }

    const backoffTime = BACKOFF_TIME_MULTIPLE * (backoffs + 1)

    log(`STATUS: Attemtping again in ${backoffTime}ms. (Attempt ${backoffs})`);

    await new Promise((resolve) => setTimeout(resolve, backoffTime));

    return retrieveAndProcessMetadata(isbn, backoffs + 1)
  }
}

type ProcessFolderReturn = boolean

export const processFolder = (folderPath: string): Promise<ProcessFolderReturn> => {

  return new Promise((resolve) => {

    fs.readdir(folderPath, async (error, files) => {

      if (error) {
        console.error(`Error reading folder ${folderPath}: ${error.message}`);
        resolve(false);
      }

      for (const file of files) {
        log('------------')
        const filePath = path.join(folderPath, file);
        log(`STATUS: ${filePath}`);

        try {
          const directory = await isDirectory(filePath);
    
          // SKIP TOP CATEGORIES
          if (directory && isTopCategory(filePath)) {
            log(`STATUS: SKIPPING FOLDER ${filePath}`)
            continue
          }

          if (directory) {
            log(`STATUS: PROCESSING FOLDER ${filePath}`)
            await processFolder(filePath)
            log(`STATUS: DELETING FOLDER ${filePath}`)
            await deleteFolder(filePath)
            continue;
          }

          let isbn: string | undefined = undefined;

          // TODO - We don't nec want to delete these. This should be a config long term
          // Right now for my purposes I don't care about them when getting metadata
          // Since I'm unable to easily parse them for ISBN
          // OR in the case of an image it's not an ebook :shrug:
          if (isMobi(filePath) || isImage(filePath) || isAmazonBook(filePath)) {
            try {
              await deleteFile(filePath)
            } catch (e) {
              log(`ERROR: Failed to delete ${filePath}`)
            } finally {
              continue
            }
          }

          if (isPDF(filePath) && isMagazine(filePath)) {
            // TODO - Just move to Magazines
            log(`STATUS: Skipping file ${filePath} which is identified as a magazine.`);
            continue;
          }

          if (isPDF(filePath) && !isMagazine(filePath)) {
            isbn = await extractISBNFromPDF(filePath)
          } 
    
          if (isEpub(filePath)) {
            isbn = await getIsbnFromEpub(filePath);
          } 

          log(`STATUS: ISBN found for ${filePath} - ${isbn}`);
          await new Promise((resolve) => setTimeout(resolve, 100));

          log(`STATUS: Fetching metadata for ${filePath} - ${isbn}`)
          const metadata = isbn ? await retrieveAndProcessMetadata(isbn) : undefined

          const commonBookType: BasicBookInfo = {
            filename: file,
            pathname: filePath,
          }

          const bookInfo: BookType = metadata && isbn ? {
            type: 'matched',
            isbn,
            metadata,
            ...commonBookType
          } : {
            type: 'unmatched',
            isbn,
            ...commonBookType,
          }
          
          const categories: string[] = metadata?.categories ?? []
          const primaryCategory = findMatchingCategory(categories);

          // TODO should never be the case
          if (!primaryCategory) {
            log(`ERROR: No category found for ${filePath} - ${isbn}`)
            log(metadata)
            continue
          }

          let newPathname = bookInfo.pathname
          const categoryDirectory = `${getFolderArg()}${primaryCategory}`

          if (bookInfo.type === 'matched') {
            // TODO - Abstract
            const authors = bookInfo.metadata.authors?.join(', ')
            const ext = filePath.substring(filePath.lastIndexOf('.') + 1);
            const pathFormattedTitle = bookInfo.metadata.title
            const newFileName = `${authors} - ${pathFormattedTitle}.${ext}`

            newPathname = `${categoryDirectory}/${newFileName}`
          } else {
            newPathname = `${categoryDirectory}/${bookInfo.filename}`
          }

          log(`STATUS: organizing ${bookInfo.filename} to category ${primaryCategory}`)
          log(`STATUS: organizing ${bookInfo.filename} to ${newPathname}`)
          await writeDirectoryIfNotExits(categoryDirectory);
          await moveFile(bookInfo.pathname, newPathname);

          log(`STATUS: ${bookInfo.filename} organized`)
          log(`STATUS: writing metadata for ${bookInfo.filename}`)

          await writeBookMetaData({ ...bookInfo, pathname: newPathname })

          log(`STATUS: metadata written`)
          log(`STATUS: ${bookInfo.filename} sorted`)
        } catch (e) {
          log('ERROR: UNABLE TO HANDLE', filePath)
          log(e)
        }
      }

      resolve();
    });
  })
}

const rootFolder = getFolderArg()

const main = async () => {
  console.log(`ROOT FOLDER: ${rootFolder}`)
  if (rootFolder) {
    const lookup = await processFolder(rootFolder);
    console.log(lookup)
    console.log(lookup.filter(x => x.includes('.pdf')))
  } else {
    console.error('Please provide a root folder as a command line argument.');
  }
}

main()

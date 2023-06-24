import axios from 'axios';
import * as path from 'path';
import * as Tesseract from 'tesseract.js';
import * as fs from 'fs'
import { getFolderToRunIn } from './utils';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { isDirectory } from './files';

const parser = new XMLParser();

export async function retrieveISBN(filePath: string): Promise<string> {
  try {
    const extractedText = await performOCR(filePath);
    const isbn = await fetchISBNFromText(extractedText);
    return isbn;
  } catch (error) {
    throw new Error(`Error retrieving ISBN for ${filePath}: ${error.message}`);
  }
}

async function getIsbnFromEpub(filepath: string): Promise<string | null> {
  try {
    const zip = new AdmZip(filepath);
    const opfEntry = zip.getEntries().find(entry => entry.entryName.endsWith('.opf'));
    if (!opfEntry) {
      return null;
    }

    const opfContent = opfEntry.getData().toString('utf8');
    const opfObj = parser.parse(opfContent);

    const metadata = opfObj.package.metadata;
    if (!metadata) {
      return null;
    }

    const identifier = Array.isArray(metadata['dc:identifier'])
      ? metadata['dc:identifier'].find((id: any) => id.scheme === 'ISBN')
      : metadata['dc:identifier'];

    if (identifier && identifier.scheme === 'ISBN') {
      return identifier['#text'];
    }

    return null;
  } catch (err) {
    console.error(err);
    return null;
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
    return { title, authors, description, ...book };
  }

  throw new Error(`No metadata found for ISBN ${isbn}`);
}

export const retrieveAndProcessMetadata = async (filePath: string) => {
  try {
    
    const isbn = await getIsbnFromEpub(filePath);
    if (isbn) {
      console.log('Metadata: ISBN = ', isbn);
    }
    return;
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

export const processFolder = (folderPath: string) => {
  fs.readdir(folderPath, (error, files) => {
    if (error) {
      console.error(`Error reading folder ${folderPath}: ${error.message}`);
      return;
    }

    files.forEach(async (file) => {
      const filePath = path.join(folderPath, file);
      const directory = await isDirectory(filePath);

      if (directory) {
        return
      }

      await retrieveAndProcessMetadata(filePath)
    });
  });
}

const rootFolder = getFolderToRunIn()

if (rootFolder) {
  processFolder(rootFolder);
} else {
  console.error('Please provide a root folder as a command line argument.');
}

import * as fs from 'fs';
import { isFileExtension } from './files';
import { formatISBN } from './books';
import { verboseLog } from './logs';
import { hasMonthInString } from './dates';
const pdf = require('pdf-parse');

export const isPDF = isFileExtension('.pdf')

export const isMagazine = (pathname: string) => {
  const lowercase = pathname.toLowerCase();

  return lowercase.includes('vol') || hasMonthInString(pathname)
}

export async function extractISBNFromPDF(filePath: string): Promise<string | undefined> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
  
    const data = await pdf(dataBuffer);

    const isbnRegex = new RegExp("(?:ISBN(?:-13)?:?\ )?(?=[0-9]{13}$|(?=(?:[0-9]+[-\ ]){4})[-\ 0-9]{17}$)97[89][-\ ]?[0-9]{1,5}[-\ ]?[0-9]+[-\ ]?[0-9]+[-\ ]?[0-9]")
    const match = data.text.match(isbnRegex);

    if (match && match[0]) {
      const isbn = match[0].replace("ISBN: ", "")
      return formatISBN(isbn);
    }
  } catch (e) {
    verboseLog('ERROR: ',e)
  }
}
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { isFileExtension } from './files';
import * as R from 'ramda';
import { formatISBN, isISBN } from './books';
import { fetchGoogleBookISBN } from '../services';

export const parser = new XMLParser();

export const isEpub = isFileExtension('.epub')

export async function getIsbnFromEpub(filepath: string): Promise<string | undefined> {
  try {
    const zip = new AdmZip(filepath);
    const opfEntry = zip.getEntries().find(entry => entry.entryName.endsWith('.opf'));
    if (!opfEntry) {
      return undefined;
    }

    const opfContent = opfEntry.getData().toString('utf8');
    const opfObj = parser.parse(opfContent);
    const opfPackage = opfObj['opf:package'] || opfObj.package || {}
    const metadata = opfPackage['opf:metadata'] || opfPackage.metadata;

    if (!metadata) {
      return undefined;
    }


    const identifier = Array.isArray(metadata['dc:identifier'])
    ? metadata['dc:identifier'].find(R.pipe(formatISBN, isISBN))
    : metadata['dc:identifier']
      ? metadata['dc:identifier']
        : metadata['dc:Identifier']
          ? metadata['dc:Identifier']
          : metadata['dc-metadata']['dc:Identifier'];
    

    if (identifier) {
      return formatISBN(identifier);
    }

    const title = metadata['dc:title']
    const author = metadata['dc:creator']
    const publisher = metadata['dc:publisher']

    if (!title || !author) {
      console.log('METADATA: ', metadata)
    }

    const isbn = await fetchGoogleBookISBN(title,author,publisher)
    return isbn;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
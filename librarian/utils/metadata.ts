import { BookType } from '../types'
import { writeJSON } from './files'

export const metadataFileName = (sourcePathname: string) => `.${sourcePathname}.metadata.json`

export const writeBookMetaData = async (book: BookType) => await writeJSON(metadataFileName(book.filename), book)
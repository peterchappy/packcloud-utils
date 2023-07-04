import { AudiobookExtensionKind, ComicExtensionKind, EbookExtensionKind } from './types';

require('dotenv').config();


export const AUDIOBOOK_EXTENSIONS: AudiobookExtensionKind[] = ['.mp3', '.mp4', '.m4b'];
export const COMIC_BOOK_EXTENSIONS: ComicExtensionKind[] = ['.cbz', '.cbr'];
export const EBOOK_EXTENSIONS: EbookExtensionKind[] = ['.mobi', '.epub', ".pdf"];


export const audiobooksFolder = process.env.AUDIOBOOKS_FOLDER;
export const comicbooksFolder = process.env.COMICBOOKS_FOLDER;
export const booksFolder = process.env.BOOKS_FOLDER;
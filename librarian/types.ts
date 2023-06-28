export type AudiobookExtensionKind = '.mp4' | '.mp3' | '.m4b'
export type ComicExtensionKind = '.cbz' | '.cbr'
export type EbookExtensionKind = '.mobi' | '.epub' | ".pdf" | '.azw' | '.azw3'
export type OtherFileExtensionKinds = ".jpeg" | '.jpg'

export type FileExtensionKind = EbookExtensionKind | ComicExtensionKind | AudiobookExtensionKind | OtherFileExtensionKinds

export type BookType = {
  filename: string;
  pathname: string;
  isbn: string;
  metadata: {
    authors: string[];
    title: string;
    publisher: string;
    categories: string[]
  }
}
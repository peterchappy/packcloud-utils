export type AudiobookExtensionKind = '.mp4' | '.mp3' | '.m4b'
export type ComicExtensionKind = '.cbz' | '.cbr'
export type EbookExtensionKind = '.mobi' | '.epub' | ".pdf" | '.azw' | '.azw3'
export type OtherFileExtensionKinds = ".jpeg" | '.jpg'

export type FileExtensionKind = EbookExtensionKind | ComicExtensionKind | AudiobookExtensionKind | OtherFileExtensionKinds

export type VolumeInfo = {
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
}

export type BasicBookInfo = {
  filename: string;
  pathname: string;
}

export type KnownBookType = BasicBookInfo & {
  type: 'matched'
  isbn: string;
  metadata: VolumeInfo
}

export type UnknownBookType = BasicBookInfo & {
  type: 'unmatched'
  isbn?: string;
}

export type BookType = UnknownBookType | KnownBookType
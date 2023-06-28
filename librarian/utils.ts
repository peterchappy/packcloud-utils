import * as path from 'path';

export const getFolderToRunIn = () => {
  const rootFolder = process.argv[2];
  return rootFolder;
}

export const isEpub = (filePath: string) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  return fileExtension === '.epub'
}

export const isPDF = (filePath: string) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  return fileExtension === '.pdf'
}
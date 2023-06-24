import * as path from 'path';

export const getFolderToRunIn = () => {
  const rootFolder = process.argv[2];
  console.log(`ROOT FOLDER: ${rootFolder}`)
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
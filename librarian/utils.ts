export const getFolderToRunIn = () => {
  const rootFolder = process.argv[2];
  console.log(`ROOT FOLDER: ${rootFolder}`)
  return rootFolder;
}

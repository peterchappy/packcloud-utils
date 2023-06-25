import { verboseLog } from './logs';

export const getFolderArg = () => {
  const rootFolder = process.argv[2];
  verboseLog(`ARG FOLDER: ${rootFolder}`)
  return rootFolder;
}

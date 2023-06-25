export enum LOG_LEVEL {
  NONE = '0',
  DEFAULT = '1',
  VERBOSE = '2',
}

const getCurrentLogLevel = () => process.env.LOG_LEVEL ?? LOG_LEVEL.DEFAULT

export const log = <T = any[]>(...args: any): T => {
  const CURRENT_LOG_LEVEL = getCurrentLogLevel()

  if (CURRENT_LOG_LEVEL == LOG_LEVEL.NONE) {
    return args;
  }

  console.log(...args)
  return args; 
}


export const verboseLog = <T = any[]>(...args: any): T => {
  const CURRENT_LOG_LEVEL = getCurrentLogLevel()

  if (CURRENT_LOG_LEVEL != LOG_LEVEL.VERBOSE) {
    return args;
  }

  console.log(...args)
  return args; 
}
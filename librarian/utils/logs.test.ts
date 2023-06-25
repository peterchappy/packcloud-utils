import { log, verboseLog, LOG_LEVEL } from './logs'

describe('log', () => {
  let consoleLogMock: jest.SpyInstance;

  beforeEach(() => {
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogMock.mockRestore();
  });

  it('should return arguments if CURRENT_LOG_LEVEL is NONE', () => {
    process.env.LOG_LEVEL = LOG_LEVEL.NONE.toString();

    const result = log('test');

    expect(result).toEqual(['test']);
    expect(consoleLogMock).not.toHaveBeenCalled();
  });

  it('should log arguments if CURRENT_LOG_LEVEL is not NONE', () => {
    process.env.LOG_LEVEL = LOG_LEVEL.DEFAULT.toString();

    const result = log('test');

    expect(result).toEqual(['test']);
    expect(consoleLogMock).toHaveBeenCalledWith('test');
  });
});

describe('verboseLog', () => {
  let consoleLogMock: jest.SpyInstance;

  beforeEach(() => {
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogMock.mockRestore();
  });

  it('should return arguments if CURRENT_LOG_LEVEL is not VERBOSE', () => {
    process.env.LOG_LEVEL = LOG_LEVEL.DEFAULT.toString();

    const result = verboseLog('test');

    expect(result).toEqual(['test']);
    expect(consoleLogMock).not.toHaveBeenCalled();
  });

  it('should log arguments if CURRENT_LOG_LEVEL is VERBOSE', () => {
    process.env.LOG_LEVEL = LOG_LEVEL.VERBOSE.toString();

    const result = verboseLog('test');

    expect(result).toEqual(['test']);
    expect(consoleLogMock).toHaveBeenCalledWith('test');
  });
});
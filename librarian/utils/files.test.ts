import { FileExtensionKind } from '../types';
import { isDirectory, isFileExtension } from './files'; // replace with your actual file path

describe('Test for isDirectory', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should return true when the path points to a directory', async () => {
    jest.doMock('fs', () => ({
      stat: (filePath, cb) => {
        cb(null, {
          isDirectory: () => true,
        });
      }
    }));

    const fs = require('fs');
    const { isDirectory } = require('./files');

    const result = await isDirectory('testPath');
    expect(result).toBe(true);
  });

  it('should reject the promise when there is an error', async () => {
    jest.doMock('fs', () => ({
      stat: (filePath, cb) => {
        cb(new Error('test error'), {
          isDirectory: () => false, // provide a stats object
        });
      }
    }));

    const fs = require('fs');
    const { isDirectory } = require('./files');

    await expect(isDirectory('testPath')).rejects.toThrow('test error');
  });
});

describe('Test for isFileExtension', () => {
  it('should return true if the file extension matches the provided one', () => {
    const filePath = 'test.pdf';
    const testExtension: FileExtensionKind = '.pdf';
    const result = isFileExtension(testExtension)(filePath);
    expect(result).toBe(true);
  });

  it('should return false if the file extension does not match the provided one', () => {
    const filePath = 'test.pdf';
    const testExtension: FileExtensionKind = '.epub';
    const result = isFileExtension(testExtension)(filePath);
    expect(result).toBe(false);
  });
});
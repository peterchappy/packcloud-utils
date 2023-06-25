import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { getIsbnFromEpub, isEpub, parser } from './epub'; // replace with your actual file path
import { fetchGoogleBookISBN } from '../services';

jest.mock('fast-xml-parser');
jest.mock('adm-zip');

jest.mock('fast-xml-parser', () => ({
  XMLParser: jest.fn().mockImplementation(() => ({
    parse: jest.fn().mockReturnValue({ 'opf:package': { 'opf:metadata': { 'dc:identifier': '123456789X' } } }),
  })),
}));

jest.mock('../services');

describe('Test for getIsbnFromEpub', () => {
  it('should return the formatted ISBN from the .opf file', async () => {
    (AdmZip as jest.Mock).mockImplementation(() => ({
      getEntries: () => [{
        entryName: 'test.opf',
        getData: () => Buffer.from('test data', 'utf8'),
      }],
    }));

    const isbn = await getIsbnFromEpub('test.epub');
    expect(isbn).toBe('123456789X');
  });

  // TODO:  Write additional tests for other branches of your code
});

describe('Test for isEpub', () => {
  it('should return true if the file extension is .epub', () => {
    const result = isEpub('test.epub');
    expect(result).toBe(true);
  });

  it('should return false if the file extension is not .epub', () => {
    const result = isEpub('test.pdf');
    expect(result).toBe(false);
  });
});

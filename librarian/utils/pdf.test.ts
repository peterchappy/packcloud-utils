import { extractISBNFromPDF } from './pdf';
import * as BOOKS from './books';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

jest.mock('pdf-parse', () =>
  jest.fn().mockImplementation((dataBuffer: Buffer) => {
    const data = dataBuffer.toString();
    return Promise.resolve({
      text: data,
    });
  })
);

describe('extractISBNFromPDF', () => {
  it('should extract ISBN from PDF when it exists', async () => {
    const mockFormatISBN = jest.spyOn(BOOKS, 'formatISBN');

    const filePath = 'path/to/file.pdf';
    const fileData = 'ISBN: 978-1-56619-909-4';
    require('fs').readFileSync.mockReturnValue(fileData);

    const result = await extractISBNFromPDF(filePath);

    expect(result).toBe('9781566199094');
    expect(mockFormatISBN).toHaveBeenCalledWith('978-1-56619-909-4');
    mockFormatISBN.mockReset()
  });

  it('should extract ISBN from PDF when it exists', async () => {
    const mockFormatISBN = jest.spyOn(BOOKS, 'formatISBN');

    const filePath = 'path/to/file.pdf';
    const fileData = 'SAMPLE_TEXT ISBN: 978-1-56619-909-4';
    require('fs').readFileSync.mockReturnValue(fileData);

    const result = await extractISBNFromPDF(filePath);

    expect(result).toBe('9781566199094');
    expect(mockFormatISBN).toHaveBeenCalledWith('978-1-56619-909-4');
    mockFormatISBN.mockReset()
  });

  it('should return undefined when ISBN is not found in the PDF', async () => {
    const mockPDF = jest.fn().mockResolvedValue({
      text: 'Sample text without ISBN',
    });
    const mockFormatISBN = jest.spyOn(BOOKS, 'formatISBN');

    const filePath = 'path/to/file.pdf';
    require('fs').readFileSync.mockReturnValue('file-data');
    require('pdf-parse').mockImplementation(mockPDF);

    const result = await extractISBNFromPDF(filePath);

    expect(result).toBeUndefined();
    expect(mockPDF).toHaveBeenCalledWith('file-data');
    expect(mockFormatISBN).not.toHaveBeenCalled();
    mockFormatISBN.mockReset()
  });

  it('should return undefined when PDF file does not exist', async () => {
    const filePath = 'path/to/nonexistent.pdf';
    require('fs').readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });
    require('pdf-parse').mockImplementation();

    const result = await extractISBNFromPDF(filePath);

    expect(result).toBeUndefined();
  });
});

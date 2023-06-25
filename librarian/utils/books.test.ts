import { formatISBN, isISBN } from './books';

describe('formatISBN', () => {
  it('should remove dashes from ISBN when input is a string', () => {
    const isbn = '0-123-45678-9';
    const formattedISBN = formatISBN(isbn);

    expect(formattedISBN).toBe('0123456789');
  });

  it('should remove urn:isbn: from ISBN when input is a string', () => {
    const isbn = 'urn:isbn:0-123-45678-9';
    const formattedISBN = formatISBN(isbn);

    expect(formattedISBN).toBe('0123456789');
  });

  it('should pad ISBN with leading zeros when input is less than 10 digits', () => {
    const isbn = 123;
    const formattedISBN = formatISBN(isbn);

    expect(formattedISBN).toBe('0000000123');
  });

  it('should return ISBN as string when input is already 10 digits', () => {
    const isbn = '0123456789';
    const formattedISBN = formatISBN(isbn);

    expect(formattedISBN).toBe('0123456789');
  });

  it('should return ISBN as string when input is 10-digit number', () => {
    const isbn = 9876543210;
    const formattedISBN = formatISBN(isbn);

    expect(formattedISBN).toBe('9876543210');
  });
});

describe('isISBN', () => {
  it('isISBN', () => {
    expect(isISBN('0123456789')).toBe(true);
    expect(isISBN('9780123456789')).toBe(true);
    expect(isISBN('e1f7d7a096dd4915bc3c5b60ac2b40d4')).toBe(false);
    expect(isISBN('1234')).toBe(false);
  });
});

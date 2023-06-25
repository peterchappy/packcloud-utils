import { formatISBN, isISBN } from './books';

describe('formatISBN', () => {
  it('should remove dashes from ISBN when input is a string', () => {
    const isbn = '0-123-45678-9';
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
  it('should return true for a valid ISBN-10', () => {
    const isbn = '0123456789';
    const isValidISBN = isISBN(isbn);

    expect(isValidISBN).toBe(true);
  });

  it('should return true for a valid ISBN-13', () => {
    const isbn = '9780123456789';
    const isValidISBN = isISBN(isbn);

    expect(isValidISBN).toBe(true);
  });

  it('should return false for an invalid ISBN', () => {
    const isbn = '12345';
    const isValidISBN = isISBN(isbn);

    expect(isValidISBN).toBe(false);
  });
});

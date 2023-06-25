const ISBN_10_LENGTH = 10

export const formatISBN = (isbn: number | string): string => typeof isbn === 'string'
    ? isbn.replace(/-/g, '')
    : String(isbn).length < ISBN_10_LENGTH
      ? isbn.toString().padStart(ISBN_10_LENGTH, '0')
      : String(isbn)

export const isISBN = (isbn: string): boolean => {
  const isbn10Regex = /^(?:[0-9]{9}X|[0-9]{10})$/; // ISBN-10 should be 9 digits followed by an X or 10 digits
  const isbn13Regex = /^(?:97[89][0-9]{10})$/; // ISBN-13 should start with 978 or 979 followed by 10 digits
  const iValidISBN = isbn10Regex.test(isbn) || isbn13Regex.test(isbn);
  return iValidISBN ;
}


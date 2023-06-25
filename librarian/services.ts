import axios from 'axios';

export async function fetchGoogleBookISBN(title: string, author: string, publisher?: string): Promise<string | undefined> {
  let query = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}+inauthor:${author}`;

  if (publisher) {
    query += `+inpublisher:${publisher}`;
  }

  try {
    const response = await axios.get(query);
    if (response.data.items) {
      const book = response.data.items[0]; // take the first book
      const identifiers = book.volumeInfo.industryIdentifiers;
      
      for (const id of identifiers) {
        if (id.type === 'ISBN_13') {
          return id.identifier;
        }
      }

      // If no ISBN-13, return ISBN-10
      for (const id of identifiers) {
        if (id.type === 'ISBN_10') {
          return id.identifier;
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export const fetchGoogleBooksMetadata = async (isbn: string) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

  const response = await axios.get(url);
  const data = response.data;

  if (data && data.items && data.items.length > 0) {
    const book = data.items[0];
    const { title, authors, description } = book.volumeInfo;
    return { title, authors, description, ...book };
  }

  throw new Error(`No metadata found for ISBN ${isbn}`);
}

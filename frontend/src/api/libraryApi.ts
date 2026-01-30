import client from './client';
import { LibraryEntry } from '../types';

interface LibraryResponse {
  data: LibraryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const libraryApi = {
  async getMyLibrary(params?: { page?: number; limit?: number }): Promise<LibraryResponse> {
    const response = await client.get<LibraryResponse>('/library/my', { params });
    return response.data;
  },

  async addBook(bookId: string): Promise<{ message: string }> {
    const response = await client.post<{ message: string }>('/library/add', { book_id: bookId });
    return response.data;
  },

  async removeBook(bookId: string): Promise<{ message: string }> {
    const response = await client.delete<{ message: string }>(`/library/${bookId}`);
    return response.data;
  },

  async addToFavorites(bookId: string): Promise<{ is_favorite: boolean }> {
    const response = await client.post<{ is_favorite: boolean }>('/library/favorite', { book_id: bookId });
    return response.data;
  },

  async addReview(bookId: string, rating: number, review?: string): Promise<{ message: string }> {
    const response = await client.post<{ message: string }>('/library/review', {
      book_id: bookId,
      rating,
      review
    });
    return response.data;
  },
};
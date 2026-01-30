import client from './client';
import { Book, Audiobook } from '../types';

interface BooksResponse {
  data: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BookDetailResponse {
  book: Book;
  audiobooks: Audiobook[];
}

export const bookApi = {
  async getAll(params?: {
    genre?: string;
    author?: string;
    search?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<BooksResponse> {
    const response = await client.get<BooksResponse>('/books', { params });
    return response.data;
  },

  async getById(id: string): Promise<BookDetailResponse> {
    const response = await client.get<BookDetailResponse>(`/books/${id}`);
    return response.data;
  },
};
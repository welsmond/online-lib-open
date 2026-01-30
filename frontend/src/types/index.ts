export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre?: string;
  isbn?: string;
  cover_image_url?: string;
  publication_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Audiobook {
  id: string;
  book_id: string;
  narrator?: string;
  duration_seconds: number;
  file_url: string;
  file_size_mb: number;
  bitrate?: string;
  created_at: string;
}

export interface LibraryEntry {
  id: string;
  user_id: string;
  book_id: string;
  is_favorite: boolean;
  rating?: number;
  review?: string;
  added_at: string;
  updated_at: string;
  title: string;
  author: string;
  cover_image_url?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, full_name?: string) => Promise<void>;
  logout: () => void;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
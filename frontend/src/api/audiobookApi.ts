import client from './client';

export const audiobookApi = {
  getStreamUrl(audiobookId: string): string {
    return `${import.meta.env.VITE_API_URL}/audiobooks/${audiobookId}/stream`;
  },
};
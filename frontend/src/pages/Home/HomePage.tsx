import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../../components/SearchBar';
import { Book, PaginationData } from '../../types';
import { bookApi } from '../../api/bookApi';

export function HomePage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState<any>({});

  useEffect(() => {
    loadBooks();
  }, [page, searchParams]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookApi.getAll({
        ...searchParams,
        page,
        limit: 12,
      });
      setBooks(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params: any) => {
    setSearchParams(params);
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        📚 Discover Audiobooks
      </Typography>

      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <Card
                  onClick={() => navigate(`/book/${book.id}`)}
                  sx={{ cursor: 'pointer', height: '100%', transition: 'transform 0.2s' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {book.cover_image_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={book.cover_image_url}
                      alt={book.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {book.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {book.author}
                    </Typography>
                    {book.genre && (
                      <Typography variant="caption" color="primary">
                        {book.genre}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {pagination && pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
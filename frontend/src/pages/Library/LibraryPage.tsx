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
  Rating,
  Button,
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { libraryApi } from '../../api/libraryApi';
import { LibraryEntry, PaginationData } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export function LibraryPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<LibraryEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadLibrary();
  }, [page, isAuthenticated]);

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const data = await libraryApi.getMyLibrary({ page, limit: 12 });
      setBooks(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        📚 My Library
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : books.length === 0 ? (
        <Typography align="center" color="textSecondary">
          No books in library. Start adding!
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {books.map((entry) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={entry.id}>
                <Card>
                  {entry.cover_image_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={entry.cover_image_url}
                      alt={entry.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {entry.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {entry.author}
                    </Typography>
                    {entry.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={entry.rating} readOnly size="small" />
                        <Typography variant="caption">{entry.rating}/5</Typography>
                      </Box>
                    )}
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={() => navigate(`/book/${entry.book_id}`)}
                      sx={{ mt: 1 }}
                    >
                      View
                    </Button>
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
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
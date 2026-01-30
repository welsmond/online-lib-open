import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Rating,
  Divider,
  Alert,
  Card,
  CardContent,
  Chip,
  Dialog,
  TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { bookApi } from '../../api/bookApi';
import { libraryApi } from '../../api/libraryApi';
import { CustomAudioPlayer } from '../../components/AudioPlayer';
import { useAuth } from '../../hooks/useAuth';
import type { Book, Audiobook } from '../../types';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudiobook, setSelectedAudiobook] = useState<Audiobook | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rating, setRating] = useState<number | null>(0);
  const [review, setReview] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await bookApi.getById(id);
        setBook(data.book);
        setAudiobooks(data.audiobooks);
        if (data.audiobooks.length > 0) {
          setSelectedAudiobook(data.audiobooks[0]);
        }
      } catch (err) {
        setError('Error loading book');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBookDetails();
  }, [id]);

  useEffect(() => {
    const checkLibraryStatus = async () => {
      if (!isAuthenticated || !id) return;

      try {
        const libraryData = await libraryApi.getMyLibrary({ limit: 1000 });
        const bookInLibrary = libraryData.data.find((item) => item.book_id === id);

        if (bookInLibrary) {
          setInLibrary(true);
          setIsFavorite(bookInLibrary.is_favorite);
          if (bookInLibrary.rating) {
            setRating(bookInLibrary.rating);
          }
        }
      } catch (err) {
        console.error('Error checking library:', err);
      }
    };

    checkLibraryStatus();
  }, [id, isAuthenticated]);

  const handleAddToLibrary = async () => {
    if (!isAuthenticated || !id) {
      navigate('/login');
      return;
    }

    try {
      await libraryApi.addBook(id);
      setInLibrary(true);
      alert('Book added to library!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error adding to library');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !id) {
      navigate('/login');
      return;
    }

    try {
      await libraryApi.addToFavorites(id);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleAddReview = async () => {
    if (!isAuthenticated || !id || rating === null) {
      alert('Please set a rating');
      return;
    }

    setReviewLoading(true);
    try {
      await libraryApi.addReview(id, rating, review);
      setShowReviewDialog(false);
      setReview('');
      alert('Review added!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error adding review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Book not found</Alert>
      </Container>
    );
  }

  const streamUrl = selectedAudiobook
    ? `/api/audiobooks/${selectedAudiobook.id}/stream`
    : '';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            {book.cover_image_url && (
              <Box
                component="img"
                src={book.cover_image_url}
                alt={book.title}
                sx={{ width: '100%', borderRadius: 2, mb: 2 }}
              />
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {!inLibrary ? (
                <Button variant="contained" fullWidth onClick={handleAddToLibrary}>
                  Add to Library
                </Button>
              ) : (
                <Button variant="outlined" color="error" fullWidth>
                  In Library
                </Button>
              )}
            </Box>

            {inLibrary && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={handleToggleFavorite}
                  color={isFavorite ? 'error' : 'inherit'}
                >
                  {isFavorite ? 'Favorite' : 'Add to Favorites'}
                </Button>
                <Button variant="outlined" fullWidth onClick={() => setShowReviewDialog(true)}>
                  Review
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Card sx={{ backgroundColor: '#fafafa' }}>
              <CardContent>
                <Typography variant="body2">
                  <strong>Author:</strong> {book.author}
                </Typography>
                {book.genre && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Genre:</strong> {book.genre}
                  </Typography>
                )}
                {book.publication_date && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Published:</strong>{' '}
                    {new Date(book.publication_date).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            {book.title}
          </Typography>

          <Typography variant="h6" color="textSecondary" gutterBottom>
            {book.author}
          </Typography>

          {book.description && (
            <>
              <Typography variant="body1" paragraph sx={{ mt: 3 }}>
                {book.description}
              </Typography>
              <Divider sx={{ my: 3 }} />
            </>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Audiobooks ({audiobooks.length})
          </Typography>

          {audiobooks.length > 0 ? (
            <Box>
              {audiobooks.length > 1 && (
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {audiobooks.map((audio) => (
                    <Chip
                      key={audio.id}
                      label={audio.narrator || 'Unknown'}
                      onClick={() => setSelectedAudiobook(audio)}
                      variant={selectedAudiobook?.id === audio.id ? 'filled' : 'outlined'}
                      color={selectedAudiobook?.id === audio.id ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              )}

              {selectedAudiobook && (
                <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Narrator:</strong> {selectedAudiobook.narrator || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Duration:</strong>{' '}
                        {Math.floor(selectedAudiobook.duration_seconds / 60)} min
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              <CustomAudioPlayer src={streamUrl} title={book.title} />
            </Box>
          ) : (
            <Alert severity="info">No audiobook available</Alert>
          )}
        </Grid>
      </Grid>

      <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Review
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2">Rating</Typography>
            <Rating value={rating} onChange={(_, value) => setRating(value)} size="large" />
          </Box>

          <TextField
            fullWidth
            label="Your Review"
            multiline
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddReview}
              disabled={reviewLoading}
            >
              {reviewLoading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setShowReviewDialog(false)}
              disabled={reviewLoading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
}
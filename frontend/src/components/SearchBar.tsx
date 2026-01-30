import React, { useState } from 'react';
import { Box, TextField, Button, Grid } from '@mui/material';

interface SearchBarProps {
  onSearch: (params: {
    search?: string;
    author?: string;
    genre?: string;
  }) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');

  const handleSearch = () => {
    onSearch({
      search: search || undefined,
      author: author || undefined,
      genre: genre || undefined,
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            placeholder="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSearch}
            sx={{ height: '56px' }}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
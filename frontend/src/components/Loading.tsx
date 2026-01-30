import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export function Loading() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="h6">Loading...</Typography>
    </Box>
  );
}
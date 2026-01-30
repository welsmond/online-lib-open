import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../styles/theme';
import { Header } from '../components/Header';
import { Box } from '@mui/material';
import { AuthProvider } from '../context/AuthContext';

export function Root() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box minHeight="100vh" display="flex" flexDirection="column">
          <Header />
          <Box flex={1}>
            <Outlet />
          </Box>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}
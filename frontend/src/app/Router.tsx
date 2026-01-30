import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/Home/HomePage';
import { LoginPage } from '../pages/Login/LoginPage';
import { RegisterPage } from '../pages/Register/RegisterPage';
import { BookDetailPage } from '../pages/BookDetail/BookDetailPage';
import { LibraryPage } from '../pages/Library/LibraryPage';
import { Root } from './Root';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Loading';
import { Box } from '@mui/material';

// Layout wrapper with header
function Layout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) return <Loading />;

  return <Box minHeight="100vh" display="flex" flexDirection="column">{children}</Box>;
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: (
          <Layout>
            <HomePage />
          </Layout>
        ),
      },
      {
        path: '/book/:id',
        element: (
          <Layout>
            <BookDetailPage />
          </Layout>
        ),
      },
      {
        path: '/library',
        element: (
          <ProtectedRoute>
            <Layout>
              <LibraryPage />
            </Layout>
          </ProtectedRoute>
        ),
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" />,
      },
    ],
  },
]);
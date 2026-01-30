import React, { createContext, useState, useEffect, ReactNode } from 'react';
import client from '../api/client';
import { User, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    // Restore auth from localStorage
    const savedAccessToken = localStorage.getItem('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    const savedUser = localStorage.getItem('user');

    if (savedAccessToken && savedUser) {
      setAccessToken(savedAccessToken);
      setRefreshToken(savedRefreshToken);
      setUser(JSON.parse(savedUser));
      client.defaults.headers.common.Authorization = `Bearer ${savedAccessToken}`;
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await client.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser(user);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    full_name?: string
  ) => {
    try {
      const response = await client.post('/auth/register', {
        username,
        email,
        password,
        full_name,
      });
      const { accessToken, refreshToken, user } = response.data;

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser(user);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete client.defaults.headers.common.Authorization;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    accessToken,
    refreshToken,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
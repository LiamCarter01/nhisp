/**
 * Auth Context
 * =============
 * Global authentication state management with JWT tokens.
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/services';
import type { User } from '../api/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

interface JwtPayload {
  user_id: string;
  exp: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data.data);
    } catch {
      logout();
    }
  }, [logout]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    await fetchProfile();
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (decoded.exp * 1000 > Date.now()) {
            await fetchProfile();
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchProfile, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hooks
 * =============
 */

import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import type { UserRole } from '../api/types';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRole = (): UserRole | null => {
  const { user } = useAuth();
  return user?.role ?? null;
};

export const useHasRole = (...roles: UserRole[]): boolean => {
  const role = useRole();
  return role !== null && roles.includes(role);
};

/**
 * Authentication Hooks
 * 
 * Custom hooks for accessing and managing authentication state
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to access authentication state and actions
 */
export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const error = useAuthStore((state) => state.error);
  
  const login = useAuthStore((state) => state.login);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);
  const logout = useAuthStore((state) => state.logout);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const clearError = useAuthStore((state) => state.clearError);
  
  const hasAccess = isAuthenticated || isGuest;

  return {
    // State
    isAuthenticated,
    isGuest,
    isLoading,
    user,
    error,
    hasAccess,
    
    // Actions
    login,
    loginAsGuest,
    logout,
    setLoading,
    setError,
    clearError,
  };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated or guest
 */
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const router = useRouter();
  const { hasAccess, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      // Store current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
    }
  }, [hasAccess, isLoading, redirectTo, router]);

  return { hasAccess, isLoading };
}

/**
 * Hook to require full authentication (not guest)
 * Redirects to login if not authenticated
 */
export function useRequireFullAuth(redirectTo: string = '/auth/login') {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to redirect if already authenticated
 * Useful for login/signup pages
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/app/map') {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

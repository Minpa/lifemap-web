/**
 * Authentication Store
 * 
 * Zustand store for managing authentication state across the application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AuthUser,
  AuthSession,
  StoredAuthState,
  createSession,
  createGuestUser,
  isSessionExpired,
} from '../cloudkit/types';
import { cloudKitService } from '../cloudkit/service';
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie';

/**
 * Authentication state interface
 */
export interface AuthState {
  // State
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  error: string | null;
  
  // Actions
  login: (user: AuthUser) => void;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  restoreSession: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
}

/**
 * Initial state
 */
const initialState = {
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  user: null,
  session: null,
  error: null,
};

/**
 * Create auth store with persistence
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Login with authenticated user
       */
      login: (user: AuthUser) => {
        const session = createSession(user, false);
        
        set({
          isAuthenticated: true,
          isGuest: false,
          user,
          session,
          isLoading: false,
          error: null,
        });
        
        // Sync to cookie for middleware
        setAuthCookie(true, false);
      },

      /**
       * Login as guest
       */
      loginAsGuest: () => {
        const guestUser = createGuestUser();
        const session = createSession(guestUser, true);
        
        set({
          isAuthenticated: false,
          isGuest: true,
          user: guestUser,
          session,
          isLoading: false,
          error: null,
        });
        
        // Sync to cookie for middleware
        setAuthCookie(false, true);
      },

      /**
       * Logout
       */
      logout: async () => {
        const { isAuthenticated } = get();
        
        // Sign out from CloudKit if authenticated
        if (isAuthenticated) {
          try {
            await cloudKitService.signOut();
          } catch (error) {
            console.error('Error signing out from CloudKit:', error);
          }
        }
        
        // Clear cookie
        clearAuthCookie();
        
        // Reset state
        set({
          ...initialState,
        });
      },

      /**
       * Set loading state
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      /**
       * Set error
       */
      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Restore session from storage
       */
      restoreSession: async () => {
        const { session } = get();
        
        // No session to restore
        if (!session) {
          return;
        }
        
        // Check if session is expired
        if (isSessionExpired(session)) {
          console.log('Session expired, clearing...');
          set({ ...initialState });
          return;
        }
        
        // If authenticated session, verify with CloudKit
        if (!session.isGuest) {
          try {
            const isAuth = await cloudKitService.isAuthenticated();
            
            if (!isAuth) {
              console.log('CloudKit session invalid, clearing...');
              set({ ...initialState });
              return;
            }
            
            // Update last login time
            const updatedUser = {
              ...session.user,
              lastLoginAt: new Date().toISOString(),
            };
            
            set({
              isAuthenticated: true,
              isGuest: false,
              user: updatedUser,
              session: {
                ...session,
                user: updatedUser,
              },
            });
          } catch (error) {
            console.error('Error restoring session:', error);
            set({ ...initialState });
          }
        } else {
          // Guest session - just restore from storage
          set({
            isAuthenticated: false,
            isGuest: true,
            user: session.user,
            session,
          });
        }
      },

      /**
       * Update user information
       */
      updateUser: (updates: Partial<AuthUser>) => {
        const { user, session } = get();
        
        if (!user) {
          return;
        }
        
        const updatedUser = {
          ...user,
          ...updates,
        };
        
        set({
          user: updatedUser,
          session: session ? {
            ...session,
            user: updatedUser,
          } : null,
        });
      },
    }),
    {
      name: 'lifemap-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
);

/**
 * Selectors for common state access patterns
 */
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsGuest = (state: AuthState) => state.isGuest;
export const selectUser = (state: AuthState) => state.user;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectHasAccess = (state: AuthState) => state.isAuthenticated || state.isGuest;

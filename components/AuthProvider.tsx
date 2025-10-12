'use client';

/**
 * Authentication Provider
 * 
 * Initializes CloudKit and restores authentication session on app load
 */

import { useEffect, useState } from 'react';
import { cloudKitService } from '@/lib/cloudkit/service';
import { useAuthStore } from '@/lib/stores/authStore';
import { isCloudKitConfigured } from '@/lib/config/cloudkit';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const setError = useAuthStore((state) => state.setError);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if CloudKit is configured
        if (!isCloudKitConfigured()) {
          console.warn('CloudKit is not configured. Authentication features will be limited.');
          setIsInitialized(true);
          return;
        }

        // Initialize CloudKit
        await cloudKitService.initialize();

        // Restore session from localStorage
        await restoreSession();

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        setError('인증 초기화에 실패했습니다.');
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [restoreSession, setError]);

  // Show nothing while initializing (or a loading screen)
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--color-text)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p>초기화 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

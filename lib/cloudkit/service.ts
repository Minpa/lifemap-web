/**
 * CloudKit Service
 * 
 * Wrapper around CloudKit JS SDK for authentication and data operations
 */

import { getCloudKitConfig, isCloudKitConfigured } from '../config/cloudkit';
import {
  CloudKitUserIdentity,
  CloudKitAuthStatus,
  AuthError,
  AuthErrorType,
  createAuthError,
  mapCloudKitError,
} from './types';
import { withRetry } from './retry';

// Declare CloudKit global type
declare global {
  interface Window {
    CloudKit?: any;
  }
}

/**
 * CloudKit Service Class
 */
class CloudKitService {
  private container: any = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Load CloudKit JS SDK dynamically
   */
  private async loadCloudKit(): Promise<any> {
    // Check if already loaded
    if (window.CloudKit) {
      return window.CloudKit;
    }

    // Load CloudKit JS SDK from CDN
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.apple-cloudkit.com/ck/2/cloudkit.js';
      script.async = true;
      
      script.onload = () => {
        if (window.CloudKit) {
          resolve(window.CloudKit);
        } else {
          reject(new Error('CloudKit failed to load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load CloudKit script'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize CloudKit
   */
  async initialize(): Promise<void> {
    // Return existing initialization promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.initialized) {
      return Promise.resolve();
    }

    // Mock mode - skip CloudKit initialization
    if (this.isMockMode()) {
      this.initialized = true;
      return Promise.resolve();
    }

    // Check if CloudKit is configured
    if (!isCloudKitConfigured()) {
      throw createAuthError(AuthErrorType.CLOUDKIT_NOT_CONFIGURED);
    }

    // Create initialization promise with retry logic
    this.initPromise = withRetry(
      async () => {
        try {
          // Load CloudKit SDK
          const CloudKit = await this.loadCloudKit();

          // Get configuration
          const config = getCloudKitConfig();

          // Configure CloudKit
          CloudKit.configure({
            containers: [{
              containerIdentifier: config.containerIdentifier,
              apiTokenAuth: {
                apiToken: config.apiToken,
                persist: true,
              },
              environment: config.environment,
            }],
          });

          // Get default container
          this.container = CloudKit.getDefaultContainer();

          // Set up authentication
          await this.container.setUpAuth();

          this.initialized = true;
        } catch (error) {
          this.initialized = false;
          this.initPromise = null;
          throw createAuthError(AuthErrorType.CLOUDKIT_INIT_FAILED, error);
        }
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
      }
    );

    return this.initPromise;
  }

  /**
   * Ensure CloudKit is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Mock mode - always return true if initialized
      if (this.isMockMode()) {
        return this.initialized;
      }

      await this.ensureInitialized();
      
      const userIdentity = this.container.userIdentity;
      return !!userIdentity;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Get authentication status
   */
  async getAuthStatus(): Promise<CloudKitAuthStatus> {
    const isAuth = await this.isAuthenticated();
    return isAuth ? 'authenticated' : 'unauthenticated';
  }

  /**
   * Get current user identity
   */
  async getCurrentUser(): Promise<CloudKitUserIdentity | null> {
    try {
      await this.ensureInitialized();
      
      const userIdentity = this.container.userIdentity;
      
      if (!userIdentity) {
        return null;
      }

      return {
        userRecordName: userIdentity.userRecordName,
        firstName: userIdentity.nameComponents?.givenName,
        lastName: userIdentity.nameComponents?.familyName,
        emailAddress: userIdentity.emailAddress,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Sign in with Apple
   */
  async signIn(): Promise<CloudKitUserIdentity> {
    try {
      // Mock mode for local development without CloudKit
      if (this.isMockMode()) {
        return this.mockSignIn();
      }

      await this.ensureInitialized();

      // Trigger sign in
      const userIdentity = await this.container.whenUserSignsIn();

      if (!userIdentity) {
        throw createAuthError(AuthErrorType.AUTHENTICATION_FAILED);
      }

      return {
        userRecordName: userIdentity.userRecordName,
        firstName: userIdentity.nameComponents?.givenName,
        lastName: userIdentity.nameComponents?.familyName,
        emailAddress: userIdentity.emailAddress,
      };
    } catch (error) {
      throw mapCloudKitError(error);
    }
  }

  /**
   * Check if running in mock mode
   */
  private isMockMode(): boolean {
    const containerId = process.env.NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID;
    return containerId === 'mock' || containerId === 'test';
  }

  /**
   * Mock sign in for local development
   */
  private async mockSignIn(): Promise<CloudKitUserIdentity> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock user
    return {
      userRecordName: `mock-user-${Date.now()}`,
      firstName: '테스트',
      lastName: '사용자',
      emailAddress: 'test@example.com',
    };
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await this.ensureInitialized();
      
      // Sign out from CloudKit
      await this.container.whenUserSignsOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Don't throw error on sign out failure
      // We'll clear local state anyway
    }
  }

  /**
   * Check if CloudKit is available in the current environment
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && isCloudKitConfigured();
  }

  /**
   * Reset the service (for testing)
   */
  reset(): void {
    this.container = null;
    this.initialized = false;
    this.initPromise = null;
  }
}

// Export singleton instance
export const cloudKitService = new CloudKitService();

// Export class for testing
export { CloudKitService };

/**
 * CloudKit Configuration
 * 
 * This file contains the configuration for CloudKit JS SDK integration.
 * CloudKit is used for Apple authentication and iCloud data synchronization.
 */

export interface CloudKitConfig {
  containerIdentifier: string;
  apiToken: string;
  environment: 'development' | 'production';
  signInButton?: {
    id: string;
    theme: 'black' | 'white' | 'white-with-outline';
    type: 'sign-in' | 'continue';
  };
}

/**
 * Get CloudKit configuration from environment variables
 */
export function getCloudKitConfig(): CloudKitConfig {
  const containerIdentifier = process.env.NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID;
  const apiToken = process.env.NEXT_PUBLIC_CLOUDKIT_API_TOKEN;
  const environment = process.env.NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT as 'development' | 'production';

  // Allow mock mode for local development
  if (containerIdentifier === 'mock' || containerIdentifier === 'test') {
    return {
      containerIdentifier: 'mock',
      apiToken: 'mock',
      environment: 'development',
      signInButton: {
        id: 'apple-sign-in-button',
        theme: 'black',
        type: 'sign-in',
      },
    };
  }

  // Validate required environment variables
  if (!containerIdentifier) {
    throw new Error(
      'NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID is not set. ' +
      'Please add it to your .env.local file. ' +
      'Get this value from Apple Developer Portal > CloudKit Dashboard. ' +
      'Or use "mock" for local development without CloudKit.'
    );
  }

  if (!apiToken) {
    throw new Error(
      'NEXT_PUBLIC_CLOUDKIT_API_TOKEN is not set. ' +
      'Please add it to your .env.local file. ' +
      'Get this value from Apple Developer Portal > CloudKit Dashboard. ' +
      'Or use "mock" for local development without CloudKit.'
    );
  }

  return {
    containerIdentifier,
    apiToken,
    environment: environment || 'development',
    signInButton: {
      id: 'apple-sign-in-button',
      theme: 'black',
      type: 'sign-in',
    },
  };
}

/**
 * Check if CloudKit is configured
 */
export function isCloudKitConfigured(): boolean {
  const containerId = process.env.NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID;
  const apiToken = process.env.NEXT_PUBLIC_CLOUDKIT_API_TOKEN;
  
  // Allow mock mode for local development
  if (containerId === 'mock' || containerId === 'test') {
    return true;
  }
  
  return !!(containerId && apiToken);
}

/**
 * Get CloudKit configuration status for debugging
 */
export function getCloudKitConfigStatus() {
  return {
    containerIdSet: !!process.env.NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID,
    apiTokenSet: !!process.env.NEXT_PUBLIC_CLOUDKIT_API_TOKEN,
    environment: process.env.NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT || 'development',
  };
}

/**
 * Retry Logic for CloudKit Operations
 * 
 * Provides retry functionality for network and transient errors
 */

import { AuthError, AuthErrorType, createAuthError } from './types';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  retryableErrors?: AuthErrorType[];
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
  retryableErrors: [
    AuthErrorType.NETWORK_ERROR,
    AuthErrorType.CLOUDKIT_INIT_FAILED,
  ],
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: AuthError, retryableErrors: AuthErrorType[]): boolean {
  return retryableErrors.includes(error.type);
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.delayMs * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelayMs);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: AuthError | null = null;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      // Convert to AuthError if not already
      const authError = error as AuthError;
      lastError = authError;

      // Check if error is retryable
      if (!isRetryableError(authError, opts.retryableErrors)) {
        throw authError;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        throw authError;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts);
      console.log(`Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms`);
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || createAuthError(AuthErrorType.UNKNOWN_ERROR);
}

/**
 * Retry wrapper for CloudKit operations
 */
export function withRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return retryOperation(operation, options);
}

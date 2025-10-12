/**
 * Authentication Cookie Utilities
 * 
 * Sync authentication status to cookies for middleware access
 */

/**
 * Set auth status cookie
 */
export function setAuthCookie(isAuthenticated: boolean, isGuest: boolean): void {
  if (typeof document === 'undefined') {
    return;
  }

  const status = JSON.stringify({ isAuthenticated, isGuest });
  
  // Set cookie with 30 day expiration
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  
  document.cookie = `lifemap-auth-status=${encodeURIComponent(status)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

/**
 * Clear auth status cookie
 */
export function clearAuthCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = 'lifemap-auth-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

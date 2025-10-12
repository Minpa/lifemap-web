/**
 * Middleware Configuration
 * 
 * Defines route patterns for authentication middleware
 */

export interface MiddlewareConfig {
  protectedRoutes: string[];
  authRoutes: string[];
  publicRoutes: string[];
  defaultRedirect: string;
  loginRedirect: string;
}

/**
 * Middleware configuration
 */
export const middlewareConfig: MiddlewareConfig = {
  /**
   * Protected routes - require authentication or guest mode
   */
  protectedRoutes: [
    '/app/map',
    '/app/:path*',
    '/journal',
    '/journal/:path*',
    '/photos',
    '/photos/:path*',
    '/palette',
    '/privacy',
    '/settings',
    '/runs',
    '/runs/:path*',
  ],

  /**
   * Auth routes - redirect to app if already authenticated
   */
  authRoutes: [
    '/auth/login',
    '/auth/signup',
  ],

  /**
   * Public routes - always accessible
   */
  publicRoutes: [
    '/',
    '/privacy-policy',
    '/terms',
    '/_next/:path*',
    '/api/:path*',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ],

  /**
   * Default redirect after login
   */
  defaultRedirect: '/app/map',

  /**
   * Login page redirect
   */
  loginRedirect: '/auth/login',
};

/**
 * Check if a path matches a route pattern
 */
export function matchesPattern(path: string, pattern: string): boolean {
  // Convert pattern to regex
  // :path* becomes .*
  // :path becomes [^/]+
  const regexPattern = pattern
    .replace(/:\w+\*/g, '.*')
    .replace(/:\w+/g, '[^/]+')
    .replace(/\//g, '\\/');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Check if path is a protected route
 */
export function isProtectedRoute(path: string): boolean {
  return middlewareConfig.protectedRoutes.some((pattern) =>
    matchesPattern(path, pattern)
  );
}

/**
 * Check if path is an auth route
 */
export function isAuthRoute(path: string): boolean {
  return middlewareConfig.authRoutes.some((pattern) =>
    matchesPattern(path, pattern)
  );
}

/**
 * Check if path is a public route
 */
export function isPublicRoute(path: string): boolean {
  return middlewareConfig.publicRoutes.some((pattern) =>
    matchesPattern(path, pattern)
  );
}

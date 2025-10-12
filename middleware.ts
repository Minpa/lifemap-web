/**
 * Next.js Middleware for Route Protection
 * 
 * Protects routes based on authentication status
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isProtectedRoute,
  isAuthRoute,
  isPublicRoute,
  middlewareConfig,
} from './lib/middleware/config';

/**
 * Check authentication status from request
 */
function getAuthStatus(request: NextRequest): {
  isAuthenticated: boolean;
  isGuest: boolean;
  hasAccess: boolean;
} {
  // Try to get auth status from cookie (fast path)
  const authCookie = request.cookies.get('lifemap-auth-status');
  
  if (authCookie) {
    try {
      const status = JSON.parse(authCookie.value);
      return {
        isAuthenticated: status.isAuthenticated || false,
        isGuest: status.isGuest || false,
        hasAccess: status.isAuthenticated || status.isGuest || false,
      };
    } catch (error) {
      // Invalid cookie, fall through to default
    }
  }

  // Default to unauthenticated
  // The client will check localStorage and update the cookie
  return {
    isAuthenticated: false,
    isGuest: false,
    hasAccess: false,
  };
}

/**
 * Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get authentication status
  const { hasAccess, isAuthenticated } = getAuthStatus(request);

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!hasAccess) {
      // Not authenticated or guest - redirect to login
      const loginUrl = new URL(middlewareConfig.loginRedirect, request.url);
      
      // Store original URL for post-login redirect
      loginUrl.searchParams.set('redirect', pathname + search);
      
      return NextResponse.redirect(loginUrl);
    }
    
    // Has access - allow
    return NextResponse.next();
  }

  // Handle auth routes (login/signup)
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      // Already authenticated - redirect to app
      const redirectUrl = new URL(middlewareConfig.defaultRedirect, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Not authenticated - allow access to auth pages
    return NextResponse.next();
  }

  // Default - allow
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Specify which routes should run the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

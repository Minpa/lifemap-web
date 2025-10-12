/**
 * CloudKit Types and Interfaces
 * 
 * Type definitions for CloudKit JS SDK integration
 */

/**
 * CloudKit user identity returned from authentication
 */
export interface CloudKitUserIdentity {
  userRecordName: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
}

/**
 * Application user model (simplified from CloudKit identity)
 */
export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Authentication session data
 */
export interface AuthSession {
  user: AuthUser;
  isGuest: boolean;
  expiresAt: string;
  cloudKitToken?: string;
}

/**
 * Stored authentication state (persisted to localStorage)
 */
export interface StoredAuthState {
  version: number;
  session: AuthSession | null;
  timestamp: string;
}

/**
 * CloudKit authentication status
 */
export type CloudKitAuthStatus = 'authenticated' | 'unauthenticated';

/**
 * Authentication error types
 */
export enum AuthErrorType {
  CLOUDKIT_NOT_CONFIGURED = 'CLOUDKIT_NOT_CONFIGURED',
  CLOUDKIT_INIT_FAILED = 'CLOUDKIT_INIT_FAILED',
  CLOUDKIT_NOT_AVAILABLE = 'CLOUDKIT_NOT_AVAILABLE',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  USER_CANCELLED = 'USER_CANCELLED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Authentication error with type and message
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: Error | unknown;
}

/**
 * User-facing error messages in Korean
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  [AuthErrorType.CLOUDKIT_NOT_CONFIGURED]:
    '서비스 설정 오류입니다. 관리자에게 문의하세요.',
  [AuthErrorType.CLOUDKIT_INIT_FAILED]:
    '서비스 초기화에 실패했습니다. 새로고침 후 다시 시도해주세요.',
  [AuthErrorType.CLOUDKIT_NOT_AVAILABLE]:
    'CloudKit 서비스를 사용할 수 없습니다. 브라우저를 확인해주세요.',
  [AuthErrorType.AUTHENTICATION_FAILED]:
    '로그인에 실패했습니다. 다시 시도해주세요.',
  [AuthErrorType.NETWORK_ERROR]:
    '네트워크 연결을 확인해주세요.',
  [AuthErrorType.SESSION_EXPIRED]:
    '세션이 만료되었습니다. 다시 로그인해주세요.',
  [AuthErrorType.PERMISSION_DENIED]:
    'Apple ID 권한이 필요합니다.',
  [AuthErrorType.USER_CANCELLED]:
    '로그인이 취소되었습니다.',
  [AuthErrorType.UNKNOWN_ERROR]:
    '알 수 없는 오류가 발생했습니다.',
};

/**
 * Create an AuthError from various error types
 */
export function createAuthError(
  type: AuthErrorType,
  originalError?: Error | unknown
): AuthError {
  return {
    type,
    message: AUTH_ERROR_MESSAGES[type],
    originalError,
  };
}

/**
 * Map CloudKit error to AuthError
 */
export function mapCloudKitError(error: unknown): AuthError {
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createAuthError(AuthErrorType.NETWORK_ERROR, error);
  }

  // Handle CloudKit-specific errors
  if (typeof error === 'object' && error !== null) {
    const ckError = error as any;
    
    // User cancelled authentication
    if (ckError.ckErrorCode === 'AUTH_CANCELLED') {
      return createAuthError(AuthErrorType.USER_CANCELLED, error);
    }
    
    // Permission denied
    if (ckError.ckErrorCode === 'NOT_AUTHENTICATED' || ckError.ckErrorCode === 'ACCESS_DENIED') {
      return createAuthError(AuthErrorType.PERMISSION_DENIED, error);
    }
    
    // Network error
    if (ckError.ckErrorCode === 'NETWORK_ERROR' || ckError.ckErrorCode === 'SERVICE_UNAVAILABLE') {
      return createAuthError(AuthErrorType.NETWORK_ERROR, error);
    }
  }

  // Default to authentication failed
  return createAuthError(AuthErrorType.AUTHENTICATION_FAILED, error);
}

/**
 * Convert CloudKit user identity to AuthUser
 */
export function cloudKitUserToAuthUser(identity: CloudKitUserIdentity): AuthUser {
  const now = new Date().toISOString();
  
  return {
    id: identity.userRecordName,
    firstName: identity.firstName,
    lastName: identity.lastName,
    email: identity.emailAddress,
    createdAt: now,
    lastLoginAt: now,
  };
}

/**
 * Create a guest user
 */
export function createGuestUser(): AuthUser {
  const now = new Date().toISOString();
  
  return {
    id: `guest-${Date.now()}`,
    firstName: '게스트',
    createdAt: now,
    lastLoginAt: now,
  };
}

/**
 * Check if a session is expired
 */
export function isSessionExpired(session: AuthSession): boolean {
  const expiresAt = new Date(session.expiresAt);
  const now = new Date();
  
  return now >= expiresAt;
}

/**
 * Create a new session
 */
export function createSession(user: AuthUser, isGuest: boolean, expiresInDays: number = 30): AuthSession {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  return {
    user,
    isGuest,
    expiresAt: expiresAt.toISOString(),
  };
}

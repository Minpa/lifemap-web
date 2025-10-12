# Design Document

## Overview

This design document outlines the architecture for integrating CloudKit authentication into the LifeMap web application. The solution includes CloudKit JS SDK integration, Zustand-based state management, Next.js middleware for route protection, and session persistence using localStorage.

The design follows a layered architecture:
1. **CloudKit Layer**: Handles Apple authentication via CloudKit JS SDK
2. **State Management Layer**: Zustand store for global auth state
3. **Middleware Layer**: Next.js middleware for route protection
4. **UI Layer**: React components that consume auth state

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (Login/Signup Pages, Header, Protected Routes)             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                   Auth State Management                      │
│              (Zustand Store + Persistence)                   │
└───────────┬───────────────────────────┬─────────────────────┘
            │                           │
            ↓                           ↓
┌───────────────────────┐   ┌──────────────────────────────┐
│   CloudKit Service    │   │   Middleware Protection      │
│  (Apple Auth + Sync)  │   │   (Route Guards)             │
└───────────────────────┘   └──────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Persistent Storage                        │
│              (localStorage + CloudKit DB)                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Login/Signup)
    ↓
CloudKit Authentication
    ↓
Update Zustand Store
    ↓
Persist to localStorage
    ↓
Trigger UI Re-render
    ↓
Middleware Check (on navigation)
    ↓
Allow/Redirect based on auth state
```

---

## Components and Interfaces

### 1. CloudKit Service (`lib/cloudkit.ts`)

**Purpose**: Wrapper around CloudKit JS SDK for authentication operations.

**Interface**:

```typescript
interface CloudKitConfig {
  containerIdentifier: string;
  apiToken: string;
  environment: 'development' | 'production';
}

interface UserIdentity {
  userRecordName: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
}

interface CloudKitService {
  // Initialize CloudKit
  initialize(config: CloudKitConfig): Promise<void>;
  
  // Check if user is authenticated
  isAuthenticated(): Promise<boolean>;
  
  // Get current user identity
  getCurrentUser(): Promise<UserIdentity | null>;
  
  // Sign in with Apple
  signIn(): Promise<UserIdentity>;
  
  // Sign out
  signOut(): Promise<void>;
  
  // Check authentication status
  getAuthStatus(): Promise<'authenticated' | 'unauthenticated'>;
}
```

**Implementation Details**:
- Lazy-load CloudKit JS SDK to avoid blocking initial page load
- Handle CloudKit initialization errors gracefully
- Provide retry logic for network failures
- Cache authentication status to minimize API calls

### 2. Auth Store (`lib/stores/authStore.ts`)

**Purpose**: Centralized state management for authentication using Zustand.

**Interface**:

```typescript
interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
  
  // Actions
  login: (user: AuthUser) => void;
  loginAsGuest: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}
```

**Persistence Strategy**:
- Use Zustand's `persist` middleware
- Store in localStorage with key `lifemap-auth`
- Serialize/deserialize user object
- Restore session on app initialization

**State Transitions**:

```
Initial State (unauthenticated)
    ↓
    ├─→ login() → Authenticated State
    ├─→ loginAsGuest() → Guest State
    └─→ restoreSession() → Authenticated/Guest State
    
Authenticated/Guest State
    ↓
    └─→ logout() → Initial State (unauthenticated)
```

### 3. Middleware (`middleware.ts`)

**Purpose**: Protect routes and handle authentication-based redirects.

**Interface**:

```typescript
interface MiddlewareConfig {
  protectedRoutes: string[];
  authRoutes: string[];
  publicRoutes: string[];
  defaultRedirect: string;
}

function middleware(request: NextRequest): NextResponse;
```

**Route Categories**:

1. **Protected Routes** (require auth or guest):
   - `/app/*`
   - `/journal/*`
   - `/photos/*`
   - `/palette`
   - `/privacy`
   - `/settings`
   - `/runs/*`

2. **Auth Routes** (redirect if authenticated):
   - `/auth/login`
   - `/auth/signup`

3. **Public Routes** (always accessible):
   - `/`
   - `/privacy-policy`
   - `/terms`
   - `/_next/*`
   - `/api/*`

**Logic Flow**:

```typescript
1. Check if route is public → Allow
2. Check auth status from cookie/header
3. If protected route:
   - Not authenticated → Redirect to /auth/login
   - Authenticated/Guest → Allow
4. If auth route:
   - Authenticated → Redirect to /app/map
   - Not authenticated → Allow
5. Store original URL for post-login redirect
```

### 4. Auth Context Provider (`components/AuthProvider.tsx`)

**Purpose**: Initialize auth state and provide it to the component tree.

**Interface**:

```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps): JSX.Element;
```

**Responsibilities**:
- Initialize CloudKit on mount
- Restore session from localStorage
- Handle CloudKit authentication events
- Provide auth state to children via Zustand

### 5. Updated Login/Signup Pages

**Changes**:
- Replace mock authentication with CloudKit service calls
- Use auth store for state management
- Handle CloudKit-specific errors
- Show appropriate loading states

**Flow**:

```typescript
// Login Page
const handleAppleSignIn = async () => {
  setLoading(true);
  clearError();
  
  try {
    // Trigger CloudKit sign in
    const userIdentity = await cloudKitService.signIn();
    
    // Update auth store
    login({
      id: userIdentity.userRecordName,
      firstName: userIdentity.firstName,
      lastName: userIdentity.lastName,
      email: userIdentity.emailAddress,
    });
    
    // Redirect to app or original destination
    const redirectTo = searchParams.get('redirect') || '/app/map';
    router.push(redirectTo);
  } catch (error) {
    setError('로그인에 실패했습니다. 다시 시도해주세요.');
  } finally {
    setLoading(false);
  }
};
```

### 6. Updated Header Component

**Changes**:
- Subscribe to auth store
- Show/hide based on auth state
- Display user info for authenticated users
- Show guest badge for guest users

**UI States**:

```typescript
// Unauthenticated
<div className={styles.authButtons}>
  <Link href="/auth/login">로그인</Link>
  <Link href="/auth/signup">가입하기</Link>
</div>

// Guest
<div className={styles.userSection}>
  <span className={styles.guestBadge}>게스트</span>
  <button onClick={handleLogout}>로그아웃</button>
</div>

// Authenticated
<div className={styles.userSection}>
  <span className={styles.userName}>{user.firstName}</span>
  <button onClick={handleLogout}>로그아웃</button>
</div>
```

---

## Data Models

### AuthUser

```typescript
interface AuthUser {
  id: string;                // CloudKit userRecordName
  firstName?: string;        // User's first name
  lastName?: string;         // User's last name
  email?: string;           // User's email (if shared)
  createdAt: string;        // ISO timestamp
  lastLoginAt: string;      // ISO timestamp
}
```

### AuthSession

```typescript
interface AuthSession {
  user: AuthUser;
  isGuest: boolean;
  expiresAt: string;        // ISO timestamp
  cloudKitToken?: string;   // CloudKit session token
}
```

### StoredAuthState

```typescript
interface StoredAuthState {
  version: number;          // Schema version for migrations
  session: AuthSession | null;
  timestamp: string;        // Last update timestamp
}
```

---

## Error Handling

### Error Types

```typescript
enum AuthErrorType {
  CLOUDKIT_NOT_CONFIGURED = 'CLOUDKIT_NOT_CONFIGURED',
  CLOUDKIT_INIT_FAILED = 'CLOUDKIT_INIT_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: Error;
}
```

### Error Handling Strategy

1. **CloudKit Not Configured** (Development):
   ```typescript
   if (!process.env.NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID) {
     console.error('CloudKit not configured. Set NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID');
     // Show development error UI
   }
   ```

2. **Authentication Failed**:
   ```typescript
   catch (error) {
     if (error.code === 'AUTHENTICATION_FAILED') {
       setError('로그인에 실패했습니다. 다시 시도해주세요.');
     }
   }
   ```

3. **Network Error**:
   ```typescript
   catch (error) {
     if (error.code === 'NETWORK_ERROR') {
       setError('네트워크 연결을 확인해주세요.');
     }
   }
   ```

4. **Session Expired**:
   ```typescript
   if (error.code === 'SESSION_EXPIRED') {
     logout();
     router.push('/auth/login?expired=true');
   }
   ```

### User-Facing Error Messages (Korean)

```typescript
const ERROR_MESSAGES: Record<AuthErrorType, string> = {
  CLOUDKIT_NOT_CONFIGURED: '서비스 설정 오류입니다. 관리자에게 문의하세요.',
  CLOUDKIT_INIT_FAILED: '서비스 초기화에 실패했습니다. 새로고침 후 다시 시도해주세요.',
  AUTHENTICATION_FAILED: '로그인에 실패했습니다. 다시 시도해주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
  PERMISSION_DENIED: 'Apple ID 권한이 필요합니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};
```

---

## Testing Strategy

### Unit Tests

1. **CloudKit Service**:
   - Test initialization with valid/invalid config
   - Test sign in success/failure
   - Test sign out
   - Test session restoration

2. **Auth Store**:
   - Test state transitions (login, logout, guest)
   - Test persistence (save/restore)
   - Test error handling
   - Test concurrent state updates

3. **Middleware**:
   - Test protected route access (authenticated/unauthenticated)
   - Test auth route redirects
   - Test public route access
   - Test redirect URL preservation

### Integration Tests

1. **Authentication Flow**:
   - User signs up → redirected to app
   - User logs in → redirected to app
   - User logs out → redirected to landing
   - Guest mode → full app access

2. **Session Persistence**:
   - User logs in → closes browser → reopens → still logged in
   - Session expires → user redirected to login

3. **Route Protection**:
   - Unauthenticated user tries to access `/app/map` → redirected to login
   - Authenticated user accesses `/auth/login` → redirected to app

### E2E Tests

1. Complete signup flow with Apple ID
2. Complete login flow with Apple ID
3. Guest mode usage
4. Session restoration after page reload
5. Logout and re-login

---

## Security Considerations

### 1. Token Storage

- **CloudKit tokens**: Stored in memory only, not localStorage
- **Session data**: Stored in localStorage with minimal user info
- **Sensitive data**: Never stored in localStorage (use CloudKit DB)

### 2. HTTPS Enforcement

```typescript
// middleware.ts
if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
  return NextResponse.redirect(`https://${request.url.slice(7)}`);
}
```

### 3. CSRF Protection

- Use Next.js built-in CSRF protection
- Validate CloudKit tokens on server-side API routes

### 4. Rate Limiting

```typescript
// Implement rate limiting for auth endpoints
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
});
```

---

## Performance Considerations

### 1. Lazy Loading

```typescript
// Lazy load CloudKit SDK
const loadCloudKit = async () => {
  if (typeof window !== 'undefined' && !window.CloudKit) {
    await import('cloudkit');
  }
  return window.CloudKit;
};
```

### 2. Middleware Optimization

```typescript
// Cache auth status in cookie for fast middleware checks
export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('lifemap-auth-status');
  
  // Fast path: check cookie first
  if (authCookie) {
    return handleWithCachedAuth(request, authCookie.value);
  }
  
  // Slow path: check localStorage via client-side
  return handleWithoutCache(request);
}
```

### 3. State Updates

```typescript
// Batch state updates to minimize re-renders
const login = (user: AuthUser) => {
  set((state) => ({
    ...state,
    isAuthenticated: true,
    isGuest: false,
    user,
    isLoading: false,
    error: null,
  }));
};
```

---

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=iCloud.com.yourcompany.lifemap
NEXT_PUBLIC_CLOUDKIT_API_TOKEN=your_api_token_here
NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT=development # or production
```

### CloudKit Configuration

```typescript
// lib/config/cloudkit.ts
export const cloudKitConfig: CloudKitConfig = {
  containerIdentifier: process.env.NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID!,
  apiToken: process.env.NEXT_PUBLIC_CLOUDKIT_API_TOKEN!,
  environment: (process.env.NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT as 'development' | 'production') || 'development',
  
  // Optional settings
  signInButton: {
    id: 'apple-sign-in-button',
    theme: 'black',
    type: 'sign-in',
  },
};
```

---

## Migration Strategy

### Phase 1: Setup Infrastructure
1. Install CloudKit JS SDK
2. Create auth store
3. Create CloudKit service wrapper
4. Add environment variables

### Phase 2: Update UI Components
1. Update login page
2. Update signup page
3. Update header component
4. Add auth provider

### Phase 3: Add Route Protection
1. Create middleware
2. Test protected routes
3. Test auth routes
4. Test public routes

### Phase 4: Testing & Polish
1. Add error handling
2. Add loading states
3. Test session persistence
4. Test guest mode

---

## Deployment Checklist

- [ ] CloudKit container created in Apple Developer Portal
- [ ] CloudKit API token generated
- [ ] Environment variables set in production
- [ ] HTTPS enforced
- [ ] Error tracking configured (Sentry)
- [ ] Rate limiting enabled
- [ ] Session expiration configured
- [ ] Backup authentication method (guest mode)

---

## Future Enhancements

1. **Multi-device Session Management**: Show active sessions, allow remote logout
2. **Biometric Authentication**: Face ID/Touch ID on supported devices
3. **Account Linking**: Link multiple Apple IDs
4. **Social Sharing**: Share with other LifeMap users
5. **Family Sharing**: Share maps with family members

---

## Summary

This design provides a robust, secure, and performant authentication system for LifeMap using CloudKit JS SDK. The architecture is modular, testable, and follows Next.js best practices. The system supports both authenticated users (with iCloud sync) and guest users (local-only), providing flexibility for different user preferences.

**Key Design Decisions**:
1. **Zustand for State**: Simple, performant, and easy to test
2. **Next.js Middleware**: Built-in route protection without client-side checks
3. **CloudKit JS SDK**: Native Apple authentication with iCloud integration
4. **localStorage Persistence**: Fast session restoration without server calls
5. **Guest Mode**: Low-friction onboarding for new users

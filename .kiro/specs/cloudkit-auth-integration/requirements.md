# Requirements Document

## Introduction

This document outlines the requirements for integrating CloudKit authentication with the LifeMap web application, including state management and protected routes. The goal is to enable users to authenticate using Sign in with Apple via CloudKit JS SDK, manage authentication state across the application, and protect routes that require authentication.

## Requirements

### Requirement 1: CloudKit JS SDK Integration

**User Story:** As a user, I want to sign in with my Apple ID so that my data can sync across all my devices via iCloud.

#### Acceptance Criteria

1. WHEN the application loads THEN the CloudKit JS SDK SHALL be initialized with the correct container configuration
2. WHEN a user clicks "Apple로 로그인" or "Apple로 가입하기" THEN the system SHALL trigger the CloudKit authentication flow
3. WHEN authentication succeeds THEN the system SHALL store the user identity and session token securely
4. WHEN authentication fails THEN the system SHALL display an appropriate error message in Korean
5. IF the user is already authenticated THEN the system SHALL restore their session on page load
6. WHEN a user logs out THEN the system SHALL clear the CloudKit session and local storage

### Requirement 2: Authentication State Management

**User Story:** As a developer, I want centralized authentication state management so that all components can access and react to authentication changes consistently.

#### Acceptance Criteria

1. WHEN the application initializes THEN a Zustand store SHALL be created to manage authentication state
2. WHEN a user authenticates THEN the store SHALL update with user identity, authentication status, and user type (authenticated/guest)
3. WHEN authentication state changes THEN all subscribed components SHALL re-render with the new state
4. WHEN the application reloads THEN the authentication state SHALL be restored from persistent storage
5. IF a user is in guest mode THEN the store SHALL reflect guest status without user identity
6. WHEN a user logs out THEN the store SHALL reset to the initial unauthenticated state

### Requirement 3: Protected Route Middleware

**User Story:** As a user, I want to be automatically redirected to login when I try to access protected pages without being authenticated so that my data remains secure.

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses a protected route (e.g., `/app/*`, `/journal`, `/photos`) THEN the system SHALL redirect them to `/auth/login`
2. WHEN a guest user accesses a protected route THEN the system SHALL allow access (guest mode has full app access)
3. WHEN an authenticated user accesses a protected route THEN the system SHALL allow access
4. WHEN an authenticated user accesses an auth page (e.g., `/auth/login`, `/auth/signup`) THEN the system SHALL redirect them to `/app/map`
5. IF the user was redirected from a protected route THEN the system SHALL redirect them back to that route after successful authentication
6. WHEN middleware runs THEN it SHALL check authentication status efficiently without blocking page loads

### Requirement 4: Environment Configuration

**User Story:** As a developer, I want to configure CloudKit credentials via environment variables so that sensitive information is not hardcoded in the application.

#### Acceptance Criteria

1. WHEN the application is deployed THEN CloudKit container ID and API token SHALL be loaded from environment variables
2. WHEN environment variables are missing THEN the system SHALL display a clear error message during development
3. IF the application is in development mode THEN the system SHALL provide helpful debugging information for CloudKit setup
4. WHEN environment variables are updated THEN the system SHALL use the new values after restart

### Requirement 5: Session Persistence

**User Story:** As a user, I want to remain logged in when I close and reopen the browser so that I don't have to authenticate every time.

#### Acceptance Criteria

1. WHEN a user successfully authenticates THEN their session SHALL be stored in localStorage
2. WHEN the application loads THEN the system SHALL check for an existing session and restore it
3. WHEN a session expires THEN the system SHALL clear the stored session and redirect to login
4. IF a user explicitly logs out THEN the session SHALL be removed from localStorage
5. WHEN a user switches between guest and authenticated mode THEN the session storage SHALL update accordingly

### Requirement 6: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when authentication fails so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN CloudKit authentication fails THEN the system SHALL display a user-friendly error message in Korean
2. WHEN network errors occur THEN the system SHALL inform the user to check their connection
3. WHEN the CloudKit container is not configured THEN the system SHALL display a setup error (development only)
4. IF authentication is in progress THEN the system SHALL show a loading indicator
5. WHEN authentication succeeds THEN the system SHALL provide visual feedback before redirecting

### Requirement 7: Guest Mode Integration

**User Story:** As a user, I want to use the app in guest mode without authentication so that I can try the app before committing to an account.

#### Acceptance Criteria

1. WHEN a user clicks "게스트로 계속하기" or "게스트로 체험하기" THEN the system SHALL set guest mode in the auth store
2. WHEN in guest mode THEN the user SHALL have full access to all app features
3. WHEN in guest mode THEN data SHALL only be stored locally (no iCloud sync)
4. IF a guest user wants to upgrade to authenticated mode THEN the system SHALL provide a clear path to sign in
5. WHEN a guest user signs in THEN their local data SHALL be preserved and optionally synced to iCloud

### Requirement 8: Header Authentication UI

**User Story:** As a user, I want to see my authentication status in the header so that I know whether I'm logged in and can easily log out.

#### Acceptance Criteria

1. WHEN a user is authenticated THEN the header SHALL display a logout button
2. WHEN a user is in guest mode THEN the header SHALL display a "게스트" badge and logout button
3. WHEN a user is not authenticated THEN the header SHALL display login and signup buttons
4. WHEN a user clicks logout THEN the system SHALL log them out and redirect to the landing page
5. IF the user is on an auth page THEN the header SHALL be hidden or simplified

---

## Edge Cases and Constraints

### Edge Cases
- User closes browser during authentication flow
- CloudKit service is temporarily unavailable
- User has multiple tabs open with different auth states
- Session expires while user is actively using the app
- User denies Apple ID permissions

### Constraints
- Must work with CloudKit JS SDK (web-based, not native)
- Must support both authenticated and guest modes
- Must not block page loads with authentication checks
- Must handle CloudKit rate limits gracefully
- Must work across all modern browsers (Chrome, Safari, Firefox, Edge)

---

## Success Metrics

1. **Authentication Success Rate**: > 95% of authentication attempts succeed
2. **Session Persistence**: > 99% of sessions restore correctly on page reload
3. **Middleware Performance**: < 50ms overhead for route protection checks
4. **Error Recovery**: Users can recover from 100% of authentication errors
5. **Guest Mode Adoption**: Track percentage of users starting in guest mode

---

## Dependencies

- CloudKit JS SDK
- Zustand (state management)
- Next.js middleware
- localStorage API
- Environment variables configuration

---

## Out of Scope

- Native iOS CloudKit integration (future work)
- Multi-factor authentication
- Social login providers other than Apple
- Account deletion and data export (covered in privacy dashboard)
- Email/password authentication

# Implementation Plan

- [x] 1. Set up CloudKit infrastructure and configuration
  - Install CloudKit JS SDK package
  - Create environment variable configuration file
  - Add CloudKit config to Next.js config
  - Create `.env.example` with required variables
  - _Requirements: 1.1, 4.1, 4.2_

- [ ] 2. Implement CloudKit service wrapper
  - [x] 2.1 Create CloudKit service interface and types
    - Define TypeScript interfaces for CloudKit operations
    - Create error types and error handling utilities
    - Define user identity and session types
    - _Requirements: 1.1, 1.3, 6.1_
  
  - [x] 2.2 Implement CloudKit initialization and authentication
    - Write CloudKit initialization logic with lazy loading
    - Implement sign in with Apple functionality
    - Implement sign out functionality
    - Add authentication status checking
    - _Requirements: 1.1, 1.2, 1.6_
  
  - [x] 2.3 Add error handling and retry logic
    - Implement error mapping from CloudKit to app errors
    - Add retry logic for network failures
    - Create user-friendly error messages in Korean
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 3. Create authentication state management with Zustand
  - [x] 3.1 Create auth store with state and actions
    - Define auth state interface
    - Implement login, logout, and guest mode actions
    - Add loading and error state management
    - _Requirements: 2.1, 2.2, 2.6_
  
  - [x] 3.2 Add persistence middleware
    - Configure Zustand persist middleware
    - Implement session serialization/deserialization
    - Add session restoration logic
    - _Requirements: 2.4, 5.1, 5.2_
  
  - [x] 3.3 Implement session restoration and validation
    - Create session validation logic
    - Implement automatic session restoration on app load
    - Handle expired sessions
    - _Requirements: 1.5, 5.3, 5.4_

- [ ] 4. Create authentication provider component
  - [x] 4.1 Implement AuthProvider component
    - Create provider component that wraps the app
    - Initialize CloudKit on mount
    - Restore session from localStorage
    - Handle CloudKit authentication events
    - _Requirements: 1.1, 1.5, 2.4_
  
  - [x] 4.2 Add to root layout
    - Wrap app with AuthProvider in layout.tsx
    - Ensure proper initialization order
    - _Requirements: 2.1_

- [ ] 5. Implement Next.js middleware for route protection
  - [x] 5.1 Create middleware configuration
    - Define protected, auth, and public route patterns
    - Create middleware configuration object
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 5.2 Implement route protection logic
    - Write middleware function with route checking
    - Implement redirect logic for protected routes
    - Handle auth route redirects for authenticated users
    - Store original URL for post-login redirect
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 5.3 Add authentication status checking
    - Implement efficient auth status checking from cookies
    - Add fallback to localStorage check
    - Optimize middleware performance
    - _Requirements: 3.6_

- [ ] 6. Update login page with CloudKit integration
  - [x] 6.1 Replace mock authentication with CloudKit service
    - Import CloudKit service and auth store
    - Update handleAppleSignIn to use CloudKit
    - Handle CloudKit-specific errors
    - Add proper loading states
    - _Requirements: 1.2, 1.3, 1.4, 6.4_
  
  - [x] 6.2 Implement guest mode with auth store
    - Update handleGuestMode to use auth store
    - Set guest status in store
    - Redirect to app after guest login
    - _Requirements: 7.1, 7.2_
  
  - [x] 6.3 Add redirect handling for protected routes
    - Check for redirect URL in query params
    - Redirect to original destination after login
    - _Requirements: 3.5_

- [ ] 7. Update signup page with CloudKit integration
  - [x] 7.1 Replace mock authentication with CloudKit service
    - Import CloudKit service and auth store
    - Update handleAppleSignUp to use CloudKit
    - Handle CloudKit-specific errors
    - Add proper loading states
    - _Requirements: 1.2, 1.3, 1.4, 6.4_
  
  - [x] 7.2 Implement guest mode with auth store
    - Update handleGuestMode to use auth store
    - Set guest status in store
    - Redirect to app after guest signup
    - _Requirements: 7.1, 7.2_
  
  - [x] 7.3 Preserve terms agreement state
    - Ensure terms agreement is checked before signup
    - Store agreement timestamp if needed
    - _Requirements: 1.2_

- [ ] 8. Update Header component with auth state
  - [x] 8.1 Subscribe to auth store
    - Import and use auth store
    - Subscribe to authentication state changes
    - Handle loading states
    - _Requirements: 2.3, 8.1, 8.2, 8.3_
  
  - [x] 8.2 Implement conditional rendering based on auth state
    - Show login/signup buttons when unauthenticated
    - Show guest badge and logout when in guest mode
    - Show user name and logout when authenticated
    - Hide header on auth pages
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  
  - [x] 8.3 Implement logout functionality
    - Call auth store logout action
    - Call CloudKit sign out
    - Redirect to landing page
    - Clear all stored session data
    - _Requirements: 1.6, 2.6, 8.4_

- [ ] 9. Add authentication utilities and hooks
  - [x] 9.1 Create useAuth hook
    - Create custom hook that wraps auth store
    - Provide convenient access to auth state and actions
    - Add TypeScript types
    - _Requirements: 2.3_
  
  - [x] 9.2 Create useRequireAuth hook
    - Create hook that redirects if not authenticated
    - Use in protected page components
    - Handle loading states
    - _Requirements: 3.1_
  
  - [x] 9.3 Create auth utility functions
    - Create helper functions for common auth operations
    - Add session validation utilities
    - Create redirect URL helpers
    - _Requirements: 3.5, 5.3_

- [ ] 10. Add error handling and user feedback
  - [x] 10.1 Create error display components
    - Create ErrorMessage component for auth errors
    - Add error styling
    - Support Korean error messages
    - _Requirements: 6.1, 6.2_
  
  - [x] 10.2 Add loading states to auth pages
    - Update login page with loading indicators
    - Update signup page with loading indicators
    - Disable buttons during loading
    - _Requirements: 6.4_
  
  - [x] 10.3 Add success feedback
    - Show success message after authentication
    - Add smooth transition to app
    - _Requirements: 6.5_

- [ ] 11. Implement session persistence and restoration
  - [x] 11.1 Add session storage logic
    - Store session in localStorage on successful auth
    - Include expiration timestamp
    - Store minimal user data
    - _Requirements: 5.1, 5.5_
  
  - [x] 11.2 Implement session restoration on app load
    - Check for existing session in localStorage
    - Validate session expiration
    - Restore auth state if valid
    - _Requirements: 5.2_
  
  - [x] 11.3 Handle session expiration
    - Check session expiration on app load
    - Clear expired sessions
    - Redirect to login if expired
    - _Requirements: 5.3_

- [ ] 12. Add guest mode upgrade path
  - [ ] 12.1 Create upgrade prompt component
    - Design component to encourage guest users to sign in
    - Show benefits of authenticated mode
    - Add "Sign in with Apple" button
    - _Requirements: 7.4_
  
  - [ ] 12.2 Implement data preservation during upgrade
    - Preserve local data when guest upgrades to authenticated
    - Optionally sync local data to iCloud
    - Handle conflicts if any
    - _Requirements: 7.5_

- [ ] 13. Add development and debugging tools
  - [ ] 13.1 Create auth debug panel (development only)
    - Show current auth state
    - Show session data
    - Add buttons to test auth flows
    - _Requirements: 4.3_
  
  - [ ] 13.2 Add CloudKit configuration validation
    - Check for required environment variables
    - Show helpful error messages if missing
    - Provide setup instructions
    - _Requirements: 4.2, 6.3_

- [ ] 14. Testing and validation
  - [ ] 14.1 Test authentication flows
    - Test Apple sign in flow
    - Test Apple sign up flow
    - Test guest mode
    - Test logout
    - _Requirements: 1.2, 1.6, 7.1_
  
  - [ ] 14.2 Test route protection
    - Test protected route access when unauthenticated
    - Test protected route access when authenticated
    - Test protected route access in guest mode
    - Test auth route redirects
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 14.3 Test session persistence
    - Test session restoration after page reload
    - Test session expiration handling
    - Test logout clears session
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 14.4 Test error handling
    - Test network error handling
    - Test CloudKit error handling
    - Test error message display
    - _Requirements: 6.1, 6.2_

- [ ] 15. Documentation and cleanup
  - [ ] 15.1 Update README with CloudKit setup instructions
    - Document environment variable setup
    - Document CloudKit container configuration
    - Add troubleshooting guide
    - _Requirements: 4.1, 4.2_
  
  - [ ] 15.2 Add inline code documentation
    - Document CloudKit service methods
    - Document auth store actions
    - Document middleware logic
    - _Requirements: All_
  
  - [ ] 15.3 Create authentication flow diagrams
    - Create visual flow diagrams for documentation
    - Document state transitions
    - Document error handling flows
    - _Requirements: All_

# Requirements: User Authentication & Database Storage

## Overview
Implement email/password authentication and real database storage for location data that works for all users (not just CloudKit users).

## Requirements

### 1. User Authentication

#### 1.1 Email/Password Sign-up
**User Story:** As a new user, I want to sign up with email and password, so that I can use the app without Apple ID.

**Acceptance Criteria:**
1. WHEN user visits signup page THEN system SHALL display email and password fields
2. WHEN user enters valid email and password THEN system SHALL create account
3. WHEN user enters invalid email THEN system SHALL show error message
4. WHEN password is too weak THEN system SHALL show requirements
5. WHEN signup succeeds THEN system SHALL redirect to map page

#### 1.2 Email/Password Login
**User Story:** As a registered user, I want to login with email and password, so that I can access my data.

**Acceptance Criteria:**
1. WHEN user visits login page THEN system SHALL display email and password fields
2. WHEN user enters correct credentials THEN system SHALL authenticate user
3. WHEN user enters wrong credentials THEN system SHALL show error message
4. WHEN login succeeds THEN system SHALL redirect to map page

#### 1.3 Multiple Auth Methods
**User Story:** As a user, I want to choose between Apple Sign-In or email/password, so that I can use my preferred method.

**Acceptance Criteria:**
1. WHEN user visits login page THEN system SHALL show both Apple Sign-In and email/password options
2. WHEN user chooses Apple Sign-In THEN system SHALL use CloudKit authentication
3. WHEN user chooses email/password THEN system SHALL use database authentication
4. WHEN user is authenticated THEN system SHALL work the same regardless of auth method

### 2. Database Storage

#### 2.1 Location Data Storage
**User Story:** As a user, I want my location data saved to a database, so that I don't lose it if I clear browser data.

**Acceptance Criteria:**
1. WHEN user captures location point THEN system SHALL save to database
2. WHEN user syncs data THEN system SHALL upload to database
3. WHEN database save fails THEN system SHALL retry with exponential backoff
4. WHEN user logs in from new device THEN system SHALL download their location history

#### 2.2 User Data Isolation
**User Story:** As a user, I want my data to be private, so that other users cannot see my location history.

**Acceptance Criteria:**
1. WHEN user queries location data THEN system SHALL only return their own data
2. WHEN user uploads location data THEN system SHALL associate it with their user ID
3. WHEN unauthorized user tries to access data THEN system SHALL return 401 error

#### 2.3 Data Encryption
**User Story:** As a user, I want my location data encrypted, so that my privacy is protected.

**Acceptance Criteria:**
1. WHEN location data is saved THEN system SHALL encrypt it client-side
2. WHEN location data is transmitted THEN system SHALL use HTTPS
3. WHEN location data is stored THEN system SHALL remain encrypted
4. WHEN user retrieves data THEN system SHALL decrypt it client-side

### 3. Database Schema

#### 3.1 Users Table
**User Story:** As a system, I need to store user accounts, so that users can authenticate.

**Acceptance Criteria:**
1. WHEN user signs up THEN system SHALL create user record
2. WHEN user has email/password THEN system SHALL store hashed password
3. WHEN user has Apple ID THEN system SHALL store CloudKit user ID
4. WHEN user record is created THEN system SHALL generate unique user ID

#### 3.2 Location Points Table
**User Story:** As a system, I need to store location points, so that users can access their history.

**Acceptance Criteria:**
1. WHEN location point is uploaded THEN system SHALL store encrypted data
2. WHEN location point is stored THEN system SHALL associate with user ID
3. WHEN location point is stored THEN system SHALL record timestamp
4. WHEN location point is stored THEN system SHALL mark as synced

## Technical Requirements

### Database: Supabase (PostgreSQL + Auth)
- PostgreSQL database for location storage
- Built-in authentication (email/password)
- Row Level Security (RLS) for data isolation
- Real-time subscriptions (optional)
- Free tier available

### Authentication Flow
1. User signs up with email/password OR Apple Sign-In
2. System creates user record in database
3. System generates JWT token
4. Client stores token in localStorage
5. Client includes token in API requests

### API Endpoints
- POST /api/auth/signup - Create new user
- POST /api/auth/login - Authenticate user
- POST /api/location/sync - Upload location points (authenticated)
- GET /api/location/points - Download location points (authenticated)

### Security
- Passwords hashed with bcrypt
- JWT tokens for session management
- HTTPS for all requests
- Client-side encryption for location data
- Row Level Security in database

## Success Criteria

1. ✅ Users can sign up with email/password
2. ✅ Users can login with email/password
3. ✅ Users can still use Apple Sign-In
4. ✅ Location data is saved to database
5. ✅ Location data persists across devices
6. ✅ Each user can only access their own data
7. ✅ Data is encrypted end-to-end

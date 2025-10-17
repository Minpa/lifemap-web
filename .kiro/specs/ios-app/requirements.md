# LifeMap iOS Native App - Requirements

## Overview
Native iOS application for personal location tracking with background capabilities, CloudKit sync, and beautiful journey visualization.

## Core Features

### 1. Location Tracking
- **Foreground Tracking**
  - High-accuracy GPS when app is open
  - Real-time position updates
  - Live map view with current location
  - Continuous path drawing

- **Background Tracking**
  - Always-on location tracking (even when app closed)
  - Significant location change monitoring
  - Visit detection (when user stays at a place)
  - Region monitoring for geofences
  - Battery-efficient tracking modes

- **Smart Tracking**
  - Adaptive accuracy (high when moving, low when stationary)
  - Automatic pause when not moving
  - Batch location updates for efficiency
  - Configurable tracking intervals

### 2. Authentication
- **Apple Sign In** (Primary)
  - CloudKit integration
  - Seamless iCloud sync
  - Privacy-focused

- **Email/Password** (Alternative)
  - For users without Apple ID
  - Sync to Railway PostgreSQL

- **Guest Mode**
  - Local-only storage
  - No account required
  - Can upgrade to account later

### 3. Data Storage & Sync

**Local Storage (Core Data)**
- Store all location points locally
- Offline-first architecture
- Fast access and queries
- Encrypted at rest

**Cloud Sync**
- **Option A: CloudKit** (for Apple users)
  - Automatic iCloud sync
  - Cross-device sync
  - Privacy-preserving
  
- **Option B: Railway API** (for email users)
  - Sync to PostgreSQL database
  - REST API integration
  - Manual/automatic sync

**Sync Strategy**
- Background sync when connected to WiFi
- Batch uploads to save battery
- Conflict resolution
- Retry failed syncs

### 4. Map Visualization

**Map Features**
- Display user's journey as colored path
- Heat map of frequently visited places
- Timeline view (by day/week/month/year)
- Location clusters
- Search locations
- Filter by date range

**Map Providers**
- Apple Maps (default)
- Mapbox (optional, for custom styling)

**Interactions**
- Tap location point to see details
- Zoom to specific date/location
- 3D terrain view
- Satellite view

### 5. Privacy & Permissions

**Location Permissions**
- Request "Always Allow" for background tracking
- Explain why permission is needed
- Graceful degradation if denied

**Data Privacy**
- All data encrypted
- User controls what to share
- Can delete all data anytime
- Export data (JSON/GPX)

**Sharing Controls**
- Choose who can see your location
- Share current location only
- Share historical path
- Time-limited sharing
- Revoke access anytime

### 6. User Interface

**Main Screens**
1. **Map View** - Main screen showing journey
2. **Timeline** - List view of locations by date
3. **Stats** - Distance traveled, places visited, etc.
4. **Settings** - Tracking preferences, privacy, account
5. **Sharing** - Manage who can see your location

**Design Principles**
- Native iOS design (SwiftUI)
- Dark mode support
- Accessibility compliant
- Smooth animations
- Intuitive gestures

### 7. Notifications

**Push Notifications**
- Daily summary of journey
- Reminder to enable tracking
- Sync status updates
- Sharing requests from friends

**Local Notifications**
- "You've been here before!" reminders
- Weekly/monthly journey summaries

### 8. Battery Optimization

**Power Management**
- Low Power Mode detection
- Reduce tracking frequency in low battery
- Smart sync scheduling
- Background task optimization

### 9. Export & Backup

**Export Formats**
- GPX (for other apps)
- JSON (raw data)
- KML (Google Earth)
- CSV (spreadsheet)

**Backup**
- Automatic iCloud backup
- Manual export to Files app
- Share via AirDrop

## Technical Requirements

### iOS Version
- Minimum: iOS 16.0
- Target: iOS 17.0+
- Support latest iOS features

### Frameworks
- **SwiftUI** - UI framework
- **Core Location** - Location tracking
- **MapKit** - Map display
- **Core Data** - Local storage
- **CloudKit** - Cloud sync
- **Combine** - Reactive programming
- **WidgetKit** - Home screen widgets

### Capabilities
- Background Modes (location, fetch, processing)
- Push Notifications
- CloudKit
- HealthKit (optional, for activity data)

### Architecture
- **MVVM** pattern
- **Repository** pattern for data
- **Dependency Injection**
- **Protocol-oriented** design

## Performance Requirements

- App launch: < 2 seconds
- Map rendering: 60 FPS
- Location update latency: < 5 seconds
- Sync time: < 10 seconds for 1000 points
- Battery drain: < 5% per day with background tracking

## Security Requirements

- End-to-end encryption for synced data
- Secure token storage (Keychain)
- Certificate pinning for API calls
- No tracking analytics (privacy-first)

## Future Features (Phase 2)

- Apple Watch companion app
- Siri shortcuts
- Home screen widgets
- Live Activities
- Photo integration (attach photos to locations)
- Social features (see friends' journeys)
- Achievements/gamification
- Route planning
- Offline maps

## Success Metrics

- Daily active users
- Average tracking time per day
- Sync success rate
- App Store rating
- Battery impact rating
- Crash-free rate > 99.9%

---

**Status**: Planning Phase
**Priority**: High
**Estimated Timeline**: 6-8 weeks for MVP

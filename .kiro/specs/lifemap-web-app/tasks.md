# Implementation Plan

- [x] 1. Set up project structure and core configuration
  - Initialize Next.js 14+ project with TypeScript and App Router
  - Configure pnpm workspace and install core dependencies (React, Zustand, Framer Motion, next-intl)
  - Set up ESLint, Prettier, and TypeScript strict mode configuration
  - Create directory structure: app/, components/, lib/, types/, styles/
  - _Requirements: 1.1, 2.1, 15.1_

- [x] 2. Implement design system and theming
  - [x] 2.1 Create CSS custom properties for design tokens
    - Define color palette variables (--palette-0 through --palette-4)
    - Set up spacing, typography, shadow, and radius tokens
    - Implement dark mode color scheme with WCAG AA contrast ratios
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [x] 2.2 Create typography system with Day One-inspired fonts
    - Configure serif font (Lora) for journal body text
    - Configure sans-serif font (Inter) for UI elements
    - Set up responsive font sizes and line heights
    - _Requirements: 1.6, 1.9_
  
  - [x] 2.3 Implement animation utilities
    - Create Framer Motion variants for common transitions
    - Define timing functions (fast, base, slow)
    - Build reusable animation components (FadeIn, SlideIn, etc.)
    - _Requirements: 1.8_

- [x] 3. Build core layout components
  - [x] 3.1 Create Header component with navigation
    - Build responsive header with brand logo
    - Implement navigation links (Map, Running, Journal, Photos, Palette, Privacy, Settings)
    - Add keyboard navigation and ARIA labels
    - _Requirements: 3.1, 3.2, 3.5, 12.2_
  
  - [x] 3.2 Create Footer component
    - Add copyright information
    - Style with Day One-inspired minimal design
    - _Requirements: 3.3_
  
  - [x] 3.3 Implement portal root for modals
    - Create portal container in root layout
    - Build Modal base component with focus trap
    - Add keyboard handling (Esc to close)
    - _Requirements: 3.4, 12.7_

- [x] 4. Set up data layer and storage
  - [x] 4.1 Define TypeScript interfaces for all data models
    - Create types for LocationPoint, Place, Trip, RunSession, JournalEntry, Photo
    - Define PrivacySettings, UserPreferences, ShareLink interfaces
    - Add validation schemas using Zod
    - _Requirements: 15.3_
  
  - [x] 4.2 Implement IndexedDB wrapper
    - Create database schema with stores for locations, places, trips, runs, journals, photos
    - Build CRUD operations for each store
    - Add indexing for timestamp, date, and hash fields
    - Implement encryption utilities using Web Crypto API
    - _Requirements: 16.9, 19.6_
  
  - [x] 4.3 Create Zustand stores for state management
    - Build stores for map state, timeline state, journal state, preferences
    - Implement persistence middleware for user preferences
    - Add sync queue for pending cloud operations
    - _Requirements: 1.5, 9.6_

- [x] 5. Implement privacy and security layer
  - [x] 5.1 Build privacy zone detection and masking
    - Create function to detect if point is within privacy zone
    - Implement radius-based coordinate masking algorithm
    - Add visual indicator for masked areas on map
    - _Requirements: 11.1, 11.2, 11.7, 19.1_
  
  - [x] 5.2 Implement time fuzzing
    - Create function to apply ±1-3 hour fuzzing to timestamps
    - Ensure consistent fuzzing for related data points
    - _Requirements: 10.4, 19.1_
  
  - [x] 5.3 Build H3 hexagon aggregation
    - Integrate H3 library for hexagonal binning
    - Implement zoom-based resolution selection
    - Create aggregation functions for location clustering
    - _Requirements: 14.1_

- [x] 6. Create map visualization components
  - [x] 6.1 Set up Mapbox GL JS integration
    - Initialize Mapbox with API token
    - Create MapCanvas component with responsive container
    - Implement basic pan and zoom controls
    - Add keyboard navigation for map (arrow keys, +/-)
    - _Requirements: 4.1, 4.6, 12.1, 12.2_
  
  - [x] 6.2 Implement map layers
    - Create heat map layer for cumulative time spent
    - Build track polyline layer with time-based coloring
    - Add representative places layer (circles sized by duration)
    - Implement running routes layer with distinct styling
    - Add photo markers layer with clustering
    - Create privacy zones overlay layer
    - _Requirements: 4.4, 4.5_
  
  - [x] 6.3 Build layer toggle controls
    - Create checkbox UI for each layer (track, heat, rings, resonance, runs)
    - Implement show/hide functionality
    - Add ARIA labels and keyboard support
    - _Requirements: 4.4, 12.2_
  
  - [x] 6.4 Create map legend component
    - Display color coding explanation
    - Show visual element meanings (line thickness, glow)
    - Make legend responsive and collapsible
    - Add aria-live for dynamic updates
    - _Requirements: 4.5, 5.5_


- [x] 7. Build timeline and memory components
  - [x] 7.1 Create TimelinePanel component
    - Build year range slider (2000 to current year)
    - Add quick navigation buttons (today, 5 years ago, random)
    - Implement responsive layout for mobile/tablet/desktop
    - _Requirements: 4.2, 4.3, 5.1_
  
  - [x] 7.2 Implement MemoryCard component
    - Display date, location, and preview information
    - Add click handler to focus map on location
    - Style with Day One-inspired card design
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [x] 7.3 Build memory list with virtualization
    - Integrate @tanstack/react-virtual for long lists
    - Implement chronological sorting
    - Add aria-live announcements for updates
    - _Requirements: 5.2, 5.5, 14.6_

- [x] 8. Create place, trip, and run card components
  - [x] 8.1 Build PlaceCard component
    - Display place name, badge, and favorite button
    - Create life clock visualization (time-of-day donut chart)
    - Build week heatmap (day × hour matrix)
    - Show summary statistics (month, year, lifetime hours)
    - Add last visit date and privacy masking indicator
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_
  
  - [x] 8.2 Build TripCard component
    - Display trip name and date range
    - Add photo gallery with Day One-style full-bleed images
    - Show user notes/quotes
    - Implement merge, edit, and share actions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x] 8.3 Build RunCard component
    - Display run name, date/time, and metrics (distance, pace, elevation)
    - Show privacy masking indicator for start/end points
    - Add GPX export functionality
    - Implement share action
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Implement palette customization
  - [x] 9.1 Create PalettePanel component
    - Display 5 color swatches for palette slots
    - Build color picker integration
    - Add thickness scale and glow intensity sliders
    - _Requirements: 9.1, 9.2, 9.4, 9.5_
  
  - [x] 9.2 Implement real-time palette updates
    - Update CSS custom properties on color change
    - Refresh all map visualizations
    - Persist changes to user preferences
    - _Requirements: 9.3, 9.6_

- [x] 10. Build journal entry system
  - [x] 10.1 Create JournalListPage with calendar view
    - Build calendar component with entries marked
    - Display Day One-style preview cards (date, weather, location, excerpt)
    - Implement full-text search with instant results
    - _Requirements: 16.10, 16.11, 16.17_
  
  - [x] 10.2 Build JournalEntryPage
    - Create Day One-inspired distraction-free markdown editor
    - Implement auto-save every 30 seconds with subtle feedback
    - Add contextual formatting toolbar
    - Build daily timeline with time ranges, places, and travel segments
    - Create mini map showing day's route
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.6, 16.15, 16.16_
  
  - [x] 10.3 Implement timeline segment interactions
    - Allow adding notes, photos, and mood tags to segments
    - Visualize mood with color/icon
    - Associate photos with time and location
    - _Requirements: 16.5, 16.7, 16.8_
  
  - [x] 10.4 Build journal export functionality
    - Generate PDF with embedded map images
    - Create markdown export option
    - _Requirements: 16.12_
  
  - [x] 10.5 Implement journal prompts and reminders
    - Detect significant places and suggest prompts
    - Add notification system for daily reminders
    - _Requirements: 16.13, 16.14_

- [x] 11. Implement photo management system
  - [x] 11.1 Build photo upload with EXIF extraction
    - Create file upload component with drag-and-drop
    - Integrate exifr library to read GPS, timestamp, camera data
    - Implement batch processing for multiple photos
    - Add duplicate detection using file hash
    - _Requirements: 18.1, 18.5, 18.13_
  
  - [x] 11.2 Create photo location mapping
    - Automatically plot photos with GPS on map
    - Allow manual pinning for photos without GPS
    - Show photo markers with clustering
    - _Requirements: 18.2, 18.4, 18.6_
  
  - [x] 11.3 Build PhotoViewer component
    - Display photo with EXIF details
    - Add caption editing
    - Show location on mini map
    - Apply privacy masking to photos in privacy zones
    - _Requirements: 18.7, 18.9_
  
  - [x] 11.4 Create PhotoGalleryPage
    - Build virtualized photo grid
    - Organize by date, location, or album
    - Implement Day One-style elegant aspect ratios
    - _Requirements: 18.11, 1.10, 14.6_
  
  - [x] 11.5 Implement photo-journal integration
    - Auto-associate photos with journal entries by timestamp
    - Display photos inline with timeline segments
    - _Requirements: 18.3, 18.8_

- [x] 12. Build sharing system
  - [x] 12.1 Create ShareDialog component
    - Display expiration options (72h, 7d, 30d)
    - Show privacy indicators (zones masked, time fuzzed)
    - Add SNS sharing buttons (Twitter, Facebook, Instagram, KakaoTalk)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.9_
  
  - [x] 12.2 Implement share link generation API
    - Create POST /api/share/create endpoint
    - Apply privacy filters (remove zones, fuzz time, reduce precision)
    - Generate fuzzed GeoJSON
    - Create signed token with expiration
    - Store in PostgreSQL
    - _Requirements: 10.5, 19.1, 19.2_
  
  - [x] 12.3 Build ShareViewPage (read-only)
    - Create GET /api/share/:token endpoint with validation
    - Display fuzzed map view
    - Add Open Graph meta tags for social previews
    - Handle expired links gracefully
    - _Requirements: 10.6, 10.7, 10.8_
  
  - [x] 12.4 Implement SNS sharing integrations
    - Add Twitter share with pre-filled text and link
    - Integrate Facebook share dialog
    - Handle Instagram (copy link + instructions)
    - Integrate Kakao SDK for KakaoTalk sharing
    - Generate map snapshot for preview images
    - Add customizable hashtags
    - _Requirements: 10.10, 10.11, 10.12, 10.13, 10.14_


- [x] 13. Implement privacy dashboard
  - [x] 13.1 Create PrivacyDashboard page
    - Build privacy zone radius control (300-1000m slider)
    - Add home and work masking checkboxes
    - Create visibility level radio buttons (private, limited, anonymous)
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [x] 13.2 Implement real-time privacy updates
    - Apply settings changes immediately to all visualizations
    - Update map overlay for privacy zones
    - _Requirements: 11.4, 11.7_
  
  - [x] 13.3 Build data export and deletion
    - Create export functionality for all location data (GeoJSON format)
    - Implement delete confirmation dialog
    - Add permanent deletion with cleanup
    - _Requirements: 11.5, 11.6_

- [ ] 14. Set up CloudKit integration
  - [ ] 14.1 Configure CloudKit JS
    - Set up CloudKit container and API token
    - Implement Sign in with Apple authentication
    - Create session management with httpOnly cookies
    - _Requirements: 20.5, 20.6_
  
  - [ ] 14.2 Implement CloudKit sync
    - Create sync functions for each record type (Location, Journal, Photo, etc.)
    - Use private database for user data, public for shared content
    - Implement incremental sync with change tokens
    - Add conflict resolution (last-write-wins)
    - _Requirements: 20.8, 20.9_
  
  - [ ] 14.3 Build offline fallback
    - Detect iCloud sign-in status
    - Fall back to local-only storage when not signed in
    - Queue operations for sync when connection restored
    - _Requirements: 20.10, 17.11_

- [ ] 15. Create API routes
  - [ ] 15.1 Implement authentication endpoints
    - POST /api/auth/login (CloudKit authentication)
    - POST /api/auth/logout
    - GET /api/auth/session
    - _Requirements: 17.8_
  
  - [ ] 15.2 Build photo API endpoints
    - POST /api/photos/upload (multipart file upload)
    - POST /api/photos/extract-exif
    - GET /api/photos/:id
    - Strip EXIF metadata for shared photos
    - _Requirements: 18.10_
  
  - [ ] 15.3 Create export endpoints
    - POST /api/export/gpx (generate GPX from run data)
    - POST /api/export/journal (generate PDF/markdown)
    - _Requirements: 8.4, 16.12_
  
  - [ ] 15.4 Add health check endpoint
    - GET /api/health (status and timestamp)
    - _Requirements: 20.4_

- [ ] 16. Implement internationalization
  - [ ] 16.1 Set up next-intl
    - Configure locale detection from browser settings
    - Create translation files for Korean, English, Japanese
    - Add data-i18n-key attributes to all UI elements
    - _Requirements: 13.1, 13.2, 13.3, 15.5_
  
  - [ ] 16.2 Implement language switching
    - Add language selector in settings
    - Update content without page reload
    - _Requirements: 13.4_
  
  - [ ] 16.3 Add locale-aware date formatting
    - Use date-fns with locale support
    - Format dates according to selected language
    - _Requirements: 13.5_

- [x] 17. Build settings page
  - Create SettingsPage with sections for language, units, accessibility
  - Add journal reminder configuration
  - Implement preference persistence
  - _Requirements: 2.12, 16.14_

- [ ] 18. Implement responsive layouts
  - [ ] 18.1 Create mobile layout (< 768px)
    - Single column with bottom sheet for inspector
    - Hamburger menu for navigation
    - Touch-optimized controls (44px min tap targets)
    - _Requirements: 4.7_
  
  - [ ] 18.2 Create tablet layout (768px - 1024px)
    - Two column: map + sidebar
    - Collapsible panels with swipe gestures
    - _Requirements: 4.8_
  
  - [ ] 18.3 Create desktop layout (> 1024px)
    - Three column: timeline + map + inspector
    - Persistent panels
    - Keyboard shortcuts and hover states
    - _Requirements: 4.9_

- [ ] 19. Add accessibility features
  - [ ] 19.1 Implement keyboard shortcuts
    - Add global shortcuts (Cmd+K, Cmd+J, Cmd+M, etc.)
    - Create command palette
    - Build keyboard shortcuts help modal
    - _Requirements: 12.2, 12.6_
  
  - [ ] 19.2 Enhance screen reader support
    - Add aria-labelledby to all cards and panels
    - Implement aria-live regions for dynamic updates
    - Ensure logical tab order
    - _Requirements: 12.1, 12.3, 12.4, 12.6_
  
  - [ ] 19.3 Add color-blind accessibility
    - Implement alternative patterns (dotted, dashed lines)
    - Ensure meaning not conveyed by color alone
    - Test contrast ratios
    - _Requirements: 12.5_

- [ ] 20. Set up Railway deployment
  - [ ] 20.1 Configure Railway project
    - Connect GitHub repository
    - Set up automatic deployments from main branch
    - Configure environment variables
    - Add PostgreSQL addon
    - _Requirements: 20.1, 20.2, 20.12_
  
  - [ ] 20.2 Optimize build for production
    - Generate static assets optimized for CDN
    - Enable HTTPS and security headers
    - Configure CORS policies
    - _Requirements: 20.3, 20.11_
  
  - [ ] 20.3 Set up monitoring
    - Add structured logging (no PII)
    - Track key metrics (response time, error rate, sync success)
    - Create analytics aggregation
    - _Requirements: 19.3_

- [ ] 21. Implement performance optimizations
  - [ ] 21.1 Add code splitting
    - Lazy load heavy components (MapCanvas, PhotoViewer)
    - Split routes with dynamic imports
    - _Requirements: 14.4_
  
  - [ ] 21.2 Optimize images
    - Use Next.js Image component
    - Generate responsive images with srcset
    - Implement lazy loading below fold
    - Create thumbnail sizes (200x200, 400x400, 800x800)
    - _Requirements: 14.2_
  
  - [ ] 21.3 Implement progressive mounting
    - Use IntersectionObserver for viewport-based loading
    - Defer non-critical interactions with requestIdleCallback
    - _Requirements: 14.4, 14.5_

- [ ] 22. Create landing page
  - Build LandingPage with app description
  - Add privacy information section
  - Include sample map visualization
  - Add call-to-action buttons
  - _Requirements: 2.1_

- [ ] 23. Build runs page
  - Create RunsPage with list of running sessions
  - Display run cards with metrics
  - Add filtering and sorting options
  - _Requirements: 2.4_

- [ ] 24. Create trip and place detail pages
  - Build TripDetailPage with full trip information
  - Create PlaceDetailPage with comprehensive statistics
  - Add navigation from map markers
  - _Requirements: 2.5, 2.6_

- [ ] 25. Implement error handling
  - Create error boundary components
  - Build toast notification system
  - Add error modals for critical failures
  - Implement retry logic with exponential backoff
  - Handle offline mode gracefully
  - _Requirements: 19.4_

- [ ] 26. Add security measures
  - [ ] 26.1 Implement Content Security Policy
    - Configure CSP headers
    - Whitelist trusted domains
    - _Requirements: 19.5_
  
  - [ ] 26.2 Add rate limiting
    - Implement rate limiter middleware
    - Set limits per endpoint
    - _Requirements: 19.2_
  
  - [ ] 26.3 Add input validation
    - Use Zod schemas for all API inputs
    - Validate and sanitize user inputs
    - _Requirements: 19.1_

- [ ] 27. Wire everything together
  - Connect all pages with routing
  - Integrate all components into MapPage layout
  - Test data flow between components
  - Ensure state synchronization across features
  - Verify privacy settings apply globally
  - Test offline-to-online sync
  - _Requirements: All_

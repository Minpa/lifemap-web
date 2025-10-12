# Requirements Document

## Introduction

LifeMap은 개인의 위치 데이터를 시각화하고 관리하는 웹 애플리케이션입니다. 온디바이스 + 웹 하이브리드 방식으로 프라이버시를 최우선으로 하며, 사용자의 생애 궤적을 아름답고 의미있는 방식으로 표현합니다. 이 프로젝트는 웹 뷰, 공유 기능, 경량 편집을 위한 마크업 구조와 핵심 컴포넌트를 구현합니다.

## Requirements

### Requirement 1: 디자인 시스템 및 테마

**User Story:** As a user, I want a consistent and accessible design system with dark mode support inspired by Day One's elegant UX, so that I can have a comfortable and beautiful journaling experience.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL apply CSS custom properties for colors, spacing, typography, and shadows
2. WHEN a user views the app THEN the system SHALL support a customizable color palette with at least 5 palette slots (--palette-0 through --palette-4)
3. WHEN the viewport size changes THEN the system SHALL apply responsive breakpoints at 480px (sm), 768px (md), 1024px (lg), and 1440px (xl)
4. WHEN dark mode is active THEN the system SHALL use appropriate contrast ratios meeting WCAG AA standards
5. WHEN a user customizes palette colors THEN the system SHALL persist the changes and apply them across all visualizations
6. WHEN UI elements are designed THEN the system SHALL follow Day One's design principles: clean typography, generous whitespace, subtle animations, and focus on content
7. WHEN cards and panels are displayed THEN the system SHALL use Day One-inspired rounded corners, soft shadows, and layered depth
8. WHEN transitions occur THEN the system SHALL use smooth, natural animations similar to Day One's fluid interactions
9. WHEN the journal interface is displayed THEN the system SHALL prioritize readability with Day One-style serif fonts for body text and sans-serif for UI elements
10. WHEN photos are displayed THEN the system SHALL use Day One-inspired full-bleed images with elegant aspect ratios

### Requirement 2: 라우팅 및 페이지 구조

**User Story:** As a user, I want to navigate between different sections of the app, so that I can access maps, running sessions, trips, journals, photos, and settings.

#### Acceptance Criteria

1. WHEN a user visits the root path (/) THEN the system SHALL display a landing page with app description, privacy information, and sample map
2. WHEN a user navigates to /app/map THEN the system SHALL display the main map interface with timeline, layers, and inspector panels
3. WHEN a user navigates to /share/:id THEN the system SHALL display a read-only shared map view with fuzzed data
4. WHEN a user navigates to /runs THEN the system SHALL display a list of running sessions
5. WHEN a user navigates to /trip/:id THEN the system SHALL display detailed trip information
6. WHEN a user navigates to /place/:id THEN the system SHALL display a representative place card with statistics
7. WHEN a user navigates to /journal THEN the system SHALL display a calendar view of journal entries
8. WHEN a user navigates to /journal/:date THEN the system SHALL display the journal entry page for that specific date
9. WHEN a user navigates to /photos THEN the system SHALL display a photo gallery organized by date, location, or album
10. WHEN a user navigates to /palette THEN the system SHALL display palette customization interface
11. WHEN a user navigates to /privacy THEN the system SHALL display privacy dashboard with masking controls
12. WHEN a user navigates to /settings THEN the system SHALL display app settings including i18n and accessibility options

### Requirement 3: 공통 레이아웃 컴포넌트

**User Story:** As a user, I want a consistent header and navigation across all pages, so that I can easily move between different sections.

#### Acceptance Criteria

1. WHEN any page loads THEN the system SHALL display a header with brand logo and main navigation links (Map, Running, Journal, Photos, Palette, Privacy, Settings)
2. WHEN a user clicks navigation links THEN the system SHALL navigate to the corresponding route
3. WHEN a page loads THEN the system SHALL include a footer with copyright information
4. WHEN the app needs to display modals or overlays THEN the system SHALL use a portal root element
5. WHEN navigation is accessed via keyboard THEN the system SHALL provide proper focus management and ARIA labels

### Requirement 4: 메인 맵 인터페이스

**User Story:** As a user, I want to view my life map with timeline controls and layer toggles, so that I can explore my location history in different ways.

#### Acceptance Criteria

1. WHEN the map page loads THEN the system SHALL display a three-panel layout with timeline (left), map canvas (center), and inspector (right)
2. WHEN a user adjusts the year slider THEN the system SHALL filter map data to show only locations from the selected time period
3. WHEN a user clicks quick navigation buttons (today, 5 years ago, random) THEN the system SHALL jump to the corresponding time period
4. WHEN a user toggles layer checkboxes THEN the system SHALL show/hide the corresponding map layers (track, heat, rings, resonance, runs)
5. WHEN map data is displayed THEN the system SHALL show a legend explaining color coding and visual elements
6. WHEN the map canvas is focused THEN the system SHALL support keyboard navigation for panning and zooming
7. WHEN the viewport is mobile-sized THEN the system SHALL stack panels vertically
8. WHEN the viewport is tablet-sized THEN the system SHALL show map and one panel side-by-side
9. WHEN the viewport is desktop-sized THEN the system SHALL show all three panels simultaneously

### Requirement 5: 타임라인 및 메모리 카드

**User Story:** As a user, I want to see a timeline of my memories and navigate through time, so that I can revisit specific moments in my life.

#### Acceptance Criteria

1. WHEN the timeline panel is displayed THEN the system SHALL show a year range slider from 2000 to current year
2. WHEN a user selects a time period THEN the system SHALL display relevant memory cards in chronological order
3. WHEN memory cards are displayed THEN the system SHALL include date, location, and preview information
4. WHEN a user clicks a memory card THEN the system SHALL focus the map on that location and time
5. WHEN the timeline updates THEN the system SHALL announce changes to screen readers using aria-live

### Requirement 6: 대표 위치 카드 (PlaceCard)

**User Story:** As a user, I want to see detailed statistics about places I frequently visit, so that I can understand my time patterns.

#### Acceptance Criteria

1. WHEN a place card is displayed THEN the system SHALL show the place name, badge, and favorite button
2. WHEN a place card is displayed THEN the system SHALL include a life clock visualization showing time-of-day distribution
3. WHEN a place card is displayed THEN the system SHALL include a week heatmap showing day-of-week and hour patterns
4. WHEN a place card is displayed THEN the system SHALL show summary statistics for this month, this year, and lifetime hours
5. WHEN a place card is displayed THEN the system SHALL show last visit date and privacy masking status
6. WHEN a user clicks the favorite button THEN the system SHALL toggle favorite status and update aria-pressed attribute
7. WHEN privacy masking is enabled for a place THEN the system SHALL display a privacy indicator

### Requirement 7: 여행 카드 (TripCard)

**User Story:** As a user, I want to see automatically detected trips with photos and notes, so that I can remember and share my travel experiences.

#### Acceptance Criteria

1. WHEN a trip card is displayed THEN the system SHALL show trip name and date range
2. WHEN a trip card is displayed THEN the system SHALL include a photo gallery if photos are available
3. WHEN a trip card is displayed THEN the system SHALL show user-written notes or quotes
4. WHEN a user clicks "merge trips" THEN the system SHALL allow combining multiple trips
5. WHEN a user clicks "edit" THEN the system SHALL allow editing trip notes
6. WHEN a user clicks "share" THEN the system SHALL open the share dialog for this trip

### Requirement 8: 러닝 카드 (RunCard)

**User Story:** As a user, I want to see my running session details with metrics and privacy controls, so that I can track my fitness activities while protecting my home location.

#### Acceptance Criteria

1. WHEN a run card is displayed THEN the system SHALL show run name and date/time
2. WHEN a run card is displayed THEN the system SHALL show distance, average pace, and elevation gain metrics
3. WHEN a run card is displayed THEN the system SHALL indicate that start/end points are masked within 500m
4. WHEN a user clicks "export GPX" THEN the system SHALL download the run data in GPX format
5. WHEN a user clicks "share" THEN the system SHALL open the share dialog with appropriate privacy settings

### Requirement 9: 팔레트 커스터마이제이션

**User Story:** As a user, I want to customize the color palette and visual style of my map, so that I can express my personal aesthetic preferences.

#### Acceptance Criteria

1. WHEN the palette panel is displayed THEN the system SHALL show 5 color swatches corresponding to palette slots
2. WHEN a user clicks a color swatch THEN the system SHALL open a color picker
3. WHEN a user changes a palette color THEN the system SHALL immediately update all map visualizations
4. WHEN a user adjusts thickness scale THEN the system SHALL update line thickness on the map
5. WHEN a user adjusts glow intensity THEN the system SHALL update the glow effect on map elements
6. WHEN palette changes are made THEN the system SHALL persist settings to user preferences

### Requirement 10: 공유 기능

**User Story:** As a user, I want to share my map with others using privacy-protected links and social media, so that I can show my travels without exposing sensitive location data.

#### Acceptance Criteria

1. WHEN a user clicks share on any card THEN the system SHALL open a share dialog
2. WHEN the share dialog is displayed THEN the system SHALL show expiration options (72 hours, 7 days, 30 days)
3. WHEN the share dialog is displayed THEN the system SHALL indicate that home/work privacy zones are automatically masked
4. WHEN the share dialog is displayed THEN the system SHALL indicate that time fuzzing of 1-3 hours is applied
5. WHEN a user clicks "create link" THEN the system SHALL generate a signed, expiring share URL
6. WHEN a share link is accessed THEN the system SHALL display a read-only map view with fuzzed GeoJSON data
7. WHEN a share link expires THEN the system SHALL return a 404 or expiration message
8. WHEN a share page loads THEN the system SHALL include Open Graph meta tags for social media previews
9. WHEN the share dialog is displayed THEN the system SHALL show SNS sharing buttons for Twitter, Facebook, Instagram, and KakaoTalk
10. WHEN a user clicks an SNS share button THEN the system SHALL open the respective platform's share interface with pre-filled text and link
11. WHEN SNS sharing is triggered THEN the system SHALL include a preview image (map snapshot) with the share
12. WHEN a user shares to Instagram THEN the system SHALL copy the link to clipboard and provide instructions to paste in bio/story
13. WHEN a user shares to KakaoTalk THEN the system SHALL use Kakao SDK to share with custom template including map preview
14. WHEN SNS share content is generated THEN the system SHALL include hashtags like #LifeMap and user-customizable tags

### Requirement 11: 프라이버시 대시보드

**User Story:** As a user, I want granular control over my privacy settings, so that I can protect sensitive locations while still using the app.

#### Acceptance Criteria

1. WHEN the privacy dashboard loads THEN the system SHALL display privacy zone radius control (300-1000m range)
2. WHEN the privacy dashboard loads THEN the system SHALL show checkboxes for home and work masking
3. WHEN the privacy dashboard loads THEN the system SHALL display visibility level options (private, limited sharing, anonymous public)
4. WHEN a user adjusts privacy settings THEN the system SHALL immediately apply changes to all visualizations
5. WHEN a user clicks "export" THEN the system SHALL download all location data in a standard format
6. WHEN a user clicks "delete all records" THEN the system SHALL show a confirmation dialog and permanently delete data upon confirmation
7. WHEN privacy zones are active THEN the system SHALL visually indicate masked areas on the map

### Requirement 12: 접근성 (Accessibility)

**User Story:** As a user with disabilities, I want the app to be fully accessible via keyboard and screen readers, so that I can use all features independently.

#### Acceptance Criteria

1. WHEN the map container is rendered THEN the system SHALL use role="application" with appropriate ARIA labels
2. WHEN interactive elements are rendered THEN the system SHALL provide keyboard navigation alternatives
3. WHEN cards and panels are displayed THEN the system SHALL include aria-labelledby and descriptive labels
4. WHEN content updates dynamically THEN the system SHALL use aria-live regions to announce changes
5. WHEN color is used to convey meaning THEN the system SHALL provide alternative patterns (dotted lines, hatching) for color-blind users
6. WHEN the app is navigated via keyboard THEN the system SHALL maintain logical tab order and visible focus indicators
7. WHEN modals are opened THEN the system SHALL trap focus within the modal and restore focus on close

### Requirement 13: 국제화 (i18n)

**User Story:** As a user, I want to use the app in my preferred language, so that I can understand all labels and messages.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL detect the user's preferred language from browser settings
2. WHEN all UI elements are rendered THEN the system SHALL use data-i18n-key attributes for translatable strings
3. WHEN the app is displayed THEN the system SHALL support Korean (default), English, and Japanese
4. WHEN a user changes language in settings THEN the system SHALL update all text content without page reload
5. WHEN dates and times are displayed THEN the system SHALL format them according to the selected locale

### Requirement 14: 퍼포먼스 최적화

**User Story:** As a user, I want the app to load quickly and respond smoothly, so that I can have a seamless experience even with large datasets.

#### Acceptance Criteria

1. WHEN map tiles and GeoJSON are loaded THEN the system SHALL use chunked loading based on H3 level and zoom
2. WHEN the share page loads THEN the system SHALL include pre-rendered Open Graph images for fast social previews
3. WHEN the share page loads THEN the system SHALL optimize for Largest Contentful Paint (LCP) metric
4. WHEN non-critical interactions are triggered THEN the system SHALL use requestIdleCallback for deferred execution
5. WHEN components enter the viewport THEN the system SHALL use IntersectionObserver for progressive mounting
6. WHEN large datasets are rendered THEN the system SHALL implement virtualization for lists and grids

### Requirement 20: 배포 및 인프라

**User Story:** As a developer, I want the web app deployed on Railway and data synced via iCloud, so that deployment is simple and users have seamless Apple ecosystem integration.

#### Acceptance Criteria

1. WHEN the web app is deployed THEN the system SHALL use Railway for hosting with automatic deployments from git
2. WHEN Railway deployment is configured THEN the system SHALL include environment variables for API keys, database URLs, and secrets
3. WHEN the app is built THEN the system SHALL generate static assets optimized for Railway's CDN
4. WHEN Railway deployment occurs THEN the system SHALL include health check endpoints for monitoring
5. WHEN users sync data THEN the system SHALL use CloudKit (iCloud) as the primary cloud storage backend
6. WHEN CloudKit is integrated THEN the system SHALL use CloudKit JS for web app access to iCloud data
7. WHEN iOS app syncs data THEN the system SHALL use native CloudKit APIs for optimal performance
8. WHEN data is stored in CloudKit THEN the system SHALL use private database for user data and public database for shared content
9. WHEN CloudKit sync occurs THEN the system SHALL handle conflict resolution with last-write-wins or custom merge logic
10. WHEN a user is not signed in to iCloud THEN the system SHALL fall back to local-only storage with sync disabled
11. WHEN Railway environment is production THEN the system SHALL enable HTTPS, CORS policies, and security headers
12. WHEN database is needed for server-side data THEN the system SHALL use Railway's PostgreSQL addon for metadata and share links

### Requirement 15: 데이터 속성 규약

**User Story:** As a developer, I want consistent data attribute conventions, so that JavaScript can reliably bind to DOM elements.

#### Acceptance Criteria

1. WHEN components are rendered THEN the system SHALL use data-component attribute to identify JS mount points
2. WHEN map layers are rendered THEN the system SHALL use data-layer attribute for toggle identification
3. WHEN dynamic properties need binding THEN the system SHALL use data-prop-* attributes for hydration
4. WHEN interactive elements are rendered THEN the system SHALL use data-action attribute for event dispatch keys
5. WHEN i18n is applied THEN the system SHALL use data-i18n-key attribute for translation lookup

### Requirement 16: 일기 작성 기능

**User Story:** As a user, I want to write daily journal entries based on my location data with a Day One-inspired writing experience, so that I can reflect on my day and create meaningful memories.

#### Acceptance Criteria

1. WHEN a user navigates to /journal/:date THEN the system SHALL display a journal entry page for that date with Day One-style clean layout
2. WHEN the journal page loads THEN the system SHALL automatically generate a timeline of the day's activities based on location data
3. WHEN the daily timeline is displayed THEN the system SHALL show time ranges, detected places, and travel segments with Day One-inspired visual hierarchy
4. WHEN the daily timeline is displayed THEN the system SHALL include a mini map showing the day's route
5. WHEN a user clicks on a timeline segment THEN the system SHALL allow adding notes, photos, and mood tags to that segment
6. WHEN a user writes journal text THEN the system SHALL auto-save drafts every 30 seconds with subtle feedback like Day One
7. WHEN a user adds photos to a journal entry THEN the system SHALL associate them with the corresponding time and location
8. WHEN a user selects a mood tag THEN the system SHALL apply it to the timeline segment and visualize it with color/icon
9. WHEN a journal entry is saved THEN the system SHALL store it locally with encryption
10. WHEN a user views the journal list (/journal) THEN the system SHALL show a calendar view with entries marked, similar to Day One's timeline view
11. WHEN a user searches journals THEN the system SHALL support full-text search across all entries with Day One-style instant results
12. WHEN a user exports a journal THEN the system SHALL generate a PDF or markdown file with embedded map images
13. WHEN the system detects significant places THEN the system SHALL suggest journal prompts like "How was your visit to [place]?"
14. WHEN a user enables journal reminders THEN the system SHALL send notifications at a chosen time to write the day's entry
15. WHEN the writing interface is displayed THEN the system SHALL use Day One-inspired distraction-free editor with markdown support
16. WHEN a user types in the editor THEN the system SHALL provide Day One-style formatting toolbar that appears contextually
17. WHEN journal entries are displayed in list view THEN the system SHALL show Day One-style preview cards with date, weather icon, location, and excerpt

### Requirement 18: 사진 메타데이터 기반 위치 기록

**User Story:** As a user, I want to upload photos and have their location automatically extracted from metadata, so that I can enrich my map and journal with visual memories without manual data entry.

#### Acceptance Criteria

1. WHEN a user uploads a photo THEN the system SHALL read EXIF metadata including GPS coordinates, timestamp, camera model, and other relevant data
2. WHEN a photo contains GPS coordinates THEN the system SHALL automatically plot the photo location on the map
3. WHEN a photo contains a timestamp THEN the system SHALL automatically associate it with the corresponding date's journal entry
4. WHEN a photo lacks GPS data THEN the system SHALL allow the user to manually pin it to a location on the map
5. WHEN multiple photos are uploaded at once THEN the system SHALL batch process them and create a photo timeline
6. WHEN photos are displayed on the map THEN the system SHALL show them as photo markers clustered by location
7. WHEN a user clicks a photo marker THEN the system SHALL display a photo viewer with EXIF details and option to add caption
8. WHEN a photo is added to a journal entry THEN the system SHALL display it inline with the timeline segment
9. WHEN a photo's location is within a privacy zone THEN the system SHALL apply the same masking rules as other location data
10. WHEN photos are shared via share links THEN the system SHALL strip EXIF metadata and apply privacy fuzzing
11. WHEN a user views photo gallery (/photos) THEN the system SHALL display photos organized by date, location, or album
12. WHEN a user enables photo sync THEN the system SHALL automatically import photos from device camera roll with permission
13. WHEN duplicate photos are detected THEN the system SHALL skip or merge them based on file hash
14. WHEN a photo is deleted THEN the system SHALL remove it from map, journal, and storage while keeping location history intact

### Requirement 17: iOS 네이티브 앱 하이브리드 아키텍처

**User Story:** As a user, I want seamless integration between iOS native app and web app, so that I can use the best features of both platforms.

#### Acceptance Criteria

1. WHEN the web app is designed THEN the system SHALL use a platform-agnostic API layer that can be consumed by both web and iOS clients
2. WHEN API endpoints are created THEN the system SHALL follow RESTful conventions with JSON responses suitable for mobile consumption
3. WHEN the iOS app is developed THEN the system SHALL use native Swift/SwiftUI for UI while sharing the same backend API
4. WHEN location tracking occurs on iOS THEN the system SHALL use native CoreLocation for better battery efficiency and accuracy
5. WHEN data is stored on iOS THEN the system SHALL use local SQLite/CoreData with the same schema as web's IndexedDB
6. WHEN the iOS app needs web views THEN the system SHALL embed WKWebView for specific features like map visualization
7. WHEN communication between native and web view is needed THEN the system SHALL use JavaScript bridge (WKScriptMessageHandler)
8. WHEN authentication is implemented THEN the system SHALL support both web session cookies and iOS native token storage (Keychain)
9. WHEN push notifications are needed THEN the system SHALL use APNs for iOS and web push for web app
10. WHEN the iOS app syncs data THEN the system SHALL use the same API endpoints with device-specific headers
11. WHEN offline mode is enabled THEN the system SHALL cache data locally on both platforms with sync on reconnection
12. WHEN the user switches between devices THEN the system SHALL maintain consistent state through cloud sync
13. WHEN platform-specific features are used THEN the system SHALL gracefully degrade on unsupported platforms
14. WHEN the iOS app accesses photos THEN the system SHALL use native PhotoKit for better performance than web file upload

### Requirement 19: 보안 및 프라이버시 (웹)

**User Story:** As a user, I want my location data to be secure and never exposed in raw form, so that my privacy is protected.

#### Acceptance Criteria

1. WHEN share links are generated THEN the system SHALL only expose fuzzed and masked GeoJSON data
2. WHEN share links are created THEN the system SHALL include signed tokens with expiration timestamps
3. WHEN server logs are created THEN the system SHALL only store aggregated metrics without personal identifiers
4. WHEN the /share/:id endpoint is accessed THEN the system SHALL validate token signature and expiration
5. WHEN raw coordinate data is processed THEN the system SHALL never transmit it to the server without fuzzing/masking
6. WHEN journal entries are stored THEN the system SHALL encrypt them using user's device key
7. WHEN journal data is synced THEN the system SHALL use end-to-end encryption

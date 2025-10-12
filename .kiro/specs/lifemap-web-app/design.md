# Design Document

## Overview

LifeMap is a privacy-first location journaling web application that visualizes a user's life journey through an interactive map interface. The system follows a hybrid architecture where the web app serves as the primary interface while being designed for future iOS native app integration. The design emphasizes Day One-inspired UX principles with clean typography, generous whitespace, and fluid animations.

### Key Design Principles

1. **Privacy by Default**: All location data is processed locally first, with fuzzing and masking applied before any server transmission
2. **Progressive Enhancement**: Core features work offline with local storage, enhanced by cloud sync when available
3. **Platform Agnostic**: API and data layer designed to support both web and future iOS clients
4. **Performance First**: Chunked loading, virtualization, and lazy mounting for smooth experience with large datasets
5. **Accessibility**: WCAG AA compliant with full keyboard navigation and screen reader support

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────┐              ┌────────────────────┐   │
│  │   Web App        │              │  iOS App (Future)  │   │
│  │  (React/Next.js) │              │  (Swift/SwiftUI)   │   │
│  └────────┬─────────┘              └─────────┬──────────┘   │
│           │                                   │              │
│           └───────────────┬───────────────────┘              │
└───────────────────────────┼──────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   API Gateway   │
                   │  (REST/GraphQL) │
                   └────────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐   ┌───────▼────────┐
│  CloudKit JS   │  │  PostgreSQL │   │  Privacy Layer │
│   (iCloud)     │  │  (Railway)  │   │ (Fuzzing/Mask) │
└────────────────┘  └─────────────┘   └────────────────┘
```

### Technology Stack

**Frontend:**
- Framework: Next.js 14+ (App Router)
- UI: React 18+ with TypeScript
- Styling: CSS Modules + CSS Custom Properties
- Map: Mapbox GL JS (primary) / CesiumJS (3D option)
- State Management: Zustand (lightweight) + React Query (server state)
- Forms: React Hook Form + Zod validation
- Animation: Framer Motion
- i18n: next-intl

**Backend:**
- Hosting: Railway (auto-deploy from Git)
- Database: PostgreSQL (Railway addon) for share links and metadata
- Cloud Storage: CloudKit (iCloud) for user data sync
- API: Next.js API Routes (serverless functions)

**Data Processing:**
- EXIF: exifr library for photo metadata extraction
- Geospatial: H3 (Uber) for hexagonal binning, Turf.js for geometry operations
- Privacy: Custom fuzzing algorithms with configurable radius

**Development:**
- Language: TypeScript (strict mode)
- Package Manager: pnpm
- Linting: ESLint + Prettier
- Testing: Vitest + React Testing Library

## Components and Interfaces

### Component Hierarchy

```
App
├── Layout
│   ├── Header (navigation, branding)
│   ├── Main (route outlet)
│   └── Footer
├── Pages
│   ├── LandingPage (/)
│   ├── MapPage (/app/map)
│   │   ├── TimelinePanel (left sidebar)
│   │   │   ├── YearSlider
│   │   │   ├── QuickNavButtons
│   │   │   └── MemoryCardList
│   │   ├── MapCanvas (center)
│   │   │   ├── MapContainer (Mapbox)
│   │   │   ├── LayerToggle
│   │   │   └── Legend
│   │   └── InspectorPanel (right sidebar)
│   │       ├── PlaceCard
│   │       ├── TripCard
│   │       ├── RunCard
│   │       └── PalettePanel
│   ├── JournalListPage (/journal)
│   │   ├── CalendarView
│   │   └── JournalPreviewCard[]
│   ├── JournalEntryPage (/journal/:date)
│   │   ├── DailyTimeline
│   │   ├── MiniMap
│   │   ├── MarkdownEditor
│   │   └── PhotoGallery
│   ├── PhotoGalleryPage (/photos)
│   │   ├── PhotoGrid (virtualized)
│   │   └── PhotoViewer (modal)
│   ├── RunsPage (/runs)
│   ├── TripDetailPage (/trip/:id)
│   ├── PlaceDetailPage (/place/:id)
│   ├── PalettePage (/palette)
│   ├── PrivacyDashboard (/privacy)
│   ├── SettingsPage (/settings)
│   └── ShareViewPage (/share/:id)
└── Shared Components
    ├── Modal
    ├── ShareDialog
    ├── ColorPicker
    ├── DatePicker
    └── Toast
```

### Core Component Interfaces


```typescript
// Map Component
interface MapCanvasProps {
  center: [number, number];
  zoom: number;
  layers: LayerConfig[];
  onLocationClick: (location: Location) => void;
  timeRange: TimeRange;
}

// Timeline Component
interface TimelinePanelProps {
  yearRange: [number, number];
  selectedYear: number;
  onYearChange: (year: number) => void;
  memories: Memory[];
}

// Place Card
interface PlaceCardProps {
  place: Place;
  onFavoriteToggle: (placeId: string) => void;
  onShare: (placeId: string) => void;
}

// Journal Entry
interface JournalEntryProps {
  date: string;
  entry: JournalEntry | null;
  timeline: DailyTimeline;
  onSave: (entry: JournalEntry) => void;
}

// Photo Upload
interface PhotoUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  onMetadataExtracted: (photo: PhotoWithMetadata) => void;
}
```

## Data Models

### Core Entities

```typescript
// Location Point
interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  altitude?: number;
  speed?: number;
  heading?: number;
  source: 'gps' | 'wifi' | 'cell' | 'manual';
}

// Place (Representative Location)
interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: 'home' | 'work' | 'frequent' | 'other';
  visitCount: number;
  totalDuration: number; // milliseconds
  firstVisit: Date;
  lastVisit: Date;
  isFavorite: boolean;
  privacyMasked: boolean;
  lifeClockData: LifeClockData; // time-of-day distribution
  weekHeatmap: WeekHeatmap; // day x hour matrix
}

// Trip
interface Trip {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  locations: LocationPoint[];
  photos: Photo[];
  notes: string;
  isAutoDetected: boolean;
  boundingBox: BoundingBox;
}

// Running Session
interface RunSession {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  distance: number; // meters
  averagePace: number; // seconds per km
  elevationGain: number; // meters
  route: LocationPoint[];
  gpxData?: string;
  privacyMasked: boolean;
}

// Journal Entry
interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string; // markdown
  timeline: TimelineSegment[];
  photos: Photo[];
  mood?: MoodTag;
  weather?: WeatherData;
  createdAt: Date;
  updatedAt: Date;
  encrypted: boolean;
}

interface TimelineSegment {
  id: string;
  startTime: Date;
  endTime: Date;
  place?: Place;
  activity: 'stationary' | 'walking' | 'driving' | 'running' | 'unknown';
  notes?: string;
  photos: Photo[];
  mood?: MoodTag;
}

// Photo
interface Photo {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  latitude?: number;
  longitude?: number;
  timestamp: Date;
  exif: ExifData;
  caption?: string;
  journalEntryId?: string;
  tripId?: string;
  hash: string; // for duplicate detection
}

interface ExifData {
  make?: string;
  model?: string;
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  focalLength?: number;
  width: number;
  height: number;
}

// Share Link
interface ShareLink {
  id: string;
  token: string;
  userId: string;
  contentType: 'map' | 'trip' | 'place' | 'run';
  contentId: string;
  expiresAt: Date;
  createdAt: Date;
  viewCount: number;
  fuzzedData: GeoJSON; // pre-processed with privacy applied
}

// Privacy Settings
interface PrivacySettings {
  userId: string;
  privacyZones: PrivacyZone[];
  defaultMaskRadius: number; // meters
  timeFuzzingRange: [number, number]; // hours
  visibilityLevel: 'private' | 'limited' | 'anonymous';
  maskHome: boolean;
  maskWork: boolean;
}

interface PrivacyZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  type: 'home' | 'work' | 'custom';
}

// User Preferences
interface UserPreferences {
  userId: string;
  palette: PaletteColors;
  thicknessScale: number;
  glowIntensity: number;
  language: 'ko' | 'en' | 'ja';
  units: 'metric' | 'imperial';
  journalReminder?: {
    enabled: boolean;
    time: string; // HH:mm
  };
}

interface PaletteColors {
  palette0: string; // hex color
  palette1: string;
  palette2: string;
  palette3: string;
  palette4: string;
}
```

## Data Storage Strategy

### Local Storage (IndexedDB)


**Database Schema:**

```
Stores:
- locations: LocationPoint[] (indexed by timestamp, lat/lng)
- places: Place[] (indexed by category, lastVisit)
- trips: Trip[] (indexed by startDate)
- runs: RunSession[] (indexed by startTime)
- journals: JournalEntry[] (indexed by date)
- photos: Photo[] (indexed by timestamp, hash)
- preferences: UserPreferences
- privacySettings: PrivacySettings
- syncQueue: SyncOperation[] (pending cloud sync)
```

**Encryption:**
- Journal entries encrypted using Web Crypto API with user-derived key
- Key stored in browser's secure storage (not transmitted)
- Photos stored as encrypted blobs with metadata in plaintext for indexing

### Cloud Storage (CloudKit)

**Private Database (User Data):**
- Record Types: Location, Place, Trip, Run, Journal, Photo, Preferences
- Sync Strategy: Incremental sync with change tokens
- Conflict Resolution: Last-write-wins with timestamp comparison

**Public Database (Shared Content):**
- Record Types: SharedMap (fuzzed GeoJSON snapshots)
- Access: Read-only for share link holders
- Expiration: Automatic cleanup via scheduled job

### Server Database (PostgreSQL on Railway)

**Tables:**

```sql
-- Share links metadata
CREATE TABLE share_links (
  id UUID PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  fuzzed_data JSONB NOT NULL
);

-- Aggregated analytics (no PII)
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  count INTEGER DEFAULT 1,
  date DATE NOT NULL,
  metadata JSONB
);

-- User sessions (minimal, for auth only)
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Privacy and Security Architecture

### Data Flow for Location Processing

```
Raw GPS Data
    ↓
[Local Processing]
    ↓
Privacy Zone Detection → Apply Masking (radius-based)
    ↓
Time Fuzzing (±1-3 hours)
    ↓
H3 Hexagon Aggregation (resolution based on zoom)
    ↓
[Fuzzed Data]
    ↓
├─→ Display on Map (local)
├─→ Store in IndexedDB (encrypted)
└─→ Sync to CloudKit (if enabled)
```

### Sharing Flow

```
User Initiates Share
    ↓
Select Content (map/trip/place/run)
    ↓
Apply Privacy Filters
    ├─ Remove points in privacy zones
    ├─ Apply time fuzzing
    ├─ Reduce coordinate precision
    └─ Strip metadata
    ↓
Generate Fuzzed GeoJSON
    ↓
Create Share Link
    ├─ Generate signed token
    ├─ Set expiration
    └─ Store in PostgreSQL
    ↓
Return Share URL
```

### Authentication Strategy

**Web App:**
- CloudKit Web Auth (Sign in with Apple)
- Session stored in httpOnly cookie
- CSRF protection via double-submit cookie

**iOS App (Future):**
- Native CloudKit authentication
- Token stored in Keychain
- Biometric unlock option

## API Design

### REST Endpoints


```
POST   /api/auth/login          - Authenticate with CloudKit
POST   /api/auth/logout         - End session
GET    /api/auth/session        - Check session status

POST   /api/share/create        - Create share link
GET    /api/share/:token        - Get shared content
DELETE /api/share/:token        - Revoke share link
POST   /api/share/:token/view   - Increment view count

POST   /api/photos/upload       - Upload photo (multipart)
POST   /api/photos/extract-exif - Extract EXIF from photo
GET    /api/photos/:id          - Get photo metadata

POST   /api/export/gpx          - Export run as GPX
POST   /api/export/journal      - Export journal as PDF/MD

GET    /api/health              - Health check endpoint
```

### CloudKit Schema

```javascript
// Record Types
{
  "Location": {
    "fields": {
      "latitude": "Double",
      "longitude": "Double",
      "timestamp": "Date/Time",
      "accuracy": "Double",
      "encrypted": "Int64" // boolean
    }
  },
  "Journal": {
    "fields": {
      "date": "String",
      "content": "String", // encrypted
      "timeline": "String", // JSON
      "photos": "Asset[]",
      "modifiedAt": "Date/Time"
    }
  },
  "Photo": {
    "fields": {
      "asset": "Asset",
      "thumbnail": "Asset",
      "latitude": "Double",
      "longitude": "Double",
      "timestamp": "Date/Time",
      "exif": "String", // JSON
      "hash": "String"
    }
  }
}
```

## Map Visualization Design

### Layer Architecture

```
Map Layers (bottom to top):
1. Base Map (Mapbox Streets/Dark)
2. Heat Map Layer (cumulative time spent)
3. Track Layer (polylines colored by time period)
4. Representative Places (circles sized by duration)
5. Resonance Layer (glow effect for emotional significance)
6. Running Routes (distinct color/style)
7. Photo Markers (clustered)
8. Privacy Zones (semi-transparent overlay)
```

### Color Mapping Strategy

**Time-based Palette:**
- palette-0: Dawn/Youth (light blue)
- palette-1: Day/Prime (green)
- palette-2: Dusk/Reflection (amber)
- palette-3: Passion (pink)
- palette-4: Depth (purple)

**Mapping Algorithm:**
```typescript
function getColorForTimestamp(timestamp: Date, birthDate: Date): string {
  const ageInYears = (timestamp - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
  const lifeStage = Math.floor(ageInYears / 20) % 5; // 0-4
  return `var(--palette-${lifeStage})`;
}
```

### Performance Optimizations

**Chunked Loading:**
- Divide map into H3 hexagons at resolution 6 (avg 36 km²)
- Load only visible hexagons + 1 ring buffer
- Cache loaded chunks in memory (LRU eviction)

**Level of Detail:**
```
Zoom 0-8:   H3 res 3, show aggregated hexagons only
Zoom 9-12:  H3 res 5, show place circles
Zoom 13-15: H3 res 7, show track polylines
Zoom 16+:   H3 res 9, show individual points
```

## UI/UX Design Patterns

### Day One-Inspired Elements

**Typography:**
```css
--font-serif: 'Lora', 'Georgia', serif;
--font-sans: 'Inter', system-ui, sans-serif;

.journal-body {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.7;
  letter-spacing: 0.01em;
}

.ui-text {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
}
```

**Spacing:**
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 40px;
--space-2xl: 64px;
```

**Animations:**
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Responsive Layout Breakpoints


**Mobile (< 768px):**
- Single column layout
- Bottom sheet for inspector panel
- Hamburger menu for navigation
- Touch-optimized controls (min 44px tap targets)

**Tablet (768px - 1024px):**
- Two column: Map + Sidebar
- Collapsible panels
- Swipe gestures for panel navigation

**Desktop (> 1024px):**
- Three column: Timeline + Map + Inspector
- Persistent panels
- Keyboard shortcuts enabled
- Hover states and tooltips

## Error Handling

### Error Categories

**Network Errors:**
- Offline mode: Queue operations for later sync
- Timeout: Retry with exponential backoff (max 3 attempts)
- 5xx errors: Show generic error, log to analytics

**Data Errors:**
- Invalid EXIF: Skip GPS extraction, allow manual pinning
- Corrupt photo: Show placeholder, log error
- Sync conflict: Use last-write-wins, notify user

**Privacy Errors:**
- Location permission denied: Disable tracking, show explanation
- CloudKit not available: Fall back to local-only mode
- Share link expired: Show friendly message with option to request new link

### Error UI Patterns

```typescript
// Toast for non-critical errors
toast.error('Failed to upload photo. Retrying...', {
  duration: 3000,
  action: { label: 'Dismiss', onClick: () => {} }
});

// Modal for critical errors
<ErrorModal
  title="Sync Failed"
  message="Unable to sync with iCloud. Your data is safe locally."
  actions={[
    { label: 'Retry', onClick: retrySync },
    { label: 'Continue Offline', onClick: dismissModal }
  ]}
/>

// Inline for form validation
<Input
  error="Privacy radius must be between 300-1000 meters"
  value={radius}
  onChange={setRadius}
/>
```

## Testing Strategy

### Unit Tests
- Data models and transformations
- Privacy fuzzing algorithms
- EXIF extraction logic
- Date/time utilities
- Color mapping functions

### Integration Tests
- API endpoints (mocked CloudKit)
- IndexedDB operations
- Photo upload flow
- Share link generation and validation

### E2E Tests (Playwright)
- User authentication flow
- Journal entry creation
- Photo upload with EXIF
- Map interaction and layer toggling
- Share link creation and access

### Accessibility Tests
- Keyboard navigation
- Screen reader announcements
- Color contrast ratios
- Focus management in modals

## Deployment Strategy

### Railway Configuration

**Build Command:**
```bash
pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start
```

**Environment Variables:**
```
NODE_ENV=production
DATABASE_URL=postgresql://...
CLOUDKIT_CONTAINER_ID=...
CLOUDKIT_API_TOKEN=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://lifemap.app
KAKAO_API_KEY=...
```

**Health Check:**
```
GET /api/health
Expected: 200 OK with { "status": "healthy", "timestamp": "..." }
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
      - uses: railway/deploy@v1
        with:
          service: lifemap-web
```

### Monitoring

**Metrics to Track:**
- Response time (p50, p95, p99)
- Error rate by endpoint
- CloudKit sync success rate
- Share link creation/access counts
- Photo upload success rate

**Logging:**
- Structured JSON logs
- No PII in logs (use hashed user IDs)
- Log levels: ERROR, WARN, INFO, DEBUG

## Future iOS App Integration Points

### Shared API Contract


All API endpoints return JSON with consistent structure:

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-10-11T12:00:00Z"
}

// Error response
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Share link has expired",
    "details": { ... }
  },
  "timestamp": "2025-10-11T12:00:00Z"
}
```

### Platform Detection

```typescript
// Detect platform from User-Agent or custom header
const platform = req.headers['x-platform'] || 'web';

if (platform === 'ios') {
  // Return iOS-optimized response
  // e.g., smaller image sizes, native date formats
}
```

### WKWebView Bridge (iOS)

```swift
// iOS side
webView.configuration.userContentController.add(self, name: "lifemap")

// JavaScript side
window.webkit.messageHandlers.lifemap.postMessage({
  action: "shareMap",
  data: { mapId: "123" }
});
```

### Data Schema Compatibility

Both platforms use identical data structures:
- Same field names and types
- ISO 8601 dates
- GeoJSON for geographic data
- Markdown for journal content

## Accessibility Implementation

### Keyboard Navigation

**Global Shortcuts:**
- `Cmd/Ctrl + K`: Open command palette
- `Cmd/Ctrl + J`: Jump to journal
- `Cmd/Ctrl + M`: Focus map
- `Cmd/Ctrl + /`: Show keyboard shortcuts
- `Esc`: Close modal/panel

**Map Navigation:**
- Arrow keys: Pan map
- `+/-`: Zoom in/out
- `Space`: Toggle layer panel
- `Tab`: Cycle through map markers

### Screen Reader Support

```html
<!-- Map container -->
<div
  role="application"
  aria-label="LifeMap interactive map"
  aria-describedby="map-instructions"
>
  <div id="map-instructions" class="sr-only">
    Use arrow keys to pan, plus and minus to zoom.
    Press Tab to navigate to map markers.
  </div>
</div>

<!-- Dynamic updates -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {statusMessage}
</div>

<!-- Place card -->
<article
  aria-labelledby="place-title"
  aria-describedby="place-stats"
>
  <h3 id="place-title">Favorite Cafe</h3>
  <div id="place-stats">
    Visited 42 times. Last visit: October 8, 2025.
  </div>
</article>
```

### Color Accessibility

**Contrast Ratios:**
- Text on background: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum

**Alternative Patterns:**
```css
/* For color-blind users */
.track-line[data-pattern="youth"] {
  stroke-dasharray: 5, 5; /* dotted */
}

.track-line[data-pattern="prime"] {
  stroke-dasharray: 10, 5; /* dashed */
}

.track-line[data-pattern="reflection"] {
  stroke-dasharray: 15, 5, 5, 5; /* dash-dot */
}
```

## Internationalization (i18n)

### Translation Files Structure

```
locales/
├── ko/
│   ├── common.json
│   ├── map.json
│   ├── journal.json
│   └── errors.json
├── en/
│   └── ...
└── ja/
    └── ...
```

### Example Translation File

```json
// locales/ko/journal.json
{
  "title": "일기",
  "newEntry": "새 일기 작성",
  "placeholder": "오늘 하루는 어땠나요?",
  "autoSave": "자동 저장됨",
  "prompts": {
    "place": "{{place}}에서의 시간은 어땠나요?",
    "trip": "{{destination}} 여행의 하이라이트는?"
  },
  "export": {
    "pdf": "PDF로 내보내기",
    "markdown": "마크다운으로 내보내기"
  }
}
```

### Date/Time Formatting

```typescript
import { format } from 'date-fns';
import { ko, enUS, ja } from 'date-fns/locale';

const locales = { ko, en: enUS, ja };

function formatDate(date: Date, locale: string): string {
  return format(date, 'PPP', { locale: locales[locale] });
}

// Output:
// ko: 2025년 10월 11일
// en: October 11, 2025
// ja: 2025年10月11日
```

## Performance Benchmarks

### Target Metrics

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Optimization Techniques

**Code Splitting:**
```typescript
// Lazy load heavy components
const MapCanvas = lazy(() => import('./components/MapCanvas'));
const PhotoViewer = lazy(() => import('./components/PhotoViewer'));
```

**Image Optimization:**
- Next.js Image component with automatic WebP conversion
- Responsive images with srcset
- Lazy loading below the fold
- Thumbnail generation (200x200, 400x400, 800x800)

**Data Virtualization:**
```typescript
// For long lists (journal entries, photos)
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
  overscan: 5
});
```

## Security Considerations

### Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.apple-cloudkit.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.mapbox.com;
  connect-src 'self' https://api.mapbox.com https://*.apple-cloudkit.com;
  font-src 'self' data:;
  frame-ancestors 'none';
```

### Rate Limiting

```typescript
// API route middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

export default limiter;
```

### Input Validation

```typescript
import { z } from 'zod';

const ShareLinkSchema = z.object({
  contentType: z.enum(['map', 'trip', 'place', 'run']),
  contentId: z.string().uuid(),
  expiresIn: z.number().min(72).max(720) // hours
});

// Usage
const result = ShareLinkSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: result.error });
}
```

## Conclusion

This design document provides a comprehensive blueprint for building LifeMap as a privacy-first, performant, and accessible web application. The architecture is designed to support future iOS native app integration while maintaining a clean separation of concerns. Key design decisions prioritize user privacy, data ownership, and a delightful Day One-inspired user experience.

The modular component structure, well-defined data models, and clear API contracts ensure that the system can scale and evolve as new features are added. The emphasis on local-first data storage with optional cloud sync via CloudKit provides users with full control over their data while enabling seamless multi-device experiences.

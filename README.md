# LifeMap Web App

Privacy-first location journaling web application that visualizes your life journey through an interactive map interface.

## ✨ Features

- 🗺️ **Interactive Map Visualization**
  - Mapbox GL JS integration with custom layers
  - Heat maps, track lines, place rings, and running routes
  - Real-time layer toggling and legend
  - Keyboard navigation support

- 📝 **Day One-Inspired Journaling**
  - Location-based daily entries
  - Markdown editor with auto-save
  - Timeline visualization
  - Mood tags and weather data

- 📸 **Photo Management**
  - Automatic EXIF metadata extraction
  - GPS coordinate mapping
  - Duplicate detection
  - Privacy-aware sharing

- 🔒 **Privacy-First Architecture**
  - Local-first with IndexedDB
  - Privacy zone masking (home/work)
  - Time fuzzing (1-3 hours)
  - H3 hexagon aggregation
  - End-to-end encryption for journals

- 🎨 **Customizable Design**
  - 5-color palette system
  - Real-time theme updates
  - Thickness and glow controls
  - Day One-inspired typography

- 🌐 **Multi-Platform Ready**
  - Responsive design (mobile/tablet/desktop)
  - Future iOS app integration
  - CloudKit sync support
  - Offline-first capability

## 🏗️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand + React Query
- **Styling**: CSS Modules + CSS Custom Properties
- **Map**: Mapbox GL JS
- **Geospatial**: H3 (Uber), Turf.js
- **Animation**: Framer Motion
- **i18n**: next-intl
- **Validation**: Zod
- **Storage**: IndexedDB (local), CloudKit (cloud)
- **Deployment**: Railway + PostgreSQL

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Mapbox account (for map token)

### Installation

\`\`\`bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Run development server
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a \`.env.local\` file:

\`\`\`env
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# CloudKit (iCloud)
CLOUDKIT_CONTAINER_ID=your_cloudkit_container_id
CLOUDKIT_API_TOKEN=your_cloudkit_api_token

# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Kakao (for SNS sharing)
NEXT_PUBLIC_KAKAO_API_KEY=your_kakao_api_key
\`\`\`

## 📁 Project Structure

\`\`\`
lifemap-web-app/
├── app/                      # Next.js App Router pages
│   ├── app/map/             # Main map interface
│   ├── journal/             # Journal pages
│   ├── photos/              # Photo gallery
│   ├── palette/             # Palette customization
│   ├── privacy/             # Privacy dashboard
│   └── settings/            # App settings
├── components/              # React components
│   ├── cards/              # PlaceCard, TripCard, RunCard
│   ├── map/                # MapCanvas, LayerToggle, Legend
│   ├── timeline/           # TimelinePanel, MemoryCard
│   └── palette/            # PalettePanel
├── lib/                     # Utilities and helpers
│   ├── stores/             # Zustand state stores
│   ├── animations.ts       # Framer Motion variants
│   ├── crypto.ts           # Encryption utilities
│   ├── db.ts               # IndexedDB wrapper
│   ├── h3Utils.ts          # H3 hexagon utilities
│   ├── mapLayers.ts        # Mapbox layer management
│   ├── privacy.ts          # Privacy masking
│   └── timeFuzzing.ts      # Time fuzzing
├── types/                   # TypeScript definitions
│   ├── index.ts            # Core data models
│   └── schemas.ts          # Zod validation schemas
├── styles/                  # Global styles
│   ├── tokens.css          # Design tokens
│   └── typography.css      # Typography system
└── public/                  # Static assets
\`\`\`

## 🎨 Design System

### Color Palette

The app uses a 5-color palette system inspired by life stages:

- **Palette 0** (#7fe3ff): Youth/Dawn/Calm
- **Palette 1** (#8af5c2): Prime/Day/Energy
- **Palette 2** (#ffd166): Reflection/Dusk/Memory
- **Palette 3** (#ff7aa2): Passion/Intensity
- **Palette 4** (#9d8cff): Depth/Quiet

### Typography

- **UI Text**: Inter (sans-serif)
- **Journal Body**: Lora (serif)
- **Code**: SF Mono, Monaco, Consolas

### Responsive Breakpoints

- **sm**: ≥480px
- **md**: ≥768px
- **lg**: ≥1024px
- **xl**: ≥1440px

## 🔐 Privacy & Security

### Data Storage

- **Local**: IndexedDB with encryption (Web Crypto API)
- **Cloud**: CloudKit private database (optional)
- **Sharing**: PostgreSQL for temporary share links only

### Privacy Features

- Privacy zone masking (300-1000m radius)
- Time fuzzing (±1-3 hours)
- Coordinate precision reduction
- EXIF metadata stripping on share
- No raw coordinates transmitted to server

### Encryption

- Journal entries: AES-GCM encryption
- Device key: Stored in localStorage
- Sync: End-to-end encryption via CloudKit

## 🧪 Development

\`\`\`bash
# Run linter
pnpm lint

# Type check
pnpm type-check

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

## 📝 Implementation Status

### ✅ Completed (Tasks 1-9)

- [x] Project structure and configuration
- [x] Design system and theming
- [x] Core layout components (Header, Footer, Modal)
- [x] Data layer (TypeScript types, IndexedDB, Zustand)
- [x] Privacy layer (masking, fuzzing, H3 aggregation)
- [x] Map visualization (Mapbox, layers, controls)
- [x] Timeline and memory components
- [x] Card components (Place, Trip, Run)
- [x] Palette customization

### 🚧 In Progress (Tasks 10-27)

- [ ] Journal entry system
- [ ] Photo management
- [ ] Sharing functionality
- [ ] CloudKit integration
- [ ] API endpoints
- [ ] Internationalization
- [ ] Responsive layouts
- [ ] Accessibility enhancements
- [ ] Railway deployment

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the maintainer.

## 📄 License

Private project - All rights reserved

## 🙏 Acknowledgments

- Design inspiration: Day One
- Map provider: Mapbox
- Geospatial library: H3 (Uber)
- Icons: Native emoji

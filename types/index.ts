/**
 * Core data models for LifeMap
 * Based on design document specifications
 */

// ===== Location and Geography =====

export interface LocationPoint {
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

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ===== Places =====

export interface LifeClockData {
  [hour: number]: number; // hour (0-23) -> duration in minutes
}

export interface WeekHeatmap {
  [day: number]: {
    // day (0-6, Sunday-Saturday)
    [hour: number]: number; // hour (0-23) -> visit count
  };
}

export interface Place {
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
  lifeClockData: LifeClockData;
  weekHeatmap: WeekHeatmap;
}

// ===== Trips =====

export interface Trip {
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

// ===== Running =====

export interface RunSession {
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

// ===== Journal =====

export type MoodTag =
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'anxious'
  | 'grateful'
  | 'reflective';

export interface WeatherData {
  condition: string;
  temperature: number;
  icon: string;
}

export interface TimelineSegment {
  id: string;
  startTime: Date;
  endTime: Date;
  place?: Place;
  activity: 'stationary' | 'walking' | 'driving' | 'running' | 'unknown';
  notes?: string;
  photos: Photo[];
  mood?: MoodTag;
}

export interface JournalEntry {
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

// ===== Photos =====

export interface ExifData {
  make?: string;
  model?: string;
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  focalLength?: number;
  width: number;
  height: number;
}

export interface Photo {
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

// ===== Sharing =====

export interface ShareLink {
  id: string;
  token: string;
  userId: string;
  contentType: 'map' | 'trip' | 'place' | 'run';
  contentId: string;
  expiresAt: Date;
  createdAt: Date;
  viewCount: number;
  fuzzedData: GeoJSON.FeatureCollection;
}

// ===== Privacy =====

export interface PrivacyZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  type: 'home' | 'work' | 'custom';
}

export interface PrivacySettings {
  userId: string;
  privacyZones: PrivacyZone[];
  defaultMaskRadius: number; // meters
  timeFuzzingRange: [number, number]; // hours [min, max]
  visibilityLevel: 'private' | 'limited' | 'anonymous';
  maskHome: boolean;
  maskWork: boolean;
}

// ===== User Preferences =====

export interface PaletteColors {
  palette0: string; // hex color
  palette1: string;
  palette2: string;
  palette3: string;
  palette4: string;
}

export interface JournalReminderSettings {
  enabled: boolean;
  time: string; // HH:mm
}

export interface UserPreferences {
  userId: string;
  palette: PaletteColors;
  thicknessScale: number;
  glowIntensity: number;
  language: 'ko' | 'en' | 'ja';
  units: 'metric' | 'imperial';
  journalReminder?: JournalReminderSettings;
}

// ===== Sync Queue =====

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'location' | 'place' | 'trip' | 'run' | 'journal' | 'photo';
  entityId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

// ===== Map Layers =====

export type LayerType = 'track' | 'heat' | 'rings' | 'resonance' | 'runs';

export interface LayerConfig {
  id: LayerType;
  enabled: boolean;
  opacity: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

// ===== Memory Card =====

export interface Memory {
  id: string;
  date: Date;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  preview: string;
  type: 'place' | 'trip' | 'journal' | 'photo';
}

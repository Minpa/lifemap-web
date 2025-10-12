/**
 * Zod validation schemas for data models
 */

import { z } from 'zod';

// ===== Location =====

export const LocationPointSchema = z.object({
  id: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive(),
  timestamp: z.date(),
  altitude: z.number().optional(),
  speed: z.number().nonnegative().optional(),
  heading: z.number().min(0).max(360).optional(),
  source: z.enum(['gps', 'wifi', 'cell', 'manual']),
});

// ===== Place =====

export const PlaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  category: z.enum(['home', 'work', 'frequent', 'other']),
  visitCount: z.number().int().nonnegative(),
  totalDuration: z.number().nonnegative(),
  firstVisit: z.date(),
  lastVisit: z.date(),
  isFavorite: z.boolean(),
  privacyMasked: z.boolean(),
  lifeClockData: z.record(z.number()),
  weekHeatmap: z.record(z.record(z.number())),
});

// ===== Trip =====

export const TripSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  startDate: z.date(),
  endDate: z.date(),
  locations: z.array(LocationPointSchema),
  photos: z.array(z.any()), // PhotoSchema
  notes: z.string(),
  isAutoDetected: z.boolean(),
  boundingBox: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }),
});

// ===== Running =====

export const RunSessionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  startTime: z.date(),
  endTime: z.date(),
  distance: z.number().positive(),
  averagePace: z.number().positive(),
  elevationGain: z.number().nonnegative(),
  route: z.array(LocationPointSchema),
  gpxData: z.string().optional(),
  privacyMasked: z.boolean(),
});

// ===== Journal =====

export const MoodTagSchema = z.enum([
  'happy',
  'sad',
  'excited',
  'calm',
  'anxious',
  'grateful',
  'reflective',
]);

export const TimelineSegmentSchema = z.object({
  id: z.string().uuid(),
  startTime: z.date(),
  endTime: z.date(),
  place: PlaceSchema.optional(),
  activity: z.enum(['stationary', 'walking', 'driving', 'running', 'unknown']),
  notes: z.string().optional(),
  photos: z.array(z.any()),
  mood: MoodTagSchema.optional(),
});

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string(),
  timeline: z.array(TimelineSegmentSchema),
  photos: z.array(z.any()),
  mood: MoodTagSchema.optional(),
  weather: z
    .object({
      condition: z.string(),
      temperature: z.number(),
      icon: z.string(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  encrypted: z.boolean(),
});

// ===== Photo =====

export const ExifDataSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  fNumber: z.number().optional(),
  exposureTime: z.number().optional(),
  iso: z.number().optional(),
  focalLength: z.number().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const PhotoSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timestamp: z.date(),
  exif: ExifDataSchema,
  caption: z.string().max(500).optional(),
  journalEntryId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  hash: z.string(),
});

// ===== Privacy =====

export const PrivacyZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(300).max(1000),
  type: z.enum(['home', 'work', 'custom']),
});

export const PrivacySettingsSchema = z.object({
  userId: z.string(),
  privacyZones: z.array(PrivacyZoneSchema),
  defaultMaskRadius: z.number().min(300).max(1000),
  timeFuzzingRange: z.tuple([z.number().min(1), z.number().max(3)]),
  visibilityLevel: z.enum(['private', 'limited', 'anonymous']),
  maskHome: z.boolean(),
  maskWork: z.boolean(),
});

// ===== User Preferences =====

export const PaletteColorsSchema = z.object({
  palette0: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  palette1: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  palette2: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  palette3: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  palette4: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const UserPreferencesSchema = z.object({
  userId: z.string(),
  palette: PaletteColorsSchema,
  thicknessScale: z.number().min(0).max(100),
  glowIntensity: z.number().min(0).max(100),
  language: z.enum(['ko', 'en', 'ja']),
  units: z.enum(['metric', 'imperial']),
  journalReminder: z
    .object({
      enabled: z.boolean(),
      time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    })
    .optional(),
});

// ===== Share Link =====

export const ShareLinkSchema = z.object({
  contentType: z.enum(['map', 'trip', 'place', 'run']),
  contentId: z.string().uuid(),
  expiresIn: z.number().min(72).max(720), // hours
});

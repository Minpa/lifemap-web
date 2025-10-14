/**
 * Location Tracking Types
 * 
 * Type definitions for location tracking system
 */

/**
 * Location point captured from GPS
 */
export interface LocationPoint {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  isLowQuality: boolean;
  source: 'foreground' | 'background';
  synced: boolean;
  syncedAt: number | null;
  userId: string | null;
}

/**
 * Encrypted location point for server storage
 */
export interface EncryptedLocationPoint {
  id: string;
  userId: string;
  encryptedData: string;
  iv: string;
  timestamp: number;
  synced: boolean;
}

/**
 * Tracking options
 */
export interface TrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  updateInterval?: number;
  minDistance?: number;
}

/**
 * Tracking status
 */
export interface TrackingStatus {
  isActive: boolean;
  lastUpdate: Date | null;
  pointsToday: number;
  accuracy: number | null;
}

/**
 * Tracking statistics
 */
export interface TrackingStats {
  pointsCount: number;
  distance: number;
  duration: number;
  startTime: number;
}

/**
 * Track segment for visualization
 */
export interface TrackSegment {
  id: string;
  points: LocationPoint[];
  startTime: number;
  endTime: number;
  distance: number;
  duration: number;
  color: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Privacy zone
 */
export interface PrivacyZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  enabled: boolean;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalPoints: number;
  oldestPoint: Date | null;
  newestPoint: Date | null;
  estimatedSize: number;
  unsyncedCount: number;
}

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  error?: string;
}

/**
 * Sync status
 */
export interface SyncStatus {
  lastSyncTime: Date | null;
  unsyncedCount: number;
  isSyncing: boolean;
  autoSyncEnabled: boolean;
}

/**
 * Location error types
 */
export enum LocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  STORAGE_FULL = 'STORAGE_FULL',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Location error messages (Korean)
 */
export const LOCATION_ERROR_MESSAGES: Record<LocationErrorType, string> = {
  [LocationErrorType.PERMISSION_DENIED]:
    '위치 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.',
  [LocationErrorType.POSITION_UNAVAILABLE]:
    'GPS 신호를 찾을 수 없습니다. 야외로 이동해주세요.',
  [LocationErrorType.TIMEOUT]:
    '위치 정보를 가져오는데 시간이 초과되었습니다.',
  [LocationErrorType.STORAGE_FULL]:
    '저장 공간이 부족합니다. 오래된 데이터를 삭제해주세요.',
  [LocationErrorType.UNKNOWN]: '알 수 없는 오류가 발생했습니다.',
};

/**
 * Time-based colors for track visualization
 */
export const TIME_COLORS = {
  RECENT: '#7fe3ff', // < 1 hour (cyan)
  TODAY: '#8af5c2', // < 24 hours (green)
  THIS_WEEK: '#ffd166', // < 7 days (yellow)
  THIS_MONTH: '#ff7aa2', // < 30 days (orange)
  OLDER: '#9d8cff', // > 30 days (purple)
} as const;

/**
 * Time constants
 */
export const TIME_CONSTANTS = {
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Default tracking options
 */
export const DEFAULT_TRACKING_OPTIONS: TrackingOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
  updateInterval: 30000, // 30 seconds
  minDistance: 10, // 10 meters
};

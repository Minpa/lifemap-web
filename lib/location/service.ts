/**
 * Location Service
 * 
 * Manages geolocation tracking and position capture
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  LocationPoint,
  TrackingOptions,
  TrackingStatus,
  LocationErrorType,
} from './types';
import { DEFAULT_TRACKING_OPTIONS, LOCATION_ERROR_MESSAGES } from './types';
import { addLocationPoint } from '../db/locationDB';

class LocationService {
  private watchId: number | null = null;
  private isTracking = false;
  private lastPosition: LocationPoint | null = null;
  private options: TrackingOptions = DEFAULT_TRACKING_OPTIONS;
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(position: LocationPoint) => void> = new Set();
  private errorListeners: Set<(error: string) => void> = new Set();

  /**
   * Start tracking location
   */
  async startTracking(
    options?: TrackingOptions,
    userId?: string
  ): Promise<void> {
    if (this.isTracking) {
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    // Merge options
    this.options = { ...DEFAULT_TRACKING_OPTIONS, ...options };

    // Request permission first
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error(LOCATION_ERROR_MESSAGES.PERMISSION_DENIED);
    }

    // Start watching position
    this.isTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePosition(position, userId),
      (error) => this.handleError(error),
      {
        enableHighAccuracy: this.options.enableHighAccuracy,
        timeout: this.options.timeout,
        maximumAge: this.options.maximumAge,
      }
    );

    console.log('Location tracking started');
  }

  /**
   * Stop tracking location
   */
  stopTracking(): void {
    if (!this.isTracking) {
      return;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isTracking = false;
    console.log('Location tracking stopped');
  }

  /**
   * Get current position once
   */
  async getCurrentPosition(userId?: string): Promise<LocationPoint> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = this.createLocationPoint(position, userId);
          resolve(point);
        },
        (error) => {
          reject(this.mapGeolocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Check if tracking is active
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Get tracking status
   */
  getStatus(): TrackingStatus {
    return {
      isActive: this.isTracking,
      lastUpdate: this.lastPosition ? new Date(this.lastPosition.timestamp) : null,
      pointsToday: 0, // Will be calculated from store
      accuracy: this.lastPosition?.accuracy || null,
    };
  }

  /**
   * Request location permission
   */
  async requestPermission(): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return result.state;
    } catch {
      // Fallback for browsers that don't support permissions API
      return 'prompt';
    }
  }

  /**
   * Add position listener
   */
  onPosition(callback: (position: LocationPoint) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Add error listener
   */
  onError(callback: (error: string) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  /**
   * Handle position update
   */
  private async handlePosition(
    position: GeolocationPosition,
    userId?: string
  ): Promise<void> {
    const point = this.createLocationPoint(position, userId);

    // Filter by accuracy
    if (point.accuracy > 100) {
      point.isLowQuality = true;
    }

    // Filter by distance
    if (this.lastPosition && !this.shouldSavePoint(point, this.lastPosition)) {
      return;
    }

    // Save to database
    try {
      await addLocationPoint(point);
      this.lastPosition = point;

      // Notify listeners
      this.listeners.forEach((callback) => callback(point));
    } catch (error) {
      console.error('Failed to save location point:', error);
      this.errorListeners.forEach((callback) =>
        callback('Failed to save location')
      );
    }
  }

  /**
   * Handle geolocation error
   */
  private handleError(error: GeolocationPositionError): void {
    const errorMessage = this.mapGeolocationError(error);
    console.error('Geolocation error:', errorMessage);

    this.errorListeners.forEach((callback) => callback(errorMessage));
  }

  /**
   * Create location point from GeolocationPosition
   */
  private createLocationPoint(
    position: GeolocationPosition,
    userId?: string
  ): LocationPoint {
    const now = Date.now();
    const date = new Date(now);
    const dateString = date.toISOString().split('T')[0];

    return {
      id: uuidv4(),
      timestamp: now,
      date: dateString,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      isLowQuality: false,
      source: 'foreground',
      synced: false,
      syncedAt: null,
      userId: userId || null,
    };
  }

  /**
   * Check if point should be saved (distance filter)
   */
  private shouldSavePoint(
    newPoint: LocationPoint,
    lastPoint: LocationPoint
  ): boolean {
    const distance = this.calculateDistance(
      lastPoint.latitude,
      lastPoint.longitude,
      newPoint.latitude,
      newPoint.longitude
    );

    return distance >= (this.options.minDistance || 10);
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Map GeolocationPositionError to user-friendly message
   */
  private mapGeolocationError(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return LOCATION_ERROR_MESSAGES.PERMISSION_DENIED;
      case error.POSITION_UNAVAILABLE:
        return LOCATION_ERROR_MESSAGES.POSITION_UNAVAILABLE;
      case error.TIMEOUT:
        return LOCATION_ERROR_MESSAGES.TIMEOUT;
      default:
        return LOCATION_ERROR_MESSAGES.UNKNOWN;
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Export class for testing
export { LocationService };

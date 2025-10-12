/**
 * Privacy utilities for location masking and fuzzing
 */

import type { LocationPoint, PrivacyZone, PrivacySettings } from '@/types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a location point is within a privacy zone
 */
export function isInPrivacyZone(
  location: { latitude: number; longitude: number },
  zone: PrivacyZone
): boolean {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    zone.latitude,
    zone.longitude
  );
  return distance <= zone.radius;
}

/**
 * Check if a location is within any privacy zone
 */
export function isInAnyPrivacyZone(
  location: { latitude: number; longitude: number },
  zones: PrivacyZone[]
): boolean {
  return zones.some((zone) => isInPrivacyZone(location, zone));
}

/**
 * Mask coordinates by adding random offset within radius
 */
export function maskCoordinates(
  latitude: number,
  longitude: number,
  radiusMeters: number
): { latitude: number; longitude: number } {
  // Convert radius to degrees (approximate)
  const radiusDegrees = radiusMeters / 111320; // 1 degree ≈ 111.32 km

  // Generate random angle and distance
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusDegrees;

  // Calculate offset
  const latOffset = distance * Math.cos(angle);
  const lonOffset =
    distance * Math.sin(angle) / Math.cos((latitude * Math.PI) / 180);

  return {
    latitude: latitude + latOffset,
    longitude: longitude + lonOffset,
  };
}

/**
 * Apply privacy masking to a location point
 */
export function maskLocation(
  location: LocationPoint,
  settings: PrivacySettings
): LocationPoint {
  const activeZones = settings.privacyZones.filter((zone) => {
    if (zone.type === 'home' && !settings.maskHome) return false;
    if (zone.type === 'work' && !settings.maskWork) return false;
    return true;
  });

  // Check if location is in any privacy zone
  if (isInAnyPrivacyZone(location, activeZones)) {
    const masked = maskCoordinates(
      location.latitude,
      location.longitude,
      settings.defaultMaskRadius
    );

    return {
      ...location,
      latitude: masked.latitude,
      longitude: masked.longitude,
      accuracy: settings.defaultMaskRadius, // Reduced accuracy
    };
  }

  return location;
}

/**
 * Reduce coordinate precision for sharing
 */
export function reduceCoordinatePrecision(
  latitude: number,
  longitude: number,
  decimals: number = 3
): { latitude: number; longitude: number } {
  const factor = Math.pow(10, decimals);
  return {
    latitude: Math.round(latitude * factor) / factor,
    longitude: Math.round(longitude * factor) / factor,
  };
}

/**
 * Remove locations within privacy zones from an array
 */
export function filterPrivateLocations(
  locations: LocationPoint[],
  zones: PrivacyZone[]
): LocationPoint[] {
  return locations.filter((loc) => !isInAnyPrivacyZone(loc, zones));
}

/**
 * Create a circular privacy zone overlay for map visualization
 */
export function createPrivacyZoneOverlay(zone: PrivacyZone): GeoJSON.Feature {
  const points = 64; // Number of points in circle
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const radiusDegrees = zone.radius / 111320;

    const lat =
      zone.latitude + radiusDegrees * Math.cos(angle);
    const lon =
      zone.longitude +
      (radiusDegrees * Math.sin(angle)) /
        Math.cos((zone.latitude * Math.PI) / 180);

    coordinates.push([lon, lat]);
  }

  return {
    type: 'Feature',
    properties: {
      name: zone.name,
      type: zone.type,
      radius: zone.radius,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
  };
}

/**
 * Get default privacy zones (home and work)
 */
export function getDefaultPrivacyZones(): PrivacyZone[] {
  return [
    {
      id: 'home-default',
      name: '집',
      latitude: 0,
      longitude: 0,
      radius: 500,
      type: 'home',
    },
    {
      id: 'work-default',
      name: '직장',
      latitude: 0,
      longitude: 0,
      radius: 500,
      type: 'work',
    },
  ];
}

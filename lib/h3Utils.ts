/**
 * H3 hexagon utilities for location aggregation and clustering
 */

import { latLngToCell, cellToBoundary, gridDisk } from 'h3-js';
import type { LocationPoint } from '@/types';

/**
 * Get H3 resolution based on map zoom level
 * Higher zoom = higher resolution (smaller hexagons)
 */
export function getH3ResolutionForZoom(zoom: number): number {
  if (zoom <= 8) return 3; // ~100 km hexagons
  if (zoom <= 12) return 5; // ~10 km hexagons
  if (zoom <= 15) return 7; // ~1 km hexagons
  return 9; // ~100 m hexagons
}

/**
 * Convert location to H3 cell index
 */
export function locationToH3(
  location: { latitude: number; longitude: number },
  resolution: number
): string {
  return latLngToCell(location.latitude, location.longitude, resolution);
}

/**
 * Get hexagon boundary coordinates for rendering
 */
export function getHexagonBoundary(h3Index: string): [number, number][] {
  const boundary = cellToBoundary(h3Index);
  return boundary.map(([lat, lng]) => [lng, lat]); // GeoJSON uses [lng, lat]
}

/**
 * Aggregate locations into H3 hexagons
 */
export function aggregateLocationsToH3(
  locations: LocationPoint[],
  resolution: number
): Map<string, LocationPoint[]> {
  const hexMap = new Map<string, LocationPoint[]>();

  for (const location of locations) {
    const h3Index = locationToH3(location, resolution);

    if (!hexMap.has(h3Index)) {
      hexMap.set(h3Index, []);
    }

    hexMap.get(h3Index)!.push(location);
  }

  return hexMap;
}

/**
 * Calculate statistics for hexagon (for heatmap visualization)
 */
export interface HexagonStats {
  h3Index: string;
  count: number;
  totalDuration: number; // milliseconds
  avgDuration: number;
  firstVisit: Date;
  lastVisit: Date;
  boundary: [number, number][];
}

export function calculateHexagonStats(
  h3Index: string,
  locations: LocationPoint[]
): HexagonStats {
  if (locations.length === 0) {
    throw new Error('Cannot calculate stats for empty location array');
  }

  // Sort by timestamp
  const sorted = [...locations].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Calculate total duration (time between first and last visit)
  const firstVisit = sorted[0].timestamp;
  const lastVisit = sorted[sorted.length - 1].timestamp;
  const totalDuration = lastVisit.getTime() - firstVisit.getTime();

  return {
    h3Index,
    count: locations.length,
    totalDuration,
    avgDuration: totalDuration / locations.length,
    firstVisit,
    lastVisit,
    boundary: getHexagonBoundary(h3Index),
  };
}

/**
 * Get neighboring hexagons (ring around center)
 */
export function getNeighboringHexagons(
  h3Index: string,
  ringSize: number = 1
): string[] {
  return gridDisk(h3Index, ringSize);
}

/**
 * Create GeoJSON feature for hexagon visualization
 */
export function createHexagonFeature(
  stats: HexagonStats,
  intensity: number = 1
): GeoJSON.Feature {
  return {
    type: 'Feature',
    properties: {
      h3Index: stats.h3Index,
      count: stats.count,
      totalDuration: stats.totalDuration,
      avgDuration: stats.avgDuration,
      intensity,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [...stats.boundary, stats.boundary[0]], // Close the polygon
      ],
    },
  };
}

/**
 * Generate heatmap data from locations
 */
export function generateHeatmapData(
  locations: LocationPoint[],
  resolution: number
): GeoJSON.FeatureCollection {
  const hexMap = aggregateLocationsToH3(locations, resolution);
  const features: GeoJSON.Feature[] = [];

  // Find max count for normalization
  let maxCount = 0;
  hexMap.forEach((locs) => {
    if (locs.length > maxCount) maxCount = locs.length;
  });

  // Create features
  hexMap.forEach((locs, h3Index) => {
    const stats = calculateHexagonStats(h3Index, locs);
    const intensity = stats.count / maxCount; // Normalize 0-1
    features.push(createHexagonFeature(stats, intensity));
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Filter hexagons by time range
 */
export function filterHexagonsByTimeRange(
  hexMap: Map<string, LocationPoint[]>,
  startDate: Date,
  endDate: Date
): Map<string, LocationPoint[]> {
  const filtered = new Map<string, LocationPoint[]>();

  hexMap.forEach((locations, h3Index) => {
    const filteredLocs = locations.filter(
      (loc) =>
        loc.timestamp >= startDate && loc.timestamp <= endDate
    );

    if (filteredLocs.length > 0) {
      filtered.set(h3Index, filteredLocs);
    }
  });

  return filtered;
}

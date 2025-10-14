/**
 * Track Renderer
 * 
 * Renders location tracks on Mapbox with time-based colors
 */

import type mapboxgl from 'mapbox-gl';
import type { LocationPoint, TrackSegment } from './types';
import { TIME_COLORS, TIME_CONSTANTS } from './types';

/**
 * Get color for timestamp based on age
 */
export function getColorForTime(timestamp: number): string {
  const now = Date.now();
  const age = now - timestamp;

  if (age < TIME_CONSTANTS.HOUR) return TIME_COLORS.RECENT;
  if (age < TIME_CONSTANTS.DAY) return TIME_COLORS.TODAY;
  if (age < TIME_CONSTANTS.WEEK) return TIME_COLORS.THIS_WEEK;
  if (age < TIME_CONSTANTS.MONTH) return TIME_COLORS.THIS_MONTH;
  return TIME_COLORS.OLDER;
}

/**
 * Convert points to GeoJSON LineString
 */
export function pointsToGeoJSON(points: LocationPoint[]) {
  // Group points by color (time period)
  const segments: { [color: string]: LocationPoint[] } = {};

  points.forEach((point) => {
    const color = getColorForTime(point.timestamp);
    if (!segments[color]) {
      segments[color] = [];
    }
    segments[color].push(point);
  });

  // Create GeoJSON features for each segment
  const features = Object.entries(segments).map(([color, segmentPoints]) => ({
    type: 'Feature' as const,
    properties: {
      color,
      pointCount: segmentPoints.length,
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: segmentPoints.map((p) => [p.longitude, p.latitude]),
    },
  }));

  return {
    type: 'FeatureCollection' as const,
    features,
  };
}

/**
 * Simplify track using Ramer-Douglas-Peucker algorithm
 */
export function simplifyTrack(
  points: LocationPoint[],
  tolerance: number
): LocationPoint[] {
  if (points.length < 3) return points;

  const coords = points.map((p) => [p.longitude, p.latitude]);
  const simplified = rdpSimplify(coords, tolerance);

  // Map back to LocationPoints
  return simplified.map((coord) => {
    return points.find(
      (p) => p.longitude === coord[0] && p.latitude === coord[1]
    )!;
  });
}

/**
 * Ramer-Douglas-Peucker simplification algorithm
 */
function rdpSimplify(
  points: number[][],
  tolerance: number
): number[][] {
  if (points.length < 3) return points;

  const first = points[0];
  const last = points[points.length - 1];

  let maxDistance = 0;
  let maxIndex = 0;

  // Find point with maximum distance from line
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const left = rdpSimplify(points.slice(0, maxIndex + 1), tolerance);
    const right = rdpSimplify(points.slice(maxIndex), tolerance);

    return [...left.slice(0, -1), ...right];
  }

  // Otherwise, return just the endpoints
  return [first, last];
}

/**
 * Calculate perpendicular distance from point to line
 */
function perpendicularDistance(
  point: number[],
  lineStart: number[],
  lineEnd: number[]
): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Add track layers to map
 */
export function addTrackLayers(map: mapboxgl.Map): void {
  // Add source for tracks
  if (!map.getSource('location-tracks')) {
    map.addSource('location-tracks', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  // Add track line layer
  if (!map.getLayer('location-tracks-line')) {
    map.addLayer({
      id: 'location-tracks-line',
      type: 'line',
      source: 'location-tracks',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 3,
        'line-opacity': 0.8,
      },
    });
  }
}

/**
 * Update track data on map
 */
export function updateTracks(map: mapboxgl.Map, points: LocationPoint[]): void {
  const source = map.getSource('location-tracks') as mapboxgl.GeoJSONSource;
  
  if (source) {
    const geojson = pointsToGeoJSON(points);
    source.setData(geojson);
  }
}

/**
 * Add current position marker
 */
export function addCurrentPositionMarker(map: mapboxgl.Map): void {
  // Add source for current position
  if (!map.getSource('current-position')) {
    map.addSource('current-position', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  // Add accuracy circle
  if (!map.getLayer('current-position-accuracy')) {
    map.addLayer({
      id: 'current-position-accuracy',
      type: 'circle',
      source: 'current-position',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 0,
          20, ['get', 'accuracy']
        ],
        'circle-color': 'rgba(127, 227, 255, 0.2)',
        'circle-stroke-width': 1,
        'circle-stroke-color': '#7fe3ff',
      },
    });
  }

  // Add position marker
  if (!map.getLayer('current-position-marker')) {
    map.addLayer({
      id: 'current-position-marker',
      type: 'circle',
      source: 'current-position',
      paint: {
        'circle-radius': 8,
        'circle-color': '#7fe3ff',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });
  }
}

/**
 * Update current position marker
 */
export function updateCurrentPosition(
  map: mapboxgl.Map,
  position: LocationPoint
): void {
  const source = map.getSource('current-position') as mapboxgl.GeoJSONSource;

  if (source) {
    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            accuracy: position.accuracy,
          },
          geometry: {
            type: 'Point',
            coordinates: [position.longitude, position.latitude],
          },
        },
      ],
    });
  }
}

/**
 * Clear all tracks from map
 */
export function clearTracks(map: mapboxgl.Map): void {
  const source = map.getSource('location-tracks') as mapboxgl.GeoJSONSource;
  
  if (source) {
    source.setData({
      type: 'FeatureCollection',
      features: [],
    });
  }
}

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분`;
  }
  if (minutes > 0) {
    return `${minutes}분 ${seconds % 60}초`;
  }
  return `${seconds}초`;
}

/**
 * Format speed for display
 */
function formatSpeed(metersPerSecond: number | null): string {
  if (metersPerSecond === null) return '알 수 없음';
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

/**
 * Format time for display
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Add track interaction handlers
 */
export function addTrackInteraction(
  map: mapboxgl.Map,
  points: LocationPoint[]
): void {
  // Create popup
  const popup = new (window as any).mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  // Mouse enter handler
  map.on('mouseenter', 'location-tracks-line', (e) => {
    map.getCanvas().style.cursor = 'pointer';

    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const coordinates = e.lngLat;

    // Find nearest point
    const nearestPoint = findNearestPoint(
      points,
      coordinates.lng,
      coordinates.lat
    );

    if (!nearestPoint) return;

    // Create popup content
    const html = `
      <div style="padding: 8px; min-width: 150px;">
        <div style="font-weight: 600; margin-bottom: 4px;">
          ${formatTime(nearestPoint.timestamp)}
        </div>
        <div style="font-size: 12px; color: #666;">
          <div>속도: ${formatSpeed(nearestPoint.speed)}</div>
          <div>정확도: ${nearestPoint.accuracy.toFixed(0)}m</div>
          ${nearestPoint.altitude !== null ? `<div>고도: ${nearestPoint.altitude.toFixed(0)}m</div>` : ''}
        </div>
      </div>
    `;

    popup.setLngLat(coordinates).setHTML(html).addTo(map);
  });

  // Mouse leave handler
  map.on('mouseleave', 'location-tracks-line', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  // Click handler
  map.on('click', 'location-tracks-line', (e) => {
    if (!e.features || e.features.length === 0) return;

    const coordinates = e.lngLat;

    // Find nearest point
    const nearestPoint = findNearestPoint(
      points,
      coordinates.lng,
      coordinates.lat
    );

    if (!nearestPoint) return;

    // Fly to point
    map.flyTo({
      center: [nearestPoint.longitude, nearestPoint.latitude],
      zoom: 16,
      duration: 1000,
    });
  });
}

/**
 * Find nearest point to coordinates
 */
function findNearestPoint(
  points: LocationPoint[],
  lng: number,
  lat: number
): LocationPoint | null {
  if (points.length === 0) return null;

  let nearest = points[0];
  let minDistance = calculatePointDistance(lng, lat, nearest.longitude, nearest.latitude);

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const distance = calculatePointDistance(lng, lat, point.longitude, point.latitude);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = point;
    }
  }

  return nearest;
}

/**
 * Calculate distance between two coordinates
 */
function calculatePointDistance(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
): number {
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Remove track interaction handlers
 */
export function removeTrackInteraction(map: mapboxgl.Map): void {
  map.off('mouseenter', 'location-tracks-line');
  map.off('mouseleave', 'location-tracks-line');
  map.off('click', 'location-tracks-line');
}

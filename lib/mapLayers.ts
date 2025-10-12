/**
 * Map layer utilities for Mapbox GL JS
 */

import type mapboxgl from 'mapbox-gl';
import type { LocationPoint, Place } from '@/types';
import { generateHeatmapData, getH3ResolutionForZoom } from './h3Utils';

/**
 * Add heat map layer to show cumulative time spent
 */
export function addHeatMapLayer(
  map: mapboxgl.Map,
  locations: LocationPoint[]
): void {
  const zoom = map.getZoom();
  const resolution = getH3ResolutionForZoom(zoom);
  const heatmapData = generateHeatmapData(locations, resolution);

  if (!map.getSource('heatmap-source')) {
    map.addSource('heatmap-source', {
      type: 'geojson',
      data: heatmapData,
    });
  }

  if (!map.getLayer('heatmap-layer')) {
    map.addLayer({
      id: 'heatmap-layer',
      type: 'fill',
      source: 'heatmap-source',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'intensity'],
          0,
          'rgba(127, 227, 255, 0.1)',
          0.5,
          'rgba(138, 245, 194, 0.3)',
          1,
          'rgba(255, 209, 102, 0.5)',
        ],
        'fill-opacity': 0.7,
      },
    });
  }
}

/**
 * Add track polyline layer with time-based coloring
 */
export function addTrackLayer(
  map: mapboxgl.Map,
  locations: LocationPoint[]
): void {
  // Create GeoJSON LineString from locations
  const coordinates = locations
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map((loc) => [loc.longitude, loc.latitude]);

  const trackData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    ],
  };

  if (!map.getSource('track-source')) {
    map.addSource('track-source', {
      type: 'geojson',
      data: trackData,
    });
  }

  if (!map.getLayer('track-layer')) {
    map.addLayer({
      id: 'track-layer',
      type: 'line',
      source: 'track-source',
      paint: {
        'line-color': 'var(--palette-1)',
        'line-width': 2,
        'line-opacity': 0.8,
      },
    });
  }
}

/**
 * Add representative places as circles
 */
export function addPlacesLayer(map: mapboxgl.Map, places: Place[]): void {
  const placesData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: places.map((place) => ({
      type: 'Feature',
      properties: {
        id: place.id,
        name: place.name,
        category: place.category,
        visitCount: place.visitCount,
        totalDuration: place.totalDuration,
        isFavorite: place.isFavorite,
      },
      geometry: {
        type: 'Point',
        coordinates: [place.longitude, place.latitude],
      },
    })),
  };

  if (!map.getSource('places-source')) {
    map.addSource('places-source', {
      type: 'geojson',
      data: placesData,
    });
  }

  // Outer ring (sized by duration)
  if (!map.getLayer('places-ring-layer')) {
    map.addLayer({
      id: 'places-ring-layer',
      type: 'circle',
      source: 'places-source',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'totalDuration'],
          0,
          10,
          3600000,
          20, // 1 hour
          86400000,
          40, // 1 day
        ],
        'circle-color': 'var(--palette-2)',
        'circle-opacity': 0.2,
        'circle-stroke-width': 2,
        'circle-stroke-color': 'var(--palette-2)',
        'circle-stroke-opacity': 0.6,
      },
    });
  }

  // Inner circle
  if (!map.getLayer('places-circle-layer')) {
    map.addLayer({
      id: 'places-circle-layer',
      type: 'circle',
      source: 'places-source',
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'match',
          ['get', 'category'],
          'home',
          'var(--palette-0)',
          'work',
          'var(--palette-3)',
          'frequent',
          'var(--palette-1)',
          'var(--palette-4)',
        ],
        'circle-opacity': 0.9,
      },
    });
  }

  // Labels
  if (!map.getLayer('places-label-layer')) {
    map.addLayer({
      id: 'places-label-layer',
      type: 'symbol',
      source: 'places-source',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': 'var(--color-text)',
        'text-halo-color': 'var(--color-bg)',
        'text-halo-width': 2,
      },
    });
  }
}

/**
 * Add running routes layer
 */
export function addRunningLayer(
  map: mapboxgl.Map,
  routes: { id: string; coordinates: [number, number][] }[]
): void {
  const runData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: routes.map((route) => ({
      type: 'Feature',
      properties: { id: route.id },
      geometry: {
        type: 'LineString',
        coordinates: route.coordinates,
      },
    })),
  };

  if (!map.getSource('runs-source')) {
    map.addSource('runs-source', {
      type: 'geojson',
      data: runData,
    });
  }

  if (!map.getLayer('runs-layer')) {
    map.addLayer({
      id: 'runs-layer',
      type: 'line',
      source: 'runs-source',
      paint: {
        'line-color': 'var(--color-ok)',
        'line-width': 3,
        'line-opacity': 0.8,
      },
    });
  }
}

/**
 * Add resonance/glow layer for emotional significance
 */
export function addResonanceLayer(
  map: mapboxgl.Map,
  locations: { lat: number; lng: number; intensity: number }[]
): void {
  const resonanceData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: locations.map((loc) => ({
      type: 'Feature',
      properties: { intensity: loc.intensity },
      geometry: {
        type: 'Point',
        coordinates: [loc.lng, loc.lat],
      },
    })),
  };

  if (!map.getSource('resonance-source')) {
    map.addSource('resonance-source', {
      type: 'geojson',
      data: resonanceData,
    });
  }

  if (!map.getLayer('resonance-layer')) {
    map.addLayer({
      id: 'resonance-layer',
      type: 'circle',
      source: 'resonance-source',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'intensity'],
          0,
          20,
          1,
          50,
        ],
        'circle-color': 'var(--palette-3)',
        'circle-opacity': 0,
        'circle-blur': 1,
        'circle-stroke-width': 0,
      },
    });
  }
}

/**
 * Update layer visibility
 */
export function setLayerVisibility(
  map: mapboxgl.Map,
  layerId: string,
  visible: boolean
): void {
  const visibility = visible ? 'visible' : 'none';

  const layerMap: Record<string, string[]> = {
    track: ['track-layer'],
    heat: ['heatmap-layer'],
    rings: ['places-ring-layer', 'places-circle-layer', 'places-label-layer'],
    resonance: ['resonance-layer'],
    runs: ['runs-layer'],
  };

  const layers = layerMap[layerId] || [];
  layers.forEach((layer) => {
    if (map.getLayer(layer)) {
      map.setLayoutProperty(layer, 'visibility', visibility);
    }
  });
}

/**
 * Update layer opacity
 */
export function setLayerOpacity(
  map: mapboxgl.Map,
  layerId: string,
  opacity: number
): void {
  const layerMap: Record<string, { layer: string; property: string }[]> = {
    track: [{ layer: 'track-layer', property: 'line-opacity' }],
    heat: [{ layer: 'heatmap-layer', property: 'fill-opacity' }],
    rings: [
      { layer: 'places-ring-layer', property: 'circle-opacity' },
      { layer: 'places-circle-layer', property: 'circle-opacity' },
    ],
    resonance: [{ layer: 'resonance-layer', property: 'circle-opacity' }],
    runs: [{ layer: 'runs-layer', property: 'line-opacity' }],
  };

  const layers = layerMap[layerId] || [];
  layers.forEach(({ layer, property }) => {
    if (map.getLayer(layer)) {
      map.setPaintProperty(layer, property, opacity);
    }
  });
}

/**
 * Remove all custom layers
 */
export function removeAllLayers(map: mapboxgl.Map): void {
  const layers = [
    'track-layer',
    'heatmap-layer',
    'places-ring-layer',
    'places-circle-layer',
    'places-label-layer',
    'runs-layer',
    'resonance-layer',
  ];

  layers.forEach((layer) => {
    if (map.getLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  const sources = [
    'track-source',
    'heatmap-source',
    'places-source',
    'runs-source',
    'resonance-source',
  ];

  sources.forEach((source) => {
    if (map.getSource(source)) {
      map.removeSource(source);
    }
  });
}

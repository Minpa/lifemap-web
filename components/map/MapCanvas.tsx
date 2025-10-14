'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore } from '@/lib/stores/mapStore';
import { useLocationStore } from '@/lib/stores/locationStore';
import { getAllPoints } from '@/lib/db/locationDB';
import {
  addTrackLayers,
  updateTracks,
  addCurrentPositionMarker,
  updateCurrentPosition,
  addTrackInteraction,
} from '@/lib/location/trackRenderer';
import styles from './MapCanvas.module.css';

interface MapCanvasProps {
  onLocationClick?: (location: { lat: number; lng: number }) => void;
}

export function MapCanvas({ onLocationClick }: MapCanvasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { center, zoom, setCenter, setZoom } = useMapStore();
  const { currentPosition } = useLocationStore();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize Mapbox
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    // Create map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [center[1], center[0]], // Mapbox uses [lng, lat]
      zoom: zoom,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Map loaded event
    map.current.on('load', () => {
      setIsLoaded(true);
      
      // Add location tracking layers
      if (map.current) {
        addTrackLayers(map.current);
        addCurrentPositionMarker(map.current);
        
        // Load existing tracks
        loadTracks();
      }
    });

    // Update store on map move (user interaction only)
    let isUserInteraction = false;
    map.current.on('movestart', (e) => {
      // Only track user interactions, not programmatic moves
      isUserInteraction = e.originalEvent !== undefined;
    });
    
    map.current.on('moveend', () => {
      if (!map.current || !isUserInteraction) return;
      const center = map.current.getCenter();
      setCenter([center.lat, center.lng]);
      isUserInteraction = false;
    });

    // Update store on zoom (user interaction only)
    let isUserZoom = false;
    map.current.on('zoomstart', (e) => {
      // Only track user interactions, not programmatic zooms
      isUserZoom = e.originalEvent !== undefined;
    });
    
    map.current.on('zoomend', () => {
      if (!map.current || !isUserZoom) return;
      setZoom(map.current.getZoom());
      isUserZoom = false;
    });

    // Click handler
    map.current.on('click', (e) => {
      if (onLocationClick) {
        onLocationClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!map.current) return;

      const panAmount = 50;
      const center = map.current.getCenter();

      switch (e.key) {
        case 'ArrowUp':
          map.current.panTo([center.lng, center.lat + 0.01]);
          e.preventDefault();
          break;
        case 'ArrowDown':
          map.current.panTo([center.lng, center.lat - 0.01]);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          map.current.panTo([center.lng - 0.01, center.lat]);
          e.preventDefault();
          break;
        case 'ArrowRight':
          map.current.panTo([center.lng + 0.01, center.lat]);
          e.preventDefault();
          break;
        case '+':
        case '=':
          map.current.zoomIn();
          e.preventDefault();
          break;
        case '-':
        case '_':
          map.current.zoomOut();
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Load tracks from IndexedDB
  const loadTracks = async () => {
    if (!map.current) return;
    
    try {
      const points = await getAllPoints();
      updateTracks(map.current, points);
      
      // Add interaction
      if (points.length > 0) {
        addTrackInteraction(map.current, points);
      }
    } catch (error) {
      console.error('Failed to load tracks:', error);
    }
  };

  // Update current position marker
  useEffect(() => {
    if (!map.current || !isLoaded || !currentPosition) return;
    
    updateCurrentPosition(map.current, currentPosition);
    
    // Reload tracks to include new point
    loadTracks();
  }, [currentPosition, isLoaded]);

  // Update map center when store changes
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.setCenter([center[1], center[0]]);
    }
  }, [center, isLoaded]);

  // Update map zoom when store changes
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.setZoom(zoom);
    }
  }, [zoom, isLoaded]);

  return (
    <div className={styles.container}>
      <div
        ref={mapContainer}
        className={styles.map}
        role="application"
        aria-label="LifeMap 지도"
        tabIndex={0}
      />
      <div id="map-instructions" className="sr-only">
        화살표 키로 지도를 이동하고, +/- 키로 확대/축소할 수 있습니다. Tab 키로
        지도 마커를 탐색할 수 있습니다.
      </div>
    </div>
  );
}

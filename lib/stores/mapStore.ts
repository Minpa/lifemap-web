/**
 * Map state management with Zustand
 */

import { create } from 'zustand';
import type { LayerConfig, TimeRange } from '@/types';

interface MapState {
  center: [number, number];
  zoom: number;
  layers: LayerConfig[];
  timeRange: TimeRange | null;
  selectedLocationId: string | null;

  // Actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  toggleLayer: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setTimeRange: (range: TimeRange | null) => void;
  selectLocation: (id: string | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [37.5665, 126.978], // Seoul default
  zoom: 12,
  layers: [
    { id: 'track', enabled: true, opacity: 1 },
    { id: 'heat', enabled: true, opacity: 0.7 },
    { id: 'rings', enabled: false, opacity: 0.8 },
    { id: 'resonance', enabled: false, opacity: 0.6 },
    { id: 'runs', enabled: false, opacity: 1 },
  ],
  timeRange: null,
  selectedLocationId: null,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),

  toggleLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
      ),
    })),

  setLayerOpacity: (layerId, opacity) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, opacity } : layer
      ),
    })),

  setTimeRange: (range) => set({ timeRange: range }),
  selectLocation: (id) => set({ selectedLocationId: id }),
}));

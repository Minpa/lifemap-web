/**
 * Location Store
 * 
 * Zustand store for location tracking state
 */

import { create } from 'zustand';
import type { LocationPoint, TrackingStats, SyncStatus } from '../location/types';
import { locationService } from '../location/service';
import { getPointsByDate, getUnsyncedPoints } from '../db/locationDB';
import { locationSyncService } from '../location/syncService';

interface LocationState {
  // State
  isTracking: boolean;
  currentPosition: LocationPoint | null;
  trackingError: string | null;
  permissionStatus: PermissionState;
  todayStats: TrackingStats;
  syncStatus: SyncStatus;
  
  // Actions
  startTracking: (userId?: string) => Promise<void>;
  stopTracking: () => void;
  updatePosition: (position: LocationPoint) => void;
  setPermissionStatus: (status: PermissionState) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshTodayStats: () => Promise<void>;
  refreshSyncStatus: () => Promise<void>;
  syncNow: (userId: string) => Promise<void>;
  enableAutoSync: (userId: string) => void;
  disableAutoSync: () => void;
}

const initialStats: TrackingStats = {
  pointsCount: 0,
  distance: 0,
  duration: 0,
  startTime: 0,
};

const initialSyncStatus: SyncStatus = {
  lastSyncTime: null,
  unsyncedCount: 0,
  isSyncing: false,
  autoSyncEnabled: false,
};

export const useLocationStore = create<LocationState>((set, get) => ({
  // Initial state
  isTracking: false,
  currentPosition: null,
  trackingError: null,
  permissionStatus: 'prompt',
  todayStats: initialStats,
  syncStatus: initialSyncStatus,

  /**
   * Start location tracking
   */
  startTracking: async (userId?: string) => {
    try {
      set({ trackingError: null });

      // Start location service
      await locationService.startTracking(undefined, userId);

      // Listen for position updates
      locationService.onPosition((position) => {
        get().updatePosition(position);
      });

      // Listen for errors
      locationService.onError((error) => {
        set({ trackingError: error });
      });

      set({ isTracking: true });

      // Refresh today's stats
      await get().refreshTodayStats();

      // Enable auto-sync if user ID provided
      if (userId) {
        get().enableAutoSync(userId);
      }
    } catch (error: any) {
      set({
        trackingError: error.message || '위치 추적을 시작할 수 없습니다.',
        isTracking: false,
      });
    }
  },

  /**
   * Stop location tracking
   */
  stopTracking: () => {
    locationService.stopTracking();
    get().disableAutoSync();
    set({ isTracking: false });
  },

  /**
   * Update current position
   */
  updatePosition: (position: LocationPoint) => {
    set({ currentPosition: position });

    // Refresh stats
    get().refreshTodayStats();
  },

  /**
   * Set permission status
   */
  setPermissionStatus: (status: PermissionState) => {
    set({ permissionStatus: status });
  },

  /**
   * Set error
   */
  setError: (error: string | null) => {
    set({ trackingError: error });
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ trackingError: null });
  },

  /**
   * Refresh today's statistics
   */
  refreshTodayStats: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const points = await getPointsByDate(today);

      if (points.length === 0) {
        set({ todayStats: initialStats });
        return;
      }

      // Calculate distance with GPS jump filtering
      let totalDistance = 0;
      for (let i = 1; i < sortedPoints.length; i++) {
        const prev = sortedPoints[i - 1];
        const curr = sortedPoints[i];
        
        // Skip if accuracy is too low (> 100m)
        if (curr.accuracy > 100 || prev.accuracy > 100) {
          continue;
        }
        
        const distance = calculateDistance(
          prev.latitude,
          prev.longitude,
          curr.latitude,
          curr.longitude
        );
        
        // Calculate time difference in seconds
        const timeDiff = (curr.timestamp - prev.timestamp) / 1000;
        
        // Skip if time difference is too small (< 1 second)
        if (timeDiff < 1) {
          continue;
        }
        
        // Calculate speed in m/s
        const speed = distance / timeDiff;
        
        // Skip if speed is unrealistic (> 55 m/s = 198 km/h)
        // This filters out GPS jumps
        if (speed > 55) {
          console.warn(`Skipping GPS jump: ${distance.toFixed(0)}m in ${timeDiff.toFixed(0)}s (${(speed * 3.6).toFixed(0)} km/h)`);
          continue;
        }
        
        totalDistance += distance;
      }

      // Calculate duration
      const sortedPoints = [...points].sort((a, b) => a.timestamp - b.timestamp);
      const startTime = sortedPoints[0].timestamp;
      const endTime = sortedPoints[sortedPoints.length - 1].timestamp;
      const duration = Math.max(0, endTime - startTime);

      set({
        todayStats: {
          pointsCount: points.length,
          distance: totalDistance,
          duration,
          startTime,
        },
      });
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  },

  /**
   * Refresh sync status
   */
  refreshSyncStatus: async () => {
    try {
      const unsyncedPoints = await getUnsyncedPoints();
      const isSyncing = locationSyncService.getIsSyncing();

      set((state) => ({
        syncStatus: {
          ...state.syncStatus,
          unsyncedCount: unsyncedPoints.length,
          isSyncing,
        },
      }));
    } catch (error) {
      console.error('Failed to refresh sync status:', error);
    }
  },

  /**
   * Sync now
   */
  syncNow: async (userId: string) => {
    try {
      set((state) => ({
        syncStatus: {
          ...state.syncStatus,
          isSyncing: true,
        },
      }));

      const result = await locationSyncService.syncNow();

      if (result) {
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            lastSyncTime: new Date(),
            isSyncing: false,
          },
        }));

        // Refresh sync status
        await get().refreshSyncStatus();
      }
    } catch (error) {
      console.error('Failed to sync:', error);
      set((state) => ({
        syncStatus: {
          ...state.syncStatus,
          isSyncing: false,
        },
      }));
    }
  },

  /**
   * Enable auto-sync
   */
  enableAutoSync: (userId: string) => {
    locationSyncService.start(userId, 30000); // Sync every 30 seconds

    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        autoSyncEnabled: true,
      },
    }));

    // Refresh sync status periodically
    const refreshInterval = setInterval(() => {
      get().refreshSyncStatus();
    }, 5000);

    // Store interval for cleanup
    (window as any).__syncRefreshInterval = refreshInterval;
  },

  /**
   * Disable auto-sync
   */
  disableAutoSync: () => {
    locationSyncService.stop();

    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        autoSyncEnabled: false,
      },
    }));

    // Clear refresh interval
    const refreshInterval = (window as any).__syncRefreshInterval;
    if (refreshInterval) {
      clearInterval(refreshInterval);
      delete (window as any).__syncRefreshInterval;
    }
  },
}));

/**
 * Calculate distance between two points (Haversine)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
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

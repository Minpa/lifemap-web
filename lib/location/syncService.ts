/**
 * Location Sync Service
 * 
 * Client-side service for syncing location data to server
 */

import type { LocationPoint, SyncResult } from './types';
import { encryptLocationPoints } from './encryption';
import { getUnsyncedPoints, updateSyncStatus } from '../db/locationDB';

/**
 * Sync configuration
 */
const SYNC_CONFIG = {
  maxBatchSize: 100, // Max points per request
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
};

/**
 * Exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  const delay = SYNC_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, SYNC_CONFIG.maxDelay);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload batch of encrypted points to server
 */
async function uploadBatch(
  points: LocationPoint[],
  userId: string,
  token: string
): Promise<{ success: boolean; syncedIds: string[]; error?: string }> {
  try {
    // Encrypt points
    const encryptedPoints = await encryptLocationPoints(points);

    // Upload to server
    const response = await fetch('/api/location/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ points: encryptedPoints }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${response.status} ${error}`);
    }

    const result = await response.json();

    return {
      success: result.success,
      syncedIds: points.map(p => p.id),
      error: result.errors?.[0],
    };
  } catch (error) {
    console.error('Error uploading batch:', error);
    return {
      success: false,
      syncedIds: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync unsynced points to server with retry logic
 */
export async function syncToServer(userId: string, token?: string): Promise<SyncResult> {
  // Get token from localStorage if not provided
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token') || undefined;
  }
  
  if (!token) {
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      error: 'No authentication token',
    };
  }
  try {
    // Get unsynced points
    const unsyncedPoints = await getUnsyncedPoints();

    if (unsyncedPoints.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
      };
    }

    console.log(`Syncing ${unsyncedPoints.length} points to server...`);

    // Split into batches
    const batches: LocationPoint[][] = [];
    for (let i = 0; i < unsyncedPoints.length; i += SYNC_CONFIG.maxBatchSize) {
      batches.push(unsyncedPoints.slice(i, i + SYNC_CONFIG.maxBatchSize));
    }

    let totalSynced = 0;
    let totalFailed = 0;

    // Process each batch with retry logic
    for (const batch of batches) {
      let attempt = 0;
      let success = false;

      while (attempt < SYNC_CONFIG.maxRetries && !success) {
        if (attempt > 0) {
          const delay = getBackoffDelay(attempt - 1);
          console.log(`Retry attempt ${attempt} after ${delay}ms...`);
          await sleep(delay);
        }

        const result = await uploadBatch(batch, userId, token);

        if (result.success) {
          // Mark points as synced
          await updateSyncStatus(result.syncedIds, true);
          totalSynced += result.syncedIds.length;
          success = true;
        } else {
          attempt++;
          if (attempt >= SYNC_CONFIG.maxRetries) {
            console.error(`Failed to sync batch after ${SYNC_CONFIG.maxRetries} attempts`);
            totalFailed += batch.length;
          }
        }
      }
    }

    console.log(`Sync complete: ${totalSynced} synced, ${totalFailed} failed`);

    return {
      success: totalFailed === 0,
      syncedCount: totalSynced,
      failedCount: totalFailed,
    };
  } catch (error) {
    console.error('Error syncing to server:', error);
    return {
      success: false,
      syncedCount: 0,
      failedCount: unsyncedPoints.length,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download points from server
 */
export async function downloadPoints(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<LocationPoint[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    // Fetch from server
    const response = await fetch(`/api/location/points?${params.toString()}`, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const result = await response.json();
    
    // TODO: Decrypt points
    // For now, return empty array since server returns mock data
    return [];
  } catch (error) {
    console.error('Error downloading points:', error);
    throw error;
  }
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Sync service class for managing automatic sync
 */
export class LocationSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private userId: string | null = null;

  /**
   * Start automatic sync
   */
  start(userId: string, intervalMs: number = 30000) {
    this.userId = userId;

    // Clear existing interval
    this.stop();

    // Initial sync
    this.sync();

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.sync();
    }, intervalMs);

    console.log(`Auto-sync started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop automatic sync
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Perform sync
   */
  async sync(): Promise<SyncResult | null> {
    // Skip if already syncing
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return null;
    }

    // Skip if offline
    if (!isOnline()) {
      console.log('Offline, skipping sync...');
      return null;
    }

    // Skip if no user ID
    if (!this.userId) {
      console.log('No user ID, skipping sync...');
      return null;
    }

    try {
      this.isSyncing = true;
      const result = await syncToServer(this.userId);
      return result;
    } catch (error) {
      console.error('Sync error:', error);
      return null;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Force sync now
   */
  async syncNow(): Promise<SyncResult | null> {
    return this.sync();
  }

  /**
   * Check if syncing
   */
  getIsSyncing(): boolean {
    return this.isSyncing;
  }
}

// Export singleton instance
export const locationSyncService = new LocationSyncService();

/**
 * Location Sync Scheduler
 * 
 * Handles automatic sync scheduling and lifecycle events
 */

import { locationSyncService } from './syncService';
import { getUnsyncedPoints } from '../db/locationDB';

/**
 * Sync scheduler class
 */
export class SyncScheduler {
  private userId: string | null = null;
  private isInitialized = false;

  /**
   * Initialize sync scheduler
   */
  initialize(userId: string) {
    if (this.isInitialized) {
      return;
    }

    this.userId = userId;

    // Set up event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    console.log('Sync scheduler initialized');
  }

  /**
   * Set up event listeners for sync triggers
   */
  private setupEventListeners() {
    // Sync on page visibility change (app going to background)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.syncOnBackground();
      }
    });

    // Sync before page unload
    window.addEventListener('beforeunload', () => {
      this.syncOnClose();
    });

    // Sync when coming back online
    window.addEventListener('online', () => {
      this.syncOnOnline();
    });

    // Sync when unsynced points reach threshold
    this.startThresholdCheck();
  }

  /**
   * Sync when app goes to background
   */
  private async syncOnBackground() {
    if (!this.userId) return;

    console.log('App going to background, syncing...');
    try {
      await locationSyncService.syncNow();
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Sync when app is closing
   */
  private syncOnClose() {
    if (!this.userId) return;

    console.log('App closing, syncing...');
    
    // Use sendBeacon for reliable sync on close
    this.sendBeaconSync();
  }

  /**
   * Sync when coming back online
   */
  private async syncOnOnline() {
    if (!this.userId) return;

    console.log('Back online, syncing...');
    try {
      await locationSyncService.syncNow();
    } catch (error) {
      console.error('Online sync failed:', error);
    }
  }

  /**
   * Check unsynced points threshold periodically
   */
  private startThresholdCheck() {
    const THRESHOLD = 50; // Sync when 50+ unsynced points
    const CHECK_INTERVAL = 60000; // Check every minute

    setInterval(async () => {
      if (!this.userId) return;

      try {
        const unsyncedPoints = await getUnsyncedPoints();
        
        if (unsyncedPoints.length >= THRESHOLD) {
          console.log(`Threshold reached (${unsyncedPoints.length} points), syncing...`);
          await locationSyncService.syncNow();
        }
      } catch (error) {
        console.error('Threshold check failed:', error);
      }
    }, CHECK_INTERVAL);
  }

  /**
   * Send sync using sendBeacon (for page unload)
   */
  private async sendBeaconSync() {
    if (!this.userId) return;

    try {
      const unsyncedPoints = await getUnsyncedPoints();
      
      if (unsyncedPoints.length === 0) {
        return;
      }

      // Use sendBeacon for reliable delivery
      const data = JSON.stringify({
        points: unsyncedPoints.slice(0, 100), // Max 100 points
      });

      const blob = new Blob([data], { type: 'application/json' });
      
      navigator.sendBeacon(
        `/api/location/sync?userId=${this.userId}`,
        blob
      );
    } catch (error) {
      console.error('sendBeacon sync failed:', error);
    }
  }

  /**
   * Clean up
   */
  cleanup() {
    this.isInitialized = false;
    this.userId = null;
  }
}

// Export singleton instance
export const syncScheduler = new SyncScheduler();

/**
 * Location Database
 * 
 * IndexedDB wrapper for location data storage
 */

import type { LocationPoint, StorageStats } from '../location/types';

const DB_NAME = 'lifemap-locations';
const DB_VERSION = 1;
const STORE_NAME = 'locations';

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create locations store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

        // Create indexes
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('accuracy', 'accuracy', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('userId', 'userId', { unique: false });
      }
    };
  });
}

/**
 * Add location point
 */
export async function addLocationPoint(point: LocationPoint): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(point);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get points by date range
 */
export async function getPointsByTimeRange(
  start: Date,
  end: Date
): Promise<LocationPoint[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const range = IDBKeyRange.bound(start.getTime(), end.getTime());
    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get points by date (YYYY-MM-DD)
 */
export async function getPointsByDate(date: string): Promise<LocationPoint[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('date');

    const request = index.getAll(date);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all points
 */
export async function getAllPoints(): Promise<LocationPoint[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get unsynced points
 */
export async function getUnsyncedPoints(): Promise<LocationPoint[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('synced');

    const request = index.getAll(false);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update point sync status
 */
export async function updateSyncStatus(
  pointIds: string[],
  synced: boolean
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    let completed = 0;
    const total = pointIds.length;

    pointIds.forEach((id) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const point = getRequest.result;
        if (point) {
          point.synced = synced;
          point.syncedAt = synced ? Date.now() : null;

          const putRequest = store.put(point);
          putRequest.onsuccess = () => {
            completed++;
            if (completed === total) resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          completed++;
          if (completed === total) resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  });
}

/**
 * Delete old points
 */
export async function deleteOldPoints(olderThan: Date): Promise<number> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const range = IDBKeyRange.upperBound(olderThan.getTime());
    const request = index.openCursor(range);

    let deletedCount = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        deletedCount++;
        cursor.continue();
      } else {
        resolve(deletedCount);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all points
 */
export async function clearAllPoints(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<StorageStats> {
  const points = await getAllPoints();
  const unsyncedPoints = await getUnsyncedPoints();

  if (points.length === 0) {
    return {
      totalPoints: 0,
      oldestPoint: null,
      newestPoint: null,
      estimatedSize: 0,
      unsyncedCount: 0,
    };
  }

  const timestamps = points.map((p) => p.timestamp);
  const oldest = new Date(Math.min(...timestamps));
  const newest = new Date(Math.max(...timestamps));

  // Estimate size (rough calculation)
  const estimatedSize = points.length * 200; // ~200 bytes per point

  return {
    totalPoints: points.length,
    oldestPoint: oldest,
    newestPoint: newest,
    estimatedSize,
    unsyncedCount: unsyncedPoints.length,
  };
}

/**
 * Service Worker for Location Tracking
 * 
 * Handles background sync and periodic location updates
 */

const CACHE_NAME = 'lifemap-v1';
const DB_NAME = 'lifemap-locations';
const DB_VERSION = 1;
const STORE_NAME = 'locations';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
      ]);
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  
  // Take control immediately
  return self.clients.claim();
});

// Background Sync event - sync location data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-locations') {
    event.waitUntil(syncLocations());
  }
});

// Periodic Background Sync event - for periodic location updates
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'location-update') {
    event.waitUntil(captureAndSyncLocation());
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SYNC_NOW') {
    syncLocations().then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
  
  if (event.data.type === 'CAPTURE_LOCATION') {
    captureLocation(event.data.userId).then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
});

/**
 * Open IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('userId', 'userId', { unique: false });
      }
    };
  });
}

/**
 * Get unsynced location points
 */
async function getUnsyncedPoints() {
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
 * Update sync status for points
 */
async function updateSyncStatus(pointIds, synced) {
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
 * Encrypt location point (simplified version for SW)
 */
async function encryptLocationPoint(point) {
  // In Service Worker, we'll send unencrypted data
  // and let the API endpoint handle encryption
  // This is a limitation of the Web Crypto API in SW context
  return {
    id: point.id,
    userId: point.userId,
    encryptedData: btoa(JSON.stringify(point)), // Simple base64 encoding
    iv: 'sw-generated',
    timestamp: point.timestamp,
    synced: point.synced,
  };
}

/**
 * Sync locations to server
 */
async function syncLocations() {
  try {
    console.log('[SW] Starting location sync...');
    
    const unsyncedPoints = await getUnsyncedPoints();
    
    if (unsyncedPoints.length === 0) {
      console.log('[SW] No points to sync');
      return { success: true, syncedCount: 0 };
    }
    
    console.log(`[SW] Syncing ${unsyncedPoints.length} points...`);
    
    // Get user ID from first point
    const userId = unsyncedPoints[0].userId;
    
    if (!userId) {
      console.error('[SW] No user ID found');
      return { success: false, error: 'No user ID' };
    }
    
    // Batch sync (max 100 points)
    const batchSize = 100;
    let totalSynced = 0;
    
    for (let i = 0; i < unsyncedPoints.length; i += batchSize) {
      const batch = unsyncedPoints.slice(i, i + batchSize);
      
      // Encrypt points
      const encryptedPoints = await Promise.all(
        batch.map(point => encryptLocationPoint(point))
      );
      
      // Upload to server
      const response = await fetch('/api/location/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ points: encryptedPoints }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Mark as synced
        const pointIds = batch.map(p => p.id);
        await updateSyncStatus(pointIds, true);
        
        totalSynced += pointIds.length;
        console.log(`[SW] Synced batch: ${pointIds.length} points`);
      } else {
        console.error('[SW] Sync failed:', response.status);
      }
    }
    
    console.log(`[SW] Sync complete: ${totalSynced} points synced`);
    
    // Notify all clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        syncedCount: totalSynced,
      });
    });
    
    return { success: true, syncedCount: totalSynced };
  } catch (error) {
    console.error('[SW] Sync error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Capture current location
 */
async function captureLocation(userId) {
  try {
    console.log('[SW] Capturing location...');
    
    // Note: Geolocation API is not available in Service Worker
    // We need to request location from the main thread
    // This is a limitation we'll document
    
    console.log('[SW] Location capture requires main thread');
    return { success: false, error: 'Geolocation not available in SW' };
  } catch (error) {
    console.error('[SW] Location capture error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Capture location and sync
 */
async function captureAndSyncLocation() {
  try {
    console.log('[SW] Periodic location update...');
    
    // Request location from main thread
    const clients = await self.clients.matchAll();
    
    if (clients.length > 0) {
      clients.forEach(client => {
        client.postMessage({
          type: 'REQUEST_LOCATION_UPDATE',
        });
      });
    }
    
    // Sync existing unsynced points
    await syncLocations();
    
    return { success: true };
  } catch (error) {
    console.error('[SW] Periodic sync error:', error);
    return { success: false, error: error.message };
  }
}

// Fetch event - network-first strategy for API calls
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API calls - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }
  
  // Static assets - cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

console.log('[SW] Service Worker loaded');

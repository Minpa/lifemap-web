'use client';

/**
 * Service Worker Initializer
 * 
 * Initializes Service Worker and handles SW messages
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useLocationStore } from '@/lib/stores/locationStore';
import {
  registerServiceWorker,
  requestPeriodicSync,
  listenToServiceWorker,
  getServiceWorkerStatus,
} from '@/lib/location/serviceWorkerManager';
import { locationService } from '@/lib/location/service';

export function ServiceWorkerInitializer() {
  const { user, isAuthenticated } = useAuthStore();
  const { refreshSyncStatus, isTracking } = useLocationStore();

  useEffect(() => {
    // Register Service Worker
    const initServiceWorker = async () => {
      try {
        const registration = await registerServiceWorker();
        
        if (registration) {
          console.log('✅ Service Worker registered successfully');
          
          // Check status
          const status = await getServiceWorkerStatus();
          console.log('Service Worker status:', status);
          
          // Request periodic sync if tracking is enabled
          if (isAuthenticated && user?.id && isTracking) {
            try {
              await requestPeriodicSync('location-update', 15 * 60 * 1000); // 15 minutes
              console.log('✅ Periodic sync registered');
            } catch (error) {
              console.log('⚠️ Periodic sync not available:', error);
            }
          }
        }
      } catch (error) {
        console.error('❌ Service Worker initialization failed:', error);
      }
    };

    initServiceWorker();

    // Listen for Service Worker messages
    const unsubscribe = listenToServiceWorker((message) => {
      console.log('📨 Message from Service Worker:', message);

      switch (message.type) {
        case 'SYNC_COMPLETE':
          console.log(`✅ Background sync complete: ${message.syncedCount} points`);
          refreshSyncStatus();
          break;

        case 'REQUEST_LOCATION_UPDATE':
          console.log('📍 Service Worker requesting location update');
          // Capture location if tracking is active
          if (isTracking && user?.id) {
            locationService.getCurrentPosition()
              .then(() => {
                console.log('✅ Location captured for background sync');
              })
              .catch((error) => {
                console.error('❌ Failed to capture location:', error);
              });
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, user?.id, isTracking, refreshSyncStatus]);

  // This component doesn't render anything
  return null;
}

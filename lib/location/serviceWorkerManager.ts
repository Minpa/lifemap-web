/**
 * Service Worker Manager
 * 
 * Manages Service Worker registration and communication
 */

/**
 * Register Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration.scope);

    // Wait for SW to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      const success = await registration.unregister();
      console.log('Service Worker unregistered:', success);
      return success;
    }
    
    return false;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Request background sync
 */
export async function requestBackgroundSync(tag: string = 'sync-locations'): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if ('sync' in registration) {
      await (registration as any).sync.register(tag);
      console.log('Background sync requested:', tag);
    } else {
      console.log('Background Sync API not supported');
      // Fallback to immediate sync
      await syncNowViaSW();
    }
  } catch (error) {
    console.error('Background sync request failed:', error);
    throw error;
  }
}

/**
 * Request periodic background sync
 */
export async function requestPeriodicSync(
  tag: string = 'location-update',
  minInterval: number = 15 * 60 * 1000 // 15 minutes
): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if ('periodicSync' in registration) {
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as PermissionName,
      });

      if (status.state === 'granted') {
        await (registration as any).periodicSync.register(tag, {
          minInterval,
        });
        console.log('Periodic sync registered:', tag, minInterval);
      } else {
        console.log('Periodic sync permission not granted');
      }
    } else {
      console.log('Periodic Background Sync API not supported');
    }
  } catch (error) {
    console.error('Periodic sync request failed:', error);
    // Don't throw - this is an enhancement, not critical
  }
}

/**
 * Cancel periodic background sync
 */
export async function cancelPeriodicSync(tag: string = 'location-update'): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if ('periodicSync' in registration) {
      await (registration as any).periodicSync.unregister(tag);
      console.log('Periodic sync cancelled:', tag);
    }
  } catch (error) {
    console.error('Periodic sync cancellation failed:', error);
  }
}

/**
 * Sync now via Service Worker
 */
export async function syncNowViaSW(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { success: false, error: 'Service Worker not supported' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (!registration.active) {
      return { success: false, error: 'Service Worker not active' };
    }

    // Send message to SW
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      registration.active.postMessage(
        { type: 'SYNC_NOW' },
        [messageChannel.port2]
      );

      // Timeout after 30 seconds
      setTimeout(() => {
        resolve({ success: false, error: 'Timeout' });
      }, 30000);
    });
  } catch (error) {
    console.error('Sync via SW failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Request location capture via Service Worker
 */
export async function captureLocationViaSW(userId: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { success: false, error: 'Service Worker not supported' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (!registration.active) {
      return { success: false, error: 'Service Worker not active' };
    }

    // Send message to SW
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      registration.active.postMessage(
        { type: 'CAPTURE_LOCATION', userId },
        [messageChannel.port2]
      );

      // Timeout after 10 seconds
      setTimeout(() => {
        resolve({ success: false, error: 'Timeout' });
      }, 10000);
    });
  } catch (error) {
    console.error('Location capture via SW failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Listen for Service Worker messages
 */
export function listenToServiceWorker(
  callback: (message: any) => void
): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    callback(event.data);
  };

  navigator.serviceWorker.addEventListener('message', handler);

  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}

/**
 * Check if Service Worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Check if Background Sync is supported
 */
export function isBackgroundSyncSupported(): boolean {
  return (
    isServiceWorkerSupported() &&
    'sync' in ServiceWorkerRegistration.prototype
  );
}

/**
 * Check if Periodic Background Sync is supported
 */
export function isPeriodicSyncSupported(): boolean {
  return (
    isServiceWorkerSupported() &&
    'periodicSync' in ServiceWorkerRegistration.prototype
  );
}

/**
 * Get Service Worker status
 */
export async function getServiceWorkerStatus(): Promise<{
  registered: boolean;
  active: boolean;
  backgroundSyncSupported: boolean;
  periodicSyncSupported: boolean;
}> {
  if (!isServiceWorkerSupported()) {
    return {
      registered: false,
      active: false,
      backgroundSyncSupported: false,
      periodicSyncSupported: false,
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    return {
      registered: !!registration,
      active: !!registration?.active,
      backgroundSyncSupported: isBackgroundSyncSupported(),
      periodicSyncSupported: isPeriodicSyncSupported(),
    };
  } catch (error) {
    console.error('Failed to get SW status:', error);
    return {
      registered: false,
      active: false,
      backgroundSyncSupported: false,
      periodicSyncSupported: false,
    };
  }
}

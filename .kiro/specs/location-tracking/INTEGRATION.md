# Location Tracking - Integration Guide

## 🎯 Goal
Integrate the location tracking components into your existing map page to create a working MVP.

---

## Step 1: Update Map Page

Add the TrackingControls component to your map page:

```tsx
// app/page.tsx or wherever your map is

import { TrackingControls } from '@/components/location/TrackingControls';
import { PermissionDialog } from '@/components/location/PermissionDialog';
import { useLocationStore } from '@/lib/stores/locationStore';
import { useState, useEffect } from 'react';

export default function MapPage() {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { permissionStatus, setPermissionStatus } = useLocationStore();

  // Check permission status on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        
        result.addEventListener('change', () => {
          setPermissionStatus(result.state);
        });
      });
    }
  }, [setPermissionStatus]);

  return (
    <div className="relative w-full h-screen">
      {/* Your existing map component */}
      <Map />
      
      {/* Add tracking controls */}
      <TrackingControls />
      
      {/* Add permission dialog */}
      <PermissionDialog
        isOpen={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        onRequestPermission={() => {
          // Permission will be requested when tracking starts
        }}
        permissionStatus={permissionStatus}
      />
    </div>
  );
}
```

---

## Step 2: Integrate Track Visualization

Update your map component to show location tracks:

```tsx
// components/Map.tsx or your map component

import { useEffect, useRef } from 'react';
import { useLocationStore } from '@/lib/stores/locationStore';
import { getAllPoints } from '@/lib/db/locationDB';
import {
  addTrackLayers,
  updateTracks,
  addCurrentPositionMarker,
  updateCurrentPosition,
  addTrackInteraction,
} from '@/lib/location/trackRenderer';

export function Map() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { currentPosition } = useLocationStore();

  // Initialize map
  useEffect(() => {
    // Your existing map initialization code
    const map = new mapboxgl.Map({
      // ... your config
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add track layers
      addTrackLayers(map);
      
      // Add current position marker
      addCurrentPositionMarker(map);
      
      // Load existing tracks
      loadTracks();
    });

    return () => {
      map.remove();
    };
  }, []);

  // Load tracks from IndexedDB
  const loadTracks = async () => {
    if (!mapRef.current) return;
    
    const points = await getAllPoints();
    updateTracks(mapRef.current, points);
    
    // Add interaction
    addTrackInteraction(mapRef.current, points);
  };

  // Update current position marker
  useEffect(() => {
    if (!mapRef.current || !currentPosition) return;
    
    updateCurrentPosition(mapRef.current, currentPosition);
    
    // Reload tracks to include new point
    loadTracks();
  }, [currentPosition]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
```

---

## Step 3: Add Navigation to Settings

Add a link to the location settings page in your navigation:

```tsx
// components/Navigation.tsx or wherever your nav is

import Link from 'next/link';
import { Settings } from 'lucide-react';

export function Navigation() {
  return (
    <nav>
      {/* Your existing nav items */}
      
      <Link 
        href="/settings/location"
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
      >
        <Settings className="w-4 h-4" />
        위치 설정
      </Link>
    </nav>
  );
}
```

---

## Step 4: Initialize Sync Scheduler

Add sync scheduler initialization to your app:

```tsx
// app/layout.tsx or components/AuthProvider.tsx

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { syncScheduler } from '@/lib/location/syncScheduler';

export function AppInitializer() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Initialize sync scheduler
      syncScheduler.initialize(user.id);
    }

    return () => {
      syncScheduler.cleanup();
    };
  }, [isAuthenticated, user?.id]);

  return null;
}

// Add to your layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppInitializer />
        {children}
      </body>
    </html>
  );
}
```

---

## Step 5: Update API Authentication

Update the API endpoints to use proper authentication:

```tsx
// app/api/location/sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // or your auth method

export async function POST(request: NextRequest) {
  // Get user from session instead of header
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  
  // ... rest of your code
}
```

---

## Step 6: Test the Integration

### Test Checklist:

1. **Start Tracking**
   - [ ] Click "추적 시작" button
   - [ ] Permission dialog appears (if needed)
   - [ ] Tracking starts successfully
   - [ ] Current position marker appears on map

2. **Verify Location Capture**
   - [ ] Move around (or simulate movement)
   - [ ] Points are captured every 30 seconds
   - [ ] Statistics update (points count, distance)
   - [ ] Track appears on map with time-based colors

3. **Test Sync**
   - [ ] Open DevTools → Network tab
   - [ ] See POST requests to `/api/location/sync` every 30 seconds
   - [ ] Sync status shows "동기화 완료" when done
   - [ ] Unsynced count decreases after sync

4. **Test Map Interaction**
   - [ ] Hover over track → popup appears
   - [ ] Click on track → map zooms to that point
   - [ ] Current position marker updates in real-time

5. **Test Settings Page**
   - [ ] Navigate to `/settings/location`
   - [ ] Toggle tracking on/off
   - [ ] Toggle auto-sync on/off
   - [ ] Manual sync button works
   - [ ] Storage statistics display correctly

6. **Test Offline**
   - [ ] Disconnect from internet
   - [ ] Continue tracking
   - [ ] Points are queued locally
   - [ ] Reconnect → points sync automatically

---

## 🐛 Troubleshooting

### Issue: Permission denied
**Solution**: Check browser settings → Site settings → Location → Allow

### Issue: Tracks not appearing
**Solution**: 
1. Check IndexedDB in DevTools → Application → IndexedDB
2. Verify points are being saved
3. Check console for errors

### Issue: Sync not working
**Solution**:
1. Check Network tab for API errors
2. Verify user ID is being passed correctly
3. Check API endpoint authentication

### Issue: Map not updating
**Solution**:
1. Verify `currentPosition` is updating in store
2. Check map ref is initialized
3. Verify track layers are added to map

---

## 🎉 Success Criteria

You'll know the integration is successful when:

1. ✅ You can start/stop tracking from the UI
2. ✅ Your location appears as a pulsing marker on the map
3. ✅ Your movement creates a colored track on the map
4. ✅ Statistics update in real-time
5. ✅ Data syncs to server every 30 seconds
6. ✅ Settings page shows accurate information

---

## 📝 Next Steps After Integration

Once the MVP is working:

1. **Task 8**: Add Service Worker for background tracking
2. **Task 9**: Implement performance optimizations
3. **Task 10**: Add privacy features (zones, export)
4. **Task 11**: Improve accuracy filtering
5. **Task 12**: Add user onboarding
6. **Task 13**: Implement data restoration
7. **Task 14**: Write tests
8. **Task 15**: Deploy to production

---

## 💡 Tips

- Test on mobile device for real GPS tracking
- Use Chrome DevTools → Sensors to simulate location
- Monitor IndexedDB size to ensure cleanup works
- Check battery usage on mobile
- Test with airplane mode for offline functionality

# Location Tracking - Testing Guide

## 🎯 Overview

This guide will help you test the location tracking feature end-to-end, including the Service Worker for background sync.

---

## 📋 Prerequisites

Before testing, make sure you have:

1. ✅ Development server running (`npm run dev`)
2. ✅ HTTPS enabled (required for Service Worker and Geolocation)
   - Use `localhost` (automatically HTTPS in modern browsers)
   - Or use a tunneling service like ngrok
3. ✅ Browser with Service Worker support (Chrome, Firefox, Edge, Safari)
4. ✅ Location permissions enabled

---

## 🚀 Step 1: Add ServiceWorkerInitializer to Your App

Add the Service Worker initializer to your root layout:

```tsx
// app/layout.tsx

import { ServiceWorkerInitializer } from '@/components/ServiceWorkerInitializer';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <ServiceWorkerInitializer />
        {children}
      </body>
    </html>
  );
}
```

---

## 🧪 Step 2: Test Service Worker Registration

### 2.1 Open DevTools
1. Open your app in Chrome
2. Press `F12` to open DevTools
3. Go to **Application** tab → **Service Workers**

### 2.2 Verify Registration
You should see:
- ✅ Service Worker registered at `/sw.js`
- ✅ Status: **activated and running**
- ✅ Scope: `/`

### 2.3 Check Console
Look for these messages:
```
✅ Service Worker registered successfully
Service Worker status: { registered: true, active: true, ... }
[SW] Service Worker loaded
```

---

## 🧪 Step 3: Test Location Tracking

### 3.1 Start Tracking
1. Navigate to your map page
2. Click **"추적 시작"** (Start Tracking) button
3. Allow location permissions when prompted

### 3.2 Verify Location Capture
**In Console:**
```
Location tracking started
📍 Service Worker requesting location update
✅ Location captured for background sync
```

**In DevTools → Application → IndexedDB:**
1. Expand `lifemap-locations` database
2. Open `locations` object store
3. You should see location points being added

### 3.3 Check Map Visualization
- ✅ Current position marker appears (pulsing blue dot)
- ✅ Accuracy circle shows around marker
- ✅ Track line appears as you move
- ✅ Track color changes based on time (cyan → green → yellow)

---

## 🧪 Step 4: Test Automatic Sync

### 4.1 Monitor Network Requests
1. Open DevTools → **Network** tab
2. Filter by `sync`
3. Watch for POST requests to `/api/location/sync`

### 4.2 Verify Sync Timing
- ✅ First sync happens within 30 seconds of starting tracking
- ✅ Subsequent syncs every 30 seconds
- ✅ Batch size: max 100 points per request

### 4.3 Check Sync Status
In the TrackingControls panel:
- ✅ "동기화 완료" (Sync Complete) when synced
- ✅ "X개 대기 중" (X Pending) when unsynced
- ✅ Last sync time updates

---

## 🧪 Step 5: Test Background Sync

### 5.1 Test App Backgrounding
1. Start tracking
2. Switch to another tab or minimize browser
3. Wait 30 seconds
4. Return to app

**Expected:**
- ✅ Console shows: `[SW] Background sync triggered: sync-locations`
- ✅ Points captured while backgrounded are synced
- ✅ Sync status updates

### 5.2 Test Page Close Sync
1. Start tracking
2. Move around to capture points
3. Close the browser tab

**Expected:**
- ✅ Service Worker triggers sync before page unload
- ✅ Points are saved to server (check on next visit)

### 5.3 Test Offline → Online Sync
1. Start tracking
2. Disconnect from internet (airplane mode or DevTools → Network → Offline)
3. Move around to capture points
4. Reconnect to internet

**Expected:**
- ✅ Points queued locally while offline
- ✅ Automatic sync when back online
- ✅ Console shows: `Back online, syncing...`

---

## 🧪 Step 6: Test Periodic Background Sync

**Note:** Periodic Background Sync is only supported in Chrome/Edge and requires HTTPS.

### 6.1 Check Support
In console, run:
```javascript
'periodicSync' in ServiceWorkerRegistration.prototype
```

If `true`, periodic sync is supported.

### 6.2 Verify Registration
1. Start tracking
2. Check console for: `✅ Periodic sync registered`
3. Go to DevTools → Application → Service Workers
4. Look for periodic sync registration

### 6.3 Test Periodic Updates
- ✅ Location updates every 15 minutes (when app is closed)
- ✅ Points are synced automatically
- ✅ Works even when browser is in background

**Note:** Browser may throttle or skip periodic syncs based on:
- Battery level
- Network conditions
- User engagement with site

---

## 🧪 Step 7: Test Settings Page

### 7.1 Navigate to Settings
Go to `/settings/location`

### 7.2 Test Toggles
1. **Tracking Toggle**
   - ✅ Turn off → tracking stops
   - ✅ Turn on → tracking resumes

2. **Auto-Sync Toggle**
   - ✅ Turn off → no automatic syncs
   - ✅ Turn on → syncs resume every 30 seconds

### 7.3 Test Manual Sync
1. Click **"지금 동기화"** (Sync Now) button
2. Watch for:
   - ✅ Button shows "동기화 중..." (Syncing...)
   - ✅ Network request to `/api/location/sync`
   - ✅ Unsynced count decreases
   - ✅ Last sync time updates

### 7.4 Test Storage Stats
- ✅ Total points count is accurate
- ✅ Estimated size is reasonable
- ✅ Oldest/newest point dates are correct

### 7.5 Test Data Deletion
1. Click **"모든 데이터 삭제"** (Delete All Data)
2. Confirm deletion
3. Verify:
   - ✅ IndexedDB is cleared
   - ✅ Storage stats reset to 0
   - ✅ Map tracks disappear

---

## 🧪 Step 8: Test Track Interaction

### 8.1 Hover Over Track
- ✅ Cursor changes to pointer
- ✅ Popup appears with:
  - Time
  - Speed
  - Accuracy
  - Altitude (if available)

### 8.2 Click on Track
- ✅ Map zooms to that point
- ✅ Smooth animation (1 second duration)

### 8.3 Test Time-Based Colors
Create tracks at different times and verify colors:
- ✅ Recent (< 1 hour): Cyan (#7fe3ff)
- ✅ Today (< 24 hours): Green (#8af5c2)
- ✅ This week (< 7 days): Yellow (#ffd166)
- ✅ This month (< 30 days): Orange (#ff7aa2)
- ✅ Older (> 30 days): Purple (#9d8cff)

---

## 🧪 Step 9: Test Permission Handling

### 9.1 Test Permission Request
1. Clear site data (DevTools → Application → Clear storage)
2. Reload page
3. Click "추적 시작"
4. Verify:
   - ✅ Permission dialog appears
   - ✅ Explanation text is clear
   - ✅ "권한 허용" button works

### 9.2 Test Permission Denied
1. Deny location permission
2. Try to start tracking
3. Verify:
   - ✅ Error message appears
   - ✅ Instructions for enabling permission shown
   - ✅ Tracking doesn't start

### 9.3 Test Permission Granted
1. Allow location permission
2. Start tracking
3. Verify:
   - ✅ Tracking starts immediately
   - ✅ No error messages
   - ✅ Current position appears

---

## 🧪 Step 10: Test Performance

### 10.1 Test with Many Points
1. Let tracking run for 1+ hours
2. Accumulate 100+ points
3. Verify:
   - ✅ Map remains responsive
   - ✅ Track rendering is smooth
   - ✅ No memory leaks (check DevTools → Memory)

### 10.2 Test Sync Performance
1. Accumulate 200+ unsynced points
2. Trigger sync
3. Verify:
   - ✅ Points synced in batches of 100
   - ✅ Multiple requests if needed
   - ✅ No UI blocking

### 10.3 Test Battery Impact
On mobile device:
1. Enable tracking for 1 hour
2. Monitor battery usage
3. Expected: < 5% battery drain per hour

---

## 🐛 Common Issues & Solutions

### Issue: Service Worker not registering
**Solutions:**
- ✅ Ensure you're on HTTPS or localhost
- ✅ Check console for errors
- ✅ Clear browser cache and reload
- ✅ Check `/sw.js` is accessible

### Issue: Location permission denied
**Solutions:**
- ✅ Check browser settings → Site settings → Location
- ✅ Clear site data and try again
- ✅ Use HTTPS (required for geolocation)

### Issue: Tracks not appearing
**Solutions:**
- ✅ Check IndexedDB has points
- ✅ Verify map layers are added
- ✅ Check console for errors
- ✅ Ensure points have valid coordinates

### Issue: Sync not working
**Solutions:**
- ✅ Check network tab for API errors
- ✅ Verify user ID is set
- ✅ Check API endpoint authentication
- ✅ Ensure Service Worker is active

### Issue: Background sync not triggering
**Solutions:**
- ✅ Verify Service Worker is registered
- ✅ Check browser supports Background Sync API
- ✅ Ensure app is not in incognito mode
- ✅ Check browser battery saver settings

---

## 📊 Success Metrics

Your implementation is successful if:

1. ✅ **Service Worker**: Registered and active
2. ✅ **Location Tracking**: Captures points every 30 seconds
3. ✅ **Automatic Sync**: Syncs every 30 seconds
4. ✅ **Background Sync**: Works when app is backgrounded
5. ✅ **Offline Support**: Queues points when offline
6. ✅ **Map Visualization**: Shows tracks with time-based colors
7. ✅ **UI Controls**: All buttons and toggles work
8. ✅ **Settings**: Data management works correctly
9. ✅ **Performance**: No lag with 100+ points
10. ✅ **Battery**: < 5% drain per hour on mobile

---

## 🎉 Next Steps After Testing

Once all tests pass:

1. **Task 9**: Performance optimizations (track simplification, lazy loading)
2. **Task 10**: Privacy features (zones, export, deletion)
3. **Task 11**: Accuracy filtering improvements
4. **Task 12**: User onboarding
5. **Task 13**: Data restoration on new device
6. **Task 14**: Write automated tests
7. **Task 15**: Deploy to production

---

## 💡 Testing Tips

- **Use Chrome DevTools Sensors** to simulate location changes
- **Test on real mobile device** for accurate GPS and battery testing
- **Use airplane mode** to test offline functionality
- **Monitor IndexedDB size** to ensure cleanup works
- **Check Service Worker logs** in DevTools → Application → Service Workers
- **Test in incognito mode** to verify fresh user experience
- **Test on different browsers** (Chrome, Firefox, Safari, Edge)

---

## 📝 Test Checklist

Copy this checklist and mark items as you test:

```
Service Worker
- [ ] SW registers successfully
- [ ] SW activates and runs
- [ ] SW survives page reload
- [ ] SW handles messages from main thread

Location Tracking
- [ ] Permission request works
- [ ] Tracking starts/stops correctly
- [ ] Points captured every 30 seconds
- [ ] Distance filter works (10m minimum)
- [ ] Accuracy filter works (100m threshold)

Sync
- [ ] Automatic sync every 30 seconds
- [ ] Manual sync button works
- [ ] Batch upload (100 points max)
- [ ] Retry logic on failure
- [ ] Offline queueing works
- [ ] Sync on app close
- [ ] Sync when back online

Background Sync
- [ ] Background sync API works
- [ ] Periodic sync registered (if supported)
- [ ] Syncs when app backgrounded
- [ ] Syncs when browser closed

Map Visualization
- [ ] Current position marker appears
- [ ] Accuracy circle shows
- [ ] Track line renders
- [ ] Time-based colors work
- [ ] Hover popup shows details
- [ ] Click zooms to point

UI Controls
- [ ] Start/stop button works
- [ ] Statistics update in real-time
- [ ] Sync status displays correctly
- [ ] Permission dialog works
- [ ] Settings page loads

Settings
- [ ] Tracking toggle works
- [ ] Auto-sync toggle works
- [ ] Manual sync works
- [ ] Storage stats accurate
- [ ] Delete all data works

Performance
- [ ] No lag with 100+ points
- [ ] Memory usage stable
- [ ] Battery drain acceptable
- [ ] Sync doesn't block UI

Error Handling
- [ ] Permission denied handled
- [ ] Network errors handled
- [ ] GPS unavailable handled
- [ ] Storage full handled
```

---

## 🎊 Congratulations!

If all tests pass, you have a fully functional location tracking system with:
- ✅ Real-time GPS tracking
- ✅ Client-side encryption
- ✅ Automatic server sync
- ✅ Background sync support
- ✅ Offline functionality
- ✅ Beautiful map visualization
- ✅ Full data management

Ready for production! 🚀

# Quick Test Guide - Location Tracking

## 🚀 What Was Fixed

**Issue:** TrackingControls component was not visible on the map page.

**Solution:**
1. ✅ Added `TrackingControls` component to map page
2. ✅ Added `ServiceWorkerInitializer` to root layout
3. ✅ Integrated track visualization into `MapCanvas`
4. ✅ Added current position marker display
5. ✅ Connected location store to map component

---

## 🧪 How to Test Locally

### Step 1: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Start fresh
npm run dev
```

### Step 2: Navigate to Map Page

Open your browser and go to:
```
http://localhost:3000/app/map
```

### Step 3: You Should Now See

**In the top-right corner:**
- ✅ White panel with "위치 추적" (Location Tracking) header
- ✅ "추적 시작" (Start Tracking) button
- ✅ Today's statistics (0개, 0m, 0초)
- ✅ Sync status section

**On the map:**
- ✅ Dark Mapbox map
- ✅ Navigation controls (zoom +/-)
- ✅ Layer toggle (left side)
- ✅ Legend (bottom right)

---

## 🎯 Test Location Tracking

### 1. Start Tracking

1. Click **"추적 시작"** button
2. Browser will ask for location permission
3. Click **"Allow"** or **"허용"**

**Expected Result:**
- ✅ Button changes to red "추적 중지" (Stop Tracking)
- ✅ Status shows "추적 중" (Tracking) in green
- ✅ A pulsing blue dot appears on your location
- ✅ Blue circle shows accuracy radius

### 2. Check Console

Open DevTools (F12) → Console tab

You should see:
```
✅ Service Worker registered successfully
Location tracking started
[SW] Service Worker loaded
```

### 3. Check Service Worker

DevTools → Application tab → Service Workers

You should see:
- ✅ Service Worker registered at `/sw.js`
- ✅ Status: **activated and running**

### 4. Check IndexedDB

DevTools → Application tab → IndexedDB → lifemap-locations

You should see:
- ✅ `locations` object store
- ✅ Location points being added (every 30 seconds)

### 5. Check Network

DevTools → Network tab

After 30 seconds, you should see:
- ✅ POST request to `/api/location/sync`
- ✅ Status: 200 OK
- ✅ Response: `{"success":true,"syncedCount":X,"failedCount":0}`

---

## 🗺️ Test Map Visualization

### 1. Move Around

- Walk around with your device, OR
- Use Chrome DevTools → Sensors → Location
- Set custom location and change it

**Expected Result:**
- ✅ Blue marker moves to new location
- ✅ Track line appears connecting points
- ✅ Track color is cyan (recent)
- ✅ Statistics update (points count, distance)

### 2. Hover Over Track

Move mouse over the track line

**Expected Result:**
- ✅ Cursor changes to pointer
- ✅ Popup appears showing:
  - Time
  - Speed
  - Accuracy
  - Altitude (if available)

### 3. Click on Track

Click on any part of the track

**Expected Result:**
- ✅ Map zooms to that point
- ✅ Smooth animation (1 second)

---

## 🔧 Test Settings Page

### 1. Navigate to Settings

Go to:
```
http://localhost:3000/settings/location
```

### 2. Check Settings Page

You should see:
- ✅ "위치 추적 설정" header
- ✅ Tracking toggle (on/off)
- ✅ Auto-sync toggle (on/off)
- ✅ Sync status section
- ✅ Storage statistics
- ✅ "지금 동기화" button
- ✅ "모든 데이터 삭제" button

### 3. Test Toggles

1. Turn tracking off → tracking stops
2. Turn tracking on → tracking resumes
3. Turn auto-sync off → no automatic syncs
4. Turn auto-sync on → syncs resume

### 4. Test Manual Sync

1. Click **"지금 동기화"** button
2. Button shows "동기화 중..."
3. Network tab shows POST to `/api/location/sync`
4. Button returns to "지금 동기화"
5. Last sync time updates

---

## ✅ Success Checklist

```
UI Components
- [ ] TrackingControls panel visible in top-right
- [ ] Start/stop button works
- [ ] Statistics display correctly
- [ ] Sync status shows

Service Worker
- [ ] SW registers successfully
- [ ] SW shows as "activated and running"
- [ ] Console shows SW messages

Location Tracking
- [ ] Permission request appears
- [ ] Tracking starts after permission granted
- [ ] Blue marker appears on map
- [ ] Accuracy circle shows
- [ ] Points captured every 30 seconds

Map Visualization
- [ ] Track line appears
- [ ] Track color is cyan (recent)
- [ ] Hover shows popup
- [ ] Click zooms to point
- [ ] Statistics update

Sync
- [ ] Automatic sync every 30 seconds
- [ ] Network shows POST requests
- [ ] Sync status updates
- [ ] Manual sync works

Settings Page
- [ ] Page loads correctly
- [ ] All toggles work
- [ ] Storage stats display
- [ ] Manual sync button works
```

---

## 🐛 Troubleshooting

### TrackingControls Not Visible

**Check:**
1. Are you on `/app/map` page? (not just `/`)
2. Did you restart the dev server?
3. Any console errors?

**Solution:**
```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

### Location Permission Denied

**Check:**
1. Browser settings → Site settings → Location
2. Is location enabled for localhost?

**Solution:**
- Chrome: Settings → Privacy → Site Settings → Location → Allow
- Clear site data and try again

### No Blue Marker Appears

**Check:**
1. Is tracking started? (button should be red)
2. Is permission granted?
3. Any console errors?

**Solution:**
- Check DevTools → Console for errors
- Check DevTools → Application → IndexedDB for points
- Try stopping and starting tracking again

### Tracks Not Showing

**Check:**
1. Are there points in IndexedDB?
2. Is map loaded? (check console for "Map loaded")
3. Any errors in console?

**Solution:**
- Check IndexedDB has points
- Reload page
- Check console for errors

---

## 📊 Expected Behavior

### After 1 Minute of Tracking

- ✅ 2-3 location points captured
- ✅ Blue marker on map
- ✅ Short track line (if you moved)
- ✅ 1-2 sync requests
- ✅ Statistics show: 2-3 points, X meters, ~1 minute

### After 5 Minutes of Tracking

- ✅ 10+ location points
- ✅ Visible track line on map
- ✅ 5+ sync requests
- ✅ Statistics show: 10+ points, X meters, ~5 minutes
- ✅ All points synced (unsynced count = 0)

---

## 🎉 Success!

If you see the TrackingControls panel and can start tracking, you're all set!

**Next Steps:**
1. Test on mobile device for real GPS
2. Test offline functionality
3. Test background sync
4. Deploy to Railway (already pushed)

---

## 📝 Notes

- **Local Testing**: Uses browser's Geolocation API
- **Accuracy**: Depends on your device (10-50m typical)
- **Update Frequency**: Every 30 seconds
- **Sync Frequency**: Every 30 seconds
- **Distance Filter**: Only saves if moved > 10m
- **Accuracy Filter**: Marks points > 100m as low quality

---

## 🚀 Railway Deployment

The changes have been pushed to GitHub. Railway will auto-deploy in ~5 minutes.

**Check Deployment:**
1. Go to https://railway.app
2. Open your project
3. Check "Deployments" tab
4. Wait for "Success" status
5. Test on production URL

Good luck with testing! 🎊

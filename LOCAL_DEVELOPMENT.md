# 🚀 Local Development Guide - No CloudKit Required!

You can use LifeMap locally **right now** without setting up CloudKit! Here are your options:

---

## ✅ **Option 1: Guest Mode (Easiest)**

This is the simplest way to use the app locally. No configuration needed!

### Steps:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the app**:
   - Go to `http://localhost:3000`

3. **Use Guest Mode**:
   - Click "무료로 시작하기" or "로그인"
   - Click **"게스트로 계속하기"** or **"게스트로 체험하기"**
   - You're in! 🎉

### What Works:
- ✅ **Full app access** - All features available
- ✅ **Local storage** - Data saved in browser (IndexedDB + localStorage)
- ✅ **Session persistence** - Stay logged in across page reloads
- ✅ **All features** - Map, journal, photos, palette, etc.
- ✅ **No setup** - Works immediately

### What Doesn't Work:
- ❌ **iCloud sync** - Data stays on this device only
- ❌ **Multi-device** - Can't access from other devices

---

## ✅ **Option 2: Mock CloudKit Mode**

Want to test the Apple Sign-In button without real CloudKit? Use mock mode!

### Steps:

1. **Create `.env.local` file** (already created for you):
   ```bash
   # Mock CloudKit - No real CloudKit needed
   NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=mock
   NEXT_PUBLIC_CLOUDKIT_API_TOKEN=mock
   NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT=development
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Test Apple Sign-In**:
   - Go to `http://localhost:3000/auth/login`
   - Click **"Apple로 로그인"**
   - Mock authentication happens (1 second delay)
   - You're logged in as "테스트 사용자"! 🎉

### What Works:
- ✅ **Apple Sign-In UI** - Test the button and flow
- ✅ **Mock authentication** - Simulates real CloudKit
- ✅ **Full app access** - All features available
- ✅ **Session persistence** - Works like real auth
- ✅ **Header shows user** - Displays "테스트 사용자"

### What Doesn't Work:
- ❌ **Real Apple ID** - Uses mock user instead
- ❌ **iCloud sync** - No real CloudKit connection

---

## 🎯 **Quick Start Commands**

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

---

## 🧪 **Testing Different Modes**

### Test Guest Mode:
1. Go to `http://localhost:3000/auth/login`
2. Click "게스트로 계속하기"
3. Check header shows "게스트" badge
4. Try all features

### Test Mock Apple Sign-In:
1. Ensure `.env.local` has `NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=mock`
2. Go to `http://localhost:3000/auth/login`
3. Click "Apple로 로그인"
4. Wait 1 second (simulated network delay)
5. Check header shows "테스트" (mock user name)

### Test Route Protection:
1. Logout (click logout button in header)
2. Try to access `http://localhost:3000/app/map`
3. Should redirect to `/auth/login`
4. Login (guest or mock) and try again
5. Should work!

---

## 📊 **What's Stored Locally**

### Guest Mode:
- **localStorage**: Session data, preferences
- **IndexedDB**: Journal entries, photos, map data
- **Cookies**: Auth status for middleware

### Mock CloudKit Mode:
- Same as Guest Mode
- Plus: Mock user identity

---

## 🔄 **Switching Between Modes**

### From Guest to Mock CloudKit:
1. Logout from guest mode
2. Ensure `.env.local` has `NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=mock`
3. Restart dev server: `npm run dev`
4. Login with "Apple로 로그인"

### From Mock CloudKit to Guest:
1. Logout
2. Click "게스트로 계속하기"

### Clear All Data:
```bash
# In browser console
localStorage.clear()
# Then refresh page
```

---

## 🐛 **Troubleshooting**

### "CloudKit not configured" error:
**Solution**: Create `.env.local` with mock values:
```bash
NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=mock
NEXT_PUBLIC_CLOUDKIT_API_TOKEN=mock
```

### Can't access protected routes:
**Solution**: 
1. Check you're logged in (guest or mock)
2. Check header shows auth status
3. Try logging out and back in

### Session not persisting:
**Solution**:
1. Check browser allows localStorage
2. Check no browser extensions blocking storage
3. Try incognito mode

### Mock sign-in not working:
**Solution**:
1. Check `.env.local` exists
2. Restart dev server after creating `.env.local`
3. Check browser console for errors

---

## 🎓 **Understanding the Flow**

### Guest Mode Flow:
```
1. Click "게스트로 계속하기"
   ↓
2. App creates guest user in Zustand store
   ↓
3. Guest status saved to localStorage + cookie
   ↓
4. Redirect to /app/map
   ↓
5. Full app access (local-only)
```

### Mock CloudKit Flow:
```
1. Click "Apple로 로그인"
   ↓
2. CloudKit service detects mock mode
   ↓
3. Returns mock user after 1 second
   ↓
4. User saved to Zustand store + localStorage + cookie
   ↓
5. Redirect to /app/map
   ↓
6. Full app access (simulated CloudKit)
```

---

## 🚀 **When to Use Real CloudKit**

You only need real CloudKit when you want:
- ✅ Real Apple ID authentication
- ✅ iCloud data synchronization
- ✅ Multi-device access
- ✅ Production deployment

For local development and testing, **Guest Mode or Mock Mode is perfect!**

---

## 📝 **Current Setup**

Your `.env.local` is already configured for **Mock CloudKit Mode**:

```bash
NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=mock
NEXT_PUBLIC_CLOUDKIT_API_TOKEN=mock
NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT=development
```

This means:
- ✅ Apple Sign-In button works (mock)
- ✅ Guest mode works
- ✅ No real CloudKit needed
- ✅ Ready to use right now!

---

## 🎉 **You're Ready!**

Just run:
```bash
npm run dev
```

Then choose:
- **Guest Mode**: Click "게스트로 계속하기"
- **Mock Apple Sign-In**: Click "Apple로 로그인"

Both work perfectly for local development! 🚀

---

## 📚 **Next Steps**

When you're ready for production:
1. See `CLOUDKIT_SETUP.md` for real CloudKit setup
2. Replace mock values in `.env.local` with real credentials
3. Test with real Apple ID
4. Deploy to production

But for now, **enjoy using LifeMap locally!** 🎊

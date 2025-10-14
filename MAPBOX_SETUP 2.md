# 🗺️ Mapbox Setup Guide

The map isn't showing because you need a Mapbox access token. Don't worry, it's **free** and takes 2 minutes!

---

## 🚀 Quick Setup (2 minutes)

### 1. Create Mapbox Account (Free)

Go to: **https://account.mapbox.com/auth/signup/**

- Sign up with email or GitHub
- Free tier includes 50,000 map loads/month (plenty for development!)

### 2. Get Your Access Token

After signing up:
1. You'll be redirected to your dashboard
2. Or go to: **https://account.mapbox.com/access-tokens/**
3. Copy your **Default public token**

### 3. Add Token to `.env.local`

Open `.env.local` and add your token:

```bash
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZjR4eHh4eHh4eHgifQ.xxxxxxxxxxxxxxxxxx
```

### 4. Restart Dev Server

```bash
# Press Ctrl+C to stop
# Then restart:
npm run dev
```

### 5. Refresh Browser

Go to `http://localhost:3000/app/map` and the map should appear! 🎉

---

## 🎯 What You'll See

Once the token is added:
- ✅ Interactive map with your custom style
- ✅ Layer controls (heat map, tracks, places, etc.)
- ✅ Timeline controls
- ✅ Legend
- ✅ All map features working

---

## 🆓 Mapbox Free Tier

Perfect for development and small projects:
- **50,000 map loads/month** - Free
- **Unlimited styles**
- **All map features**
- **No credit card required**

---

## 🔧 Troubleshooting

### Map still not showing?

1. **Check token is correct**:
   - Should start with `pk.`
   - No spaces or quotes around it
   - Example: `NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...`

2. **Restart dev server**:
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

3. **Check browser console**:
   - Open DevTools (F12)
   - Look for Mapbox errors
   - Should see map loading messages

4. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### "Unauthorized" error?

- Token might be invalid
- Generate a new token at https://account.mapbox.com/access-tokens/
- Make sure it's a **public token** (starts with `pk.`)

---

## 📚 Resources

- [Mapbox Account](https://account.mapbox.com/)
- [Mapbox Documentation](https://docs.mapbox.com/)
- [Mapbox Pricing](https://www.mapbox.com/pricing) (Free tier is generous!)

---

## ✅ Current Status

Your `.env.local` is ready, just needs the token:

```bash
# CloudKit Configuration (Mock Mode)
NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=mock
NEXT_PUBLIC_CLOUDKIT_API_TOKEN=mock
NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT=development

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=<-- ADD YOUR TOKEN HERE
```

---

## 🎉 After Setup

Once you add the token and restart:
1. Map will load at `http://localhost:3000/app/map`
2. You can toggle layers (heat map, tracks, places)
3. Use timeline controls to navigate years
4. See the legend for color meanings
5. Full map functionality! 🗺️

---

**Get your free token now**: https://account.mapbox.com/access-tokens/

# 🚂 Railway Deployment Guide

Deploy LifeMap to Railway for mobile testing and production use!

---

## 🚀 Quick Deploy

### Option 1: Automatic Deployment (Recommended)

I'll deploy it for you! Just follow these steps:

1. **Login to Railway** (if not already):
   ```bash
   railway login
   ```

2. **Deploy**:
   ```bash
   railway up
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables set NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=mock
   railway variables set NEXT_PUBLIC_CLOUDKIT_API_TOKEN=mock
   railway variables set NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT=production
   railway variables set NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWlucGEiLCJhIjoiY21nbmx6N3VrMGp5dzJtcTVyNGYwZXpybyJ9.LEANGX0woRXI-nY62VNMfg
   ```

4. **Get Your URL**:
   ```bash
   railway domain
   ```

---

## 📱 After Deployment

Once deployed, you'll get a URL like:
- `https://lifemap-production.up.railway.app`

You can:
- ✅ Access from any device (phone, tablet, computer)
- ✅ Share with others for testing
- ✅ Test on real mobile browsers
- ✅ Use guest mode or mock Apple Sign-In

---

## 🔧 Configuration Files Created

I've created these files for Railway:

1. **`railway.json`** - Railway configuration
2. **`nixpacks.toml`** - Build configuration
3. **`.env.local`** - Local environment variables (not deployed)

---

## 🌐 Environment Variables

Railway will need these environment variables:

```bash
# CloudKit (Mock Mode)
NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=mock
NEXT_PUBLIC_CLOUDKIT_API_TOKEN=mock
NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT=production

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWlucGEiLCJhIjoiY21nbmx6N3VrMGp5dzJtcTVyNGYwZXpybyJ9.LEANGX0woRXI-nY62VNMfg
```

---

## 📊 Deployment Process

```
1. Build Next.js app
   ↓
2. Upload to Railway
   ↓
3. Set environment variables
   ↓
4. Railway builds and deploys
   ↓
5. Get public URL
   ↓
6. Access from mobile! 📱
```

---

## 🐛 Troubleshooting

### Build Failed?

Check the Railway logs:
```bash
railway logs
```

### Environment Variables Not Set?

Set them manually in Railway dashboard:
1. Go to https://railway.app/dashboard
2. Select your project
3. Go to Variables tab
4. Add each variable

### App Not Loading?

1. Check Railway logs for errors
2. Verify environment variables are set
3. Check build completed successfully
4. Try redeploying: `railway up --detach`

---

## 🔄 Updating Deployment

To update after making changes:

```bash
# Commit your changes
git add .
git commit -m "Update app"

# Redeploy
railway up
```

Or enable automatic deployments from GitHub!

---

## 💰 Railway Pricing

- **Free Tier**: $5 credit/month (plenty for testing!)
- **Pro**: $20/month for production use
- No credit card required for free tier

---

## 📱 Mobile Testing

Once deployed, test on your phone:

1. Open the Railway URL on your phone
2. Click "게스트로 계속하기" for guest mode
3. Or click "Apple로 로그인" for mock authentication
4. Test all features on mobile!

---

## ✅ Checklist

- [ ] Railway CLI installed (`railway --version`)
- [ ] Logged in to Railway (`railway login`)
- [ ] Environment variables set
- [ ] Deployed (`railway up`)
- [ ] Got public URL (`railway domain`)
- [ ] Tested on mobile device
- [ ] Shared URL with team (optional)

---

## 🎉 You're Live!

Your LifeMap app is now accessible from anywhere! 🌍

Share the URL with your team or test it on your mobile device.

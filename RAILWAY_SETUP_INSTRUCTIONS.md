# Railway Database Setup - Step by Step

## 📋 What You Need to Do

### 1. Create Railway Database (5 minutes)

1. **Go to Railway**: https://railway.app
2. **Sign in** with your GitHub account
3. **Click "New Project"**
4. **Select "Provision PostgreSQL"**
5. **Wait** for deployment (~30 seconds)

### 2. Get Your Database URL

Once deployed:

1. **Click** on the PostgreSQL service card
2. **Go to** the "Variables" tab
3. **Find** `DATABASE_URL` or `POSTGRES_CONNECTION_STRING`
4. **Copy** the entire URL (it looks like this):
   ```
   postgresql://postgres:PASSWORD@region.railway.app:5432/railway
   ```

### 3. Update Your .env.local File

Open your `.env.local` file and add these lines at the end:

```env
# Database Configuration (Railway PostgreSQL)
DATABASE_URL="paste-your-railway-url-here"

# JWT Secret (for authentication tokens)
NEXTAUTH_SECRET="lifemap-secret-key-change-this-in-production"
```

**Important**: Replace `paste-your-railway-url-here` with the actual URL from Railway!

### 4. Run Setup Commands

After updating `.env.local`, run these commands in your terminal:

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Check if everything works
node scripts/check-db.js

# Restart your dev server
npm run dev
```

## ✅ Verification

After running the commands, you should see:

```
✅ Successfully connected to database
✅ Users table exists (0 users)
✅ LocationPoint table exists (0 points)
✨ Everything looks good! Your database is ready.
```

## 🎯 Test Your Signup

1. Go to http://localhost:3000/auth/signup
2. Click "이메일로 가입하기"
3. Fill in the form
4. Click "가입하기"
5. You should be redirected to the map! 🎉

## 🚀 Deploy to Railway (Optional)

Want to deploy your whole app to Railway?

1. In Railway, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `lifemap-web` repository
4. Railway will auto-detect Next.js
5. Add environment variables in Railway dashboard
6. Deploy!

## 💡 Tips

- **Free Tier**: Railway gives you $5 credit/month (enough for development)
- **Database Backups**: Railway automatically backs up your database
- **Monitoring**: Check the "Metrics" tab to see database usage
- **Logs**: Check the "Logs" tab if something goes wrong

## 🆘 Need Help?

If you get stuck:

1. Run `node scripts/check-db.js` to diagnose issues
2. Check Railway logs in the dashboard
3. Make sure your DATABASE_URL is correct
4. Restart your dev server after changing .env.local

## 📝 Your Current .env.local Should Look Like:

```env
# CloudKit Configuration (Mock Mode - No Real CloudKit Needed)
NEXT_PUBLIC_CLOUDKIT_CONTAINER_ID=mock
NEXT_PUBLIC_CLOUDKIT_API_TOKEN=mock
NEXT_PUBLIC_CLOUDKIT_ENVIRONMENT=development

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWlucGEiLCJhIjoiY21nbmx6N3VrMGp5dzJtcTVyNGYwZXpybyJ9.LEANGX0woRXI-nY62VNMfg

# Database Configuration (Railway PostgreSQL)
DATABASE_URL="postgresql://postgres:PASSWORD@region.railway.app:5432/railway"

# JWT Secret (for authentication tokens)
NEXTAUTH_SECRET="lifemap-secret-key-change-this-in-production"
```

---

**Ready?** Go to https://railway.app and let's get started! 🚀

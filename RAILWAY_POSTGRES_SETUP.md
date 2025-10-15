# Railway PostgreSQL Setup Guide

## 🎯 Goal
Add PostgreSQL database to your Railway project for storing user accounts and location data.

---

## 📋 Step 1: Add PostgreSQL to Railway

### 1.1 Go to Railway Dashboard
```
https://railway.app
→ Open your project (lifemap-web)
```

### 1.2 Add PostgreSQL Service
```
1. Click "New" button
2. Select "Database"
3. Choose "PostgreSQL"
4. Wait for provisioning (~30 seconds)
```

### 1.3 Get Database URL
```
1. Click on the PostgreSQL service
2. Go to "Variables" tab
3. Copy the "DATABASE_URL" value
   Format: postgresql://user:password@host:port/database
```

---

## 📋 Step 2: Add Environment Variables

### 2.1 Add to Railway (Production)
```
1. Go to your web service (not the database)
2. Click "Variables" tab
3. Click "New Variable"
4. Add these variables:

DATABASE_URL = (paste the PostgreSQL URL from step 1.3)
NEXTAUTH_SECRET = (generate random string - see below)
NEXTAUTH_URL = https://your-app.railway.app
```

### 2.2 Generate NEXTAUTH_SECRET
```bash
# Run this command to generate a secure secret:
openssl rand -base64 32

# Or use this online:
# https://generate-secret.vercel.app/32
```

### 2.3 Add to Local (.env.local)
```env
# Add these to your .env.local file:
DATABASE_URL="postgresql://user:password@localhost:5432/lifemap"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📋 Step 3: Install Dependencies

```bash
npm install @prisma/client prisma bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

---

## 📋 Step 4: Initialize Prisma

```bash
# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - Updates .env with DATABASE_URL
```

---

## 📋 Step 5: Create Database Schema

The schema will be created automatically by the implementation.

Tables:
- `users` - User accounts (email, password, etc.)
- `location_points` - Encrypted location data

---

## 📋 Step 6: Run Migrations

After I create the schema, you'll run:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate dev --name init
```

---

## 🔍 Verify Setup

### Check Database Connection
```bash
# Test connection
npx prisma db pull

# Should show: "Introspected X tables"
```

### View Database
```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Opens at http://localhost:5555
```

---

## 📊 Database Schema Preview

### users table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  auth_provider TEXT NOT NULL, -- 'email' or 'cloudkit'
  cloudkit_user_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### location_points table
```sql
CREATE TABLE location_points (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  encrypted_data TEXT NOT NULL,
  iv TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_timestamp (user_id, timestamp DESC)
);
```

---

## 🚀 Next Steps

1. ✅ Add PostgreSQL to Railway
2. ✅ Copy DATABASE_URL
3. ✅ Add environment variables
4. ✅ Install dependencies
5. ⏳ I'll create the Prisma schema
6. ⏳ I'll implement auth & database code
7. ⏳ You run migrations
8. ✅ Test it works!

---

## 💰 Cost

### Railway PostgreSQL
- **Free tier:** 512MB storage, 1GB RAM
- **Paid:** $5/month for 8GB storage, 8GB RAM

**Your usage:** Probably < 100MB for months of location data
**Recommendation:** Free tier is fine to start

---

## 🔧 Troubleshooting

### Can't connect to database
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### Prisma errors
```bash
# Regenerate client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

---

## 📝 Summary

**What you need to do:**
1. Add PostgreSQL to Railway (2 minutes)
2. Copy DATABASE_URL (1 minute)
3. Add environment variables (2 minutes)
4. Run `npm install` (1 minute)

**What I'll do:**
1. Create Prisma schema
2. Implement authentication
3. Implement database storage
4. Update API endpoints

**Total time: ~5 minutes for you, ~1 hour for me**

---

## ✅ Ready?

Once you've completed steps 1-3 above, let me know and I'll start implementing the code! 🚀

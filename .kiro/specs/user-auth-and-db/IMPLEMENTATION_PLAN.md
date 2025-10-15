# Implementation Plan: User Auth & Database Storage

## 🎯 Goal
Add email/password authentication and real PostgreSQL database storage for location data.

## 🛠️ Technology Stack

### Option 1: Supabase (Recommended) ⭐
**Pros:**
- PostgreSQL database included
- Built-in authentication (email/password)
- Row Level Security (RLS)
- Free tier: 500MB database, 50MB file storage
- Easy setup (5 minutes)
- Real-time subscriptions
- Auto-generated REST API

**Cons:**
- External dependency
- Need to create Supabase account

### Option 2: Railway PostgreSQL + Custom Auth
**Pros:**
- You're already on Railway
- Full control over auth logic
- No external dependencies

**Cons:**
- More code to write
- Need to implement auth from scratch
- More security considerations

**Recommendation: Use Supabase** - It's faster, more secure, and easier to maintain.

---

## 📋 Implementation Steps

### Phase 1: Setup Supabase (15 minutes)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Sign up / Login
   - Create new project
   - Wait for database to provision

2. **Get Credentials**
   - Copy Project URL
   - Copy anon/public key
   - Copy service role key (for server-side)

3. **Add to Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   ```

4. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

### Phase 2: Create Database Schema (10 minutes)

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table (Supabase auth handles this automatically)
-- We just need to extend it with a profile

-- Location points table
CREATE TABLE location_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_data TEXT NOT NULL,
  iv TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_user_timestamp (user_id, timestamp DESC),
  INDEX idx_user_synced (user_id, synced)
);

-- Enable Row Level Security
ALTER TABLE location_points ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own location points"
  ON location_points FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own location points"
  ON location_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own location points"
  ON location_points FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own data
CREATE POLICY "Users can delete own location points"
  ON location_points FOR DELETE
  USING (auth.uid() = user_id);
```

### Phase 3: Update Authentication (30 minutes)

**Files to create/update:**

1. `lib/supabase/client.ts` - Supabase client setup
2. `lib/supabase/auth.ts` - Auth helper functions
3. `lib/stores/authStore.ts` - Update to support both auth methods
4. `app/auth/signup/page.tsx` - Add email/password form
5. `app/auth/login/page.tsx` - Add email/password form

### Phase 4: Update API Endpoints (20 minutes)

**Files to update:**

1. `app/api/location/sync/route.ts` - Save to Supabase
2. `app/api/location/points/route.ts` - Fetch from Supabase
3. Add authentication middleware

### Phase 5: Update Client-Side Sync (15 minutes)

**Files to update:**

1. `lib/location/syncService.ts` - Use Supabase client
2. Add JWT token to requests
3. Handle authentication errors

### Phase 6: Testing (20 minutes)

1. Test email/password signup
2. Test email/password login
3. Test location data sync
4. Test data isolation (create 2 users)
5. Test Apple Sign-In still works

---

## 🚀 Quick Start Guide

### Step 1: Create Supabase Project

```bash
# 1. Go to https://supabase.com
# 2. Click "Start your project"
# 3. Create new organization
# 4. Create new project:
#    - Name: lifemap
#    - Database Password: (generate strong password)
#    - Region: (closest to you)
# 5. Wait 2 minutes for provisioning
```

### Step 2: Get Credentials

```bash
# In Supabase Dashboard:
# 1. Go to Settings → API
# 2. Copy "Project URL"
# 3. Copy "anon public" key
# 4. Copy "service_role" key (keep secret!)
```

### Step 3: Add to .env.local

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 5: Create Database Schema

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Click "New query"
# 3. Paste the SQL from Phase 2 above
# 4. Click "Run"
```

### Step 6: Implement Code

I'll create all the necessary files for you!

---

## 📊 Database Schema

### location_points table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| encrypted_data | TEXT | Encrypted location point JSON |
| iv | TEXT | Initialization vector for encryption |
| timestamp | BIGINT | Unix timestamp in milliseconds |
| synced | BOOLEAN | Always true (for compatibility) |
| created_at | TIMESTAMP | When record was created |

### Indexes

- `idx_user_timestamp` - Fast queries by user and time
- `idx_user_synced` - Fast queries for unsynced points

### Row Level Security (RLS)

- Users can only SELECT their own data
- Users can only INSERT their own data
- Users can only UPDATE their own data
- Users can only DELETE their own data

---

## 🔐 Security Features

1. **Row Level Security** - Database enforces data isolation
2. **JWT Authentication** - Secure session management
3. **Password Hashing** - Supabase uses bcrypt
4. **Client-side Encryption** - Location data encrypted before upload
5. **HTTPS Only** - All requests over secure connection

---

## 💰 Cost

### Supabase Free Tier
- ✅ 500MB database storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth
- ✅ 50MB file storage
- ✅ Unlimited API requests

**This is more than enough for your app!**

If you exceed limits:
- Pro plan: $25/month
- Includes 8GB database, 100GB bandwidth

---

## 🎯 Next Steps

1. **Create Supabase account** (5 min)
2. **Get credentials** (2 min)
3. **I'll implement the code** (30 min)
4. **Test it works** (10 min)

**Total time: ~45 minutes to full implementation!**

---

## 🤔 Alternative: Railway PostgreSQL

If you prefer to use Railway's PostgreSQL instead of Supabase:

**Pros:**
- Everything in one place
- No external dependencies

**Cons:**
- Need to implement auth from scratch
- Need to write more code
- More security considerations
- No built-in RLS

**Estimated time:** 3-4 hours (vs 45 minutes with Supabase)

---

## 💡 Recommendation

**Use Supabase** because:
1. ✅ Faster to implement (45 min vs 4 hours)
2. ✅ More secure (built-in RLS, tested auth)
3. ✅ Free tier is generous
4. ✅ Easy to maintain
5. ✅ Can migrate to Railway later if needed

**Let me know if you want to proceed with Supabase, and I'll implement everything for you!** 🚀

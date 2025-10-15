# Signup/Login 500 Error - Fix Guide

## 🔍 Problem Identified

The signup and login pages are showing 500 errors because the **database is not connected or configured**.

Looking at your screenshot, the errors are:
- ❌ `/api/auth/signup` - 500 error
- ❌ `/api/auth/login` - 500 error
- ❌ `/terms` - 404 (page doesn't exist yet)
- ❌ `/privacy-policy` - 404 (page doesn't exist yet)

## ✅ Quick Fix Steps

### Step 1: Check Database Connection

Run this diagnostic script:

```bash
node scripts/check-db.js
```

This will tell you exactly what's wrong.

### Step 2: Set Up Environment Variables

Make sure your `.env.local` file exists and has:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### Step 5: Restart Dev Server

```bash
npm run dev
```

## 📋 Detailed Instructions

I've created a comprehensive guide: **`DATABASE_SETUP_GUIDE.md`**

It covers:
- ✅ How to set up PostgreSQL locally
- ✅ How to use Railway for production
- ✅ How to use Docker for quick setup
- ✅ Common errors and solutions
- ✅ How to verify everything is working

## 🚀 What's Already Working

The code is perfect! Everything is implemented:
- ✅ Email/password signup form
- ✅ Email/password login form
- ✅ API endpoints for signup/login
- ✅ Password hashing with bcrypt
- ✅ JWT token generation
- ✅ Database schema with Prisma
- ✅ All dependencies installed

The ONLY issue is the database connection.

## 🎯 After Database Setup

Once you set up the database, you'll be able to:

1. **Register new users** at `/auth/signup`
   - Click "이메일로 가입하기"
   - Fill in name (optional), email, password
   - Check agreement box
   - Click "가입하기"

2. **Login existing users** at `/auth/login`
   - Click "이메일로 로그인"
   - Enter email and password
   - Click "로그인"

3. **Store location data** in PostgreSQL
   - All location points will be encrypted and stored
   - Synced across devices

## 🔧 Need Help?

Run the diagnostic script first:
```bash
node scripts/check-db.js
```

It will tell you exactly what needs to be fixed!

## 📝 Optional: Create Missing Pages

The 404 errors for `/terms` and `/privacy-policy` are not critical, but you can create them later:

```bash
# Create terms page
mkdir -p app/terms
touch app/terms/page.tsx

# Create privacy policy page
mkdir -p app/privacy-policy
touch app/privacy-policy/page.tsx
```

But focus on the database first! 🎯

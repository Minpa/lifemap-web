# Database Setup Guide

## Issue
The signup/login API endpoints are returning 500 errors because the database isn't connected or configured properly.

## Quick Fix

### 1. Check Your Environment Variables

Make sure your `.env.local` file has the following:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secret (for authentication tokens)
NEXTAUTH_SECRET="your-secret-key-here"
```

### 2. Generate Prisma Client

Run this command to generate the Prisma client:

```bash
npx prisma generate
```

### 3. Run Database Migrations

Apply the database schema to your PostgreSQL database:

```bash
npx prisma migrate dev --name init
```

Or if you're in production:

```bash
npx prisma migrate deploy
```

### 4. Test Database Connection

You can test if the database is connected:

```bash
npx prisma db push
```

## If You Don't Have a Database Yet

### Option 1: Use Railway (Recommended for Production)

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL database
4. Copy the `DATABASE_URL` from Railway
5. Add it to your `.env.local` file

### Option 2: Use Local PostgreSQL (For Development)

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb lifemap
   ```
3. Set your DATABASE_URL:
   ```env
   DATABASE_URL="postgresql://localhost:5432/lifemap"
   ```

### Option 3: Use Docker (Quick Local Setup)

```bash
docker run --name lifemap-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=lifemap -p 5432:5432 -d postgres
```

Then use:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lifemap"
```

## After Setting Up Database

1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

2. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

## Verify It's Working

1. Go to `/auth/signup`
2. Click "이메일로 가입하기"
3. Fill in the form
4. You should be redirected to `/app/map` on success

## Common Errors

### Error: "Can't reach database server"
- Check if your DATABASE_URL is correct
- Make sure PostgreSQL is running
- Check firewall/network settings

### Error: "Table does not exist"
- Run `npx prisma migrate dev`
- Or run `npx prisma db push`

### Error: "Environment variable not found: DATABASE_URL"
- Make sure `.env.local` exists in your project root
- Restart your dev server after adding environment variables

## Check Current Status

Run this to see if Prisma can connect:

```bash
npx prisma studio
```

This will open a GUI to view your database. If it opens successfully, your database is connected!

## Need Help?

Check the server logs in your terminal where you ran `npm run dev`. The error messages will tell you exactly what's wrong.

#!/bin/bash

# Database Setup Script
# Run this after adding DATABASE_URL to .env.local

echo "🚀 Setting up LifeMap Database..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local and add your DATABASE_URL"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env.local; then
    echo "❌ DATABASE_URL not found in .env.local"
    echo ""
    echo "Please add this to your .env.local:"
    echo ""
    echo "DATABASE_URL=\"postgresql://postgres:PASSWORD@region.railway.app:5432/railway\""
    echo "NEXTAUTH_SECRET=\"lifemap-secret-key-change-this-in-production\""
    echo ""
    exit 1
fi

echo "✅ .env.local found"
echo ""

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate
echo ""

# Run migrations
echo "🗄️  Creating database tables..."
npx prisma migrate dev --name init
echo ""

# Check database connection
echo "🔍 Checking database connection..."
node scripts/check-db.js
echo ""

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Go to: http://localhost:3000/auth/signup"
echo "3. Create your first account!"
echo ""

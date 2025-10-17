#!/bin/bash
# Run database migrations on Railway

echo "Running Prisma migrations on Railway..."

# This will run migrations using the DATABASE_URL from Railway
npx prisma migrate deploy

echo "✅ Migrations complete!"

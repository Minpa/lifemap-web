/**
 * Database Connection Check Script
 * 
 * Run this to verify your database is properly configured
 * Usage: node scripts/check-db.js
 */

const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');

  // Check environment variables
  console.log('1. Checking environment variables:');
  const dbUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.NEXTAUTH_SECRET;

  if (!dbUrl) {
    console.log('   ❌ DATABASE_URL is not set');
    console.log('   → Add DATABASE_URL to your .env.local file\n');
    return;
  } else {
    // Hide password in output
    const sanitizedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
    console.log(`   ✅ DATABASE_URL is set: ${sanitizedUrl}`);
  }

  if (!jwtSecret) {
    console.log('   ⚠️  NEXTAUTH_SECRET is not set');
    console.log('   → Add NEXTAUTH_SECRET to your .env.local file');
  } else {
    console.log('   ✅ NEXTAUTH_SECRET is set');
  }

  console.log('');

  // Try to connect to database
  console.log('2. Testing database connection:');
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('   ✅ Successfully connected to database\n');

    // Check if tables exist
    console.log('3. Checking database tables:');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`   ✅ Users table exists (${userCount} users)`);
    } catch (error) {
      console.log('   ❌ Users table does not exist');
      console.log('   → Run: npx prisma migrate dev\n');
      return;
    }

    try {
      const locationCount = await prisma.locationPoint.count();
      console.log(`   ✅ LocationPoint table exists (${locationCount} points)`);
    } catch (error) {
      console.log('   ❌ LocationPoint table does not exist');
      console.log('   → Run: npx prisma migrate dev\n');
      return;
    }

    console.log('\n✨ Everything looks good! Your database is ready.\n');

  } catch (error) {
    console.log('   ❌ Failed to connect to database');
    console.log(`   Error: ${error.message}\n`);
    
    console.log('Troubleshooting steps:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your DATABASE_URL is correct');
    console.log('3. Run: npx prisma generate');
    console.log('4. Run: npx prisma migrate dev\n');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(console.error);

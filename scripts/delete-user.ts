/**
 * Delete User Script
 * 
 * Deletes a user and all associated data from the database
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function deleteUser(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        locationPoints: true,
      },
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log(`Found user: ${user.id}`);
    console.log(`Location points: ${user.locationPoints.length}`);
    
    // Delete the user (cascade will delete location points)
    await prisma.user.delete({
      where: { email },
    });
    
    console.log('✅ User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/delete-user.ts <email>');
  process.exit(1);
}

deleteUser(email);

/**
 * Location Sync API Endpoint
 * 
 * POST /api/location/sync
 * Upload encrypted location points to server
 */

import { NextRequest, NextResponse } from 'next/server';
import { EncryptedLocationPoint } from '@/lib/location/types';

// Rate limiting configuration
const RATE_LIMIT = {
  maxPoints: 100, // Max points per request
  windowMs: 60000, // 1 minute
  maxRequests: 10, // Max 10 requests per minute
};

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset or create new limit
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Validate encrypted location point
 */
function validateLocationPoint(point: any): point is EncryptedLocationPoint {
  return (
    typeof point === 'object' &&
    typeof point.id === 'string' &&
    typeof point.userId === 'string' &&
    typeof point.encryptedData === 'string' &&
    typeof point.iv === 'string' &&
    typeof point.timestamp === 'number' &&
    typeof point.synced === 'boolean'
  );
}

/**
 * POST /api/location/sync
 * Upload encrypted location points
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth (you'll need to implement this based on your auth)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { points } = body;

    // Validate points array
    if (!Array.isArray(points)) {
      return NextResponse.json(
        { error: 'Invalid request: points must be an array' },
        { status: 400 }
      );
    }

    // Check max points limit
    if (points.length > RATE_LIMIT.maxPoints) {
      return NextResponse.json(
        { error: `Too many points: max ${RATE_LIMIT.maxPoints} per request` },
        { status: 400 }
      );
    }

    // Validate each point
    const validPoints: EncryptedLocationPoint[] = [];
    const errors: string[] = [];

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      
      if (!validateLocationPoint(point)) {
        errors.push(`Invalid point at index ${i}`);
        continue;
      }

      // Verify userId matches
      if (point.userId !== userId) {
        errors.push(`User ID mismatch at index ${i}`);
        continue;
      }

      validPoints.push(point);
    }

    // TODO: Store points in database (CloudKit, Supabase, etc.)
    // For now, we'll just simulate storage
    console.log(`Storing ${validPoints.length} location points for user ${userId}`);
    
    // Simulate async storage
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return success response
    return NextResponse.json({
      success: true,
      syncedCount: validPoints.length,
      failedCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error syncing location points:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
    },
  });
}

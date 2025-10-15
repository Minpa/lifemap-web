/**
 * Location Sync API Endpoint
 * 
 * POST /api/location/sync
 * Upload encrypted location points to server
 */

import { NextRequest, NextResponse } from 'next/server';
import { EncryptedLocationPoint } from '@/lib/location/types';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractToken } from '@/lib/auth/jwt';

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
    // Get and verify JWT token
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

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

    // Store points in PostgreSQL database
    console.log(`Storing ${validPoints.length} location points for user ${userId}`);
    
    try {
      // Batch insert location points
      await prisma.locationPoint.createMany({
        data: validPoints.map(point => ({
          id: point.id,
          userId: userId,
          encryptedData: point.encryptedData,
          iv: point.iv,
          timestamp: BigInt(point.timestamp),
          synced: true,
        })),
        skipDuplicates: true, // Skip if point already exists
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save location data' },
        { status: 500 }
      );
    }

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

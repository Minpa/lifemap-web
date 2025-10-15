/**
 * Location Points API Endpoint
 * 
 * GET /api/location/points
 * Download encrypted location points from server
 */

import { NextRequest, NextResponse } from 'next/server';
import { EncryptedLocationPoint } from '@/lib/location/types';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, extractToken } from '@/lib/auth/jwt';

/**
 * GET /api/location/points
 * Download encrypted location points
 * 
 * Query parameters:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - limit: number (optional, default 1000, max 5000)
 * - offset: number (optional, default 0)
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '1000'),
      5000
    );
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate date parameters
    let startTimestamp: number | undefined;
    let endTimestamp: number | undefined;

    if (startDate) {
      const date = new Date(startDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid startDate format' },
          { status: 400 }
        );
      }
      startTimestamp = date.getTime();
    }

    if (endDate) {
      const date = new Date(endDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid endDate format' },
          { status: 400 }
        );
      }
      endTimestamp = date.getTime();
    }

    // Fetch points from PostgreSQL database
    console.log(`Fetching location points for user ${userId}`, {
      startDate,
      endDate,
      limit,
      offset,
    });

    // Build query filters
    const where: any = { userId };
    
    if (startTimestamp && endTimestamp) {
      where.timestamp = {
        gte: BigInt(startTimestamp),
        lte: BigInt(endTimestamp),
      };
    } else if (startTimestamp) {
      where.timestamp = { gte: BigInt(startTimestamp) };
    } else if (endTimestamp) {
      where.timestamp = { lte: BigInt(endTimestamp) };
    }

    // Fetch points from database
    const [dbPoints, totalCount] = await Promise.all([
      prisma.locationPoint.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.locationPoint.count({ where }),
    ]);

    // Convert to EncryptedLocationPoint format
    const points: EncryptedLocationPoint[] = dbPoints.map(point => ({
      id: point.id,
      userId: point.userId,
      encryptedData: point.encryptedData,
      iv: point.iv,
      timestamp: Number(point.timestamp),
      synced: point.synced,
    }));

    const hasMore = offset + points.length < totalCount;

    // Return response
    return NextResponse.json({
      points,
      totalCount,
      hasMore,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Error fetching location points:', error);
    
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
    },
  });
}

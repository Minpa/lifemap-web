/**
 * EXIF metadata extraction utilities
 */

import exifr from 'exifr';
import type { ExifData } from '@/types';
import { hashData } from './crypto';

export interface ExtractedPhotoData {
  latitude?: number;
  longitude?: number;
  timestamp: Date;
  exif: ExifData;
  hash: string;
}

/**
 * Extract EXIF data from photo file
 */
export async function extractExifData(
  file: File
): Promise<ExtractedPhotoData | null> {
  try {
    // Read EXIF data
    const exifData = await exifr.parse(file, {
      gps: true,
      exif: true,
      ifd0: true,
      ifd1: true,
    });

    if (!exifData) {
      console.warn('No EXIF data found in file:', file.name);
      return null;
    }

    // Extract GPS coordinates
    const latitude = exifData.latitude;
    const longitude = exifData.longitude;

    // Extract timestamp
    let timestamp = new Date();
    if (exifData.DateTimeOriginal) {
      timestamp = new Date(exifData.DateTimeOriginal);
    } else if (exifData.DateTime) {
      timestamp = new Date(exifData.DateTime);
    } else {
      // Fallback to file modification time
      timestamp = new Date(file.lastModified);
    }

    // Extract camera info
    const exif: ExifData = {
      make: exifData.Make,
      model: exifData.Model,
      fNumber: exifData.FNumber,
      exposureTime: exifData.ExposureTime,
      iso: exifData.ISO,
      focalLength: exifData.FocalLength,
      width: exifData.ImageWidth || 0,
      height: exifData.ImageHeight || 0,
    };

    // Calculate file hash for duplicate detection
    const arrayBuffer = await file.arrayBuffer();
    const hash = await hashData(arrayBuffer);

    return {
      latitude,
      longitude,
      timestamp,
      exif,
      hash,
    };
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return null;
  }
}

/**
 * Batch process multiple photos
 */
export async function batchExtractExif(
  files: File[]
): Promise<Map<string, ExtractedPhotoData | null>> {
  const results = new Map<string, ExtractedPhotoData | null>();

  await Promise.all(
    files.map(async (file) => {
      const data = await extractExifData(file);
      results.set(file.name, data);
    })
  );

  return results;
}

/**
 * Strip EXIF data from photo for privacy
 */
export async function stripExifData(file: File): Promise<Blob> {
  // Create a canvas to redraw the image without EXIF
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, file.type);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Create thumbnail from photo
 */
export async function createThumbnail(
  file: File,
  maxSize: number = 400
): Promise<Blob> {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create thumbnail'));
          }
        },
        'image/jpeg',
        0.8
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate photo file
 */
export function isValidPhotoFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type.toLowerCase())) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
}

/**
 * Format EXIF data for display
 */
export function formatExifForDisplay(exif: ExifData): string[] {
  const lines: string[] = [];

  if (exif.make && exif.model) {
    lines.push(`${exif.make} ${exif.model}`);
  }

  if (exif.fNumber) {
    lines.push(`f/${exif.fNumber}`);
  }

  if (exif.exposureTime) {
    lines.push(`${exif.exposureTime}s`);
  }

  if (exif.iso) {
    lines.push(`ISO ${exif.iso}`);
  }

  if (exif.focalLength) {
    lines.push(`${exif.focalLength}mm`);
  }

  if (exif.width && exif.height) {
    lines.push(`${exif.width} × ${exif.height}`);
  }

  return lines;
}

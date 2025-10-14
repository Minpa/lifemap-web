/**
 * Location Data Encryption
 * 
 * AES-256-GCM encryption for location data
 */

import type { LocationPoint, EncryptedLocationPoint } from './types';

/**
 * Generate encryption key from user ID
 */
async function generateUserKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('lifemap-location-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt location point
 */
export async function encryptLocationPoint(
  point: LocationPoint
): Promise<EncryptedLocationPoint> {
  if (!point.userId) {
    throw new Error('User ID required for encryption');
  }

  // Generate encryption key
  const key = await generateUserKey(point.userId);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt data
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(point));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    key,
    data
  );

  return {
    id: point.id,
    userId: point.userId,
    encryptedData: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
    timestamp: point.timestamp,
    synced: point.synced,
  };
}

/**
 * Decrypt location point
 */
export async function decryptLocationPoint(
  encrypted: EncryptedLocationPoint,
  userId: string
): Promise<LocationPoint> {
  // Generate decryption key
  const key = await generateUserKey(userId);

  // Convert from Base64
  const encryptedData = base64ToArrayBuffer(encrypted.encryptedData);
  const iv = base64ToArrayBuffer(encrypted.iv);

  // Decrypt data
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
      tagLength: 128,
    },
    key,
    encryptedData
  );

  // Parse JSON
  const decoder = new TextDecoder();
  const json = decoder.decode(decrypted);
  return JSON.parse(json);
}

/**
 * Batch encrypt location points
 */
export async function encryptLocationPoints(
  points: LocationPoint[]
): Promise<EncryptedLocationPoint[]> {
  return Promise.all(points.map((point) => encryptLocationPoint(point)));
}

/**
 * Batch decrypt location points
 */
export async function decryptLocationPoints(
  encrypted: EncryptedLocationPoint[],
  userId: string
): Promise<LocationPoint[]> {
  return Promise.all(
    encrypted.map((point) => decryptLocationPoint(point, userId))
  );
}

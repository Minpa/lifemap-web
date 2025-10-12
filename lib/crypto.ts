/**
 * Encryption utilities using Web Crypto API
 * For encrypting journal entries and sensitive data
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

/**
 * Generate a cryptographic key from a password
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt text data
 */
export async function encrypt(
  text: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Encrypt data
  const encryptedData = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  // Combine salt + IV + encrypted data
  const combined = new Uint8Array(
    salt.length + iv.length + encryptedData.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt text data
 */
export async function decrypt(
  encryptedText: string,
  password: string
): Promise<string> {
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));

  // Extract salt, IV, and encrypted data
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 16 + IV_LENGTH);
  const encryptedData = combined.slice(16 + IV_LENGTH);

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Decrypt data
  const decryptedData = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encryptedData
  );

  // Convert to string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

/**
 * Generate a random encryption key and store it securely
 * This is used as the user's device key
 */
export function generateDeviceKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Hash data for duplicate detection
 */
export async function hashData(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create device key from localStorage
 */
export function getDeviceKey(): string {
  const STORAGE_KEY = 'lifemap-device-key';
  let key = localStorage.getItem(STORAGE_KEY);

  if (!key) {
    key = generateDeviceKey();
    localStorage.setItem(STORAGE_KEY, key);
  }

  return key;
}

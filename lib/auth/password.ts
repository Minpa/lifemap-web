/**
 * Password Utilities
 * 
 * Functions for hashing and verifying passwords
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 최소 1개 포함해야 합니다');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 최소 1개 포함해야 합니다');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 최소 1개 포함해야 합니다');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

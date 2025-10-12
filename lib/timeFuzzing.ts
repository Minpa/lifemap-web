/**
 * Time fuzzing utilities for privacy protection
 */

/**
 * Apply time fuzzing to a timestamp
 * Adds random offset within specified range
 */
export function fuzzTimestamp(
  timestamp: Date,
  minHours: number = 1,
  maxHours: number = 3
): Date {
  const minMs = minHours * 60 * 60 * 1000;
  const maxMs = maxHours * 60 * 60 * 1000;

  // Random offset between min and max (can be positive or negative)
  const offset = Math.random() * (maxMs - minMs) + minMs;
  const direction = Math.random() < 0.5 ? -1 : 1;

  return new Date(timestamp.getTime() + offset * direction);
}

/**
 * Apply consistent fuzzing to related timestamps
 * Uses a seed to ensure related events maintain relative timing
 */
export function fuzzTimestampWithSeed(
  timestamp: Date,
  seed: string,
  minHours: number = 1,
  maxHours: number = 3
): Date {
  // Simple hash function for seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use hash to generate consistent random offset
  const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1
  const minMs = minHours * 60 * 60 * 1000;
  const maxMs = maxHours * 60 * 60 * 1000;
  const offset = normalized * (maxMs - minMs) + minMs;
  const direction = hash < 0 ? -1 : 1;

  return new Date(timestamp.getTime() + offset * direction);
}

/**
 * Round timestamp to nearest hour for additional privacy
 */
export function roundToNearestHour(timestamp: Date): Date {
  const rounded = new Date(timestamp);
  rounded.setMinutes(0, 0, 0);

  // Round up if past 30 minutes
  if (timestamp.getMinutes() >= 30) {
    rounded.setHours(rounded.getHours() + 1);
  }

  return rounded;
}

/**
 * Remove precise time information, keeping only date
 */
export function stripTimeInfo(timestamp: Date): Date {
  const dateOnly = new Date(timestamp);
  dateOnly.setHours(0, 0, 0, 0);
  return dateOnly;
}

/**
 * Apply fuzzing to an array of timestamps while maintaining order
 */
export function fuzzTimestampArray(
  timestamps: Date[],
  minHours: number = 1,
  maxHours: number = 3
): Date[] {
  if (timestamps.length === 0) return [];

  // Sort timestamps
  const sorted = [...timestamps].sort((a, b) => a.getTime() - b.getTime());

  // Apply fuzzing
  const fuzzed = sorted.map((ts) => fuzzTimestamp(ts, minHours, maxHours));

  // Ensure order is maintained
  for (let i = 1; i < fuzzed.length; i++) {
    if (fuzzed[i].getTime() < fuzzed[i - 1].getTime()) {
      fuzzed[i] = new Date(fuzzed[i - 1].getTime() + 60000); // Add 1 minute
    }
  }

  return fuzzed;
}

/**
 * Calculate time difference in hours
 */
export function getHoursDifference(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return diffMs / (1000 * 60 * 60);
}

/**
 * Check if two timestamps are within fuzzing range
 */
export function areTimestampsRelated(
  ts1: Date,
  ts2: Date,
  maxHours: number = 3
): boolean {
  return getHoursDifference(ts1, ts2) <= maxHours;
}

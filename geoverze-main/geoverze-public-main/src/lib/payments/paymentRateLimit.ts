/**
 * In-process sliding window rate limiter for payment APIs.
 * Protects order creation and verification from brute-force retries.
 * Resets on process restart — enough for a single Node server / serverless isolate.
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export function assertRateLimit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);
  if (bucket.timestamps.length >= max) {
    throw new Error("Too many payment requests. Wait a moment and try again.");
  }
  bucket.timestamps.push(now);
  buckets.set(key, bucket);
}

/** Test helper — not used in production paths. */
export function resetRateLimitBuckets(): void {
  buckets.clear();
}

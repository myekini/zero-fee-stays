/**
 * Cache Invalidation Utilities
 *
 * Provides utilities to invalidate server-side caches when data changes
 */

/**
 * Invalidate profile cache for a specific user
 * Triggers a revalidation on the next middleware request
 */
export async function invalidateProfileCache(userId: string): Promise<void> {
  try {
    // Call middleware cache invalidation endpoint
    await fetch('/api/cache/invalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'profile', userId }),
    });
  } catch (error) {
    console.error('Failed to invalidate profile cache:', error);
    // Don't throw - cache invalidation is non-critical
  }
}

/**
 * Invalidate all caches (use sparingly)
 */
export async function invalidateAllCaches(): Promise<void> {
  try {
    await fetch('/api/cache/invalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'all' }),
    });
  } catch (error) {
    console.error('Failed to invalidate all caches:', error);
  }
}

export default {
  invalidateProfileCache,
  invalidateAllCaches,
};

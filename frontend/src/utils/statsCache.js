import { getApiUrl } from '../config'
import logger from './logger'

const CACHE_TTL_MS = 30000 // 30 seconds cache validity

let cachedStats = null
let cacheTimestamp = null
let prefetchPromise = null

/**
 * Prefetch admin stats - call this on hover over admin link
 * Returns a promise that resolves when prefetch completes
 */
export const prefetchStats = async (range = 'all') => {
  // If already prefetching, return existing promise
  if (prefetchPromise) {
    return prefetchPromise
  }

  // If cache is still valid, no need to refetch
  if (cachedStats && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedStats
  }

  prefetchPromise = (async () => {
    try {
      const url = range !== 'all'
        ? getApiUrl(`/api/admin/stats?range=${range}`)
        : getApiUrl('/api/admin/stats')

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      if (data && !data.error) {
        cachedStats = data
        cacheTimestamp = Date.now()
        logger.log('Stats prefetched successfully')
        return data
      }
    } catch (err) {
      logger.error('Error prefetching stats:', err)
    } finally {
      prefetchPromise = null
    }
    return null
  })()

  return prefetchPromise
}

/**
 * Get cached stats if available and not stale
 * Returns null if no valid cache exists
 */
export const getCachedStats = () => {
  if (cachedStats && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedStats
  }
  return null
}

/**
 * Clear the stats cache
 */
export const clearStatsCache = () => {
  cachedStats = null
  cacheTimestamp = null
  prefetchPromise = null
}

/**
 * Update the cache with new stats (useful after a fetch)
 */
export const updateStatsCache = (stats) => {
  if (stats && typeof stats === 'object') {
    cachedStats = stats
    cacheTimestamp = Date.now()
  }
}

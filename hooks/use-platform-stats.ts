import { useState, useEffect } from "react"

export interface PlatformStats {
  totalAPIs: number
  activeAPIs: number
  totalCalls: number
  totalRequests: number
  totalUsers: number
  activeCreators: number
  minPrice: number
  maxPrice: number
  avgPrice: number
  totalRevenue: number
  lastUpdated: string
  cacheAge: number
}

const defaultStats: PlatformStats = {
  totalAPIs: 0,
  activeAPIs: 0,
  totalCalls: 0,
  totalRequests: 0,
  totalUsers: 0,
  activeCreators: 0,
  minPrice: 0,
  maxPrice: 0,
  avgPrice: 0,
  totalRevenue: 0,
  lastUpdated: new Date().toISOString(),
  cacheAge: 30,
}

// Shared cache across all components
let cachedStats: PlatformStats | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 30000 // 30 seconds

/**
 * Universal platform statistics hook
 * Fetches and caches platform-wide metrics from a single source of truth
 * 
 * @param refreshInterval - Optional refresh interval in milliseconds (default: 30000ms)
 * @returns Platform statistics and loading state
 */
export function usePlatformStats(refreshInterval = 30000) {
  const [stats, setStats] = useState<PlatformStats>(cachedStats || defaultStats)
  const [loading, setLoading] = useState(!cachedStats)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      // Check if cache is still valid
      if (cachedStats && Date.now() - cacheTimestamp < CACHE_DURATION) {
        setStats(cachedStats)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch('/api/platform-stats')
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        const data = await res.json()
        
        if (data.success && data.stats) {
          cachedStats = data.stats
          cacheTimestamp = Date.now()
          setStats(data.stats)
        } else {
          throw new Error(data.error || 'Invalid response format')
        }
      } catch (err) {
        console.error('[usePlatformStats] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
        // Keep showing cached stats if available
        if (cachedStats) {
          setStats(cachedStats)
        }
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchStats()

    // Set up refresh interval if specified
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refreshInterval])

  return { stats, loading, error }
}


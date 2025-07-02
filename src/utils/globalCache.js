/**
 * Global Cache Utility for PTO Connect
 * Prevents unnecessary page reloads when users switch between windows/tabs
 * Stores component state and data in localStorage with expiration times
 */

import React from 'react';

const CACHE_PREFIX = 'pto_connect_cache_';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

class GlobalCache {
  constructor() {
    this.setupVisibilityListener();
  }

  /**
   * Store data in cache with expiration
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} duration - Cache duration in milliseconds
   */
  set(key, data, duration = DEFAULT_CACHE_DURATION) {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiration: Date.now() + duration
    };
    
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  /**
   * Retrieve data from cache if not expired
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null if expired/not found
   */
  get(key) {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;

      const cacheItem = JSON.parse(item);
      
      // Check if expired
      if (Date.now() > cacheItem.expiration) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  /**
   * Remove specific cache item
   * @param {string} key - Cache key
   */
  remove(key) {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  /**
   * Clear all cache items
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Check if data exists in cache and is valid
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Setup visibility change listener to prevent unnecessary reloads
   */
  setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          // Page became visible again - extend cache expiration for active data
          this.extendActiveCaches();
        }
      });
    }
  }

  /**
   * Extend expiration time for recently used cache items
   */
  extendActiveCaches() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          const item = JSON.parse(localStorage.getItem(key));
          
          // If cache was accessed within last 2 minutes, extend it
          if (item && (now - item.timestamp) < 2 * 60 * 1000) {
            item.expiration = now + DEFAULT_CACHE_DURATION;
            localStorage.setItem(key, JSON.stringify(item));
          }
        }
      });
    } catch (error) {
      console.warn('Failed to extend cache expiration:', error);
    }
  }

  /**
   * Create a React hook for easy cache integration
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - Function to fetch fresh data
   * @param {number} duration - Cache duration
   * @returns {Object} - {data, loading, error, refresh}
   */
  useCache(key, fetchFunction, duration = DEFAULT_CACHE_DURATION) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const refresh = React.useCallback(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const freshData = await fetchFunction();
        this.set(key, freshData, duration);
        setData(freshData);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        // Try to use stale cache data if available
        const staleData = this.get(key);
        if (staleData) {
          setData(staleData);
        }
      } finally {
        setLoading(false);
      }
    }, [key, fetchFunction, duration]);

    React.useEffect(() => {
      // Try to get cached data first
      const cachedData = this.get(key);
      
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
      } else {
        refresh();
      }
    }, [key, refresh]);

    return { data, loading, error, refresh };
  }
}

// Create singleton instance
const globalCache = new GlobalCache();

export default globalCache;

/**
 * React hook for easy cache integration
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch fresh data
 * @param {number} duration - Cache duration in milliseconds
 * @returns {Object} - {data, loading, error, refresh}
 */
export const useGlobalCache = (key, fetchFunction, duration = DEFAULT_CACHE_DURATION) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const freshData = await fetchFunction();
      globalCache.set(key, freshData, duration);
      setData(freshData);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      // Try to use stale cache data if available
      const staleData = globalCache.get(key);
      if (staleData) {
        setData(staleData);
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetchFunction, duration]);

  React.useEffect(() => {
    // Try to get cached data first
    const cachedData = globalCache.get(key);
    
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
    } else {
      refresh();
    }
  }, [key, refresh]);

  return { data, loading, error, refresh };
}; 
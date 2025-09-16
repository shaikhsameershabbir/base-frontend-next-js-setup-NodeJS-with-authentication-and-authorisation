'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { marketsAPI } from '@/lib/api/auth';
import { betAPI } from '@/lib/api/bet';
import { useAuthContext } from './AuthContext';

interface Market {
  _id: string;
  marketName: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  isGolden?: boolean;
  rank?: number;
  weekDays?: number;
  isAssigned: boolean;
  assignmentId: string;
}

interface MarketResult {
  _id: string;
  marketId: string;
  resultDate: string;
  results: {
    open: string | null;
    main: string | null;
    close: string | null;
    openDeclationTime: string | null;
    closeDeclationTime: string | null;
  };
}

interface MarketStatus {
  status: string;
  isOpen: boolean;
  timeUntilOpen?: number;
  timeUntilClose?: number;
}

interface MarketDataContextType {
  markets: Market[];
  marketResults: Record<string, MarketResult>;
  marketStatuses: Record<string, MarketStatus>;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>; // Force refresh function
  getMarketResult: (marketId: string) => MarketResult | null;
  getMarketStatus: (marketId: string) => MarketStatus | null;
  updateMarketStatus: (marketId: string, status: MarketStatus) => void;
  fetchMarketStatus: (marketId: string) => Promise<MarketStatus | null>;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};

interface MarketDataProviderProps {
  children: React.ReactNode;
}

// Cache management
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MARKET_STATUS_CACHE_DURATION = 30 * 1000; // 30 seconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, duration: number = CACHE_DURATION): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const marketCache = new SimpleCache();

export const MarketDataProvider: React.FC<MarketDataProviderProps> = ({ children }) => {
  const { state: { isAuthenticated, loading: authLoading } } = useAuthContext();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketResults, setMarketResults] = useState<Record<string, MarketResult>>({});
  const [marketStatuses, setMarketStatuses] = useState<Record<string, MarketStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Refs for preventing race conditions and managing state
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const statusFetchingRef = useRef<Set<string>>(new Set());
  const lastAuthStateRef = useRef<boolean | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  const resetData = useCallback(() => {
    setMarkets([]);
    setMarketResults({});
    setMarketStatuses({});
    setIsInitialized(false);
    setError(null);
    marketCache.clear();
  }, []);

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    // Only fetch on client side
    if (!isClient || !isMountedRef.current) {
      return;
    }

    // Clear cache if force refresh
    if (forceRefresh) {
      marketCache.clear();
      lastFetchTimeRef.current = 0; // Reset last fetch time
    }

    // Check if we have recent data in cache
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;

    if (!forceRefresh && timeSinceLastFetch < CACHE_DURATION) {
      const cachedData = marketCache.get<{ markets: Market[], marketResults: Record<string, MarketResult> }>('markets_data');
      if (cachedData) {
        setMarkets(cachedData.markets);
        setMarketResults(cachedData.marketResults);
        setIsInitialized(true);
        setLoading(false);
        return;
      }
    }

    // Prevent concurrent fetch calls
    if (isFetchingRef.current) {
      return;
    }

    // Clear any pending fetch timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;

    try {
      setLoading(true);
      setError(null);

      // Fetch markets
      const marketsResponse = await marketsAPI.getAssignedMarkets();
      if (!marketsResponse.success || !marketsResponse.data) {
        throw new Error(marketsResponse.message || 'Failed to fetch markets');
      }

      const marketsData = marketsResponse.data.assignments.map((assignment: any) => {
        if (assignment.marketData) {
          return {
            ...assignment.marketData,
            isAssigned: true,
            assignmentId: assignment._id
          };
        }
        return {
          ...assignment.marketId,
          isAssigned: true,
          assignmentId: assignment._id
        };
      });

      setMarkets(marketsData);

      // Fetch market results in parallel
      if (marketsData.length > 0) {
        const marketIds = marketsData.map(market => market._id);
        const resultsResponse = await betAPI.getAllMarketResults(marketIds);

        let resultsMap: Record<string, MarketResult> = {};
        if (resultsResponse.success && resultsResponse.data) {
          resultsResponse.data.forEach((item: any) => {
            if (item.success && item.data) {
              resultsMap[item.marketId] = item.data;
            }
          });
        }
        setMarketResults(resultsMap);
      }

      setIsInitialized(true);

      // Cache the data
      marketCache.set('markets_data', {
        markets: marketsData,
        marketResults: marketsData.length > 0 ?
          (marketResults || {}) : {}
      });

    } catch (error: any) {
      console.error('MarketData fetch error:', error);
      setError(error.message || 'Failed to fetch data');

      // Retry after a delay if it's a network error
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        fetchTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && !isFetchingRef.current) {
            fetchData(true);
          }
        }, 5000);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [isClient]);

  const getMarketResult = useCallback((marketId: string): MarketResult | null => {
    return marketResults[marketId] || null;
  }, [marketResults]);

  const getMarketStatus = useCallback((marketId: string): MarketStatus | null => {
    return marketStatuses[marketId] || null;
  }, [marketStatuses]);

  const updateMarketStatus = useCallback((marketId: string, status: MarketStatus) => {
    setMarketStatuses(prev => ({
      ...prev,
      [marketId]: status
    }));
  }, []);

  const fetchMarketStatus = useCallback(async (marketId: string): Promise<MarketStatus | null> => {
    // Only fetch on client side
    if (!isClient || !isMountedRef.current) {
      return null;
    }

    // Check cache first
    const cacheKey = `market_status_${marketId}`;
    const cachedStatus = marketCache.get<MarketStatus>(cacheKey);
    if (cachedStatus) {
      return cachedStatus;
    }

    // Prevent duplicate calls for the same market
    if (statusFetchingRef.current.has(marketId)) {
      return null;
    }

    // Check if we already have the status in state
    const existingStatus = getMarketStatus(marketId);
    if (existingStatus) {
      return existingStatus;
    }

    // Mark as fetching
    statusFetchingRef.current.add(marketId);

    try {
      const response = await betAPI.getMarketStatus(marketId);
      if (response.success && response.data) {
        const statusData = response.data;
        updateMarketStatus(marketId, statusData);

        // Cache the status
        marketCache.set(cacheKey, statusData, MARKET_STATUS_CACHE_DURATION);

        return statusData;
      }
    } catch (error) {
      console.error('Market status fetch error:', error);
    } finally {
      // Remove from fetching set
      statusFetchingRef.current.delete(marketId);
    }

    return null;
  }, [isClient, getMarketStatus, updateMarketStatus]);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);

    // Set mounted flag when component mounts
    isMountedRef.current = true;

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Monitor authentication state changes
  useEffect(() => {
    // Skip if not client-side or auth is still loading
    if (!isClient || authLoading) {
      return;
    }

    // If user just logged in (was not authenticated, now is)
    if (!lastAuthStateRef.current && isAuthenticated) {
      resetData();
      fetchData(true); // Force refresh on login
    }
    // If user just logged out (was authenticated, now is not)
    else if (lastAuthStateRef.current && !isAuthenticated) {
      resetData();
    }

    // Update the last auth state
    lastAuthStateRef.current = isAuthenticated;
  }, [isClient, isAuthenticated, authLoading, resetData]); // Removed fetchData from dependencies

  // Initial data fetch
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading) {
      if (!isInitialized) {
        fetchData();
      }
    } else if (!isAuthenticated && !authLoading) {
      // User is not authenticated, set loading to false
      setLoading(false);
      setIsInitialized(true); // Mark as initialized even without data
    }

    // Don't set isMounted to false here - it should only be set to false on unmount
    return () => {
      // Clear any pending timeouts
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isClient, isAuthenticated, authLoading, isInitialized]); // Removed fetchData from dependencies

  // Add a timeout fallback to prevent infinite loading
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading && isClient) {
        setLoading(false);
        setError('Loading timeout - please refresh the page');
      }
    }, 30000); // 30 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [loading, isClient]);

  // Page visibility handling - DISABLED to prevent auto-refresh on page return
  // Users can manually refresh using the refresh button if needed
  // useEffect(() => {
  //   let visibilityTimeout: NodeJS.Timeout | null = null;

  //   const handleVisibilityChange = () => {
  //     if (!isAuthenticated || document.hidden || !isClient) {
  //       return;
  //     }

  //     // Clear any existing timeout
  //     if (visibilityTimeout) {
  //       clearTimeout(visibilityTimeout);
  //     }

  //     // Debounce visibility changes
  //     visibilityTimeout = setTimeout(() => {
  //       if (isMountedRef.current) {
  //         const now = Date.now();
  //         const timeSinceLastFetch = now - lastFetchTimeRef.current;

  //         // Only fetch if data is stale (older than cache duration)
  //         if (timeSinceLastFetch > CACHE_DURATION) {
  //           fetchData();
  //         }
  //       }
  //     }, 1000);
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     if (visibilityTimeout) {
  //       clearTimeout(visibilityTimeout);
  //     }
  //   };
  // }, [isAuthenticated, isClient, fetchData]);

  const value = useMemo(() => ({
    markets,
    marketResults,
    marketStatuses,
    loading,
    error,
    fetchData: () => fetchData(false),
    refreshData: () => fetchData(true), // Force refresh function
    getMarketResult,
    getMarketStatus,
    updateMarketStatus,
    fetchMarketStatus
  }), [
    markets,
    marketResults,
    marketStatuses,
    loading,
    error,
    fetchData,
    getMarketResult,
    getMarketStatus,
    updateMarketStatus,
    fetchMarketStatus
  ]);

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};

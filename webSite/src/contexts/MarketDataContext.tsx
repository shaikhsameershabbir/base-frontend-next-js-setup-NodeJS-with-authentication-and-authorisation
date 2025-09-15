'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const MarketDataProvider: React.FC<MarketDataProviderProps> = ({ children }) => {
  const { state: { isAuthenticated, loading: authLoading } } = useAuthContext();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketResults, setMarketResults] = useState<Record<string, MarketResult>>({});
  const [marketStatuses, setMarketStatuses] = useState<Record<string, MarketStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const isMountedRef = React.useRef(true);
  const isFetchingRef = React.useRef(false);
  const statusFetchingRef = React.useRef<Set<string>>(new Set());
  const lastAuthStateRef = React.useRef<boolean | null>(null);

  const resetData = () => {
    setMarkets([]);
    setMarketResults({});
    setMarketStatuses({});
    setIsInitialized(false);
    setError(null);
  };

  const fetchData = async () => {
    // Only fetch on client side
    if (!isClient) {
      console.log('MarketDataContext: Not client-side, skipping fetch');
      return;
    }

    // Prevent concurrent fetch calls only for a short time
    if (isFetchingRef.current) {
      console.log('MarketDataContext: Already fetching, queuing retry');
      // Wait a bit and try again
      setTimeout(() => {
        if (!isFetchingRef.current) {
          fetchData();
        }
      }, 1000);
      return;
    }

    // Starting data fetch
    isFetchingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      // Fetch markets with cache busting
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
      // Markets fetched successfully

      // Fetch all market results in a single API call
      const marketIds = marketsData.map(market => market._id);
      const resultsResponse = await betAPI.getAllMarketResults(marketIds);

      if (resultsResponse.success && resultsResponse.data) {
        const resultsMap: Record<string, MarketResult> = {};
        resultsResponse.data.forEach((item: any) => {
          if (item.success && item.data) {
            resultsMap[item.marketId] = item.data;
          }
        });
        setMarketResults(resultsMap);
        // Market results fetched successfully
      }

      setIsInitialized(true);
      // Data fetch completed successfully
    } catch (error: any) {
      console.error('MarketData fetch error:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const getMarketResult = (marketId: string): MarketResult | null => {
    return marketResults[marketId] || null;
  };

  const getMarketStatus = (marketId: string): MarketStatus | null => {
    return marketStatuses[marketId] || null;
  };

  const updateMarketStatus = (marketId: string, status: MarketStatus) => {
    setMarketStatuses(prev => ({
      ...prev,
      [marketId]: status
    }));
  };

  const fetchMarketStatus = async (marketId: string): Promise<MarketStatus | null> => {
    // Only fetch on client side
    if (!isClient) {
      return null;
    }

    // Prevent duplicate calls for the same market
    if (statusFetchingRef.current.has(marketId)) {
      return null;
    }

    // Check if we already have the status
    const cachedStatus = getMarketStatus(marketId);
    if (cachedStatus) {
      return cachedStatus;
    }

    // Mark as fetching
    statusFetchingRef.current.add(marketId);

    try {
      const response = await betAPI.getMarketStatus(marketId);
      if (response.success && response.data) {
        const statusData = response.data;
        updateMarketStatus(marketId, statusData);
        return statusData;
      }
    } catch (error) {
      console.error('Market status fetch error:', error);
      // Error fetching status - silently fail
    } finally {
      // Remove from fetching set
      statusFetchingRef.current.delete(marketId);
    }

    return null;
  };

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
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
      fetchData();
    }
    // If user just logged out (was authenticated, now is not)
    else if (lastAuthStateRef.current && !isAuthenticated) {
      resetData();
    }

    // Update the last auth state
    lastAuthStateRef.current = isAuthenticated;
  }, [isClient, isAuthenticated, authLoading]);

  // Fetch data on mount (only if authenticated and client-side)
  useEffect(() => {
    if (isClient && isMountedRef.current && isAuthenticated && !authLoading) {
      // Initial data fetch triggered
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [isClient, isAuthenticated, authLoading]);

  // Note: Removed duplicate page load refresh to prevent multiple fetches
  // Initial data fetch is already handled by the mount effect above

  // Handle page visibility changes and refresh markets when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Only refresh if user is authenticated and page becomes visible
      if (isAuthenticated && !document.hidden && isClient) {
        // Page became visible, refreshing data
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchData();
          }
        }, 500);
      }
    };

    // Removed handleWindowLoad to prevent duplicate fetches

    const handleBeforeUnload = async () => {
      // Refresh data before page unload to ensure latest data is saved
      if (isAuthenticated && isMountedRef.current && isClient) {
        try {
          await fetchData();
        } catch (err) {
          // Silently fail on unload
        }
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, isClient]); // Re-run when authentication status or client status changes

  const value = {
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
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};

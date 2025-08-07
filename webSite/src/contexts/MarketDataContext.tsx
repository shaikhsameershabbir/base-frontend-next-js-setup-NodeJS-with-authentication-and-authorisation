'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { marketsAPI } from '@/lib/api/auth';
import { betAPI } from '@/lib/api/bet';

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
  weekStartDate: string;
  weekEndDate: string;
  weekDays: number;
  results: {
    [key: string]: {
      open: number | null;
      main: number | null;
      close: number | null;
      openDeclationTime: string | null;
      closeDeclationTime: string | null;
    };
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
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketResults, setMarketResults] = useState<Record<string, MarketResult>>({});
  const [marketStatuses, setMarketStatuses] = useState<Record<string, MarketStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMountedRef = React.useRef(true);
  const isFetchingRef = React.useRef(false);
  const statusFetchingRef = React.useRef<Set<string>>(new Set());

  const fetchData = async () => {
    // Prevent duplicate calls during initialization
    if (isInitialized && markets.length > 0) {
      console.log('MarketDataContext: Skipping fetchData - already initialized');
      return;
    }

    // Prevent concurrent fetch calls
    if (isFetchingRef.current) {
      console.log('MarketDataContext: Skipping fetchData - already fetching');
      return;
    }

    isFetchingRef.current = true;

    try {
      console.log('MarketDataContext: Starting fetchData');
      setLoading(true);
      setError(null);

      // Fetch markets
      console.log('MarketDataContext: Fetching assigned markets');
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

      console.log('MarketDataContext: Setting markets data', marketsData.length);
      console.log('MarketDataContext: Sample market data:', marketsData[0]);
      setMarkets(marketsData);

      // Fetch all market results in a single API call
      const marketIds = marketsData.map(market => market._id);
      console.log('MarketDataContext: Fetching market results for', marketIds.length, 'markets');
      const resultsResponse = await betAPI.getAllMarketResults(marketIds);

      if (resultsResponse.success && resultsResponse.data) {
        const resultsMap: Record<string, MarketResult> = {};
        resultsResponse.data.forEach((item: any) => {
          if (item.success && item.data) {
            resultsMap[item.marketId] = item.data;
          }
        });
        console.log('MarketDataContext: Setting market results', Object.keys(resultsMap).length);
        setMarketResults(resultsMap);
      }

      setIsInitialized(true);
    } catch (error: any) {
      console.error('MarketDataContext: Error fetching data', error);
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
    // Prevent duplicate calls for the same market
    if (statusFetchingRef.current.has(marketId)) {
      console.log(`MarketDataContext: Skipping status fetch for ${marketId} - already fetching`);
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
      console.log(`MarketDataContext: Fetching status for market ${marketId}`);
      const response = await betAPI.getMarketStatus(marketId);
      if (response.success && response.data) {
        const statusData = response.data;
        updateMarketStatus(marketId, statusData);
        return statusData;
      }
    } catch (error) {
      console.error(`MarketDataContext: Error fetching status for market ${marketId}:`, error);
    } finally {
      // Remove from fetching set
      statusFetchingRef.current.delete(marketId);
    }

    return null;
  };

  // Fetch data on mount
  useEffect(() => {
    if (isMountedRef.current) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

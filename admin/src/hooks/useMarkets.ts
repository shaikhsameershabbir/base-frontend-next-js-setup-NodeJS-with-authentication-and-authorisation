"use client"
import { useState, useCallback } from 'react';
import { marketsAPI, Market } from '@/lib/api-service';

interface UseMarketsReturn {
    markets: Market[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    getMarkets: (page?: number, limit?: number, status?: string) => Promise<void>;
    getMarketById: (marketId: string) => Promise<Market | null>;
    createMarket: (data: { name: string; status: string }) => Promise<boolean>;
    updateMarket: (marketId: string, data: Partial<Market>) => Promise<boolean>;
    deleteMarket: (marketId: string) => Promise<boolean>;
    updateMarketStatus: (marketId: string, status: string) => Promise<boolean>;
    clearError: () => void;
}

export function useMarkets(): UseMarketsReturn {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const getMarkets = useCallback(async (page = 1, limit = 10, status = '') => {
        try {
            setLoading(true);
            setError(null);
            const response = await marketsAPI.getMarkets(page, limit, status);

            if (response.success && response.data) {
                setMarkets(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Failed to fetch markets');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch markets');
        } finally {
            setLoading(false);
        }
    }, []);

    const getMarketById = useCallback(async (marketId: string): Promise<Market | null> => {
        try {
            setError(null);
            const response = await marketsAPI.getMarketById(marketId);

            if (response.success && response.data?.market) {
                return response.data.market;
            } else {
                setError(response.message || 'Failed to fetch market');
                return null;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch market');
            return null;
        }
    }, []);

    const createMarket = useCallback(async (data: { name: string; status: string }): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await marketsAPI.createMarket(data);

            if (response.success) {
                // Refresh markets list
                await getMarkets(pagination.page, pagination.limit);
                return true;
            } else {
                setError(response.message || 'Failed to create market');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create market');
            return false;
        } finally {
            setLoading(false);
        }
    }, [getMarkets, pagination.page, pagination.limit]);

    const updateMarket = useCallback(async (marketId: string, data: Partial<Market>): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await marketsAPI.updateMarket(marketId, data);

            if (response.success) {
                // Update market in the list
                setMarkets(prevMarkets =>
                    prevMarkets.map(market =>
                        market._id === marketId
                            ? { ...market, ...response.data?.market }
                            : market
                    )
                );
                return true;
            } else {
                setError(response.message || 'Failed to update market');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update market');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteMarket = useCallback(async (marketId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await marketsAPI.deleteMarket(marketId);

            if (response.success) {
                // Remove market from the list
                setMarkets(prevMarkets => prevMarkets.filter(market => market._id !== marketId));
                return true;
            } else {
                setError(response.message || 'Failed to delete market');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to delete market');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMarketStatus = useCallback(async (marketId: string, status: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await marketsAPI.updateMarketStatus(marketId, status);

            if (response.success && response.data?.market) {
                // Update market in the list
                setMarkets(prevMarkets =>
                    prevMarkets.map(market =>
                        market._id === marketId
                            ? { ...market, status: response.data.market.status }
                            : market
                    )
                );
                return true;
            } else {
                setError(response.message || 'Failed to update market status');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update market status');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        markets,
        loading,
        error,
        pagination,
        getMarkets,
        getMarketById,
        createMarket,
        updateMarket,
        deleteMarket,
        updateMarketStatus,
        clearError,
    };
} 
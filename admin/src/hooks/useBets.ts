import { useState, useEffect, useCallback } from 'react';
import { betAPI, Bet, BetFilters, BetSummary, HierarchyOption } from '@/lib/betApi';

interface UseBetsReturn {
    bets: Bet[];
    loading: boolean;
    error: string | null;
    summary: BetSummary | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalBets: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        limit: number;
    } | null;
    getBets: (filters?: BetFilters) => Promise<void>;
    getBetById: (betId: string) => Promise<Bet | null>;
    getHierarchyOptions: (level: string, parentId?: string) => Promise<HierarchyOption[]>;
    getAdminHierarchyOptions: (level: string, filters?: { adminId?: string; distributorId?: string; agentId?: string }) => Promise<HierarchyOption[]>;
    clearError: () => void;
}

export function useBets(): UseBetsReturn {
    const [bets, setBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<BetSummary | null>(null);
    const [pagination, setPagination] = useState<{
        currentPage: number;
        totalPages: number;
        totalBets: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        limit: number;
    } | null>(null);

    const getBets = useCallback(async (filters: BetFilters = {}) => {
        try {
            setLoading(true);
            setError(null);

            const response = await betAPI.getBets(filters);

            if (response.success) {
                setBets(response.data.bets);
                setSummary(response.data.summary);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Failed to fetch bets');
            }
        } catch (err) {
            console.error('Error fetching bets:', err);
            setError('Failed to fetch bets. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const getBetById = useCallback(async (betId: string): Promise<Bet | null> => {
        try {
            setError(null);

            const response = await betAPI.getBetById(betId);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch bet details');
                return null;
            }
        } catch (err) {
            console.error('Error fetching bet details:', err);
            setError('Failed to fetch bet details. Please try again.');
            return null;
        }
    }, []);

    const getHierarchyOptions = useCallback(async (level: string, parentId?: string): Promise<HierarchyOption[]> => {
        try {
            setError(null);

            const response = await betAPI.getHierarchyOptions(level, parentId);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch hierarchy options');
                return [];
            }
        } catch (err) {
            console.error('Error fetching hierarchy options:', err);
            setError('Failed to fetch hierarchy options. Please try again.');
            return [];
        }
    }, []);

    const getAdminHierarchyOptions = useCallback(async (level: string, filters?: { adminId?: string; distributorId?: string; agentId?: string }): Promise<HierarchyOption[]> => {
        try {
            setError(null);

            const response = await betAPI.getAdminHierarchyOptions(level, filters);

            if (response.success) {
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch hierarchy options');
                return [];
            }
        } catch (err) {
            console.error('Error fetching hierarchy options:', err);
            setError('Failed to fetch hierarchy options. Please try again.');
            return [];
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Load initial data on mount - only once
    useEffect(() => {
        // Only load if we don't have any bets yet (initial load)
        if (bets.length === 0 && !loading) {
            getBets({ dateFilter: 'today' });
        }
    }, []); // Empty dependency array - only run once on mount

    return {
        bets,
        loading,
        error,
        summary,
        pagination,
        getBets,
        getBetById,
        getHierarchyOptions,
        getAdminHierarchyOptions,
        clearError
    };
} 
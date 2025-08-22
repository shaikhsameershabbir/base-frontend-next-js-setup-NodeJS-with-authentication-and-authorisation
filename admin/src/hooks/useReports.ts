import { useState, useEffect, useCallback } from 'react';
import { ReportsApi, ReportsResponse, BetStats } from '@/lib/reportsApi';

export function useReports() {
    const [reports, setReports] = useState<ReportsResponse | null>(null);
    const [stats, setStats] = useState<BetStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentFilters, setCurrentFilters] = useState<{
        startDate?: string;
        endDate?: string;
    }>({});

    const fetchReports = useCallback(async (params?: {
        startDate?: string;
        endDate?: string;
    }) => {
        try {
            setLoading(true);
            setError(null);
            const data = await ReportsApi.getBetReports(params);
            setReports(data);
            // Store current filters for refresh functionality
            if (params) {
                setCurrentFilters(params);
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            setError(null);
            const data = await ReportsApi.getBetStats();
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        }
    }, []);

    const refreshReports = useCallback((params?: {
        startDate?: string;
        endDate?: string;
    }) => {
        // Use provided params or fall back to stored current filters
        const filtersToUse = params || currentFilters;
        fetchReports(filtersToUse);
    }, [fetchReports, currentFilters]);

    const refreshStats = useCallback(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        reports,
        stats,
        loading,
        error,
        fetchReports,
        fetchStats,
        refreshReports,
        refreshStats,
        currentFilters,
    };
}

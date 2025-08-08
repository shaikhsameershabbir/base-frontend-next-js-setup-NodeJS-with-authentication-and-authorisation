import { useState, useEffect } from 'react';
import { getDashboardStats, DashboardStats } from '@/lib/adminApi';

export const useDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDashboardStats();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const refreshStats = () => {
        fetchStats();
    };

    return {
        stats,
        loading,
        error,
        refreshStats
    };
};

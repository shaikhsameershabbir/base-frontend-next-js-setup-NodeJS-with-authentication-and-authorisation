"use client"
import { AdminLayout } from '@/components/layout/admin-layout'
import apiClient from '@/lib/api-client';
import React, { useEffect, useState } from 'react'

function LoadPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLoads = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiClient.get('/load/getAllLoads');
                if (res.status === 200) {
                    setData(res.data.data);
                } else {
                    setError('Failed to fetch loads');
                }
            } catch (err: any) {
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        fetchLoads();
    }, []);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Load Management</h1>
                        <p className="text-secondary">View and manage all loads with hierarchical filtering</p>
                    </div>
                </div>
                <div>
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-600">{error}</p>}
                    {data && (
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

export default LoadPage
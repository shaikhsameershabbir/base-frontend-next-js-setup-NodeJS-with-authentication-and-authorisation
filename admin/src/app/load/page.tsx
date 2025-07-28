"use client"

import { useState, useEffect } from 'react';
import { loadApi, type LoadResponse, type LoadData, type CompleteTotals } from '@/lib/loadApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AdminLayout } from '@/components/layout/admin-layout';

export default function LoadPage() {
    const [data, setData] = useState<LoadResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedGameType, setSelectedGameType] = useState<string>('all');

    useEffect(() => {
        fetchLoadData();
    }, []);

    const fetchLoadData = async (date?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await loadApi.getAllLoads(date);
            setData(response);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleDateSubmit = () => {
        if (selectedDate) {
            fetchLoadData(selectedDate);
        }
    };

    const handleTodayClick = () => {
        setSelectedDate('');
        fetchLoadData();
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getBetTypeColor = (betType: string) => {
        switch (betType) {
            case 'open': return 'bg-green-900/20 text-green-400 border-green-700';
            case 'close': return 'bg-red-900/20 text-red-400 border-red-700';
            case 'both': return 'bg-blue-900/20 text-blue-400 border-blue-700';
            default: return 'bg-gray-900/20 text-gray-400 border-gray-700';
        }
    };

    const getGameTypeColor = (gameType: string) => {
        const colors = {
            single: 'bg-purple-900/20 text-purple-400 border-purple-700',
            jodi: 'bg-indigo-900/20 text-indigo-400 border-indigo-700',
            family_panel: 'bg-pink-900/20 text-pink-400 border-pink-700',
            half_sangam_open: 'bg-orange-900/20 text-orange-400 border-orange-700',
            half_sangam_close: 'bg-yellow-900/20 text-yellow-400 border-yellow-700',
            full_sangam: 'bg-teal-900/20 text-teal-400 border-teal-700',
        };
        return colors[gameType as keyof typeof colors] || 'bg-gray-900/20 text-gray-400 border-gray-700';
    };

    const renderGameData = (gameType: string, gameData: any) => {
        const betTypes = Object.keys(gameData);

        return (
            <Card key={gameType} className="mb-6 bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Badge className={getGameTypeColor(gameType)}>
                            {gameType.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        {data?.completeTotals[gameType] && (
                            <span className="text-sm text-gray-400">
                                Total: {formatAmount((data.completeTotals[gameType] as any)?.total || 0)}
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {betTypes.map((betType) => (
                            <div key={betType} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className={getBetTypeColor(betType)}>
                                        {betType.toUpperCase()}
                                    </Badge>
                                    {data?.completeTotals[gameType] && (
                                        <span className="text-sm font-medium text-gray-300">
                                            {formatAmount((data.completeTotals[gameType] as any)?.[betType] || 0)}
                                        </span>
                                    )}
                                </div>
                                <div className="bg-gray-900/50 rounded-lg p-3 max-h-40 overflow-y-auto border border-gray-700">
                                    {Object.entries(gameData[betType]).length > 0 ? (
                                        <div className="grid grid-cols-3 gap-1 text-xs">
                                            {Object.entries(gameData[betType])
                                                .sort(([a], [b]) => a.localeCompare(b))
                                                .map(([key, value]) => (
                                                    <div key={key} className="flex justify-between p-1 bg-gray-800 rounded border border-gray-700">
                                                        <span className="font-medium text-gray-300">{key}</span>
                                                        <span className="text-green-400 font-bold">
                                                            {formatAmount(value as number)}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center text-sm">No data</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderStatistics = () => {
        if (!data?.statistics) return null;

        const stats = data.statistics;
        const totals = data.completeTotals;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Total Bets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalBets}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {formatAmount(stats.totalAmount)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Grand Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">
                            {formatAmount(totals.total)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Date Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-gray-300">
                            {new Date(data.debug.dateRange.start).toLocaleDateString()} -
                            {new Date(data.debug.dateRange.end).toLocaleDateString()}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderBetTypeStats = () => {
        if (!data?.statistics) return null;

        const betTypeStats = data.statistics.betTypeStats;

        return (
            <Card className="mb-6 bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Bet Type Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(betTypeStats).map(([betType, stats]) => (
                            <div key={betType} className="text-center">
                                <Badge className={`mb-2 ${getBetTypeColor(betType)}`}>
                                    {betType.toUpperCase()}
                                </Badge>
                                <div className="space-y-1">
                                    <div className="text-sm text-gray-400">Count: {stats.count}</div>
                                    <div className="text-lg font-bold text-white">{formatAmount(stats.amount)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 bg-black min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading load data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 bg-black min-h-screen">
                <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <Button onClick={() => fetchLoadData()}>Retry</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto p-6 bg-black min-h-screen">
                <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-gray-400">No data available</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <AdminLayout>

        <div className="container mx-auto p-6 space-y-6 bg-black min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Load Management</h1>
                    <p className="text-gray-400">View and analyze betting loads</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-auto"
                        />
                        <Button onClick={handleDateSubmit} disabled={!selectedDate}>
                            Load Date
                        </Button>
                    </div>
                    <Button variant="outline" onClick={handleTodayClick}>
                        Today
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            {renderStatistics()}

            {/* Bet Type Stats */}
            {renderBetTypeStats()}

            {/* Game Type Data */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-white">Game Loads</h2>
                <div className="space-y-6">
                    {Object.entries(data.data)
                        .filter(([gameType]) => selectedGameType === 'all' || gameType === selectedGameType)
                        .map(([gameType, gameData]) => renderGameData(gameType, gameData))}
                </div>
            </div>

            {/* Game Type Filter */}
            <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Filter by Game Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedGameType === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedGameType('all')}
                            size="sm"
                        >
                            All Games
                        </Button>
                        {Object.keys(data.data).map((gameType) => (
                            <Button
                                key={gameType}
                                variant={selectedGameType === gameType ? 'default' : 'outline'}
                                onClick={() => setSelectedGameType(gameType)}
                                size="sm"
                            >
                                {gameType.replace(/_/g, ' ').toUpperCase()}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
        </AdminLayout>

    );
}
"use client"

import { useState, useEffect } from 'react';
import { loadApi, type LoadResponse, type LoadData, type CompleteTotals, type HierarchicalUser, type Market } from '@/lib/loadApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/layout/admin-layout';

export default function LoadPage() {
    const [data, setData] = useState<LoadResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedGameType, setSelectedGameType] = useState<string>('all');

    // Hierarchical filter states
    const [hierarchicalUsers, setHierarchicalUsers] = useState<Record<string, HierarchicalUser[]>>({});
    const [assignedMarkets, setAssignedMarkets] = useState<Market[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedMarket, setSelectedMarket] = useState<string>('all');
    const [selectedUserRole, setSelectedUserRole] = useState<string>('all');
    const [loadingFilters, setLoadingFilters] = useState(false);

    // Cascading selection states
    const [selectedAdmin, setSelectedAdmin] = useState<string>('all');
    const [selectedDistributor, setSelectedDistributor] = useState<string>('all');
    const [selectedAgent, setSelectedAgent] = useState<string>('all');
    const [selectedPlayer, setSelectedPlayer] = useState<string>('all');

    // Status tracking
    const [currentDataUser, setCurrentDataUser] = useState<string>('all');

    useEffect(() => {
        fetchLoadData();
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            setLoadingFilters(true);
            const [usersResponse, marketsResponse] = await Promise.all([
                loadApi.getHierarchicalUsers(),
                loadApi.getAssignedMarkets()
            ]);
            setHierarchicalUsers(usersResponse.data);
            setAssignedMarkets(marketsResponse.data);
        } catch (err: any) {
            console.error('Failed to fetch filters:', err);
        } finally {
            setLoadingFilters(false);
        }
    };

    const fetchLoadData = async (date?: string, userId?: string, marketId?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await loadApi.getAllLoads(date, userId, marketId);
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
            const userId = selectedUser !== 'all' ? selectedUser : undefined;
            setCurrentDataUser(userId || 'all');
            fetchLoadData(selectedDate, userId, selectedMarket !== 'all' ? selectedMarket : undefined);
        }
    };

    const handleTodayClick = () => {
        setSelectedDate('');
        const userId = selectedUser !== 'all' ? selectedUser : undefined;
        setCurrentDataUser(userId || 'all');
        fetchLoadData(undefined, userId, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleUserChange = (userId: string) => {
        setSelectedUser(userId);
        fetchLoadData(selectedDate || undefined, userId !== 'all' ? userId : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleMarketChange = (marketId: string) => {
        setSelectedMarket(marketId);
        const userId = selectedUser !== 'all' ? selectedUser : undefined;
        setCurrentDataUser(userId || 'all');
        fetchLoadData(selectedDate || undefined, userId, marketId !== 'all' ? marketId : undefined);
    };

    const handleUserRoleChange = (role: string) => {
        setSelectedUserRole(role);
        setSelectedUser('all'); // Reset user selection when role changes
    };

    const handleAdminChange = (adminId: string) => {
        setSelectedAdmin(adminId);
        setSelectedDistributor('all');
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setSelectedUser(adminId !== 'all' ? adminId : 'all');
        setCurrentDataUser(adminId !== 'all' ? adminId : 'all');
        fetchLoadData(selectedDate || undefined, adminId !== 'all' ? adminId : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleDistributorChange = (distributorId: string) => {
        setSelectedDistributor(distributorId);
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setSelectedUser(distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchLoadData(selectedDate || undefined, distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleAgentChange = (agentId: string) => {
        setSelectedAgent(agentId);
        setSelectedPlayer('all');
        setSelectedUser(agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchLoadData(selectedDate || undefined, agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handlePlayerChange = (playerId: string) => {
        setSelectedPlayer(playerId);
        setSelectedUser(playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchLoadData(selectedDate || undefined, playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const clearFilters = () => {
        setSelectedUser('all');
        setSelectedMarket('all');
        setSelectedUserRole('all');
        setSelectedDate('');
        setSelectedAdmin('all');
        setSelectedDistributor('all');
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setCurrentDataUser('all');
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

    const renderFilters = () => {
        return (
            <Card className="mb-6 bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Filters</CardTitle>
                    {/* Status Indicator */}
                    {currentDataUser !== 'all' && (
                        <div className="mt-2">
                            <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-700">
                                📊 Showing hierarchical data for selected user and all downline
                            </Badge>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Date Filter */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Date</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="flex-1"
                                />
                                <Button onClick={handleDateSubmit} disabled={!selectedDate} size="sm">
                                    Load
                                </Button>
                            </div>
                            <Button variant="outline" onClick={handleTodayClick} size="sm">
                                Today
                            </Button>
                        </div>

                        {/* Market Filter */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Market</Label>
                            <Select value={selectedMarket} onValueChange={handleMarketChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select market" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Markets</SelectItem>
                                    {assignedMarkets.map((market) => (
                                        <SelectItem key={market._id} value={market._id}>
                                            {market.marketName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Hierarchical User Selection */}
                        <div className="space-y-4">
                            <Label className="text-gray-300">User Hierarchy</Label>

                            {/* Admin Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Admin</Label>
                                <Select value={selectedAdmin} onValueChange={handleAdminChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select admin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Admins</SelectItem>
                                        {hierarchicalUsers.admin?.map((admin) => (
                                            <SelectItem key={admin._id} value={admin._id}>
                                                {admin.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Distributor Selection - Only show if admin is selected */}
                            {selectedAdmin !== 'all' && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Distributor</Label>
                                    <Select value={selectedDistributor} onValueChange={handleDistributorChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select distributor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Distributors</SelectItem>
                                            {hierarchicalUsers.distributor?.filter(dist => dist.parentId === selectedAdmin).map((distributor) => (
                                                <SelectItem key={distributor._id} value={distributor._id}>
                                                    {distributor.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Agent Selection - Only show if distributor is selected */}
                            {selectedDistributor !== 'all' && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Agent</Label>
                                    <Select value={selectedAgent} onValueChange={handleAgentChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select agent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Agents</SelectItem>
                                            {hierarchicalUsers.agent?.filter(agent => agent.parentId === selectedDistributor).map((agent) => (
                                                <SelectItem key={agent._id} value={agent._id}>
                                                    {agent.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Player Selection - Only show if agent is selected */}
                            {selectedAgent !== 'all' && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Player</Label>
                                    <Select value={selectedPlayer} onValueChange={handlePlayerChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select player" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Players</SelectItem>
                                            {hierarchicalUsers.player?.filter(player => player.parentId === selectedAgent).map((player) => (
                                                <SelectItem key={player._id} value={player._id}>
                                                    {player.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="mt-4">
                        <Button variant="outline" onClick={clearFilters} size="sm">
                            Clear All Filters
                        </Button>
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
                        <p className="text-gray-400">View and analyze betting loads with hierarchical filters</p>
                    </div>
                </div>

                {/* Filters */}
                {renderFilters()}

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
"use client"

import { useState, useEffect } from 'react';
import { winnerApi, type WinnerResponse, type WinnerData, type CompleteTotals, type HierarchicalUser, type Market } from '@/lib/winnerApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/layout/admin-layout';

export default function WinnerPage() {
    const [data, setData] = useState<WinnerResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedGameType, setSelectedGameType] = useState<string>('all');
    const [selectedBetType, setSelectedBetType] = useState<string>('all'); // 'all', 'open', 'close'

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
        fetchWinnerData();
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            setLoadingFilters(true);
            const [usersResponse, marketsResponse] = await Promise.all([
                winnerApi.getHierarchicalUsers(),
                winnerApi.getAssignedMarkets()
            ]);
            setHierarchicalUsers(usersResponse.data);
            setAssignedMarkets(marketsResponse.data);
        } catch (err: any) {
            console.error('Failed to fetch filters:', err);
        } finally {
            setLoadingFilters(false);
        }
    };

    const fetchWinnerData = async (date?: string, userId?: string, marketId?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await winnerApi.getAllWinners(date, userId, marketId);
            setData(response);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch winner data');
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
            fetchWinnerData(selectedDate, userId, selectedMarket !== 'all' ? selectedMarket : undefined);
        }
    };

    const handleTodayClick = () => {
        setSelectedDate('');
        const userId = selectedUser !== 'all' ? selectedUser : undefined;
        setCurrentDataUser(userId || 'all');
        fetchWinnerData(undefined, userId, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleUserChange = (userId: string) => {
        setSelectedUser(userId);
        fetchWinnerData(selectedDate || undefined, userId !== 'all' ? userId : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleMarketChange = (marketId: string) => {
        setSelectedMarket(marketId);
        const userId = selectedUser !== 'all' ? selectedUser : undefined;
        setCurrentDataUser(userId || 'all');
        fetchWinnerData(selectedDate || undefined, userId, marketId !== 'all' ? marketId : undefined);
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
        fetchWinnerData(selectedDate || undefined, adminId !== 'all' ? adminId : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleDistributorChange = (distributorId: string) => {
        setSelectedDistributor(distributorId);
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setSelectedUser(distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchWinnerData(selectedDate || undefined, distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleAgentChange = (agentId: string) => {
        setSelectedAgent(agentId);
        setSelectedPlayer('all');
        setSelectedUser(agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchWinnerData(selectedDate || undefined, agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handlePlayerChange = (playerId: string) => {
        setSelectedPlayer(playerId);
        setSelectedUser(playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchWinnerData(selectedDate || undefined, playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleBetTypeChange = (betType: string) => {
        setSelectedBetType(betType);
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
        setSelectedBetType('all');
        setCurrentDataUser('all');
        fetchWinnerData();
    };

    // Function to organize data by game types
    const organizeDataByGameTypes = (rawData: any) => {
        if (!rawData || !rawData.data) return null;

        const organizedData: any = {
            single: {},
            double: {},
            panna: {}
        };

        // Process each game type
        Object.entries(rawData.data).forEach(([gameType, gameData]: [string, any]) => {
            // Determine which bet type to use based on filter
            let betTypeData: any = {};

            if (selectedBetType === 'all') {
                // Combine open, close, and both data
                betTypeData = {
                    ...(gameData.open || {}),
                    ...(gameData.close || {}),
                    ...(gameData.both || {})
                };
            } else if (selectedBetType === 'open' && gameData.open) {
                betTypeData = gameData.open;
            } else if (selectedBetType === 'close' && gameData.close) {
                betTypeData = gameData.close;
            } else if (selectedBetType === 'both' && gameData.both) {
                betTypeData = gameData.both;
            }

            // Categorize numbers by game type
            Object.entries(betTypeData).forEach(([number, amount]: [string, any]) => {
                const numLength = number.length;

                if (numLength === 1) {
                    // Single digit (0-9)
                    organizedData.single[number] = amount;
                } else if (numLength === 2) {
                    // Double digit (00-99)
                    organizedData.double[number] = amount;
                } else if (numLength === 3) {
                    // Triple digit (000-999)
                    organizedData.panna[number] = amount;
                }
            });
        });

        return organizedData;
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Date Filter */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Date Filter</Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="flex-1"
                                />
                                <Button onClick={handleDateSubmit} disabled={!selectedDate} size="sm" className="whitespace-nowrap">
                                    Load
                                </Button>
                            </div>
                            <Button variant="outline" onClick={handleTodayClick} size="sm" className="w-full sm:w-auto">
                                Today
                            </Button>
                        </div>

                        {/* Market Filter */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Market Filter</Label>
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

                        {/* Bet Type Filter */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Bet Type Filter</Label>
                            <Select value={selectedBetType} onValueChange={handleBetTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select bet type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Bets</SelectItem>
                                    <SelectItem value="open">Open Bets</SelectItem>
                                    <SelectItem value="close">Close Bets</SelectItem>
                                    <SelectItem value="both">Both Bets</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Hierarchical User Selection */}
                        <div className="space-y-3 lg:col-span-2 xl:col-span-1">
                            <Label className="text-gray-300 font-medium">User Hierarchy</Label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
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
                    </div>

                    {/* Clear Filters Button */}
                    <div className="mt-6 flex justify-center">
                        <Button variant="outline" onClick={clearFilters} size="sm" className="px-6">
                            Clear All Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderJsonData = () => {
        if (!data) return null;

        // Organize data by game types
        const organizedData = organizeDataByGameTypes(data);

        const displayData = {
            originalData: data,
            organizedByGameTypes: organizedData,
            filters: {
                selectedBetType,
                selectedDate,
                selectedMarket,
                selectedUser,
                selectedAdmin,
                selectedDistributor,
                selectedAgent,
                selectedPlayer
            }
        };

        return (
            <Card className="mb-6 bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">
                        Winner Data (JSON Format) - {selectedBetType !== 'all' ? `${selectedBetType.toUpperCase()} Bets` : 'All Bets'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-screen">
                        <pre className="text-green-400 text-sm whitespace-pre-wrap">
                            {JSON.stringify(displayData, null, 2)}
                        </pre>
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
                        <p className="text-gray-400">Loading winner data...</p>
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
                            <Button onClick={() => fetchWinnerData()}>Retry</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6 bg-black min-h-screen">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Winner Management</h1>
                        <p className="text-gray-400 text-sm sm:text-base">View and analyze winner data with hierarchical filters</p>
                    </div>
                </div>

                {/* Filters */}
                {renderFilters()}

                {/* JSON Data Display */}
                {renderJsonData()}
            </div>
        </AdminLayout>
    );
}
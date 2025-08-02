"use client"

import { useState, useEffect } from 'react';
import { loadApiV2, type LoadV2Response, type HierarchicalUser, type Market } from '@/lib/loadApiV2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/layout/admin-layout';
import { singlePannaNumbers, doublePannaNumbers, triplePannaNumbers, jodiNumbers, doubleNumbers } from '@/components/winner/constants';

// Types for processed data
interface ProcessedBetData {
    singleNumbers: { [key: string]: number };
    doubleNumbers: { [key: string]: number };
    singlePanna: { [key: string]: number };
    doublePanna: { [key: string]: number };
    triplePanna: { [key: string]: number };
    halfSangamOpen: { [key: string]: number };
    halfSangamClose: { [key: string]: number };
    fullSangam: { [key: string]: number };
}

export default function LoadV2Page() {
    const [data, setData] = useState<LoadV2Response | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedBetType, setSelectedBetType] = useState<string>('all');

    // Hierarchical filter states
    const [hierarchicalUsers, setHierarchicalUsers] = useState<Record<string, HierarchicalUser[]>>({});
    const [assignedMarkets, setAssignedMarkets] = useState<Market[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedMarket, setSelectedMarket] = useState<string>('all');
    const [loadingFilters, setLoadingFilters] = useState(false);

    // Cascading selection states
    const [selectedAdmin, setSelectedAdmin] = useState<string>('all');
    const [selectedDistributor, setSelectedDistributor] = useState<string>('all');
    const [selectedAgent, setSelectedAgent] = useState<string>('all');
    const [selectedPlayer, setSelectedPlayer] = useState<string>('all');

    // Status tracking
    const [currentDataUser, setCurrentDataUser] = useState<string>('all');

    // Cutting filter state
    const [cuttingAmount, setCuttingAmount] = useState<string>('');

    // Processed data state
    const [processedData, setProcessedData] = useState<ProcessedBetData | null>(null);

    useEffect(() => {
        fetchLoadData();
        fetchFilters();
    }, []);

    // Process bet data when data changes
    useEffect(() => {
        if (data) {
            const processed = processBetData(data.data.bets, selectedBetType);
            setProcessedData(processed);
        }
    }, [data, selectedBetType]);

    const processBetData = (bets: any[], betTypeFilter: string): ProcessedBetData => {
        const result: ProcessedBetData = {
            singleNumbers: {},
            doubleNumbers: {},
            singlePanna: {},
            doublePanna: {},
            triplePanna: {},
            halfSangamOpen: {},
            halfSangamClose: {},
            fullSangam: {}
        };

        bets.forEach(bet => {
            // Filter by betType
            if (betTypeFilter !== 'all') {
                if (betTypeFilter === 'open' && bet.betType !== 'open' && bet.betType !== 'both') {
                    return;
                }
                if (betTypeFilter === 'close' && bet.betType !== 'close' && bet.betType !== 'both') {
                    return;
                }
            }

            const selectedNumbers = bet.selectedNumbers || {};

            Object.entries(selectedNumbers).forEach(([key, amount]) => {
                const numKey = key.toString();
                const numAmount = Number(amount);

                // Single Numbers (0-9)
                if (/^[0-9]$/.test(numKey)) {
                    result.singleNumbers[numKey] = (result.singleNumbers[numKey] || 0) + numAmount;
                }

                // Double Numbers (00-99)
                if (/^[0-9]{2}$/.test(numKey)) {
                    result.doubleNumbers[numKey] = (result.doubleNumbers[numKey] || 0) + numAmount;
                }

                // Single Panna (3 digits, matches singlePannaNumbers)
                if (/^[0-9]{3}$/.test(numKey) && singlePannaNumbers.includes(parseInt(numKey))) {
                    result.singlePanna[numKey] = (result.singlePanna[numKey] || 0) + numAmount;
                }

                // Double Panna (3 digits, matches doublePannaNumbers)
                if (/^[0-9]{3}$/.test(numKey) && doublePannaNumbers.includes(parseInt(numKey))) {
                    result.doublePanna[numKey] = (result.doublePanna[numKey] || 0) + numAmount;
                }

                // Triple Panna (3 digits, matches triplePannaNumbers)
                if (/^[0-9]{3}$/.test(numKey) && triplePannaNumbers.includes(numKey)) {
                    result.triplePanna[numKey] = (result.triplePanna[numKey] || 0) + numAmount;
                }

                // Half Sangam Open (pattern: digitX3digit)
                if (/^[0-9]X[0-9]{3}$/.test(numKey)) {
                    result.halfSangamOpen[numKey] = (result.halfSangamOpen[numKey] || 0) + numAmount;
                }

                // Half Sangam Close (pattern: 3digitXdigit)
                if (/^[0-9]{3}X[0-9]$/.test(numKey)) {
                    result.halfSangamClose[numKey] = (result.halfSangamClose[numKey] || 0) + numAmount;
                }

                // Full Sangam (pattern: 3digit-2digit-3digit, no X)
                if (/^[0-9]{3}-[0-9]{2}-[0-9]{3}$/.test(numKey)) {
                    result.fullSangam[numKey] = (result.fullSangam[numKey] || 0) + numAmount;
                }
            });
        });

        return result;
    };

    const fetchFilters = async () => {
        try {
            setLoadingFilters(true);
            const [usersResponse, marketsResponse] = await Promise.all([
                loadApiV2.getHierarchicalUsers(),
                loadApiV2.getAssignedMarkets()
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
            const response = await loadApiV2.getAllLoads(date, userId, marketId);
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

    const handleCuttingAmountChange = (value: string) => {
        setCuttingAmount(value);
    };

    const handleBetTypeChange = (betType: string) => {
        setSelectedBetType(betType);
    };

    const clearFilters = () => {
        setSelectedUser('all');
        setSelectedMarket('all');
        setSelectedDate('');
        setSelectedAdmin('all');
        setSelectedDistributor('all');
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setCuttingAmount(''); // Clear cutting amount
        setSelectedBetType('all'); // Clear bet type filter
        setCurrentDataUser('all');
        fetchLoadData();
    };

    const renderFilters = () => {
        return (
            <Card className="mb-6 bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Filters</CardTitle>
                    {/* Status Indicator */}
                    {currentDataUser !== 'all' && (
                        <div className="mt-2">
                            <span className="text-sm text-blue-400">
                                📊 Showing hierarchical data for selected user and all downline
                            </span>
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
                                    <SelectItem value="all">All Bet Types</SelectItem>
                                    <SelectItem value="open">Open Only</SelectItem>
                                    <SelectItem value="close">Close Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Cutting Amount Filter */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Cutting Amount</Label>
                            <Input
                                type="number"
                                placeholder="Enter cutting amount"
                                value={cuttingAmount}
                                onChange={(e) => handleCuttingAmountChange(e.target.value)}
                                className="flex-1"
                            />
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

    const renderProcessedData = () => {
        if (!processedData) return null;

        return (
            <Card className="mb-6 bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Processed Bet Data</CardTitle>
                    <div className="text-sm text-gray-400">
                        Filtered by: {selectedBetType === 'all' ? 'All Bet Types' : selectedBetType === 'open' ? 'Open Only' : 'Close Only'}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-96">
                        <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                            {JSON.stringify(processedData, null, 2)}
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

    return (
        <AdminLayout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6 bg-black min-h-screen">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Load V2 - JSON View</h1>
                        <p className="text-gray-400 text-sm sm:text-base">View raw load data in JSON format with filters</p>
                    </div>
                </div>

                {/* Filters */}
                {renderFilters()}

                {/* Processed Data Display */}
                {processedData && renderProcessedData()}

                {/* JSON Data Display */}
                {data && (
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white">Raw JSON Data</CardTitle>
                            <div className="text-sm text-gray-400">
                                Total Bets: {data.data.summary.totalBets} |
                                Total Amount: ₹{data.data.summary.totalAmount.toLocaleString()} |
                                Unique Users: {data.data.summary.uniqueUsers} |
                                Unique Markets: {data.data.summary.uniqueMarkets}
                                {cuttingAmount && ` | Cutting Amount: ₹${parseInt(cuttingAmount).toLocaleString()}`}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-96">
                                <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!data && !loading && (
                    <Card className="bg-gray-900 border-gray-700">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-gray-400">No data available. Use filters to load data.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
} 
"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { BetDetailModal } from '@/components/modals/BetDetailModal';
import { useBets } from '@/hooks/useBets';
import { BetFilters, HierarchyOption } from '@/lib/betApi';
import {
    Search,
    Filter,
    Eye,
    Calendar,
    User,
    Target,
    DollarSign,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Activity
} from 'lucide-react';

export default function BetsPage() {
    const {
        bets,
        loading,
        error,
        summary,
        pagination,
        getBets,
        getHierarchyOptions,
        getAdminHierarchyOptions,
        clearError
    } = useBets();

    const [filters, setFilters] = useState<BetFilters>({
        dateFilter: 'today',
        page: 1,
        limit: 10
    });

    const [hierarchyOptions, setHierarchyOptions] = useState<{
        admins: HierarchyOption[];
        distributors: HierarchyOption[];
        agents: HierarchyOption[];
        players: HierarchyOption[];
    }>({
        admins: [],
        distributors: [],
        agents: [],
        players: []
    });

    const [selectedBetId, setSelectedBetId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string>('');

    // Memoize the loadHierarchyOptions function
    const loadHierarchyOptions = useCallback(async () => {
        if (!currentUserRole) return;

        try {
            if (currentUserRole === 'superadmin') {
                // Load admins for superadmin
                const admins = await getAdminHierarchyOptions('admin');
                setHierarchyOptions(prev => ({ ...prev, admins }));
            } else if (currentUserRole === 'admin') {
                // Load distributors for admin
                const distributors = await getHierarchyOptions('distributor');
                setHierarchyOptions(prev => ({ ...prev, distributors }));
            } else if (currentUserRole === 'distributor') {
                // Load agents for distributor
                const agents = await getHierarchyOptions('agent');
                setHierarchyOptions(prev => ({ ...prev, agents }));
            } else if (currentUserRole === 'agent') {
                // Load players for agent
                const players = await getHierarchyOptions('player');
                setHierarchyOptions(prev => ({ ...prev, players }));
            }
        } catch (error) {
            console.error('Error loading hierarchy options:', error);
        }
    }, [currentUserRole, getHierarchyOptions, getAdminHierarchyOptions]);

    // Memoize the loadChildOptions function
    const loadChildOptions = useCallback(async (level: string, parentId: string) => {
        try {
            let options: HierarchyOption[] = [];

            if (currentUserRole === 'superadmin') {
                const filters: any = {};
                if (level === 'distributor') filters.adminId = parentId;
                else if (level === 'agent') filters.distributorId = parentId;
                else if (level === 'player') filters.agentId = parentId;

                options = await getAdminHierarchyOptions(level, filters);
            } else {
                options = await getHierarchyOptions(level, parentId);
            }

            setHierarchyOptions(prev => ({ ...prev, [level + 's']: options }));
        } catch (error) {
            console.error('Error loading child options:', error);
        }
    }, [currentUserRole, getHierarchyOptions, getAdminHierarchyOptions]);

    // Memoize the handleFilterChange function
    const handleFilterChange = useCallback((key: keyof BetFilters, value: any) => {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value, page: 1 };
        setFilters(newFilters);
        getBets(newFilters);
    }, [filters, getBets]);

    // Memoize the handleHierarchyChange function
    const handleHierarchyChange = useCallback(async (level: string, value: string) => {
        const newFilters = { ...filters, page: 1 };

        // Clear child selections when parent changes
        if (level === 'admin') {
            newFilters.adminId = value === 'all' ? undefined : value;
            newFilters.distributorId = undefined;
            newFilters.agentId = undefined;
            newFilters.playerId = undefined;
            if (value && value !== 'all') {
                await loadChildOptions('distributor', value);
            }
        } else if (level === 'distributor') {
            newFilters.distributorId = value === 'all' ? undefined : value;
            newFilters.agentId = undefined;
            newFilters.playerId = undefined;
            if (value && value !== 'all') {
                await loadChildOptions('agent', value);
            }
        } else if (level === 'agent') {
            newFilters.agentId = value === 'all' ? undefined : value;
            newFilters.playerId = undefined;
            if (value && value !== 'all') {
                await loadChildOptions('player', value);
            }
        } else if (level === 'player') {
            newFilters.playerId = value === 'all' ? undefined : value;
        }

        setFilters(newFilters);
        getBets(newFilters);
    }, [filters, getBets, loadChildOptions]);

    // Memoize the handlePageChange function
    const handlePageChange = useCallback((page: number) => {
        const newFilters = { ...filters, page };
        setFilters(newFilters);
        getBets(newFilters);
    }, [filters, getBets]);

    // Memoize the handleViewBet function
    const handleViewBet = useCallback((betId: string) => {
        setSelectedBetId(betId);
        setIsDetailModalOpen(true);
    }, []);

    // Get current user role from localStorage - only once
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUserRole(user.role);
        }
    }, []);

    // Load hierarchy options based on current user role - only when role changes
    useEffect(() => {
        if (currentUserRole) {
            loadHierarchyOptions();
        }
    }, [currentUserRole, loadHierarchyOptions]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getBetTypeColor = (betType: string) => {
        return betType === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const getGameTypeColor = (gameType: string) => {
        const colors: { [key: string]: string } = {
            'single': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'double': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'triple': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'panna': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            'sangam': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            'jodi': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
        };
        return colors[gameType.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const renderHierarchyFilter = () => {
        if (currentUserRole === 'superadmin') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin">Admin</Label>
                        <Select value={filters.adminId || 'all'} onValueChange={(value) => handleHierarchyChange('admin', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Admin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Admins</SelectItem>
                                {hierarchyOptions.admins.map((admin) => (
                                    <SelectItem key={admin._id} value={admin._id}>
                                        {admin.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="distributor">Distributor</Label>
                        <Select value={filters.distributorId || 'all'} onValueChange={(value) => handleHierarchyChange('distributor', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Distributor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Distributors</SelectItem>
                                {hierarchyOptions.distributors.map((distributor) => (
                                    <SelectItem key={distributor._id} value={distributor._id}>
                                        {distributor.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="agent">Agent</Label>
                        <Select value={filters.agentId || 'all'} onValueChange={(value) => handleHierarchyChange('agent', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Agent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Agents</SelectItem>
                                {hierarchyOptions.agents.map((agent) => (
                                    <SelectItem key={agent._id} value={agent._id}>
                                        {agent.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="player">Player</Label>
                        <Select value={filters.playerId || 'all'} onValueChange={(value) => handleHierarchyChange('player', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Player" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Players</SelectItem>
                                {hierarchyOptions.players.map((player) => (
                                    <SelectItem key={player._id} value={player._id}>
                                        {player.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            );
        } else if (currentUserRole === 'admin') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="distributor">Distributor</Label>
                        <Select value={filters.distributorId || 'all'} onValueChange={(value) => handleHierarchyChange('distributor', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Distributor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Distributors</SelectItem>
                                {hierarchyOptions.distributors.map((distributor) => (
                                    <SelectItem key={distributor._id} value={distributor._id}>
                                        {distributor.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="agent">Agent</Label>
                        <Select value={filters.agentId || 'all'} onValueChange={(value) => handleHierarchyChange('agent', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Agent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Agents</SelectItem>
                                {hierarchyOptions.agents.map((agent) => (
                                    <SelectItem key={agent._id} value={agent._id}>
                                        {agent.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="player">Player</Label>
                        <Select value={filters.playerId || 'all'} onValueChange={(value) => handleHierarchyChange('player', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Player" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Players</SelectItem>
                                {hierarchyOptions.players.map((player) => (
                                    <SelectItem key={player._id} value={player._id}>
                                        {player.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            );
        } else if (currentUserRole === 'distributor') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="agent">Agent</Label>
                        <Select value={filters.agentId || 'all'} onValueChange={(value) => handleHierarchyChange('agent', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Agent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Agents</SelectItem>
                                {hierarchyOptions.agents.map((agent) => (
                                    <SelectItem key={agent._id} value={agent._id}>
                                        {agent.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="player">Player</Label>
                        <Select value={filters.playerId || 'all'} onValueChange={(value) => handleHierarchyChange('player', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Player" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Players</SelectItem>
                                {hierarchyOptions.players.map((player) => (
                                    <SelectItem key={player._id} value={player._id}>
                                        {player.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            );
        } else if (currentUserRole === 'agent') {
            return (
                <div className="space-y-2">
                    <Label htmlFor="player">Player</Label>
                    <Select value={filters.playerId || 'all'} onValueChange={(value) => handleHierarchyChange('player', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Player" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Players</SelectItem>
                            {hierarchyOptions.players.map((player) => (
                                <SelectItem key={player._id} value={player._id}>
                                    {player.username}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        return null;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Bets Management</h1>
                        <p className="text-secondary">View and manage all bets with hierarchical filtering</p>
                    </div>
                    <Button onClick={() => getBets(filters)} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-secondary">Total Bets</p>
                                        <p className="text-2xl font-bold text-primary">{summary.totalBets}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-secondary">Total Amount</p>
                                        <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalAmount)}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-secondary">Open Bets</p>
                                        <p className="text-2xl font-bold text-green-600">{summary.openBets}</p>
                                        <p className="text-sm text-secondary">{formatCurrency(summary.openAmount)}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-secondary">Close Bets</p>
                                        <p className="text-2xl font-bold text-red-600">{summary.closeBets}</p>
                                        <p className="text-sm text-secondary">{formatCurrency(summary.closeAmount)}</p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Date Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateFilter">Date Filter</Label>
                                <Select value={filters.dateFilter || 'today'} onValueChange={(value) => handleFilterChange('dateFilter', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="yesterday">Yesterday</SelectItem>
                                        <SelectItem value="thisWeek">This Week</SelectItem>
                                        <SelectItem value="lastWeek">Last Week</SelectItem>
                                        <SelectItem value="custom">Custom Range</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {filters.dateFilter === 'custom' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Input
                                            type="date"
                                            value={filters.startDate || ''}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Input
                                            type="date"
                                            value={filters.endDate || ''}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="betType">Bet Type</Label>
                                <Select value={filters.betType || 'all'} onValueChange={(value) => handleFilterChange('betType', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="close">Close</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Hierarchy Filters */}
                        {renderHierarchyFilter()}
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                        <CardContent className="p-4">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                            <Button onClick={clearError} variant="outline" size="sm" className="mt-2">
                                Dismiss
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Bets Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-primary">Bets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-primary">Loading bets...</p>
                                </div>
                            </div>
                        ) : bets.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-secondary">No bets found with the current filters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left p-3 text-primary font-medium">Player</th>
                                            <th className="text-left p-3 text-primary font-medium">Market</th>
                                            <th className="text-left p-3 text-primary font-medium">Game Type</th>
                                            <th className="text-left p-3 text-primary font-medium">Bet Type</th>
                                            <th className="text-left p-3 text-primary font-medium">Amount</th>
                                            <th className="text-left p-3 text-primary font-medium">Date</th>
                                            <th className="text-left p-3 text-primary font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bets.map((bet) => (
                                            <tr key={bet._id} className="border-b border-border hover:bg-card/50">
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium text-primary">{bet.userId.username}</p>
                                                        <p className="text-sm text-secondary">{bet.userId.role}</p>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <p className="text-primary">{bet.marketId.marketName}</p>
                                                </td>
                                                <td className="p-3">
                                                    <Badge className={getGameTypeColor(bet.type)}>
                                                        {bet.type.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <Badge className={getBetTypeColor(bet.betType)}>
                                                        {bet.betType.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-medium text-primary">{formatCurrency(bet.amount)}</p>
                                                </td>
                                                <td className="p-3">
                                                    <p className="text-secondary">{formatDate(bet.createdAt)}</p>
                                                </td>
                                                <td className="p-3">
                                                    <Button
                                                        onClick={() => handleViewBet(bet._id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    totalItems={pagination.totalBets}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bet Detail Modal */}
            <BetDetailModal
                betId={selectedBetId}
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedBetId(null);
                }}
            />
        </AdminLayout>
    );
}
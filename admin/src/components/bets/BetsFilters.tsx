import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { BetFilters, HierarchyOption } from '@/lib/betApi';

interface BetsFiltersProps {
    filters: BetFilters;
    currentUserRole: string;
    hierarchyOptions: {
        admins: HierarchyOption[];
        distributors: HierarchyOption[];
        agents: HierarchyOption[];
        players: HierarchyOption[];
    };
    onFilterChange: (key: keyof BetFilters, value: any) => void;
    onHierarchyChange: (level: string, value: string) => void;
}

export const BetsFilters: React.FC<BetsFiltersProps> = ({
    filters,
    currentUserRole,
    hierarchyOptions,
    onFilterChange,
    onHierarchyChange
}) => {
    const renderHierarchyFilter = () => {
        if (currentUserRole === 'superadmin') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin">Admin</Label>
                        <Select value={filters.adminId || 'all'} onValueChange={(value) => onHierarchyChange('admin', value)}>
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
                        <Select value={filters.distributorId || 'all'} onValueChange={(value) => onHierarchyChange('distributor', value)}>
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
                        <Select value={filters.agentId || 'all'} onValueChange={(value) => onHierarchyChange('agent', value)}>
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
                        <Select value={filters.playerId || 'all'} onValueChange={(value) => onHierarchyChange('player', value)}>
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
                        <Select value={filters.distributorId || 'all'} onValueChange={(value) => onHierarchyChange('distributor', value)}>
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
                        <Select value={filters.agentId || 'all'} onValueChange={(value) => onHierarchyChange('agent', value)}>
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
                        <Select value={filters.playerId || 'all'} onValueChange={(value) => onHierarchyChange('player', value)}>
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
                        <Select value={filters.agentId || 'all'} onValueChange={(value) => onHierarchyChange('agent', value)}>
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
                        <Select value={filters.playerId || 'all'} onValueChange={(value) => onHierarchyChange('player', value)}>
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
                    <Select value={filters.playerId || 'all'} onValueChange={(value) => onHierarchyChange('player', value)}>
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
                        <Select value={filters.dateFilter || 'today'} onValueChange={(value) => onFilterChange('dateFilter', value)}>
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
                                    onChange={(e) => onFilterChange('startDate', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    type="date"
                                    value={filters.endDate || ''}
                                    onChange={(e) => onFilterChange('endDate', e.target.value)}
                                />
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="betType">Bet Type</Label>
                        <Select value={filters.betType || 'all'} onValueChange={(value) => onFilterChange('betType', value)}>
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
    );
};

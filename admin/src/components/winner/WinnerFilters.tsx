import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HierarchicalUser {
    _id: string;
    username: string;
    parentId?: string;
}

interface Market {
    _id: string;
    marketName: string;
}

interface WinnerFiltersProps {
    selectedDate: string;
    selectedGameType: string;
    selectedBetType: string;
    hierarchicalUsers: Record<string, HierarchicalUser[]>;
    assignedMarkets: Market[];
    selectedUser: string;
    selectedMarket: string;
    selectedUserRole: string;
    loadingFilters: boolean;
    currentDataUser: string;
    selectedAdmin: string;
    selectedDistributor: string;
    selectedAgent: string;
    selectedPlayer: string;
    cuttingAmount: string;
    onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDateSubmit: () => void;
    onTodayClick: () => void;
    onMarketChange: (marketId: string) => void;
    onBetTypeChange: (betType: string) => void;
    onCuttingAmountChange: (value: string) => void;
    onAdminChange: (adminId: string) => void;
    onDistributorChange: (distributorId: string) => void;
    onAgentChange: (agentId: string) => void;
    onPlayerChange: (playerId: string) => void;
    onClearFilters: () => void;
}

export const WinnerFilters = ({
    selectedDate,
    selectedGameType,
    selectedBetType,
    hierarchicalUsers,
    assignedMarkets,
    selectedUser,
    selectedMarket,
    selectedUserRole,
    loadingFilters,
    currentDataUser,
    selectedAdmin,
    selectedDistributor,
    selectedAgent,
    selectedPlayer,
    cuttingAmount,
    onDateChange,
    onDateSubmit,
    onTodayClick,
    onMarketChange,
    onBetTypeChange,
    onCuttingAmountChange,
    onAdminChange,
    onDistributorChange,
    onAgentChange,
    onPlayerChange,
    onClearFilters
}: WinnerFiltersProps) => {
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
                                onChange={onDateChange}
                                className="flex-1"
                            />
                            <Button onClick={onDateSubmit} disabled={!selectedDate} size="sm" className="whitespace-nowrap">
                                Load
                            </Button>
                        </div>
                        <Button variant="outline" onClick={onTodayClick} size="sm" className="w-full sm:w-auto">
                            Today
                        </Button>
                    </div>

                    {/* Market Filter */}
                    <div className="space-y-3">
                        <Label className="text-gray-300 font-medium">Market Filter</Label>
                        <Select value={selectedMarket} onValueChange={onMarketChange}>
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
                        <Select value={selectedBetType} onValueChange={onBetTypeChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select bet type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Bets</SelectItem>
                                <SelectItem value="open">Open Bets</SelectItem>
                                <SelectItem value="close">Close Bets</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cutting Filter */}
                    <div className="space-y-3">
                        <Label className="text-gray-300 font-medium">Cutting Filter</Label>
                        <Input
                            type="number"
                            placeholder="Enter minimum bet amount"
                            value={cuttingAmount}
                            onChange={(e) => onCuttingAmountChange(e.target.value)}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-400">
                            Show only numbers with bet amount greater than this value
                        </div>
                    </div>

                    {/* Hierarchical User Selection */}
                    <div className="space-y-3 lg:col-span-2 xl:col-span-1">
                        <Label className="text-gray-300 font-medium">User Hierarchy</Label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                            {/* Admin Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Admin</Label>
                                <Select value={selectedAdmin} onValueChange={onAdminChange}>
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
                                    <Select value={selectedDistributor} onValueChange={onDistributorChange}>
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
                                    <Select value={selectedAgent} onValueChange={onAgentChange}>
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
                                    <Select value={selectedPlayer} onValueChange={onPlayerChange}>
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
                    <Button variant="outline" onClick={onClearFilters} size="sm" className="px-6">
                        Clear All Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}; 
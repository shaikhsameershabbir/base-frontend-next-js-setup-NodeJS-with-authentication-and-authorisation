'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { ReportsStats } from '@/components/reports/ReportsStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    Filter,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Users,
    Coins,
    Target,
    Download,
    Eye,
    Shield,
    ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdminReport, BetReport } from '@/lib/reportsApi';
import apiClient from '@/lib/api-client';

export default function ReportsPage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const { reports, stats, loading, error, fetchReports, fetchStats, refreshReports } = useReports();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAdminId, setSelectedAdminId] = useState('');
    const [expandedAdmins, setExpandedAdmins] = useState<Set<string>>(new Set());

    // New state for drill-down functionality
    const [drillDownLevel, setDrillDownLevel] = useState<'main' | 'distributors' | 'agents' | 'players'>('main');
    const [drillDownData, setDrillDownData] = useState<any[]>([]);
    const [drillDownParent, setDrillDownParent] = useState<{ id: string, username: string, role: string } | null>(null);

    // Fetch data when component mounts and user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchReports();
            fetchStats();
        }
    }, [isAuthenticated, user, fetchReports, fetchStats]);

    const handleFilter = () => {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (selectedAdminId) params.adminId = selectedAdminId;

        if (drillDownLevel === 'main') {
            fetchReports(params);
        } else {
            // Apply filters to drill-down data
            // For now, just refresh the drill-down data with current filters
            // In a real implementation, you might want to re-fetch the drill-down data with filters
            console.log('Filters applied to drill-down data:', params);
        }
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setSelectedAdminId('');

        if (drillDownLevel === 'main') {
            fetchReports();
        } else {
            // Reset filters for drill-down data
            console.log('Filters reset for drill-down data');
        }
    };

    const toggleAdminExpansion = (adminId: string) => {
        const newExpanded = new Set(expandedAdmins);
        if (newExpanded.has(adminId)) {
            newExpanded.delete(adminId);
        } else {
            newExpanded.add(adminId);
        }
        setExpandedAdmins(newExpanded);
    };

    // New function for drill-down functionality
    const drillDownToNextLevel = async (userId: string, username: string, role: string) => {
        try {
            // Prevent drilling down if we're already at players level
            if (drillDownLevel === 'players' || role === 'player') {
                return;
            }

            // Determine the next level based on current role
            let nextLevel: 'distributors' | 'agents' | 'players';
            let nextRole: string;

            if (role === 'admin') {
                nextLevel = 'distributors';
                nextRole = 'distributor';
            } else if (role === 'distributor') {
                nextLevel = 'agents';
                nextRole = 'agent';
            } else if (role === 'agent') {
                nextLevel = 'players';
                nextRole = 'player';
            } else {
                return; // No next level for players
            }

            // Fetch users at the next level using the existing users API
            const response = await apiClient.get(`/users?role=${nextRole}&parentId=${userId}`);

            if (response.status === 200) {
                const data = response.data;
                const nextLevelUsers = data.data || [];

                // For each user at the next level, get their bet data
                const nextLevelReports = await Promise.all(
                    nextLevelUsers.map(async (nextUser: any) => {
                        const betResponse = await apiClient.get(`/reports/bet-reports?adminId=${nextUser._id}`);

                        if (betResponse.status === 200) {
                            const betData = betResponse.data;
                            return betData.data.reports[0]; // Get the first (and only) report
                        }
                        return null;
                    })
                );

                const validReports = nextLevelReports.filter(report => report !== null);

                setDrillDownData(validReports);
                setDrillDownLevel(nextLevel);
                setDrillDownParent({ id: userId, username, role });
            }
        } catch (error) {
            console.error('Error drilling down:', error);
        }
    };

    // Function to go back to main level
    const goBackToMain = () => {
        setDrillDownLevel('main');
        setDrillDownData([]);
        setDrillDownParent(null);
    };

    // Helper function to check if Actions column should be shown
    const shouldShowActions = () => {
        if (drillDownLevel === 'players') return false;
        if (drillDownLevel === 'main' && user?.role === 'agent') return false;
        return true;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-secondary">Checking authentication...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Show message if not authenticated
    if (!isAuthenticated || !user) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-white" />
                        <p className="text-secondary">Please log in to view reports</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (loading && !reports) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-secondary">Loading reports...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">User Reports</h1>
                        <p className="text-secondary">Comprehensive bet calculations and analytics based on user hierarchy</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={drillDownLevel === 'main' ? refreshReports : () => {
                            // Refresh drill-down data
                            if (drillDownParent) {
                                drillDownToNextLevel(drillDownParent.id, drillDownParent.username, drillDownParent.role);
                            }
                        }} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={handleFilter} variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="adminId">User ID (Optional)</Label>
                                <Input
                                    id="adminId"
                                    placeholder="User ID to filter"
                                    value={selectedAdminId}
                                    onChange={(e) => setSelectedAdminId(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    Apply Filters
                                </Button>
                                <Button onClick={handleReset} variant="outline">
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                        <CardContent className="pt-6">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Today's Statistics */}
                <ReportsStats stats={drillDownLevel === 'main' ? stats : {
                    todayBets: drillDownData.reduce((sum, item) => sum + item.totalBets, 0),
                    todayBetAmount: drillDownData.reduce((sum, item) => sum + item.totalBet, 0),
                    todayWinningBets: drillDownData.reduce((sum, item) => sum + item.winningBets, 0),
                    todayWinAmount: drillDownData.reduce((sum, item) => sum + item.totalWin, 0),
                    totalUsers: drillDownData.length
                }} />

                {/* Summary Cards */}
                {reports?.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Total Bet Amount</CardTitle>
                                <Coins className="h-4 w-4 text-white" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(drillDownLevel === 'main' ? reports.summary.totalBet :
                                        drillDownData.reduce((sum, item) => sum + item.totalBet, 0))}
                                </div>
                                <p className="text-xs text-secondary">
                                    {drillDownLevel === 'main' ?
                                        (user?.role === 'superadmin' ? 'Across all admins' :
                                            user?.role === 'admin' ? 'Across all distributors' :
                                                user?.role === 'distributor' ? 'Across all agents' :
                                                    user?.role === 'agent' ? 'Across all players' : 'Total amount') :
                                        `Across all ${drillDownLevel}`
                                    }
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Total Win Amount</CardTitle>
                                <TrendingUp className="h-4 w-4 text-white" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(drillDownLevel === 'main' ? reports.summary.totalWin :
                                        drillDownData.reduce((sum, item) => sum + item.totalWin, 0))}
                                </div>
                                <p className="text-xs text-secondary">Total winnings</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Claimed Amount</CardTitle>
                                <Target className="h-4 w-4 text-white" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(drillDownLevel === 'main' ? reports.summary.claimedAmount :
                                        drillDownData.reduce((sum, item) => sum + item.claimedAmount, 0))}
                                </div>
                                <p className="text-xs text-secondary">Already claimed</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Unclaimed Amount</CardTitle>
                                <TrendingDown className="h-4 w-4 text-white" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(drillDownLevel === 'main' ? reports.summary.unclaimedAmount :
                                        drillDownData.reduce((sum, item) => sum + item.unclaimedAmount, 0))}
                                </div>
                                <p className="text-xs text-secondary">Pending claims</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Admin Reports */}
                {reports?.reports && reports.reports.length > 0 ? (
                    <div className="space-y-6">
                        {/* Back Button when drill-down is active */}
                        {drillDownLevel !== 'main' && drillDownParent && (
                            <div className="flex items-center gap-4">
                                <Button onClick={goBackToMain} variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to {user?.role === 'superadmin' ? 'Admin' :
                                        user?.role === 'admin' ? 'Distributor' :
                                            user?.role === 'distributor' ? 'Agent' : 'User'} Reports
                                </Button>
                                <div>
                                    <h3 className="text-lg font-medium text-secondary">
                                        Showing {drillDownLevel} under {drillDownParent.role} {drillDownParent.username}
                                    </h3>
                                </div>
                            </div>
                        )}

                        <h2 className="text-2xl font-semibold text-primary">
                            {drillDownLevel === 'main' ?
                                (user?.role === 'superadmin' ? 'Admin Reports' :
                                    user?.role === 'admin' ? 'Distributor Reports' :
                                        user?.role === 'distributor' ? 'Agent Reports' :
                                            user?.role === 'agent' ? 'Player Reports' : 'User Reports') :
                                drillDownParent?.username + "'s " + drillDownLevel.charAt(0).toUpperCase() + drillDownLevel.slice(1)
                            }
                        </h2>

                        {/* Main Admin Summary Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {drillDownLevel === 'main' ?
                                        (user?.role === 'superadmin' ? 'Admin Reports Table' :
                                            user?.role === 'admin' ? 'Distributor Reports Table' :
                                                user?.role === 'distributor' ? 'Agent Reports Table' :
                                                    user?.role === 'agent' ? 'Player Reports Table' : 'User Reports Table') :
                                        drillDownLevel.charAt(0).toUpperCase() + drillDownLevel.slice(1) + ' Reports Table'
                                    }
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left py-3 px-4 text-secondary font-medium">
                                                    {drillDownLevel === 'main' ?
                                                        (user?.role === 'superadmin' ? 'Admin' :
                                                            user?.role === 'admin' ? 'Distributor' :
                                                                user?.role === 'distributor' ? 'Agent' :
                                                                    user?.role === 'agent' ? 'Player' : 'User') :
                                                        drillDownLevel.charAt(0).toUpperCase() + drillDownLevel.slice(1, -1)
                                                    }
                                                </th>

                                                <th className="text-right py-3 px-4 text-secondary font-medium">Total Bet</th>
                                                <th className="text-right py-3 px-4 text-secondary font-medium">Total Win</th>
                                                <th className="text-right py-3 px-4 text-secondary font-medium">Claimed</th>
                                                <th className="text-right py-3 px-4 text-secondary font-medium">Unclaimed</th>

                                                {shouldShowActions() && (
                                                    <th className="text-center py-3 px-4 text-secondary font-medium">Actions</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(drillDownLevel === 'main' ? reports.reports : drillDownData).map((admin: AdminReport) => (
                                                <tr key={admin.adminId} className="border-b hover:bg-muted/30">
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-primary">{admin.adminUsername}</div>
                                                    </td>

                                                    <td className="py-3 px-4 text-right font-medium text-secondary">
                                                        {formatCurrency(admin.totalBet)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium text-secondary">
                                                        {formatCurrency(admin.totalWin)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                                            {formatCurrency(admin.claimedAmount)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                                                            {formatCurrency(admin.unclaimedAmount)}
                                                        </span>
                                                    </td>

                                                    {shouldShowActions() && (
                                                        <td className="py-3 px-4 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => drillDownToNextLevel(admin.adminId, admin.adminUsername, admin.adminRole)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto mb-4 text-white" />
                                <p className="text-secondary">No reports available</p>
                                <p className="text-sm text-secondary">Try adjusting your filters or check back later</p>
                            </div>
                        </CardContent>
                    </Card>
                )}



            </div>
        </AdminLayout>
    );
}

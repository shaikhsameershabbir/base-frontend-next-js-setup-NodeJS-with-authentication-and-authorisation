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
    Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdminReport, BetReport } from '@/lib/reportsApi';

export default function ReportsPage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const { reports, stats, loading, error, fetchReports, fetchStats, refreshReports } = useReports();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAdminId, setSelectedAdminId] = useState('');
    const [expandedAdmins, setExpandedAdmins] = useState<Set<string>>(new Set());

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
        fetchReports(params);
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setSelectedAdminId('');
        fetchReports();
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
                        <p className="text-muted">Checking authentication...</p>
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
                        <Shield className="h-12 w-12 mx-auto mb-4 text-muted" />
                        <p className="text-muted">Please log in to view reports</p>
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
                        <p className="text-muted">Loading reports...</p>
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
                        <h1 className="text-3xl font-bold text-primary">Bet Reports</h1>
                        <p className="text-muted">Comprehensive bet calculations and analytics</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={refreshReports} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
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
                                <Label htmlFor="adminId">Admin (Optional)</Label>
                                <Input
                                    id="adminId"
                                    placeholder="Admin ID"
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
                <ReportsStats stats={stats} />

                {/* Summary Cards */}
                {reports?.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Total Bet Amount</CardTitle>
                                <Coins className="h-4 w-4 text-muted" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{formatCurrency(reports.summary.totalBet)}</div>
                                <p className="text-xs text-muted">Across all admins</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Total Win Amount</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{formatCurrency(reports.summary.totalWin)}</div>
                                <p className="text-xs text-muted">Total winnings</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Claimed Amount</CardTitle>
                                <Target className="h-4 w-4 text-muted" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{formatCurrency(reports.summary.claimedAmount)}</div>
                                <p className="text-xs text-muted">Already claimed</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Unclaimed Amount</CardTitle>
                                <TrendingDown className="h-4 w-4 text-muted" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{formatCurrency(reports.summary.unclaimedAmount)}</div>
                                <p className="text-xs text-muted">Pending claims</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Admin Reports */}
                {reports?.reports && reports.reports.length > 0 ? (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-primary">Admin Reports</h2>

                        {/* Main Admin Summary Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Admin Summary Table
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-white">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left py-3 px-4 text-muted font-medium text-white">Admin</th>
                                    
                                                <th className="text-right py-3 px-4 text-muted font-medium text-white">Total Bet</th>
                                                <th className="text-right py-3 px-4 text-muted font-medium text-white">Total Win</th>
                                                <th className="text-right py-3 px-4 text-muted font-medium text-white">Claimed</th>
                                                <th className="text-right py-3 px-4 text-muted font-medium text-white">Unclaimed</th>
                                           
                                                <th className="text-center py-3 px-4 text-muted font-medium text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.reports.map((admin: AdminReport) => (
                                                <tr key={admin.adminId} className="border-b hover:bg-muted/30">
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-primary">{admin.adminUsername}</div>
                                                    </td>
                                                   
                                                    <td className="py-3 px-4 text-right font-medium">
                                                        {formatCurrency(admin.totalBet)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium">
                                                        {formatCurrency(admin.totalWin)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                                            {formatCurrency(admin.claimedAmount)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                                                            {formatCurrency(admin.unclaimedAmount)}
                                                        </span>
                                                    </td>
                                                   
                                                    <td className="py-3 px-4 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleAdminExpansion(admin.adminId)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </td>
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
                                <Users className="h-12 w-12 mx-auto mb-4 text-muted" />
                                <p className="text-muted">No reports available</p>
                                <p className="text-sm text-muted">Try adjusting your filters or check back later</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}

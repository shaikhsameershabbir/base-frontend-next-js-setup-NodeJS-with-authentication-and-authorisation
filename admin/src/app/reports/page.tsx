'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
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
    BarChart3,
    ArrowLeft,
    DollarSign
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useReports } from '@/hooks/useReports';
import { getRoleDisplayName, getRoleColor, getRoleIcon } from '@/app/helperFunctions/helper';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface HierarchicalReport {
    userId: string;
    username: string;
    role: string;
    percentage: number;
    totalBet: number;
    totalWin: number;
    claimedAmount: number;
    unclaimedAmount: number;
    totalBets: number;
    winningBets: number;
    commission: number;
    hasChildren: boolean;
}

interface ReportsData {
    reports: HierarchicalReport[];
    summary: {
        totalBet: number;
        totalWin: number;
        claimedAmount: number;
        unclaimedAmount: number;
        totalBets: number;
        winningBets: number;
        totalUsers: number;
        totalCommission: number;
    };
    filters: {
        startDate: string | null;
        endDate: string | null;
    };
    currentLevel: {
        role: string;
        parentId?: string;
        parentName?: string;
    };
}

export default function ReportsPage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const { reports, stats, loading, error, fetchReports, fetchStats } = useReports();

    // Date filters
    const getTodayDate = () => new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(getTodayDate());
    const [endDate, setEndDate] = useState(getTodayDate());

    // Navigation state for drill-down
    const [navigationStack, setNavigationStack] = useState<Array<{
        parentId: string;
        parentName: string;
        role: string;
    }>>([]);

    // Auto-fetch data when filters change
    useEffect(() => {
        if (isAuthenticated && user) {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            // Use the last navigation item's parentId, or undefined for root level
            const currentParentId = navigationStack.length > 0
                ? navigationStack[navigationStack.length - 1].parentId
                : undefined;

            if (currentParentId) {
                params.parentId = currentParentId;
            }

            fetchReports(params);
            fetchStats();
        }
    }, [startDate, endDate, navigationStack, isAuthenticated, user, fetchReports, fetchStats]);

    const handleFilter = () => {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const currentParentId = navigationStack.length > 0
            ? navigationStack[navigationStack.length - 1].parentId
            : undefined;

        if (currentParentId) {
            params.parentId = currentParentId;
        }

        fetchReports(params);
    };

    const handleReset = () => {
        const today = getTodayDate();
        setStartDate(today);
        setEndDate(today);
        setNavigationStack([]); // Reset navigation to root level
    };

    const handleDrillDown = (report: HierarchicalReport) => {
        if (report.hasChildren) {
            setNavigationStack(prev => [...prev, {
                parentId: report.userId,
                parentName: report.username,
                role: report.role
            }]);
        }
    };

    const handleGoBack = () => {
        setNavigationStack(prev => prev.slice(0, -1));
    };

    const handleGoToRoot = () => {
        setNavigationStack([]);
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

    const exportTableToPDF = () => {
        if (!reportsData || reportsData.reports.length === 0) {
            alert('No data to export');
            return;
        }

        const doc = new jsPDF('landscape');

        // Header information
        doc.setFontSize(16);
        doc.text('Hierarchical Reports', 20, 20);

        doc.setFontSize(10);
        doc.text(`Date Range: ${startDate} to ${endDate}`, 20, 30);
        doc.text(`Current Level: ${getRoleDisplayName(reportsData.currentLevel.role)}`, 20, 35);
        doc.text(`Total Users: ${reportsData.reports.length}`, 20, 40);

        // Summary information
        doc.setFontSize(12);
        doc.text('Summary', 20, 50);
        doc.setFontSize(10);
        doc.text(`Total Bet Amount: ${reportsData.summary.totalBet.toLocaleString('en-IN')}`, 20, 60);
        doc.text(`Total Win Amount: ${reportsData.summary.totalWin.toLocaleString('en-IN')}`, 20, 65);
        doc.text(`Claimed Amount: ${reportsData.summary.claimedAmount.toLocaleString('en-IN')}`, 20, 70);
        doc.text(`Unclaimed Amount: ${reportsData.summary.unclaimedAmount.toLocaleString('en-IN')}`, 20, 75);
        doc.text(`Total Commission: ${reportsData.summary.totalCommission.toLocaleString('en-IN')}`, 20, 80);

        // Prepare table data
        const tableData = reportsData.reports.map(report => [
            report.username,
            getRoleDisplayName(report.role),
            `${report.percentage}%`,
            `${report.totalBet.toLocaleString('en-IN')}`,
            `${report.totalWin.toLocaleString('en-IN')}`,
            `${report.claimedAmount.toLocaleString('en-IN')}`,
            `${report.unclaimedAmount.toLocaleString('en-IN')}`,
            `${report.commission.toLocaleString('en-IN')}`,
            report.totalBets.toLocaleString('en-IN'),
            report.hasChildren ? 'Yes' : 'No'
        ]);

        // Add table
        autoTable(doc, {
            head: [['User', 'Role', 'Percentage', 'Total Bet', 'Total Win', 'Claimed', 'Unclaimed', 'Commission', 'Bets', 'Has Children']],
            body: tableData,
            startY: 90,
            styles: {
                fontSize: 8,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
        });

        // Footer
        const finalY = (doc as any).lastAutoTable.finalY || 90;
        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, finalY + 20);

        // Save the PDF
        const fileName = `Hierarchical_Reports_${startDate}_to_${endDate}.pdf`;
        doc.save(fileName);
    };

    const exportUserToPDF = (report: HierarchicalReport) => {
        const doc = new jsPDF();

        // Header section with compact styling
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, 210, 20, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('User Report Details', 15, 14);

        // User info section - compact
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`User: ${report.username}`, 15, 28);
        doc.text(`Role: ${getRoleDisplayName(report.role)}`, 15, 34);
        doc.text(`Date Range: ${startDate} to ${endDate}`, 15, 40);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 15, 46);

        // Financial summary cards - compact
        const cardY = 52;
        const cardWidth = 85;
        const cardHeight = 20;
        const cardSpacing = 90;

        // Card 1: Total Bet Amount
        doc.setFillColor(52, 152, 219);
        doc.rect(15, cardY, cardWidth, cardHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL BET AMOUNT', 20, cardY + 6);
        doc.setFontSize(12);
        doc.text(report.totalBet.toLocaleString('en-IN'), 20, cardY + 14);

        // Card 2: Total Win Amount
        doc.setFillColor(46, 204, 113);
        doc.rect(15 + cardSpacing, cardY, cardWidth, cardHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL WIN AMOUNT', 20 + cardSpacing, cardY + 6);
        doc.setFontSize(12);
        doc.text(report.totalWin.toLocaleString('en-IN'), 20 + cardSpacing, cardY + 14);

        // Card 3: Commission
        doc.setFillColor(155, 89, 182);
        doc.rect(15, cardY + 25, cardWidth, cardHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('COMMISSION', 20, cardY + 31);
        doc.setFontSize(12);
        doc.text(report.commission.toLocaleString('en-IN'), 20, cardY + 39);

        // Card 4: Unclaimed Amount
        doc.setFillColor(230, 126, 34);
        doc.rect(15 + cardSpacing, cardY + 25, cardWidth, cardHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('UNCLAIMED AMOUNT', 20 + cardSpacing, cardY + 31);
        doc.setFontSize(12);
        doc.text(report.unclaimedAmount.toLocaleString('en-IN'), 20 + cardSpacing, cardY + 39);

        // Detailed information table - compact
        const userData = [
            ['Username', report.username],
            ['Role', getRoleDisplayName(report.role)],
            ['Commission %', `${report.percentage}%`],
            ['Claimed Amount', report.claimedAmount.toLocaleString('en-IN')],
            ['Total Bets', report.totalBets.toLocaleString('en-IN')],
            ['Winning Bets', report.winningBets.toLocaleString('en-IN')],
            ['Win Rate', `${((report.winningBets / report.totalBets) * 100).toFixed(1)}%`],
            ['Has Sub-Users', report.hasChildren ? 'Yes' : 'No']
        ];

        autoTable(doc, {
            body: userData,
            startY: cardY + 55,
            styles: {
                fontSize: 9,
                cellPadding: 4,
                lineColor: [200, 200, 200],
                lineWidth: 0.3,
            },
            headStyles: {
                fillColor: [52, 73, 94],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 10,
            },
            columnStyles: {
                0: {
                    fontStyle: 'bold',
                    fillColor: [236, 240, 241],
                    textColor: [44, 62, 80],
                    cellWidth: 50
                },
                1: {
                    fillColor: [255, 255, 255],
                    textColor: [44, 62, 80],
                    cellWidth: 70
                }
            },
            margin: { left: 15, right: 15 },
            tableWidth: 'auto'
        });

        // Compact footer
        const finalY = (doc as any).lastAutoTable.finalY || 200;
        doc.setFillColor(44, 62, 80);
        doc.rect(0, finalY + 5, 210, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`Report generated on ${new Date().toLocaleString('en-IN')}`, 15, finalY + 12);

        // Save the PDF
        const fileName = `User_Report_${report.username}_${startDate}_to_${endDate}.pdf`;
        doc.save(fileName);
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

    const reportsData: ReportsData = reports || {
        reports: [],
        summary: {
            totalBet: 0,
            totalWin: 0,
            claimedAmount: 0,
            unclaimedAmount: 0,
            totalBets: 0,
            winningBets: 0,
            totalUsers: 0,
            totalCommission: 0
        },
        filters: {
            startDate: null,
            endDate: null
        },
        currentLevel: {
            role: 'admin',
            parentId: undefined,
            parentName: undefined
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Hierarchical Reports</h1>
                        <p className="text-secondary">Drill down through user hierarchy to view consolidated bet data and commissions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleFilter} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportTableToPDF}
                            disabled={!reportsData || reportsData.reports.length === 0}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Complete Table
                        </Button>
                    </div>
                </div>

                {/* Navigation Breadcrumb */}
                {navigationStack.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-sm">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleGoToRoot}
                                    className="text-primary hover:text-primary/80"
                                >
                                    <Users className="h-4 w-4 mr-1" />
                                    Root
                                </Button>
                                {navigationStack.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-secondary">/</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setNavigationStack(prev => prev.slice(0, index + 1))}
                                            className="text-primary hover:text-primary/80"
                                        >
                                            {getRoleDisplayName(item.role)}: {item.parentName}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Quick Date Presets */}
                        <div className="mb-4">
                            <Label className="text-sm text-secondary mb-2 block">Quick Date Presets:</Label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const today = getTodayDate();
                                        setStartDate(today);
                                        setEndDate(today);
                                    }}
                                    className="text-xs"
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const yesterday = new Date();
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        const yesterdayStr = yesterday.toISOString().split('T')[0];
                                        setStartDate(yesterdayStr);
                                        setEndDate(yesterdayStr);
                                    }}
                                    className="text-xs"
                                >
                                    Yesterday
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setDate(start.getDate() - 7);
                                        setStartDate(start.toISOString().split('T')[0]);
                                        setEndDate(end.toISOString().split('T')[0]);
                                    }}
                                    className="text-xs"
                                >
                                    Last 7 Days
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setDate(start.getDate() - 30);
                                        setStartDate(start.toISOString().split('T')[0]);
                                        setEndDate(end.toISOString().split('T')[0]);
                                    }}
                                    className="text-xs"
                                >
                                    Last 30 Days
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter} className="flex-1" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Applying...
                                        </>
                                    ) : (
                                        <>
                                            <Filter className="h-4 w-4 mr-2" />
                                            Apply
                                        </>
                                    )}
                                </Button>
                                <Button onClick={handleReset} variant="outline" disabled={loading}>
                                    Reset
                                </Button>
                            </div>
                        </div>

                        {/* Current Filter Display */}
                        {(startDate || endDate || navigationStack.length > 0) && (
                            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                                <p className="text-sm text-secondary mb-2">Current Filters:</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {startDate && (
                                        <span className="px-2 py-1 bg-primary/20 text-primary rounded">
                                            From: {new Date(startDate).toLocaleDateString()}
                                        </span>
                                    )}
                                    {endDate && (
                                        <span className="px-2 py-1 bg-primary/20 text-primary rounded">
                                            To: {new Date(endDate).toLocaleDateString()}
                                        </span>
                                    )}
                                    {navigationStack.length > 0 && (
                                        <span className="px-2 py-1 bg-primary/20 text-primary rounded">
                                            Level: {getRoleDisplayName(reportsData.currentLevel.role)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
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

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Total Bet Amount</CardTitle>
                            <Coins className="h-4 w-4 text-white" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {formatCurrency(reportsData.summary.totalBet)}
                            </div>
                            <p className="text-xs text-secondary">
                                {formatNumber(reportsData.summary.totalBets)} total bets
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
                                {formatCurrency(reportsData.summary.totalWin)}
                            </div>
                            <p className="text-xs text-secondary">
                                {formatNumber(reportsData.summary.winningBets)} winning bets
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Claimed Amount</CardTitle>
                            <Target className="h-4 w-4 text-white" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {formatCurrency(reportsData.summary.claimedAmount)}
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
                                {formatCurrency(reportsData.summary.unclaimedAmount)}
                            </div>
                            <p className="text-xs text-secondary">Pending claims</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Total Commission</CardTitle>
                            <DollarSign className="h-4 w-4 text-white" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {formatCurrency(reportsData.summary.totalCommission)}
                            </div>
                            <p className="text-xs text-secondary">Commission earned</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports Table */}
                {reportsData.reports.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                {getRoleDisplayName(reportsData.currentLevel.role)} Reports ({reportsData.reports.length} users)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left py-3 px-4 text-secondary font-medium">User</th>
                                            <th className="text-left py-3 px-4 text-secondary font-medium">Role</th>
                                            <th className="text-left py-3 px-4 text-secondary font-medium">Percentage</th>
                                            <th className="text-right py-3 px-4 text-secondary font-medium">Total Bet</th>
                                            <th className="text-right py-3 px-4 text-secondary font-medium">Total Win</th>
                                            <th className="text-right py-3 px-4 text-secondary font-medium">Claimed</th>
                                            <th className="text-right py-3 px-4 text-secondary font-medium">Unclaimed</th>
                                            <th className="text-right py-3 px-4 text-secondary font-medium">Commission</th>
                                            <th className="text-center py-3 px-4 text-secondary font-medium">Bets</th>
                                            <th className="text-center py-3 px-4 text-secondary font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportsData.reports.map((report) => (
                                            <tr key={report.userId} className="border-b hover:bg-muted/30">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-primary">{report.username}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getRoleColor(report.role)}`}>
                                                        {getRoleIcon(report.role)}
                                                        {getRoleDisplayName(report.role)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {report.percentage}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium text-secondary">
                                                    {formatCurrency(report.totalBet)}
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium text-secondary">
                                                    {formatCurrency(report.totalWin)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                        {formatCurrency(report.claimedAmount)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                                                        {formatCurrency(report.unclaimedAmount)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                        {formatCurrency(report.commission)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="text-sm text-secondary">
                                                        {formatNumber(report.totalBets)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => exportUserToPDF(report)}
                                                            className="h-8 px-2"
                                                            title="Export user report to PDF"
                                                        >
                                                            <Download className="h-4 w-4 mr-1" />
                                                            Export
                                                        </Button>
                                                        {report.hasChildren && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDrillDown(report)}
                                                                className="h-8 w-8 p-0"
                                                                title={`View ${getRoleDisplayName(report.role)} details`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-white" />
                                <p className="text-secondary">No reports available for the selected filters</p>
                                <p className="text-sm text-secondary mb-4">
                                    Try adjusting your date range or navigation level
                                </p>
                                <Button onClick={handleReset} variant="outline" size="sm">
                                    Reset Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
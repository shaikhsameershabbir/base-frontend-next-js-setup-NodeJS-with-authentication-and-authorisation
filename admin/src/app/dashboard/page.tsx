"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { useDashboard } from "@/hooks/useDashboard"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    Target,
    TrendingUp,
    DollarSign,
    Activity,
    Gamepad2,
    Award,
    Wallet,
    BarChart3,
    Clock,
    CheckCircle,
    Sparkles,
    ArrowUpRight,
    RefreshCw,
    Coins
} from "lucide-react"

export default function DashboardPage() {
    const { stats, loading, error, refreshStats } = useDashboard();
    return (
        <AdminLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight gradient-text text-primary">Matka Dashboard</h1>
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <Button
                            onClick={refreshStats}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                    <p className="text-lg font-medium text-secondary dark:text-white">
                        Welcome to Matka Skill Game Management System
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <StatsCard
                        title="Total Users"
                        value={loading ? "..." : stats?.totalUsers?.toLocaleString() || "0"}
                        description="Under your hierarchy"
                        icon={Users}
                        trend={{ value: 0, isPositive: true }}
                        color="primary"
                    />
                    <StatsCard
                        title="Active Markets"
                        value={loading ? "..." : stats?.activeMarkets?.toString() || "0"}
                        description="Assigned to you"
                        icon={Target}
                        trend={{ value: 0, isPositive: true }}
                        color="success"
                    />
                    <StatsCard
                        title="Total Bids"
                        value={loading ? "..." : stats?.totalBids?.toLocaleString() || "0"}
                        description="Today's bids"
                        icon={TrendingUp}
                        trend={{ value: 0, isPositive: true }}
                        color="tertiary"
                    />
                    <StatsCard
                        title="Total Bet Amount"
                        value={loading ? "..." : `₹${stats?.totalBetAmount?.toLocaleString() || "0"}`}
                        description="Today's total bet amount"
                        icon={Coins}
                        trend={{ value: 0, isPositive: true }}
                        color="warning"
                    />
                    <StatsCard
                        title="Win Amount"
                        value={loading ? "..." : `₹${stats?.winAmount?.toLocaleString() || "0"}`}
                        description="Today's winnings"
                        icon={DollarSign}
                        trend={{ value: 0, isPositive: true }}
                        color="success"
                    />
                </div>

                {/* Market Overview */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                    {/* Market Status */}
                    <Card className="col-span-12 glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-xl font-bold">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
                                    <Gamepad2 className="h-4 w-4 text-white" />
                                </div>
                                Market Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : stats?.markets && stats.markets.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-3">
                                    {stats.markets.map((market, index) => {
                                        const colors = [
                                            'from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30 border-green-500/20',
                                            'from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-500/20',
                                            'from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-500/20',
                                            'from-orange-500/10 to-orange-600/10 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-500/20'
                                        ];
                                        const textColors = [
                                            'text-green-400 dark:text-green-300',
                                            'text-blue-400 dark:text-blue-300',
                                            'text-purple-400 dark:text-purple-300',
                                            'text-orange-400 dark:text-orange-300'
                                        ];
                                        const bgColors = [
                                            'bg-green-500',
                                            'bg-blue-500',
                                            'bg-purple-500',
                                            'bg-orange-500'
                                        ];

                                        return (
                                            <div key={market._id} className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${colors[index % colors.length]} border`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg ${bgColors[index % bgColors.length]} flex items-center justify-center`}>
                                                        <Target className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-primary">{market.marketName}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {market.isActive ? 'Active' : 'Inactive'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${textColors[index % textColors.length]}`}>
                                                        {market.totalBids.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Total Bids</p>
                                                    <p className={`font-bold ${textColors[index % textColors.length]}`}>
                                                        ₹{market.totalAmount?.toLocaleString() || "0"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Total Amount</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        {stats?.activeMarkets === 0 ? "No markets assigned to you" : "No markets available"}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>


                </div>


            </div>
        </AdminLayout>
    )
} 
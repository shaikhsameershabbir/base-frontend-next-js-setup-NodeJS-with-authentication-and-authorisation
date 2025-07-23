"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    ArrowUpRight
} from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        // Check authentication
        const auth = localStorage.getItem("isAuthenticated")
        if (!auth) {
            router.push("/")
        } else {
            setIsAuthenticated(true)
        }
    }, [router])

    if (!isAuthenticated) {
        return null
    }

    return (
        <AdminLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight gradient-text text-primary">Matka Dashboard</h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <p className="text-lg font-medium text-secondary dark:text-white">
                        Welcome to Matka Skill Game Management System
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Users"
                        value="1,847"
                        description="Registered players"
                        icon={Users}
                        trend={{ value: 15, isPositive: true }}
                        color="primary"
                    />
                    <StatsCard
                        title="Active Markets"
                        value="5"
                        description="Running games"
                        icon={Target}
                        trend={{ value: 0, isPositive: true }}
                        color="success"
                    />
                    <StatsCard
                        title="Total Bids"
                        value="12.5K"
                        description="Today's bids"
                        icon={TrendingUp}
                        trend={{ value: 23, isPositive: true }}
                        color="tertiary"
                    />
                    <StatsCard
                        title="Win Amount"
                        value="₹2.4L"
                        description="Today's winnings"
                        icon={DollarSign}
                        trend={{ value: 8, isPositive: true }}
                        color="warning"
                    />
                </div>

                {/* Market Overview */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                    {/* Market Status */}
                    <Card className="col-span-4 glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-xl font-bold">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
                                    <Gamepad2 className="h-4 w-4 text-white" />
                                </div>
                                Market Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30 border border-green-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                                                <Target className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-primary">Kalyan Bazar</p>
                                                <p className="text-sm text-muted-foreground">Open</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-400 dark:text-green-300">₹45.2K</p>
                                            <p className="text-xs text-muted-foreground">Total Bids</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                                <Target className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-primary">Milan Day</p>
                                                <p className="text-sm text-muted-foreground">Open</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-400 dark:text-blue-300">₹32.8K</p>
                                            <p className="text-xs text-muted-foreground">Total Bids</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center">
                                                <Target className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-primary">Milan Night</p>
                                                <p className="text-sm text-muted-foreground">Open</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-purple-400 dark:text-purple-300">₹28.5K</p>
                                            <p className="text-xs text-muted-foreground">Total Bids</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                                                <Target className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-primary">Rajdhani Day</p>
                                                <p className="text-sm text-muted-foreground">Open</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-orange-400 dark:text-orange-300">₹19.7K</p>
                                            <p className="text-xs text-muted-foreground">Total Bids</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <div className="col-span-3">
                        <RecentActivity />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="glass-card " style={{ animationDelay: "100ms" }}>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-white" />
                                </div>
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Manage players, commissions, and user groups
                            </p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10">
                                    <span className="text-sm font-medium">New users today</span>
                                    <span className="font-bold text-blue-600">12</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/10">
                                    <span className="text-sm font-medium">Active users</span>
                                    <span className="font-bold text-green-600">847</span>
                                </div>
                            </div>
                            <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 text-blue-600 font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2">
                                Manage Users
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </CardContent>
                    </Card>

                    <Card className="glass-card " style={{ animationDelay: "200ms" }}>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <Wallet className="h-4 w-4 dark:text-white text-black" />
                                </div>
                                Point Transfers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Manual point transfer system for players
                            </p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/10">
                                    <span className="text-sm font-medium">Pending transfers</span>
                                    <span className="font-bold text-green-600">8</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10">
                                    <span className="text-sm font-medium">Today's transfers</span>
                                    <span className="font-bold text-purple-600">₹1.2L</span>
                                </div>
                            </div>
                            <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 text-green-600 font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2">
                                Transfer Points
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </CardContent>
                    </Card>

                    <Card className="glass-card " style={{ animationDelay: "300ms" }}>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4 text-white" />
                                </div>
                                Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Generate reports for markets, users, and commissions
                            </p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10">
                                    <span className="text-sm font-medium">Total commission</span>
                                    <span className="font-bold text-purple-600">₹45.2K</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-600/10">
                                    <span className="text-sm font-medium">Win rate</span>
                                    <span className="font-bold text-orange-600">67%</span>
                                </div>
                            </div>
                            <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 text-purple-600 font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2">
                                View Reports
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
} 
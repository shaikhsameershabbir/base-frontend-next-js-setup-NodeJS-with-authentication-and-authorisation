"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Badge } from "@/components/ui/badge"
import {
    BarChart3,
    TrendingUp,
    Users,
    Eye,
    MousePointer,
    Clock,
    Globe,
    Smartphone,
    Monitor
} from "lucide-react"

export default function AnalyticsPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
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
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">
                        Track your application performance and user engagement
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Page Views"
                        value="124.5K"
                        description="Last 30 days"
                        icon={Eye}
                        trend={{ value: 15, isPositive: true }}
                    />
                    <StatsCard
                        title="Unique Visitors"
                        value="45.2K"
                        description="Last 30 days"
                        icon={Users}
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatsCard
                        title="Bounce Rate"
                        value="32.4%"
                        description="Last 30 days"
                        icon={TrendingUp}
                        trend={{ value: 5, isPositive: false }}
                    />
                    <StatsCard
                        title="Avg. Session"
                        value="4m 32s"
                        description="Last 30 days"
                        icon={Clock}
                        trend={{ value: 12, isPositive: true }}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Traffic Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Traffic Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Traffic chart would go here</p>
                                    <p className="text-sm">Integration with charting library</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Demographics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Demographics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <span className="text-sm">United States</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-secondary rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium">45%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <span className="text-sm">United Kingdom</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-secondary rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{ width: '28%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium">28%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <span className="text-sm">Germany</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-secondary rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium">15%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <span className="text-sm">Others</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-secondary rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{ width: '12%' }}></div>
                                        </div>
                                        <span className="text-sm font-medium">12%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Device Analytics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            Device Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Monitor className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold">Desktop</h3>
                                <p className="text-2xl font-bold text-primary">58%</p>
                                <p className="text-sm text-muted-foreground">72.3K sessions</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Smartphone className="h-8 w-8 text-secondary" />
                                </div>
                                <h3 className="font-semibold">Mobile</h3>
                                <p className="text-2xl font-bold text-secondary">35%</p>
                                <p className="text-sm text-muted-foreground">43.6K sessions</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Monitor className="h-8 w-8 text-tertiary" />
                                </div>
                                <h3 className="font-semibold">Tablet</h3>
                                <p className="text-2xl font-bold text-tertiary">7%</p>
                                <p className="text-sm text-muted-foreground">8.6K sessions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Pages */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MousePointer className="h-5 w-5" />
                            Top Pages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">Dashboard</p>
                                    <p className="text-sm text-muted-foreground">/dashboard</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">12.4K views</p>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                        +12%
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">Users</p>
                                    <p className="text-sm text-muted-foreground">/users</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">8.7K views</p>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                        +8%
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">Settings</p>
                                    <p className="text-sm text-muted-foreground">/settings</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">5.2K views</p>
                                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                        -3%
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">Analytics</p>
                                    <p className="text-sm text-muted-foreground">/analytics</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">3.8K views</p>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                        +15%
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Real-time Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">247</div>
                            <p className="text-xs text-muted-foreground">Currently online</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Page Views Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4,521</div>
                            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Conversion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3.2%</div>
                            <p className="text-xs text-muted-foreground">+0.5% from last week</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}

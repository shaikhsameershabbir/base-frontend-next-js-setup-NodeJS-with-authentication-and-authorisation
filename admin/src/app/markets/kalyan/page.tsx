"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Target,
    Clock,
    DollarSign,
    TrendingUp,
    Users,
    Award,
    Play,
    Pause,
    Square,
    Settings,
    BarChart3,
    Sparkles,
    CheckCircle,
    XCircle,
    AlertCircle
} from "lucide-react"

interface MarketData {
    id: string
    name: string
    status: "open" | "closed" | "pending"
    currentBids: number
    totalAmount: number
    startTime: string
    endTime: string
    winningNumber?: string
    participants: number
    commission: number
}

const marketData: MarketData = {
    id: "kalyan",
    name: "Kalyan Bazar",
    status: "open",
    currentBids: 1250,
    totalAmount: 452000,
    startTime: "2024-01-15T09:00:00",
    endTime: "2024-01-15T18:00:00",
    participants: 847,
    commission: 4520
}

const bidHistory = [
    { id: "1", user: "user_123", amount: 1500, number: "123", time: "2 minutes ago", status: "active" },
    { id: "2", user: "user_456", amount: 2500, number: "456", time: "5 minutes ago", status: "active" },
    { id: "3", user: "user_789", amount: 1000, number: "789", time: "8 minutes ago", status: "active" },
    { id: "4", user: "user_101", amount: 3000, number: "012", time: "12 minutes ago", status: "active" },
    { id: "5", user: "user_202", amount: 1800, number: "345", time: "15 minutes ago", status: "active" }
]

const getStatusColor = (status: MarketData["status"]) => {
    switch (status) {
        case "open":
            return "bg-green-500/10 text-green-600 border-green-500/20"
        case "closed":
            return "bg-red-500/10 text-red-600 border-red-500/20"
        case "pending":
            return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        default:
            return "bg-muted text-muted-foreground border-border"
    }
}

const getStatusIcon = (status: MarketData["status"]) => {
    switch (status) {
        case "open":
            return <Play className="h-4 w-4 text-green-600" />
        case "closed":
            return <Square className="h-4 w-4 text-red-600" />
        case "pending":
            return <Clock className="h-4 w-4 text-yellow-600" />
        default:
            return <Clock className="h-4 w-4" />
    }
}

export default function KalyanMarketPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {
        // Check authentication
        const auth = localStorage.getItem("isAuthenticated")
        if (!auth) {
            router.push("/login")
        } else {
            setIsAuthenticated(true)
        }
    }, [router])

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const end = new Date(marketData.endTime).getTime()
            const distance = end - now

            if (distance > 0) {
                const hours = Math.floor(distance / (1000 * 60 * 60))
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((distance % (1000 * 60)) / 1000)
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
            } else {
                setTimeLeft("Closed")
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    if (!isAuthenticated) {
        return null
    }

    return (
        <AdminLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight gradient-text text-primary">Kalyan Bazar</h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <Target className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <p className="text-lg font-medium text-secondary">
                        Manage Kalyan Bazar market operations and bids
                    </p>
                </div>

                {/* Market Status */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-card hover-lift animate-slide-up">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <Play className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-secondary">Status</p>
                                    <Badge className={`text-sm ${getStatusColor(marketData.status)}`}>
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon(marketData.status)}
                                            {marketData.status}
                                        </div>
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card hover-lift animate-slide-up" style={{ animationDelay: "100ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-secondary">Total Bids</p>
                                    <p className="text-2xl font-bold text-blue-600">{marketData.currentBids.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card hover-lift animate-slide-up" style={{ animationDelay: "200ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-secondary">Total Amount</p>
                                    <p className="text-2xl font-bold text-purple-600">₹{(marketData.totalAmount / 1000).toFixed(1)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card hover-lift animate-slide-up" style={{ animationDelay: "300ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-secondary">Participants</p>
                                    <p className="text-2xl font-bold text-orange-600">{marketData.participants}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Market Controls */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="glass-card hover-lift animate-slide-up">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <Settings className="h-4 w-4 text-white" />
                                </div>
                                Market Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                                <div>
                                    <p className="font-semibold text-secondary">Time Remaining</p>
                                    <p className="text-sm text-muted">Market closes in</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">{timeLeft}</p>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                                    <Play className="h-4 w-4 mr-2" />
                                    Open Market
                                </Button>
                                <Button variant="outline" className="w-full border-yellow-500/20 hover:bg-yellow-500/10">
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause Market
                                </Button>
                                <Button variant="outline" className="w-full border-red-500/20 hover:bg-red-500/10">
                                    <Square className="h-4 w-4 mr-2" />
                                    Close Market
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card hover-lift animate-slide-up">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <Award className="h-4 w-4 text-white" />
                                </div>
                                Winning Number
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                                <div>
                                    <p className="font-semibold text-secondary">Current Winner</p>
                                    <p className="text-sm text-muted">Winning number</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-purple-600">
                                        {marketData.winningNumber || "Pending"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter winning number"
                                        className="flex-1 bg-white/10 border-white/20 focus:bg-white/20"
                                    />
                                    <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                                        Set
                                    </Button>
                                </div>
                                <Button variant="outline" className="w-full border-purple-500/20 hover:bg-purple-500/10">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Generate Random
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Bids */}
                <Card className="glass-card hover-lift animate-slide-up">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            Recent Bids
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bidHistory.map((bid, index) => (
                                <div
                                    key={bid.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-white/10 hover:to-white/20 transition-all duration-200 group"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-tertiary/30 transition-all duration-200">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm group-hover:text-link transition-colors text-primary">
                                                {bid.user}
                                            </h4>
                                            <p className="text-xs text-muted">Number: {bid.number}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">₹{bid.amount.toLocaleString()}</p>
                                            <p className="text-xs text-muted">{bid.time}</p>
                                        </div>
                                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {bid.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10">
                            <Button className="w-full bg-gradient-to-r from-primary/10 to-tertiary/10 hover:from-primary/20 hover:to-tertiary/20 text-primary font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                View All Bids
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
} 
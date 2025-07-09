"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Target,
    TrendingUp,
    DollarSign,
    Wallet,
    Award,
    Clock,
    CheckCircle,
    XCircle,
    UserPlus,
    Gamepad2,
    BarChart3,
    Activity
} from "lucide-react"

interface ActivityItem {
    id: string
    type: "user" | "bid" | "market" | "transfer" | "win" | "commission"
    title: string
    description: string
    time: string
    status: "success" | "pending" | "failed"
    amount?: string
    user?: string
    market?: string
}

const activities: ActivityItem[] = [
    {
        id: "1",
        type: "bid",
        title: "New Bid Placed",
        description: "User placed bid on Kalyan Bazar",
        time: "2 minutes ago",
        status: "success",
        amount: "₹1,500",
        user: "user_123",
        market: "Kalyan Bazar"
    },
    {
        id: "2",
        type: "win",
        title: "Winning Bid",
        description: "User won bid on Milan Day",
        time: "5 minutes ago",
        status: "success",
        amount: "₹5,200",
        user: "user_456",
        market: "Milan Day"
    },
    {
        id: "3",
        type: "transfer",
        title: "Point Transfer",
        description: "Points transferred to user account",
        time: "8 minutes ago",
        status: "success",
        amount: "₹2,000",
        user: "user_789"
    },
    {
        id: "4",
        type: "user",
        title: "New User Registration",
        description: "New player registered",
        time: "12 minutes ago",
        status: "success",
        user: "user_101"
    },
    {
        id: "5",
        type: "commission",
        title: "Commission Earned",
        description: "Commission from user activity",
        time: "15 minutes ago",
        status: "success",
        amount: "₹150",
        user: "user_202"
    },
    {
        id: "6",
        type: "market",
        title: "Market Closed",
        description: "Kalyan Bazar market closed",
        time: "20 minutes ago",
        status: "success",
        market: "Kalyan Bazar"
    },
    {
        id: "7",
        type: "bid",
        title: "Bid Failed",
        description: "Insufficient points for bid",
        time: "25 minutes ago",
        status: "failed",
        amount: "₹3,000",
        user: "user_303"
    },
    {
        id: "8",
        type: "transfer",
        title: "Transfer Pending",
        description: "Point transfer awaiting approval",
        time: "30 minutes ago",
        status: "pending",
        amount: "₹1,800",
        user: "user_404"
    }
]

const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
        case "user":
            return <Users className="h-4 w-4" />
        case "bid":
            return <TrendingUp className="h-4 w-4" />
        case "market":
            return <Target className="h-4 w-4" />
        case "transfer":
            return <Wallet className="h-4 w-4" />
        case "win":
            return <Award className="h-4 w-4" />
        case "commission":
            return <DollarSign className="h-4 w-4" />
        default:
            return <Activity className="h-4 w-4" />
    }
}

const getStatusIcon = (status: ActivityItem["status"]) => {
    switch (status) {
        case "success":
            return <CheckCircle className="h-4 w-4 text-green-500" />
        case "pending":
            return <Clock className="h-4 w-4 text-yellow-500" />
        case "failed":
            return <XCircle className="h-4 w-4 text-red-500" />
        default:
            return <Activity className="h-4 w-4" />
    }
}

const getStatusColor = (status: ActivityItem["status"]) => {
    switch (status) {
        case "success":
            return "bg-green-500/10 text-green-600 border-green-500/20"
        case "pending":
            return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        case "failed":
            return "bg-red-500/10 text-red-600 border-red-500/20"
        default:
            return "bg-muted text-muted-foreground border-border"
    }
}

export function RecentActivity() {
    return (
        <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
            <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                    </div>
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 dark:from-black/30 dark:to-black/20 border border-border hover:from-white/10 hover:to-white/20 dark:hover:from-black/40 dark:hover:to-black/30 transition-all duration-200 group cursor-pointer"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-tertiary/30 transition-all duration-200">
                                    {getActivityIcon(activity.type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors text-primary">
                                            {activity.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            {activity.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {activity.user && (
                                                <Badge variant="outline" className="text-xs border-border bg-card/60 dark:bg-card/40">
                                                    {activity.user}
                                                </Badge>
                                            )}
                                            {activity.market && (
                                                <Badge variant="outline" className="text-xs border-border bg-card/60 dark:bg-card/40">
                                                    {activity.market}
                                                </Badge>
                                            )}
                                            {activity.amount && (
                                                <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                                                    {activity.amount}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(activity.status)}
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {activity.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                    <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary/10 to-tertiary/10 dark:from-primary/20 dark:to-tertiary/20 hover:from-primary/20 hover:to-tertiary/20 dark:hover:from-primary/30 dark:hover:to-tertiary/30 text-primary font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2">
                        <Activity className="h-4 w-4" />
                        View All Activity
                    </button>
                </div>
            </CardContent>
        </Card>
    )
} 
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, DollarSign, Sparkles } from "lucide-react"
import { TransferStats as TransferStatsType } from "@/lib/api/transfer"

interface TransferStatsProps {
    stats: TransferStatsType | null
}

export function TransferStats({ stats }: TransferStatsProps) {
    if (!stats) {
        return null
    }

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Transfers</p>
                            <p className="text-xl font-bold text-primary">{stats.totalTransfers || 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="glass-card bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Credits</p>
                            <p className="text-xl font-bold text-green-600">{stats.totalCredits || 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="glass-card bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Debits</p>
                            <p className="text-xl font-bold text-red-600">{stats.totalDebits || 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="glass-card bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-xl font-bold text-purple-600">₹{(stats.totalAmount || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
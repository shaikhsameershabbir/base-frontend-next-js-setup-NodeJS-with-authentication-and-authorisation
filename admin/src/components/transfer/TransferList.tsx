"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Wallet,
    ArrowRight,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    TrendingUp,
    History,
    ChevronDown
} from "lucide-react"
import { TransferHistoryItem } from "@/lib/api/transfer"

interface TransferListProps {
    transfers: TransferHistoryItem[]
    loading: boolean
    onRefresh: () => void
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "completed":
            return "bg-green-500/10 text-green-600 border-green-500/20"
        case "pending":
            return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        case "failed":
            return "bg-red-500/10 text-red-600 border-red-500/20"
        default:
            return "bg-muted text-muted-foreground border-border"
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case "completed":
            return <CheckCircle className="h-4 w-4 text-green-600" />
        case "pending":
            return <Clock className="h-4 w-4 text-yellow-600" />
        case "failed":
            return <XCircle className="h-4 w-4 text-red-600" />
        default:
            return <Clock className="h-4 w-4" />
    }
}

const getTypeColor = (type: string) => {
    switch (type) {
        case "credit":
            return "bg-green-500/10 text-green-600 border-green-500/20"
        case "debit":
            return "bg-red-500/10 text-red-600 border-red-500/20"
        default:
            return "bg-muted text-muted-foreground border-border"
    }
}

export function TransferList({ transfers, loading, onRefresh }: TransferListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState<string | "all">("all")
    const [expandedTransfers, setExpandedTransfers] = useState<Set<string>>(new Set())

    const filteredTransfers = (transfers || []).filter(transfer => {
        const fromUserStr = typeof transfer.fromUser === 'string' ? transfer.fromUser : transfer.fromUser?.username || '';
        const toUserStr = typeof transfer.toUser === 'string' ? transfer.toUser : transfer.toUser?.username || '';
        const reasonStr = transfer.reason?.toString() || '';

        const matchesSearch = fromUserStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            toUserStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reasonStr.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "all" || transfer.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const toggleTransferExpansion = (transferId: string) => {
        const newExpanded = new Set(expandedTransfers)
        if (newExpanded.has(transferId)) {
            newExpanded.delete(transferId)
        } else {
            newExpanded.add(transferId)
        }
        setExpandedTransfers(newExpanded)
    }

    const getUserDisplayName = (user: any) => {
        if (typeof user === 'string') {
            return user || 'Unknown'
        }
        if (user && typeof user === 'object' && user.username) {
            return user.username || 'Unknown'
        }
        return 'Unknown'
    }

    return (
        <Card className="glass-card bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
            <CardHeader className="pb-6">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-white" />
                        </div>
                        Recent Transfers ({filteredTransfers.length})
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <div className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}>
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        Refresh
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Filters and Search */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search transfers by user or reason..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    key="filter-all"
                                    variant={filterStatus === "all" ? "default" : "outline"}
                                    onClick={() => setFilterStatus("all")}
                                    className="bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90"
                                >
                                    All
                                </Button>
                                <Button
                                    key="filter-completed"
                                    variant={filterStatus === "completed" ? "default" : "outline"}
                                    onClick={() => setFilterStatus("completed")}
                                    className="border-green-500/20 hover:bg-green-500/10"
                                >
                                    Completed
                                </Button>
                                <Button
                                    key="filter-pending"
                                    variant={filterStatus === "pending" ? "default" : "outline"}
                                    onClick={() => setFilterStatus("pending")}
                                    className="border-yellow-500/20 hover:bg-yellow-500/10"
                                >
                                    Pending
                                </Button>
                                <Button
                                    key="filter-failed"
                                    variant={filterStatus === "failed" ? "default" : "outline"}
                                    onClick={() => setFilterStatus("failed")}
                                    className="border-red-500/20 hover:bg-red-500/10"
                                >
                                    Failed
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-muted-foreground">Loading transfers...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTransfers.length > 0 ? (
                            filteredTransfers.map((transfer, index) => (
                                <div key={transfer.id || `transfer-${index}`} className="space-y-2">
                                    <div
                                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 dark:from-black/30 dark:to-black/20 border border-border hover:from-white/10 hover:to-white/20 dark:hover:from-black/40 dark:hover:to-black/30 transition-all duration-200 group cursor-pointer"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        onClick={() => toggleTransferExpansion(transfer.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-tertiary/30 transition-all duration-200">
                                                <Wallet className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm text-primary">{getUserDisplayName(transfer.fromUser)}</span>
                                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-semibold text-sm text-primary">{getUserDisplayName(transfer.toUser)}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{transfer.reason || 'No reason provided'}</p>
                                                {transfer.adminNote && (
                                                    <p className="text-xs text-blue-600 mt-1 text-link">{transfer.adminNote}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={`font-bold ${transfer.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                                                    {transfer.type === "credit" ? "+" : "-"}₹{(transfer.amount || 0).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-muted">{transfer.timestamp || 'No timestamp'}</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Badge className={`text-xs ${getStatusColor(transfer.status || 'unknown')}`}>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(transfer.status || 'unknown')}
                                                        {transfer.status || 'unknown'}
                                                    </div>
                                                </Badge>
                                                <Badge className={`text-xs ${getTypeColor(transfer.type || 'unknown')}`}>
                                                    {transfer.type || 'unknown'}
                                                </Badge>
                                            </div>
                                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedTransfers.has(transfer.id) ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedTransfers.has(transfer.id) && (
                                        <div className="ml-14 p-4 rounded-lg bg-gradient-to-r from-white/3 to-white/5 dark:from-black/20 dark:to-black/10 border border-border/50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold text-sm text-primary">Balance Changes</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-muted-foreground">From User ({getUserDisplayName(transfer.fromUser)}):</span>
                                                            <div className="text-right">
                                                                <div className="text-xs text-muted-foreground">₹{(transfer.fromUserBalanceBefore || 0).toLocaleString()}</div>
                                                                <div className="text-xs text-muted-foreground">→</div>
                                                                <div className="text-xs font-semibold text-primary">₹{(transfer.fromUserBalanceAfter || 0).toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-muted-foreground">To User ({getUserDisplayName(transfer.toUser)}):</span>
                                                            <div className="text-right">
                                                                <div className="text-xs text-muted-foreground">₹{(transfer.toUserBalanceBefore || 0).toLocaleString()}</div>
                                                                <div className="text-xs text-muted-foreground">→</div>
                                                                <div className="text-xs font-semibold text-primary">₹{(transfer.toUserBalanceAfter || 0).toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold text-sm text-primary">Transfer Details</h4>
                                                    <div className="space-y-2 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Processed By:</span>
                                                            <span className="text-primary">{transfer.processedBy || 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Type:</span>
                                                            <Badge className={`text-xs ${getTypeColor(transfer.type || 'unknown')}`}>
                                                                {transfer.type || 'unknown'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Status:</span>
                                                            <Badge className={`text-xs ${getStatusColor(transfer.status || 'unknown')}`}>
                                                                {transfer.status || 'unknown'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Date:</span>
                                                            <span className="text-primary">{transfer.timestamp || 'No timestamp'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No transfers found</h3>
                                <p className="text-sm text-muted-foreground">
                                    {searchTerm || filterStatus !== "all"
                                        ? "Try adjusting your search or filters"
                                        : "Start by creating your first transfer"}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-border">
                    <Button className="w-full bg-gradient-to-r from-primary/10 to-tertiary/10 dark:from-primary/20 dark:to-tertiary/20 hover:from-primary/20 hover:to-tertiary/20 dark:hover:from-primary/30 dark:hover:to-tertiary/30 text-primary font-semibold transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2">
                        <History className="h-4 w-4" />
                        View All Transfers
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
} 
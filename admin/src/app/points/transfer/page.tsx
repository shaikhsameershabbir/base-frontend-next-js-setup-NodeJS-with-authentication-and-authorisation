"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    Wallet,
    ArrowRight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Filter,
    Plus,
    DollarSign,
    Users,
    TrendingUp,
    Sparkles,
    Send,
    History,
    ChevronDown,
    User
} from "lucide-react"
import { getChildUsers, processTransfer, getTransferHistory, getTransferStats, type ChildUser, type TransferRequest, type TransferHistoryItem, type TransferStats } from "@/lib/api/transfer"

interface Transfer {
    id: string
    fromUser: string
    toUser: string
    amount: number
    status: "pending" | "completed" | "failed"
    type: "credit" | "debit"
    reason: string
    timestamp: string
    adminNote?: string
}

const getStatusColor = (status: Transfer["status"]) => {
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

const getStatusIcon = (status: Transfer["status"]) => {
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

const getTypeColor = (type: Transfer["type"]) => {
    switch (type) {
        case "credit":
            return "bg-green-500/10 text-green-600 border-green-500/20"
        case "debit":
            return "bg-red-500/10 text-red-600 border-red-500/20"
        default:
            return "bg-muted text-muted-foreground border-border"
    }
}

export default function PointTransferPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState<Transfer["status"] | "all">("all")
    const [childUsers, setChildUsers] = useState<ChildUser[]>([])
    const [transfers, setTransfers] = useState<TransferHistoryItem[]>([])
    const [transferStats, setTransferStats] = useState<TransferStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState<ChildUser | null>(null)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [newTransfer, setNewTransfer] = useState({
        toUserId: "",
        amount: "",
        type: "credit" as "credit" | "debit",
        reason: "",
        adminNote: ""
    })
    const [expandedTransfers, setExpandedTransfers] = useState<Set<string>>(new Set())

    useEffect(() => {
        // Check authentication
        const auth = localStorage.getItem("isAuthenticated")
        if (!auth) {
            router.push("/login")
        } else {
            setIsAuthenticated(true)
            loadData()
        }
    }, [router])

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [childUsersData, transfersData, statsData] = await Promise.all([
                getChildUsers(),
                getTransferHistory(),
                getTransferStats()
            ])
            setChildUsers(childUsersData)
            setTransfers(transfersData.data)
            setTransferStats(statsData.data)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTransfers = transfers.filter(transfer => {
        const matchesSearch = transfer.fromUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfer.toUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfer.reason.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "all" || transfer.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const handleTransfer = async () => {
        if (!newTransfer.toUserId || !newTransfer.amount || !newTransfer.reason) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' })
            setTimeout(() => setMessage(null), 3000)
            return
        }

        if (Number(newTransfer.amount) <= 0) {
            setMessage({ type: 'error', text: 'Amount must be greater than 0' })
            setTimeout(() => setMessage(null), 3000)
            return
        }

        try {
            setLoading(true)
            const transferData: TransferRequest = {
                toUserId: newTransfer.toUserId,
                amount: Number(newTransfer.amount),
                type: newTransfer.type,
                reason: newTransfer.reason,
                adminNote: newTransfer.adminNote
            }

            await processTransfer(transferData)

            // Reset form and reload data
            setNewTransfer({ toUserId: "", amount: "", type: "credit", reason: "", adminNote: "" })
            setSelectedUser(null)
            await loadData()

            setMessage({ type: 'success', text: 'Transfer completed successfully!' })
            setTimeout(() => setMessage(null), 5000)
        } catch (error: any) {
            console.error('Transfer error:', error)
            setMessage({ type: 'error', text: error.response?.data?.message || 'Transfer failed' })
            setTimeout(() => setMessage(null), 5000)
        } finally {
            setLoading(false)
        }
    }

    const toggleTransferExpansion = (transferId: string) => {
        const newExpanded = new Set(expandedTransfers)
        if (newExpanded.has(transferId)) {
            newExpanded.delete(transferId)
        } else {
            newExpanded.add(transferId)
        }
        setExpandedTransfers(newExpanded)
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <AdminLayout>
            <div className="space-y-8 animate-fade-in">

                {/* Header */}                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight dark:text-white text-black">Point Transfer</h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Transfer Statistics */}
                {transferStats && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="glass-card bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <TrendingUp className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Transfers</p>
                                        <p className="text-xl font-bold text-primary">{transferStats.totalTransfers}</p>
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
                                        <p className="text-xl font-bold text-green-600">{transferStats.totalCredits}</p>
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
                                        <p className="text-xl font-bold text-red-600">{transferStats.totalDebits}</p>
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
                                        <p className="text-xl font-bold text-purple-600">₹{transferStats.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid gap-8 md:grid-cols-1">
                    {/* New Transfer */}
                    <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-xl font-bold">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <Plus className="h-4 w-4 text-white" />
                                </div>
                                New Transfer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="toUserId" className="text-secondary">To User</Label>
                                <div className="relative" ref={dropdownRef}>
                                    <Input
                                        id="toUserId"
                                        placeholder="Select a child user"
                                        value={selectedUser ? `${selectedUser.username} (${selectedUser.id})` : newTransfer.toUserId}
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                        readOnly
                                        className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60 cursor-pointer"
                                    />
                                    {selectedUser ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-red-500/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUser(null);
                                                setNewTransfer({ ...newTransfer, toUserId: "" });
                                            }}
                                        >
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        </Button>
                                    ) : null}
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                                    {showUserDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {childUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewTransfer({ ...newTransfer, toUserId: user.id });
                                                        setShowUserDropdown(false);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-primary">{user.username}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-secondary">₹{user.balance.toLocaleString()}</div>
                                                        <div className="text-xs text-muted">{user.role}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {childUsers.length === 0 && (
                                                <div className="px-4 py-2 text-muted text-sm">
                                                    No child users found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-secondary">Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={newTransfer.amount}
                                    onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
                                    className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-secondary">Transfer Type</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={newTransfer.type === "credit" ? "default" : "outline"}
                                        onClick={() => setNewTransfer({ ...newTransfer, type: "credit" })}
                                        className={`flex-1 ${newTransfer.type === "credit" ? "bg-green-500 hover:bg-green-600" : "border-green-500/20 hover:bg-green-500/10"}`}
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Credit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={newTransfer.type === "debit" ? "default" : "outline"}
                                        onClick={() => setNewTransfer({ ...newTransfer, type: "debit" })}
                                        className={`flex-1 ${newTransfer.type === "debit" ? "bg-red-500 hover:bg-red-600" : "border-red-500/20 hover:bg-red-500/10"}`}
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Debit
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-secondary">Reason</Label>
                                <Input
                                    id="reason"
                                    placeholder="Winning payout, commission, etc."
                                    value={newTransfer.reason}
                                    onChange={(e) => setNewTransfer({ ...newTransfer, reason: e.target.value })}
                                    className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adminNote" className="text-secondary">Admin Note (Optional)</Label>
                                <Input
                                    id="adminNote"
                                    placeholder="Additional notes"
                                    value={newTransfer.adminNote}
                                    onChange={(e) => setNewTransfer({ ...newTransfer, adminNote: e.target.value })}
                                    className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                                />
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                onClick={handleTransfer}
                                disabled={loading || !newTransfer.toUserId || !newTransfer.amount || !newTransfer.reason}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {loading ? "Processing..." : "Process Transfer"}
                            </Button>
                        </CardContent>
                    </Card>


                </div>

                {/* Message Display */}
                {message && (
                    <div className={`p-4 rounded-lg border ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-600'
                        : 'bg-red-500/10 border-red-500/20 text-red-600'
                        }`}>
                        <div className="flex items-center gap-2">
                            {message.type === 'success' ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                    <CardContent className="p-6">
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
                                        variant={filterStatus === "all" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("all")}
                                        className="bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={filterStatus === "completed" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("completed")}
                                        className="border-green-500/20 hover:bg-green-500/10"
                                    >
                                        Completed
                                    </Button>
                                    <Button
                                        variant={filterStatus === "pending" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("pending")}
                                        className="border-yellow-500/20 hover:bg-yellow-500/10"
                                    >
                                        Pending
                                    </Button>
                                    <Button
                                        variant={filterStatus === "failed" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("failed")}
                                        className="border-red-500/20 hover:bg-red-500/10"
                                    >
                                        Failed
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transfers Table */}
                <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
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
                                onClick={loadData}
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
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="ml-2 text-muted-foreground">Loading transfers...</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTransfers.length > 0 ? (
                                    filteredTransfers.map((transfer, index) => (
                                        <div key={transfer.id} className="space-y-2">
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
                                                            <span className="font-semibold text-sm text-primary">{transfer.fromUser}</span>
                                                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                            <span className="font-semibold text-sm text-primary">{transfer.toUser}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{transfer.reason}</p>
                                                        {transfer.adminNote && (
                                                            <p className="text-xs text-blue-600 mt-1 text-link">{transfer.adminNote}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className={`font-bold ${transfer.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                                                            {transfer.type === "credit" ? "+" : "-"}₹{transfer.amount.toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-muted">{transfer.timestamp}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge className={`text-xs ${getStatusColor(transfer.status)}`}>
                                                            <div className="flex items-center gap-1">
                                                                {getStatusIcon(transfer.status)}
                                                                {transfer.status}
                                                            </div>
                                                        </Badge>
                                                        <Badge className={`text-xs ${getTypeColor(transfer.type)}`}>
                                                            {transfer.type}
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
                                                                    <span className="text-xs text-muted-foreground">From User ({transfer.fromUser}):</span>
                                                                    <div className="text-right">
                                                                        <div className="text-xs text-muted-foreground">₹{(transfer.fromUserBalanceBefore || 0).toLocaleString()}</div>
                                                                        <div className="text-xs text-muted-foreground">→</div>
                                                                        <div className="text-xs font-semibold text-primary">₹{(transfer.fromUserBalanceAfter || 0).toLocaleString()}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs text-muted-foreground">To User ({transfer.toUser}):</span>
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
                                                                    <span className="text-primary">{transfer.processedBy}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Type:</span>
                                                                    <Badge className={`text-xs ${getTypeColor(transfer.type)}`}>
                                                                        {transfer.type}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Status:</span>
                                                                    <Badge className={`text-xs ${getStatusColor(transfer.status)}`}>
                                                                        {transfer.status}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Date:</span>
                                                                    <span className="text-primary">{transfer.timestamp}</span>
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
            </div>
        </AdminLayout>
    )
} 
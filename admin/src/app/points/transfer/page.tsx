"use client"

import { useEffect, useState } from "react"
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
    History
} from "lucide-react"

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

const transfers: Transfer[] = [
    {
        id: "1",
        fromUser: "Admin",
        toUser: "user_123",
        amount: 5000,
        status: "completed",
        type: "credit",
        reason: "Winning payout",
        timestamp: "2 minutes ago",
        adminNote: "Kalyan Bazar win"
    },
    {
        id: "2",
        fromUser: "user_456",
        toUser: "Admin",
        amount: 2000,
        status: "pending",
        type: "debit",
        reason: "Withdrawal request",
        timestamp: "5 minutes ago",
        adminNote: "Pending approval"
    },
    {
        id: "3",
        fromUser: "Admin",
        toUser: "user_789",
        amount: 1500,
        status: "completed",
        type: "credit",
        reason: "Commission payout",
        timestamp: "10 minutes ago",
        adminNote: "Monthly commission"
    },
    {
        id: "4",
        fromUser: "user_101",
        toUser: "Admin",
        amount: 3000,
        status: "failed",
        type: "debit",
        reason: "Insufficient balance",
        timestamp: "15 minutes ago",
        adminNote: "Balance too low"
    },
    {
        id: "5",
        fromUser: "Admin",
        toUser: "user_202",
        amount: 8000,
        status: "pending",
        type: "credit",
        reason: "Large win payout",
        timestamp: "20 minutes ago",
        adminNote: "Milan Day jackpot"
    }
]

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
    const [newTransfer, setNewTransfer] = useState({
        toUser: "",
        amount: "",
        reason: "",
        adminNote: ""
    })

    useEffect(() => {
        // Check authentication
        const auth = localStorage.getItem("isAuthenticated")
        if (!auth) {
            router.push("/login")
        } else {
            setIsAuthenticated(true)
        }
    }, [router])

    const filteredTransfers = transfers.filter(transfer => {
        const matchesSearch = transfer.fromUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfer.toUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfer.reason.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "all" || transfer.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const handleTransfer = () => {
        // Handle transfer logic here
        console.log("Processing transfer:", newTransfer)
        setNewTransfer({ toUser: "", amount: "", reason: "", adminNote: "" })
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <AdminLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight dark:text-white text-black">Point Transfer</h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>

         

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
                                <Label htmlFor="toUser" className="text-secondary">To User</Label>
                                <Input
                                    id="toUser"
                                    placeholder="Enter user ID or phone number"
                                    value={newTransfer.toUser}
                                    onChange={(e) => setNewTransfer({ ...newTransfer, toUser: e.target.value })}
                                    className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                                />
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
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Process Transfer
                            </Button>
                        </CardContent>
                    </Card>

        
                </div>

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
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
                                <Wallet className="h-4 w-4 text-white" />
                            </div>
                            Recent Transfers ({filteredTransfers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredTransfers.map((transfer, index) => (
                                <div
                                    key={transfer.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 dark:from-black/30 dark:to-black/20 border border-border hover:from-white/10 hover:to-white/20 dark:hover:from-black/40 dark:hover:to-black/30 transition-all duration-200 group"
                                    style={{ animationDelay: `${index * 50}ms` }}
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
                                    </div>
                                </div>
                            ))}
                        </div>

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
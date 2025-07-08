"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Shield,
    DollarSign,
    Target,
    TrendingUp,
    Wallet,
    Clock,
    CheckCircle,
    XCircle,
    Sparkles,
    ArrowUpRight
} from "lucide-react"

interface User {
    id: string
    name: string
    email: string
    phone: string
    status: "active" | "inactive" | "suspended"
    balance: number
    totalBids: number
    totalWins: number
    commission: number
    joinDate: string
    lastActive: string
    avatar?: string
}

const users: User[] = [
    {
        id: "1",
        name: "Rahul Kumar",
        email: "rahul@example.com",
        phone: "+91 98765 43210",
        status: "active",
        balance: 25000,
        totalBids: 156,
        totalWins: 89,
        commission: 1250,
        joinDate: "2024-01-15",
        lastActive: "2 minutes ago",
        avatar: "/avatars/01.png"
    },
    {
        id: "2",
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91 87654 32109",
        status: "active",
        balance: 18500,
        totalBids: 234,
        totalWins: 145,
        commission: 2100,
        joinDate: "2024-02-03",
        lastActive: "5 minutes ago",
        avatar: "/avatars/02.png"
    },
    {
        id: "3",
        name: "Amit Patel",
        email: "amit@example.com",
        phone: "+91 76543 21098",
        status: "inactive",
        balance: 5000,
        totalBids: 67,
        totalWins: 23,
        commission: 450,
        joinDate: "2024-01-28",
        lastActive: "2 days ago",
        avatar: "/avatars/03.png"
    },
    {
        id: "4",
        name: "Neha Singh",
        email: "neha@example.com",
        phone: "+91 65432 10987",
        status: "suspended",
        balance: 0,
        totalBids: 45,
        totalWins: 12,
        commission: 300,
        joinDate: "2024-02-10",
        lastActive: "1 week ago",
        avatar: "/avatars/04.png"
    },
    {
        id: "5",
        name: "Vikram Malhotra",
        email: "vikram@example.com",
        phone: "+91 54321 09876",
        status: "active",
        balance: 45000,
        totalBids: 312,
        totalWins: 198,
        commission: 3200,
        joinDate: "2024-01-05",
        lastActive: "1 hour ago",
        avatar: "/avatars/05.png"
    }
]

const getStatusColor = (status: User["status"]) => {
    switch (status) {
        case "active":
            return "bg-green-500/10 text-green-600 border-green-500/20"
        case "inactive":
            return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        case "suspended":
            return "bg-red-500/10 text-red-600 border-red-500/20"
        default:
            return "bg-muted text-muted-foreground border-border"
    }
}

const getStatusIcon = (status: User["status"]) => {
    switch (status) {
        case "active":
            return <CheckCircle className="h-4 w-4 text-green-600" />
        case "inactive":
            return <Clock className="h-4 w-4 text-yellow-600" />
        case "suspended":
            return <XCircle className="h-4 w-4 text-red-600" />
        default:
            return <Clock className="h-4 w-4" />
    }
}

export default function UsersPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState<User["status"] | "all">("all")

    useEffect(() => {
        // Check authentication
        const auth = localStorage.getItem("isAuthenticated")
        if (!auth) {
            router.push("/login")
        } else {
            setIsAuthenticated(true)
        }
    }, [router])

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm)
        const matchesStatus = filterStatus === "all" || user.status === filterStatus
        return matchesSearch && matchesStatus
    })

    if (!isAuthenticated) {
        return null
    }

    return (
        <AdminLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight gradient-text text-primary">User Management</h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Users className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <p className="text-lg font-medium text-secondary">
                        Manage players, commissions, and user accounts
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-card hover-lift animate-slide-up bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                                    <p className="text-2xl font-bold text-blue-400 dark:text-blue-300">1,847</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card hover-lift animate-slide-up bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border" style={{ animationDelay: "100ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                                    <p className="text-2xl font-bold text-green-400 dark:text-green-300">1,234</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card hover-lift animate-slide-up bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border" style={{ animationDelay: "200ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Commission</p>
                                    <p className="text-2xl font-bold text-purple-400 dark:text-purple-300">₹45.2K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card hover-lift animate-slide-up bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border" style={{ animationDelay: "300ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">New Today</p>
                                    <p className="text-2xl font-bold text-orange-400 dark:text-orange-300">12</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="glass-card hover-lift animate-slide-up bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col md:flex-row gap-4 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search users by name, email, or phone..."
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
                                        variant={filterStatus === "active" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("active")}
                                        className="border-green-500/20 hover:bg-green-500/10"
                                    >
                                        Active
                                    </Button>
                                    <Button
                                        variant={filterStatus === "inactive" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("inactive")}
                                        className="border-yellow-500/20 hover:bg-yellow-500/10"
                                    >
                                        Inactive
                                    </Button>
                                    <Button
                                        variant={filterStatus === "suspended" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("suspended")}
                                        className="border-red-500/20 hover:bg-red-500/10"
                                    >
                                        Suspended
                                    </Button>
                                </div>
                            </div>
                            <Button className="bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90">
                                <Plus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="glass-card hover-lift animate-slide-up bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                            Users ({filteredUsers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredUsers.map((user, index) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 dark:from-black/30 dark:to-black/20 border border-border hover:from-white/10 hover:to-white/20 dark:hover:from-black/40 dark:hover:to-black/30 transition-all duration-200 group"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <Avatar className="h-12 w-12 ring-2 ring-white/20">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-tertiary text-white font-semibold">
                                            {user.name.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg group-hover:text-link transition-colors text-primary">
                                                {user.name}
                                            </h3>
                                            <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                                                <div className="flex items-center gap-1">
                                                    {getStatusIcon(user.status)}
                                                    {user.status}
                                                </div>
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted">Email</p>
                                                <p className="font-medium text-primary">{user.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted">Phone</p>
                                                <p className="font-medium text-primary">{user.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted">Balance</p>
                                                <p className="font-medium text-green-400 dark:text-green-300">₹{user.balance.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted">Commission</p>
                                                <p className="font-medium text-purple-400 dark:text-purple-300">₹{user.commission.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-secondary">
                                            <span>Bids: {user.totalBids}</span>
                                            <span>Wins: {user.totalWins}</span>
                                            <span>Joined: {new Date(user.joinDate).toLocaleDateString()}</span>
                                            <span>Last Active: {user.lastActive}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="hover:bg-card/20 dark:hover:bg-card/30">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="hover:bg-card/20 dark:hover:bg-card/30">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="hover:bg-red-500/10 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
} 
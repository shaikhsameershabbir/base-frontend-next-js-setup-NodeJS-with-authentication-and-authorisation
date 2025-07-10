"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { usersAPI, User as UserType } from "@/lib/api-service"
import { AddUserModal } from "@/components/modals/AddUserModal"
import {
    Users,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Shield,
    Target,
    CheckCircle,
    XCircle,
    Loader2,
    User as UserIcon
} from "lucide-react"
import { getChildRole, getRoleColor, getRoleDisplayName, getRoleIcon, getStatusColor, getStatusIcon } from "@/app/helperFunctions/helper"

interface UserWithStats extends UserType {
    avatar?: string
}

export default function UsersPage() {
    const router = useRouter()
    const params = useParams()
    const role = params.role as string
    const userId = params.userid as string

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [users, setUsers] = useState<UserWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

    useEffect(() => {
        // Check authentication
        const auth = localStorage.getItem("isAuthenticated")
        if (!auth) {
            router.push("/login")
        } else {
            setIsAuthenticated(true)
            fetchUsers()
        }
    }, [router, role])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await usersAPI.getUsersByRole(role, userId)

            if (response.success && response.data) {
                setUsers(response.data.users)
            } else {
                setError(response.message || 'Failed to fetch users')
            }
        } catch (err) {
            setError('Failed to fetch users')
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleUserAdded = () => {
        // Refresh the users list when a new user is added
        fetchUsers()
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && user.isActive) ||
            (filterStatus === "inactive" && !user.isActive)
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
                        <h1 className="text-4xl font-medium text-secondary">
                            {getRoleDisplayName(role)}s
                        </h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Users className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <p className="text-lg font-medium text-secondary">
                        Manage {getRoleDisplayName(role).toLowerCase()} accounts and permissions
                    </p>
                </div>

                {/* Filters and Search */}
                <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col md:flex-row gap-4 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                                    <Input
                                        placeholder={`Search ${getRoleDisplayName(role).toLowerCase()}s by username...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                                    />
                                </div>
                                <div className="flex gap-2 bg-primary ">
                                    <Button
                                        variant={filterStatus === "all" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("all")}
                                        className="text-primary bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90"
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
                                        className="border-red-500/20 hover:bg-red-500/10"
                                    >
                                        Inactive
                                    </Button>
                                </div>
                            </div>
                            <AddUserModal
                                role={role}
                                parentId={userId}
                                onUserAdded={handleUserAdded}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-primary">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                            {getRoleDisplayName(role)}s ({filteredUsers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 text-primary">Loading {getRoleDisplayName(role).toLowerCase()}s...</span>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                                    <p className="text-destructive font-medium">{error}</p>
                                    <Button
                                        onClick={fetchUsers}
                                        className="mt-4 bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Users className="h-12 w-12 text-muted mx-auto mb-4" />
                                    <p className="text-muted font-medium">No {getRoleDisplayName(role).toLowerCase()}s found</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-4 px-4 font-semibold text-primary">Username</th>
                                            <th className="text-left py-4 px-4 font-semibold text-primary">Role</th>
                                            <th className="text-left py-4 px-4 font-semibold text-primary">Balance</th>
                                            <th className="text-left py-4 px-4 font-semibold text-primary">Status</th>
                                            <th className="text-left py-4 px-4 font-semibold text-primary">Joined</th>
                                            <th className="text-left py-4 px-4 font-semibold text-primary">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user, index) => (
                                            <tr
                                                key={user._id}
                                                className="border-b border-border/50 hover:bg-card/20 dark:hover:bg-card/30 transition-colors"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="font-medium text-primary">
                                                        {user.username}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                                                        <div className="flex items-center gap-1">
                                                            {getRoleIcon(user.role)}
                                                            {getRoleDisplayName(user.role)}
                                                        </div>
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                        ₹{user.balance.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={`text-xs ${getStatusColor(user.isActive)}`}>
                                                        <div className="flex items-center gap-1">
                                                            {getStatusIcon(user.isActive)}
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </div>
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-sm text-secondary">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="hover:bg-card/20 dark:hover:bg-card/30 text-primary hover:text-primary"
                                                            onClick={() => router.push(`/users/${getChildRole(role)}/${user._id}`)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="hover:bg-card/20 dark:hover:bg-card/30 text-primary hover:text-primary"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="hover:bg-destructive/10 hover:text-destructive text-primary"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
} 
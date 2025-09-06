"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { usersAPI, User as UserType, PaginationInfo } from "@/lib/api-service"
import { AddUserModal } from "@/components/modals/AddUserModal"
import { useDebounce } from "@/hooks/useDebounce"
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
    User as UserIcon,
    Building2
} from "lucide-react"
import { getChildRole, getRoleColor, getRoleDisplayName, getRoleIcon, getStatusColor, getStatusIcon } from "@/app/helperFunctions/helper"
import { EditPasswordModal } from '@/components/modals/EditPasswordModal';
import { EditUserModal } from '@/components/modals/EditUserModal';
import { AssignMarketModal } from '@/components/modals/AssignMarketModal';

interface UserWithStats extends UserType {
    avatar?: string
}

export default function UsersPage() {
    const router = useRouter()
    const params = useParams()
    const role = params.role as string
    const userId = params.userid as string

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [currentUser, setCurrentUser] = useState<UserType | null>(null)
    const [users, setUsers] = useState<UserWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editUserModalOpen, setEditUserModalOpen] = useState(false);
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [editUser, setEditUser] = useState<{ _id: string; username: string; role: string; percentage: number } | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
    const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [assignMarketModalOpen, setAssignMarketModalOpen] = useState(false);
    const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<{ id: string; name: string; role: string } | null>(null);

    useEffect(() => {
        // Check authentication and get current user
        const auth = localStorage.getItem("isAuthenticated")
        if (!auth) {
            router.push("/")
        } else {
            setIsAuthenticated(true)
            // Get current user from localStorage
            const userStr = localStorage.getItem("user")
            if (userStr) {
                try {
                    const user = JSON.parse(userStr)
                    setCurrentUser(user)
                } catch (error) {
                    console.error("Error parsing user data:", error)
                }
            }
        }
    }, [router])

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers()
        }
    }, [isAuthenticated, role, debouncedSearchTerm, currentPage])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pagination.limit.toString(),
                role: role,
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(userId !== "all" && { parentId: userId })
            });

            // Use the updated API structure
            const response = await usersAPI.getUsers(currentPage, pagination.limit, debouncedSearchTerm, role, userId !== "all" ? userId : "")

            if (response.success && response.data) {
                // The API returns data directly as an array, not wrapped in a data property
                setUsers(Array.isArray(response.data) ? response.data : [])
                // For now, set default pagination since it's not in the response
                setPagination({
                    page: currentPage,
                    limit: pagination.limit,
                    total: Array.isArray(response.data) ? response.data.length : 0,
                    totalPages: 1
                })
            } else {
                setError(response.message || 'Failed to fetch users')
                setUsers([]) // Set empty array on error
            }
        } catch (err) {
            setError('Failed to fetch users')
            console.error('Error fetching users:', err)
            setUsers([]) // Set empty array on error
        } finally {
            setLoading(false)
        }
    }

    const handleUserAdded = () => {
        // Reset to first page and refresh the users list when a new user is added
        setCurrentPage(1)
        fetchUsers()
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1) // Reset to first page when searching
    }

    const handleToggleActive = async (userId: string) => {
        setToggleLoadingId(userId);
        try {
            await usersAPI.toggleUserActive(userId);
            fetchUsers();
        } finally {
            setToggleLoadingId(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        setDeleteLoadingId(userId);
        setError(null); // Clear any previous errors
        try {
            const response = await usersAPI.deleteUser(userId);
            if (response.success) {
                // Show success message or notification
                console.log('User deleted successfully');
                // Refresh the users list
                fetchUsers();
            } else {
                setError(response.message || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user. Please try again.');
        } finally {
            setDeleteLoadingId(null);
            setConfirmDeleteId(null);
        }
    };

    const handleEditPassword = (userId: string) => {
        setEditUserId(userId);
        setEditModalOpen(true);
    };

    const handleEditUser = (user: UserWithStats) => {
        setEditUser({
            _id: user._id,
            username: user.username,
            role: user.role,
            percentage: user.percentage || 0
        });
        setEditUserModalOpen(true);
    };

    const handleSubmitPassword = async (password: string) => {
        if (!editUserId) return;
        setEditLoading(true);
        try {
            await usersAPI.updateUserPassword(editUserId, password);
            setEditModalOpen(false);
            setEditUserId(null);
        } finally {
            setEditLoading(false);
        }
    };

    const handleAssignMarket = (user: UserWithStats) => {
        setSelectedUserForAssignment({
            id: user._id,
            name: user.username,
            role: user.role
        });
        setAssignMarketModalOpen(true);
    };

    const handleMarketAssignmentSuccess = () => {
        // Optionally refresh the users list or show a success message
        fetchUsers();
    };

    const handleUserUpdated = () => {
        // Refresh the users list when a user is updated
        fetchUsers();
    };

    // Determine the parentId for new user creation
    const getParentId = (): string | undefined => {
        // If userId is "all", use current user as parent
        if (userId === "all") {
            return currentUser?._id
        }
        // If userId is a specific user ID, use that as parent
        return userId
    }

    // Check if current user can create users of the current role
    const canCreateRole = (): boolean => {
        if (!currentUser) {
            return false
        }

        // Define direct parent-child relationships
        const directParentChild: Record<string, string> = {
            'superadmin': 'admin',
            'admin': 'distributor',
            'distributor': 'agent',
            'agent': 'player'
        }

        // Case 1: userId is "all" - only show if current user is direct parent
        if (userId === "all") {
            return directParentChild[currentUser.role] === role
        }
        console.log('==-------------------------------->>', currentUser.role)
        // Case 2: userId is a specific user ID - always show button, backend will validate
        return true
    }

    const filteredUsers = (users || []).filter(user => {
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && user.isActive) ||
            (filterStatus === "inactive" && !user.isActive)
        return matchesStatus
    })

    if (!isAuthenticated) {
        return null
    }

    return (
        <AdminLayout>
            <EditPasswordModal
                open={editModalOpen}
                onClose={() => { setEditModalOpen(false); setEditUserId(null); }}
                onSubmit={handleSubmitPassword}
                loading={editLoading}
            />
            <EditUserModal
                open={editUserModalOpen}
                onClose={() => { setEditUserModalOpen(false); setEditUser(null); }}
                user={editUser || { _id: '', username: '', role: '', percentage: 0 }}
                onUserUpdated={handleUserUpdated}
            />
            <AssignMarketModal
                open={assignMarketModalOpen}
                onClose={() => { setAssignMarketModalOpen(false); setSelectedUserForAssignment(null); }}
                userId={selectedUserForAssignment?.id || ''}
                userName={selectedUserForAssignment?.name || ''}
                userRole={selectedUserForAssignment?.role || ''}
                onSuccess={handleMarketAssignmentSuccess}
            />
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
                        {userId !== "all" && (
                            <span className="text-white"> under selected user</span>
                        )}
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
                                        onChange={(e) => handleSearchChange(e.target.value)}
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

                            {canCreateRole() && (
                                <AddUserModal
                                    role={role}
                                    parentId={getParentId()}
                                    currentUserRole={currentUser?.role}
                                    onUserAdded={handleUserAdded}
                                />
                            )}
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
                            {getRoleDisplayName(role)}s ({pagination.total} total)
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
                                    <p className="text-muted font-medium">
                                        {searchTerm ? `No ${getRoleDisplayName(role).toLowerCase()}s found matching "${searchTerm}"` : `No ${getRoleDisplayName(role).toLowerCase()}s found`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-4 px-4 font-semibold text-primary">Username</th>
                                                <th className="text-left py-4 px-4 font-semibold text-primary">Role</th>
                                                <th className="text-left py-4 px-4 font-semibold text-primary">Percentage</th>
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

                                                        {
                                                            user.role !== 'player' && (
                                                                <div className="font-medium text-primary"
                                                                    onClick={() => router.push(`/users/${getChildRole(role)}/${user._id}`)}
                                                                >
                                                                    {user.username}
                                                                </div>
                                                            )
                                                        }
                                                        {
                                                            user.role == 'player' && (
                                                                <div className="font-medium text-primary"

                                                                >
                                                                    {user.username}
                                                                </div>
                                                            )
                                                        }

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
                                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                                            {user.percentage || 0}%
                                                        </span>
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
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="ml-2 p-1 h-6 w-6"
                                                                    onClick={() => handleToggleActive(user._id)}
                                                                    disabled={toggleLoadingId === user._id}
                                                                    title={user.isActive ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    {toggleLoadingId === user._id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin text-muted" />
                                                                    ) : user.isActive ? (
                                                                        <XCircle className="h-4 w-4 text-destructive" />
                                                                    ) : (
                                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    )}
                                                                </Button>
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

                                                            {
                                                                user.role !== 'player' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="hover:bg-card/20 dark:hover:bg-card/30 text-primary hover:text-primary"
                                                                        onClick={() => router.push(`/users/${getChildRole(role)}/${user._id}`)}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                )
                                                            }


                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="hover:bg-card/20 dark:hover:bg-card/30 text-primary hover:text-primary"
                                                                onClick={() => handleEditUser(user)}
                                                                title="Edit User"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="hover:bg-blue-500/10 hover:text-blue-500 text-primary"
                                                                onClick={() => handleAssignMarket(user)}
                                                                title="Assign Markets"
                                                            >
                                                                <Building2 className="h-4 w-4" />
                                                            </Button>
                                                            {/* Only show delete button for superadmin and admin */}
                                                            {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="hover:bg-destructive/10 hover:text-destructive text-primary"
                                                                    onClick={() => setConfirmDeleteId(user._id)}
                                                                    disabled={deleteLoadingId === user._id}
                                                                >
                                                                    {deleteLoadingId === user._id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            )}
                                                            {/* Confirm Delete Dialog */}
                                                            {confirmDeleteId === user._id && (
                                                                <div
                                                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                                                                    onClick={() => setConfirmDeleteId(null)}
                                                                >
                                                                    <div
                                                                        className="bg-card rounded-lg p-6 w-full max-w-sm shadow-lg"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <h2 className="text-lg font-bold mb-4">Delete User</h2>
                                                                        <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{user.username}</span> and all their downline? This action cannot be undone.</p>
                                                                        <div className="flex gap-2 justify-end">
                                                                            <Button
                                                                                onClick={() => setConfirmDeleteId(null)}
                                                                                variant="outline"
                                                                                disabled={deleteLoadingId === user._id}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                            <Button
                                                                                onClick={() => handleDeleteUser(user._id)}
                                                                                variant="destructive"
                                                                                disabled={deleteLoadingId === user._id}
                                                                            >
                                                                                {deleteLoadingId === user._id ? (
                                                                                    <>
                                                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                                        Deleting...
                                                                                    </>
                                                                                ) : (
                                                                                    'Delete'
                                                                                )}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="mt-6">
                                    <Pagination
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.total}
                                        itemsPerPage={pagination.limit}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
} 
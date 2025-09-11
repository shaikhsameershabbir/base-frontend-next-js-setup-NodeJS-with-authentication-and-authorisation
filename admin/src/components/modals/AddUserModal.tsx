"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X, Eye, EyeOff } from "lucide-react"
import { usersAPI } from "@/lib/api-service"
import { getRoleDisplayName, getRoleColor, getRoleIcon } from "@/app/helperFunctions/helper"

interface AddUserModalProps {
    role: string
    parentId?: string
    currentUserRole?: string
    onUserAdded?: () => void
    trigger?: React.ReactNode
}

interface UserFormData {
    username: string
    password: string
    confirmPassword: string
    role: string
    percentage: string
}

export function AddUserModal({ role, parentId, currentUserRole, onUserAdded, trigger }: AddUserModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<UserFormData>({
        username: "",
        password: "",
        confirmPassword: "",
        role: role,
        percentage: "0"
    })

    // Define role hierarchy for permission checking
    const roleHierarchy: Record<string, string[]> = {
        'superadmin': ['admin', 'distributor', 'agent', 'player'],
        'admin': ['distributor', 'agent', 'player'],
        'distributor': ['agent', 'player'],
        'agent': ['player'],
        'player': []
    }

    // Check if current user can create the specified role
    const canCreateRole = (): boolean => {
        if (!currentUserRole) return false
        const allowedRoles = roleHierarchy[currentUserRole] || []
        return allowedRoles.includes(role)
    }

    const handleInputChange = (field: keyof UserFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        setError(null) // Clear error when user starts typing
    }

    const validateForm = (): boolean => {
        if (!formData.username.trim()) {
            setError("Username is required")
            return false
        }

        if (formData.username.length < 3) {
            setError("Username must be at least 3 characters")
            return false
        }

        if (!formData.password) {
            setError("Password is required")
            return false
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return false
        }

        // Validate percentage
        const percentage = Number(formData.percentage)
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            setError("Percentage must be a number between 0 and 100")
            return false
        }

        // Check if user has permission to create this role
        if (!canCreateRole()) {
            setError(`You don't have permission to create ${getRoleDisplayName(role)}`)
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            setLoading(true)
            setError(null)

            const userData = {
                username: formData.username.trim(),
                password: formData.password,
                role: formData.role as 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player',
                parentId: parentId, // Pass the parentId to the backend
                percentage: Number(formData.percentage)
            }

            // Use the generic createUser endpoint instead of role-specific ones
            const response = await usersAPI.createUser(userData)

            if (response.success) {
                // Reset form
                setFormData({
                    username: "",
                    password: "",
                    confirmPassword: "",
                    role: role,
                    percentage: "0"
                })

                // Close modal
                setOpen(false)

                // Callback to refresh parent component
                onUserAdded?.()
            } else {
                setError(response.message || 'Failed to create user')
            }
        } catch (err: any) {
            console.error('Error creating user:', err)
            setError(err.response?.data?.message || err.message || 'Failed to create user')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setOpen(false)
            setFormData({
                username: "",
                password: "",
                confirmPassword: "",
                role: role,
                percentage: "0"
            })
            setError(null)
        }
    }

    // Don't render the modal if user doesn't have permission
    if (!canCreateRole()) {
        return null
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add {getRoleDisplayName(role)}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-white" />
                        </div>
                        Add New {getRoleDisplayName(role)}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">Role:</span>
                        <Badge className={`text-xs ${getRoleColor(formData.role)}`}>
                            <div className="flex items-center gap-1">
                                {getRoleIcon(formData.role)}
                                {getRoleDisplayName(formData.role)}
                            </div>
                        </Badge>
                    </div>

             

                    {/* Username Field */}
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-primary">
                            Username
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                            disabled={loading}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-primary">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60 pr-10"
                                disabled={loading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-primary">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60 pr-10"
                                disabled={loading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Percentage Field */}
                    <div className="space-y-2">
                        <Label htmlFor="percentage" className="text-sm font-medium text-primary">
                            Percentage (%)
                        </Label>
                        <Input
                            id="percentage"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="Enter percentage (0-100)"
                            value={formData.percentage}
                            onChange={(e) => handleInputChange('percentage', e.target.value)}
                            className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                            disabled={loading}
                        />
                        <p className="text-xs text-muted text-white">
                            Percentage value between 0 and 100
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <X className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-destructive">{error}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create {getRoleDisplayName(role)}
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 
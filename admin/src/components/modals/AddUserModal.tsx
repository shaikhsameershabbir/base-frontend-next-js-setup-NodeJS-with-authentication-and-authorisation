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
    onUserAdded?: () => void
    trigger?: React.ReactNode
}

interface UserFormData {
    username: string
    password: string
    confirmPassword: string
    balance: string
    role: string
}

export function AddUserModal({ role, parentId, onUserAdded, trigger }: AddUserModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<UserFormData>({
        username: "",
        password: "",
        confirmPassword: "",
        balance: "1000",
        role: role
    })

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

        const balance = parseFloat(formData.balance)
        if (isNaN(balance) || balance < 0) {
            setError("Balance must be a positive number")
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
                balance: parseFloat(formData.balance),
                role: formData.role
            }

            let response
            switch (formData.role) {
                case 'admin':
                    response = await usersAPI.registerAdmin(userData)
                    break
                case 'distributor':
                    response = await usersAPI.registerDistributor(userData)
                    break
                case 'player':
                    response = await usersAPI.registerPlayer(userData)
                    break
                default:
                    throw new Error('Invalid role')
            }

            if (response.success) {
                // Reset form
                setFormData({
                    username: "",
                    password: "",
                    confirmPassword: "",
                    balance: "1000",
                    role: role
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
            setError(err.message || 'Failed to create user')
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
                balance: "1000",
                role: role
            })
            setError(null)
        }
    }

    const getDefaultBalance = (role: string): string => {
        switch (role) {
            case 'admin': return '100000'
            case 'distributor': return '50000'
            case 'agent': return '25000'
            case 'player': return '1000'
            default: return '1000'
        }
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

                    {/* Balance Field */}
                    <div className="space-y-2">
                        <Label htmlFor="balance" className="text-sm font-medium text-primary">
                            Initial Balance (₹)
                        </Label>
                        <Input
                            id="balance"
                            type="number"
                            placeholder="Enter initial balance"
                            value={formData.balance}
                            onChange={(e) => handleInputChange('balance', e.target.value)}
                            className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                            disabled={loading}
                            min="0"
                            step="100"
                        />
                        <p className="text-xs text-muted">
                            Default: ₹{getDefaultBalance(formData.role).toLocaleString()}
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
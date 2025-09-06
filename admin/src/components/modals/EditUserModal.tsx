"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, X, Eye, EyeOff, Edit } from "lucide-react"
import { usersAPI } from "@/lib/api-service"
import { getRoleDisplayName, getRoleColor, getRoleIcon } from "@/app/helperFunctions/helper"

interface EditUserModalProps {
    open: boolean
    onClose: () => void
    user: {
        _id: string
        username: string
        role: string
        percentage: number
    }
    onUserUpdated?: () => void
}

interface UserFormData {
    password: string
    confirmPassword: string
    percentage: string
}

export function EditUserModal({ open, onClose, user, onUserUpdated }: EditUserModalProps) {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<UserFormData>({
        password: "",
        confirmPassword: "",
        percentage: user.percentage.toString()
    })

    // Update form data when user changes
    useEffect(() => {
        setFormData({
            password: "",
            confirmPassword: "",
            percentage: user.percentage.toString()
        })
        setError(null)
    }, [user])

    const handleInputChange = (field: keyof UserFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        setError(null) // Clear error when user starts typing
    }

    const validateForm = (): boolean => {
        // Password validation (optional - only validate if provided)
        if (formData.password && formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            return false
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return false
        }

        // Validate percentage
        const percentage = Number(formData.percentage)
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            setError("Percentage must be a number between 0 and 100")
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

            const updateData: any = {
                percentage: Number(formData.percentage)
            }

            // Only include password if it's provided
            if (formData.password) {
                updateData.password = formData.password
            }

            const response = await usersAPI.updateUser(user._id, updateData)

            if (response.success) {
                // Reset form
                setFormData({
                    password: "",
                    confirmPassword: "",
                    percentage: user.percentage.toString()
                })

                // Close modal
                onClose()

                // Callback to refresh parent component
                onUserUpdated?.()
            } else {
                setError(response.message || 'Failed to update user')
            }
        } catch (err: any) {
            console.error('Error updating user:', err)
            setError(err.response?.data?.message || err.message || 'Failed to update user')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            onClose()
            setFormData({
                password: "",
                confirmPassword: "",
                percentage: user.percentage.toString()
            })
            setError(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <Edit className="h-4 w-4 text-white" />
                        </div>
                        Edit User
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted">Username:</span>
                            <span className="font-medium text-primary">{user.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted">Role:</span>
                            <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                                <div className="flex items-center gap-1">
                                    {getRoleIcon(user.role)}
                                    {getRoleDisplayName(user.role)}
                                </div>
                            </Badge>
                        </div>
                    </div>

                    {/* Password Field (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-primary">
                            New Password (Optional)
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password (leave blank to keep current)"
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

                    {/* Confirm Password Field (Only show if password is provided) */}
                    {formData.password && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-primary">
                                Confirm New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
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
                    )}

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
                        <p className="text-xs text-muted">
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
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update User
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

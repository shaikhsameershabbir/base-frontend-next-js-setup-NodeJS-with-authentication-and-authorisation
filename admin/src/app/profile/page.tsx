"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { authAPI, User } from "@/lib/api-service"

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({ email: "", currentPassword: "", newPassword: "" })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const response = await authAPI.getProfile()
            if (response.success) {
                const userData = response.data?.user
                setUser(userData || null)
                if (userData) {
                    setEditData({
                        email: userData.email || "",
                        currentPassword: "",
                        newPassword: ""
                    })
                }
            } else {
                setError(response.message)
            }
        } catch (err: any) {
            console.error("Error fetching profile:", err)
            setError(err.response?.data?.message || "Failed to fetch profile")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async () => {
        try {
            const response = await authAPI.updateProfile(editData)
            if (response.success) {
                setUser(response.data?.user || null)
                setIsEditing(false)
                setError("")
            } else {
                setError(response.message)
            }
        } catch (err: any) {
            console.error("Error updating profile:", err)
            setError(err.response?.data?.message || "Failed to update profile")
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'superadmin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'distributor': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'player': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-primary">Loading profile...</div>
            </div>
        )
    }

    if (error && !user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error: {error}</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted">No user data available</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-primary">Profile</h1>
                <p className="text-muted">Manage your account information</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-primary">User Information</CardTitle>
                    <CardDescription>
                        Your account details and preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-primary">Username</Label>
                            <div className="p-3 bg-muted rounded-md text-primary">
                                {user.username}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="balance" className="text-primary">Balance</Label>
                            <div className="p-3 bg-muted rounded-md text-primary">
                                ₹{user.balance}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-primary">Email</Label>
                            {isEditing ? (
                                <Input
                                    id="email"
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="text-primary"
                                />
                            ) : (
                                <div className="p-3 bg-muted rounded-md text-primary">
                                    {user.email || "Not set"}
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className="text-primary">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={editData.currentPassword}
                                        onChange={(e) => setEditData({ ...editData, currentPassword: e.target.value })}
                                        className="text-primary"
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-primary">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={editData.newPassword}
                                        onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
                                        className="text-primary"
                                        placeholder="Enter new password (optional)"
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label className="text-primary">Role</Label>
                            <div className="p-3 bg-muted rounded-md">
                                <Badge className={getRoleColor(user.role)}>
                                    {user.role}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-primary">Status</Label>
                            <div className="p-3 bg-muted rounded-md">
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                    {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-primary">Created</Label>
                            <div className="p-3 bg-muted rounded-md text-primary">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        {user.updatedAt && (
                            <div className="space-y-2">
                                <Label className="text-primary">Last Updated</Label>
                                <div className="p-3 bg-muted rounded-md text-primary">
                                    {new Date(user.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        {isEditing ? (
                            <>
                                <Button onClick={handleUpdateProfile} className="text-primary-foreground">
                                    Save Changes
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditData({
                                            email: user.email || "",
                                            currentPassword: "",
                                            newPassword: ""
                                        })
                                        setError("")
                                    }}
                                    className="text-primary"
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} className="text-primary-foreground">
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { authAPI, User } from "@/lib/api-service"
import { Menu } from "lucide-react"

interface NavbarProps {
    onSidebarToggle?: () => void
}

export function Navbar({ onSidebarToggle }: NavbarProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            const response = await authAPI.getProfile()
            if (response.success) {
                setUser(response.data?.user || null)
            } else {
                // If profile fetch fails, redirect to login
                router.push("/login")
            }
        } catch (error) {
            console.error("Error fetching profile:", error)
            router.push("/login")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await authAPI.logout()
            setUser(null)
            router.push("/login")
        } catch (error) {
            console.error("Logout error:", error)
            // Even if logout fails, clear local state and redirect
            setUser(null)
            router.push("/login")
        }
    }

    if (loading) {
        return (
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center px-4">
                    <div className="text-primary">Loading...</div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4">
                {/* Hamburger menu for mobile */}
                <div className="md:hidden mr-2">
                    <Button variant="ghost" size="icon" onClick={onSidebarToggle}>
                        <Menu className="h-6 w-6 text-primary" />
                        <span className="sr-only">Open sidebar</span>
                    </Button>
                </div>
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-primary">Matka SK Admin</h1>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-primary">
                                            {user.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none text-primary">{user.username}</p>
                                        <p className="text-xs leading-none text-muted">{user.role}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/profile")} className="text-primary">
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("/settings")} className="text-primary">
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-primary">
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </nav>
    )
} 
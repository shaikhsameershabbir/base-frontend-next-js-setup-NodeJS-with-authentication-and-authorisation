"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { authAPI, User } from "@/lib/api-service"
import { Menu, LogOut, User as UserIcon, Settings } from "lucide-react"

interface NavbarProps {
    onSidebarToggle?: () => void
    user: User
}

export function Navbar({ onSidebarToggle, user }: NavbarProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await authAPI.logout()

            // Clear local storage
            localStorage.removeItem('isAuthenticated')
            localStorage.removeItem('user')

            // Redirect to login
            router.push("/login")
        } catch (error) {
            console.error("Logout error:", error)
            // Even if logout fails, clear local state and redirect
            localStorage.removeItem('isAuthenticated')
            localStorage.removeItem('user')
            router.push("/login")
        } finally {
            setIsLoggingOut(false)
        }
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
                                    <p className="text-xs leading-none text-muted capitalize">{user.role}</p>
                                    <p className="text-xs leading-none text-muted">₹{user.balance.toLocaleString()}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/profile")} className="text-primary">
                                <UserIcon className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/settings")} className="text-primary">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-primary"
                                disabled={isLoggingOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {isLoggingOut ? "Logging out..." : "Log out"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
} 
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { authAPI, User } from "@/lib/api-service"

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if user is authenticated in localStorage
                const isAuthenticated = localStorage.getItem('isAuthenticated')
                const storedUser = localStorage.getItem('user')

                if (!isAuthenticated || !storedUser) {
                    router.push('/login')
                    return
                }

                // Verify authentication with server
                const response = await authAPI.getProfile()
                if (response.success && response.data?.user) {
                    setUser(response.data.user)
                    // Update stored user data
                    localStorage.setItem('user', JSON.stringify(response.data.user))
                } else {
                    // Clear invalid authentication state
                    localStorage.removeItem('isAuthenticated')
                    localStorage.removeItem('user')
                    router.push('/login')
                }
            } catch (error) {
                console.error('Authentication check failed:', error)
                // Clear authentication state on error
                localStorage.removeItem('isAuthenticated')
                localStorage.removeItem('user')
                router.push('/login')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-primary">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect to login
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar onSidebarToggle={() => setSidebarOpen(true)} user={user} />
            <div className="flex">
                {/* Desktop sidebar */}
                <div className="hidden md:block">
                    <Sidebar role={user.role} />
                </div>
                {/* Mobile sidebar drawer */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="left" className="p-0 w-64 bg-background">
                        <Sidebar role={user.role} />
                    </SheetContent>
                </Sheet>
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
} 
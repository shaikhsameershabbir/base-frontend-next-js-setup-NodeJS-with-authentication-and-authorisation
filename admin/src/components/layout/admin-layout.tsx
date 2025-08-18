"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()


    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
        router.push('/')
        return null
    }

    if (loading) {
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
        router.push('/')
        return null
    }


    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar onSidebarToggle={() => setSidebarOpen(true)} user={user} />
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop sidebar */}
                <div className="hidden lg:block">
                    <Sidebar role={user.role} />
                </div>
                {/* Mobile sidebar drawer */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="left" className="p-0 w-80 max-w-[80vw] bg-background">
                        <Sidebar role={user.role} />
                    </SheetContent>
                </Sheet>
                {/* Main content area */}
                <main className="flex-1 overflow-auto">
                    <div className="p-2 sm:p-4 md:p-6 min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
} 
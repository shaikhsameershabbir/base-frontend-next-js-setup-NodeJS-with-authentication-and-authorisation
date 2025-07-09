"use client"

import { useState, useEffect } from "react"
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

    useEffect(() => {
        authAPI.getProfile().then(res => {
            if (res.success) setUser(res.data?.user || null)
        })
    }, [])

    return (
        <div className="min-h-screen bg-background">
            <Navbar onSidebarToggle={() => setSidebarOpen(true)} />
            <div className="flex">
                {/* Desktop sidebar */}
                <div className="hidden md:block">
                    <Sidebar role={user?.role} />
                </div>
                {/* Mobile sidebar drawer */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="left" className="p-0 w-64 bg-background">
                        <Sidebar role={user?.role} />
                    </SheetContent>
                </Sheet>
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
} 
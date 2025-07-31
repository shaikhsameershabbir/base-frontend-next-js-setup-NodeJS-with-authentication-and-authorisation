"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { ThemeSwitcher } from "@/components/theme/theme-switcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Settings,
    Shield,
    Database,
    Bell,
    Palette,
    Globe,
    Save,
    RefreshCw,
    User,
    Sparkles,
    Target,
    Wallet,
    BarChart3
} from "lucide-react"

export default function SettingsPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [settings, setSettings] = useState({
        siteName: "Admin Panel",
        siteDescription: "Modern admin panel built with Next.js and shadcn/ui",
        emailNotifications: true,
        darkMode: false,
        language: "en",
        timezone: "UTC",
    })

    useEffect(() => {
        const auth = localStorage.getItem("isAuthenticated")
        if (!auth) {
            router.push("/")
        } else {
            setIsAuthenticated(true)
        }
    }, [router])

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await settingsAPI.updateSettings(settings);

            if (response.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to save settings' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated) {
        return null
    }

    return (
        <AdminLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight text-primary dark:text-white">Settings</h1>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                            <Settings className="h-4 w-4 text-inverse dark:text-white text-white" />
                        </div>
                    </div>
                    <p className="text-lg font-medium text-secondary dark:text-white">
                        Configure your Matka admin panel preferences
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Theme Settings */}
                    <div className="md:col-span-2">
                        <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-xl font-bold text-primary">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                        <Palette className="h-4 w-4 text-white" />
                                    </div>
                                    Appearance & Theme
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ThemeSwitcher />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Settings */}
                    <div className="space-y-6">
                        {/* Profile Settings */}
                        <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border" style={{ animationDelay: "100ms" }}>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold text-primary">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                    Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Admin Name</Label>
                                    <Input
                                        id="name"
                                        defaultValue="Matka Admin"
                                        className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        defaultValue="admin@matka.com"
                                        className="bg-card/60 dark:bg-card/40 border-border focus:bg-card/80 dark:focus:bg-card/60"
                                    />
                                </div>
                                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </CardContent>
                        </Card>

                        {/* System Settings */}
                        <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border" style={{ animationDelay: "200ms" }}>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold text-primary">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                        <Shield className="h-4 w-4 text-white" />
                                    </div>
                                    System
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30">
                                        <div className="flex items-center gap-3">
                                            <Target className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-secondary">Auto Market Close</span>
                                        </div>
                                        <div className="h-4 w-8 rounded-full bg-green-500 relative">
                                            <div className="h-3 w-3 rounded-full bg-white absolute right-0.5 top-0.5"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30">
                                        <div className="flex items-center gap-3">
                                            <Wallet className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-secondary">Point Transfer</span>
                                        </div>
                                        <div className="h-4 w-8 rounded-full bg-blue-500 relative">
                                            <div className="h-3 w-3 rounded-full bg-white absolute right-0.5 top-0.5"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30">
                                        <div className="flex items-center gap-3">
                                            <BarChart3 className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm font-medium text-secondary">Auto Reports</span>
                                        </div>
                                        <div className="h-4 w-8 rounded-full bg-gray-400 relative">
                                            <div className="h-3 w-3 rounded-full bg-white absolute left-0.5 top-0.5"></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Database Settings */}
                        <Card className="glass-card  bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border" style={{ animationDelay: "300ms" }}>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold text-primary">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                        <Database className="h-4 w-4 text-white" />
                                    </div>
                                    Database
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-900/30 dark:to-orange-800/30">
                                        <span className="text-sm font-medium text-secondary">Connection Status</span>
                                        <span className="font-bold text-green-400 dark:text-green-300">Connected</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30">
                                        <span className="text-sm font-medium text-secondary">Last Backup</span>
                                        <span className="font-bold text-blue-400 dark:text-blue-300">2 hours ago</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full border-border hover:bg-card/20 dark:hover:bg-card/30">
                                    Backup Database
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
} 
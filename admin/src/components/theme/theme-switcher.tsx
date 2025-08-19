"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Moon, Sun, Monitor, Sparkles } from "lucide-react"
import { useTheme } from "@/components/theme/theme-provider"

type Theme = "light" | "dark" | "auto"

interface ThemeOption {
    id: Theme
    name: string
    description: string
    icon: React.ReactNode
    colors: {
        primary: string
        secondary: string
        tertiary: string
    }
}

const themeOptions: ThemeOption[] = [
    {
        id: "light",
        name: "Light Theme",
        description: "Clean and bright interface",
        icon: <Sun className="h-5 w-5" />,
        colors: {
            primary: "#3B82F6",
            secondary: "#F1F5F9",
            tertiary: "#8B5CF6"
        }
    },
    {
        id: "dark",
        name: "Dark Theme",
        description: "Easy on the eyes",
        icon: <Moon className="h-5 w-5" />,
        colors: {
            primary: "#60A5FA",
            secondary: "#1F2937",
            tertiary: "#A78BFA"
        }
    },
    {
        id: "auto",
        name: "Auto (System)",
        description: "Follows system preference",
        icon: <Monitor className="h-5 w-5" />,
        colors: {
            primary: "#8B5CF6",
            secondary: "#F3F4F6",
            tertiary: "#A78BFA"
        }
    }
]

const colorSchemes = [
    {
        name: "Default",
        primary: "#3B82F6",
        secondary: "#F1F5F9",
        tertiary: "#8B5CF6",
        textPrimary: "#18181b",
        textSecondary: "#6b7280",
        textInverse: "#fff",
        textLink: "#3B82F6"
    },
    {
        name: "Ocean",
        primary: "#0EA5E9",
        secondary: "#F0F9FF",
        tertiary: "#06B6D4",
        textPrimary: "#0f172a",
        textSecondary: "#64748b",
        textInverse: "#fff",
        textLink: "#0EA5E9"
    },
    {
        name: "Forest",
        primary: "#10B981",
        secondary: "#F0FDF4",
        tertiary: "#059669",
        textPrimary: "#052e16",
        textSecondary: "#166534",
        textInverse: "#fff",
        textLink: "#10B981"
    },
    {
        name: "Sunset",
        primary: "#F59E0B",
        secondary: "#FFFBEB",
        tertiary: "#F97316",
        textPrimary: "#78350f",
        textSecondary: "#92400e",
        textInverse: "#fff",
        textLink: "#F59E0B"
    },
    {
        name: "Royal",
        primary: "#8B5CF6",
        secondary: "#FAF5FF",
        tertiary: "#7C3AED",
        textPrimary: "#2e1065",
        textSecondary: "#6d28d9",
        textInverse: "#fff",
        textLink: "#8B5CF6"
    },
    {
        name: "Rose",
        primary: "#EC4899",
        secondary: "#FDF2F8",
        tertiary: "#DB2777",
        textPrimary: "#831843",
        textSecondary: "#be185d",
        textInverse: "#fff",
        textLink: "#EC4899"
    }
]

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()

    const handleThemeChange = (theme: Theme) => {
        setTheme(theme)
    }

    return (
        <div className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme Selection
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {themeOptions.map((themeOption) => (
                        <Card
                            key={themeOption.id}
                            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${theme === themeOption.id
                                ? "ring-2 ring-primary bg-gradient-to-br from-primary/10 to-tertiary/10"
                                : "hover:bg-white/5"
                                }`}
                            onClick={() => handleThemeChange(themeOption.id)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${theme === themeOption.id
                                        ? "bg-gradient-to-br from-primary to-tertiary text-white"
                                        : "bg-white/10"
                                        }`}>
                                        {themeOption.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{themeOption.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground">{themeOption.description}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex gap-2">
                                    <div
                                        className="h-6 w-6 rounded-full"
                                        style={{ backgroundColor: themeOption.colors.primary }}
                                    />
                                    <div
                                        className="h-6 w-6 rounded-full"
                                        style={{ backgroundColor: themeOption.colors.secondary }}
                                    />
                                    <div
                                        className="h-6 w-6 rounded-full"
                                        style={{ backgroundColor: themeOption.colors.tertiary }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
} 
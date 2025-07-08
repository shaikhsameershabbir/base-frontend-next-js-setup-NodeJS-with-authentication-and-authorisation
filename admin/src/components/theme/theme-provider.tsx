"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "auto"

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    colorScheme: number
    setColorScheme: (index: number) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("theme") as Theme) || "auto"
        }
        return "auto"
    })
    const [colorScheme, setColorSchemeState] = useState(() => {
        if (typeof window !== "undefined") {
            return Number(localStorage.getItem("colorScheme") || 0)
        }
        return 0
    })

    // Apply theme and color scheme to DOM
    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark")
        } else if (theme === "light") {
            document.documentElement.classList.remove("dark")
        } else {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                document.documentElement.classList.add("dark")
            } else {
                document.documentElement.classList.remove("dark")
            }
        }
        localStorage.setItem("theme", theme)
    }, [theme])

    useEffect(() => {
        const scheme = colorSchemes[colorScheme]
        document.documentElement.style.setProperty("--primary", scheme.primary)
        document.documentElement.style.setProperty("--secondary", scheme.secondary)
        document.documentElement.style.setProperty("--tertiary", scheme.tertiary)
        document.documentElement.style.setProperty("--text-primary", scheme.textPrimary)
        document.documentElement.style.setProperty("--text-secondary", scheme.textSecondary)
        document.documentElement.style.setProperty("--text-inverse", scheme.textInverse)
        document.documentElement.style.setProperty("--text-link", scheme.textLink)
        localStorage.setItem("colorScheme", String(colorScheme))
    }, [colorScheme])

    const setTheme = (t: Theme) => setThemeState(t)
    const setColorScheme = (i: number) => setColorSchemeState(i)

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colorScheme, setColorScheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
    return ctx
} 
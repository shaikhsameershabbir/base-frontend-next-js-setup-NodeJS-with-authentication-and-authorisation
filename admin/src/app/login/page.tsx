"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            // Demo credentials check
            if (email === "admin@example.com" && password === "admin123") {
                // In a real app, you'd store the token in localStorage or cookies
                localStorage.setItem("isAuthenticated", "true")
                router.push("/dashboard")
            } else {
                alert("Invalid credentials. Use admin@example.com / admin123")
            }
            setIsLoading(false)
        }, 1000)
    }

    return <LoginForm onLogin={handleLogin} isLoading={isLoading} />
} 
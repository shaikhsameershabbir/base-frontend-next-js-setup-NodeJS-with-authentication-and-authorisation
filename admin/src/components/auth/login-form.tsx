"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User, Shield, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

export function LoginForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
    const [loginError, setLoginError] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    const validateForm = () => {
        const newErrors: { username?: string; password?: string } = {}

        if (!username) {
            newErrors.username = "Username is required"
        } else if (username.length < 3) {
            newErrors.username = "Username must be at least 3 characters"
        }

        if (!password) {
            newErrors.password = "Password is required"
        } else if (password.length < 4) {
            newErrors.password = "Password must be at least 4 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        setLoginError("")

        try {
            const success = await login(username, password)
            if (success) {
                // Redirect to dashboard on successful login
                router.push("/dashboard")
            }
        } catch (err: any) {
            console.error("Login error:", err)
            // Display error message to user
            setLoginError(err.message || "Login failed. Please check your credentials and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
            {/* Background decoration - responsive sizing */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-tertiary/20 dark:from-black/40 dark:via-black/60 dark:to-black/80"></div>
            <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-tertiary/10 dark:bg-tertiary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl glass-card animate-scale-in hover-lift bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                <CardHeader className="space-y-1 text-center pb-6 sm:pb-8 px-4 sm:px-6">
                    <div className="mx-auto mb-4 sm:mb-6 relative">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-lg">
                            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text text-primary">Welcome back</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-muted">
                        Enter your credentials to access the admin panel
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* Login Error Display */}
                        {loginError && (
                            <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
                                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                                <p className="text-sm text-destructive font-medium">{loginError}</p>
                            </div>
                        )}

                        <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="username" className="text-sm font-medium text-primary">Username</Label>
                            <div className="relative group">
                                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value)
                                        setLoginError("") // Clear error when user starts typing
                                    }}
                                    className={`pl-10 sm:pl-12 pr-3 sm:pr-4 h-10 sm:h-12 text-sm sm:text-base border-2 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.username ? "border-destructive focus:border-destructive" : "border-border hover:border-primary/50"}`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs sm:text-sm text-destructive animate-fade-in">{errors.username}</p>
                            )}
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="password" className="text-sm font-medium text-primary">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        setLoginError("") // Clear error when user starts typing
                                    }}
                                    className={`pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base border-2 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.password ? "border-destructive focus:border-destructive" : "border-border hover:border-primary/50"}`}
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 hover:bg-primary/10"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                                    ) : (
                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-xs sm:text-sm text-destructive animate-fade-in dark:text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="rounded border-border focus:ring-primary focus:ring-2 dark:bg-background dark:border-border"
                                    disabled={isLoading}
                                />
                                <Label htmlFor="remember" className="text-xs sm:text-sm font-medium text-primary">
                                    Remember me
                                </Label>
                            </div>
                            <Button variant="link" className="text-xs sm:text-sm px-0 font-medium hover:text-primary self-start sm:self-auto" disabled={isLoading}>
                                Forgot password?
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <div className="pt-4 sm:pt-6 border-t border-border/50 dark:border-border/70">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <p className="text-xs sm:text-sm text-muted font-medium">Demo Credentials</p>
                            <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-2 sm:p-3 space-y-0.5 sm:space-y-1">
                                <p className="text-xs font-mono text-muted break-all sm:break-normal">Superadmin: smasher / 123456</p>
                                <p className="text-xs font-mono text-muted break-all sm:break-normal">Admin: admin1 / admin123</p>
                                <p className="text-xs font-mono text-muted break-all sm:break-normal">Distributor: distributor1_1 / dist123</p>
                                <p className="text-xs font-mono text-muted break-all sm:break-normal">Player: player1 / player123</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
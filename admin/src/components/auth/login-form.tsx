"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface LoginFormProps {
    onLogin: (email: string, password: string) => void
    isLoading?: boolean
}

export function LoginForm({ onLogin, isLoading = false }: LoginFormProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {}

        if (!email) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email"
        }

        if (!password) {
            newErrors.password = "Password is required"
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onLogin(email, password)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-tertiary/20 dark:from-black/40 dark:via-black/60 dark:to-black/80"></div>
            <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-tertiary/10 dark:bg-tertiary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <Card className="w-full max-w-md glass-card animate-scale-in hover-lift bg-card/80 dark:bg-card/80 backdrop-blur-lg border border-border">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="mx-auto mb-6 relative">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-lg">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold gradient-text text-primary">Welcome back</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        Enter your credentials to access the admin panel
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-sm font-medium text-primary">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`pl-12 pr-4 h-12 text-base border-2 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.email ? "border-destructive focus:border-destructive" : "border-border hover:border-primary/50"
                                        }`}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive animate-fade-in">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="password" className="text-sm font-medium text-primary">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`pl-12 pr-12 h-12 text-base border-2 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.password ? "border-destructive focus:border-destructive" : "border-border hover:border-primary/50"
                                        }`}
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-primary/10"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive animate-fade-in dark:text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="rounded border-border focus:ring-primary focus:ring-2 dark:bg-background dark:border-border"
                                />
                                <Label htmlFor="remember" className="text-sm font-medium text-primary">
                                    Remember me
                                </Label>
                            </div>
                            <Button variant="link" className="text-sm px-0 font-medium hover:text-primary">
                                Forgot password?
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing in...
                                </div>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-border/50 dark:border-border/70">
                        <div className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground font-medium">Demo Credentials</p>
                            <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-3 space-y-1">
                                <p className="text-xs font-mono text-muted-foreground">Email: admin@example.com</p>
                                <p className="text-xs font-mono text-muted-foreground">Password: admin123</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
"use client"

import { useState } from "react"
import { Menu, Search, User, Settings, LogOut, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

interface NavbarProps {
    onSidebarToggle: () => void
}

export function Navbar({ onSidebarToggle }: NavbarProps) {
    return (
        <header className="sticky top-0 z-50 w-full glass-effect border-b border-border backdrop-blur-xl bg-background/80 dark:bg-background/90">
            <div className="container flex h-16 items-center">
                <div className="flex items-center gap-2 md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10">
                                <Menu className="h-5 w-5 text-primary" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 bg-background/95 dark:bg-background/90 backdrop-blur-xl">
                            <Sidebar />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary group-focus-within:text-link transition-colors" />
                            <Input
                                placeholder="Search users, markets, bids..."
                                className="pl-10 md:w-[300px] lg:w-[400px] h-10 bg-white/10 border-white/20 focus:bg-white/20 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/70"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-white/10 transition-all duration-200">
                                    <Avatar className="h-9 w-9 ring-2 ring-white/20 hover:ring-primary/50 transition-all duration-200">
                                        <AvatarImage src="/avatars/01.png" alt="@admin" />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-tertiary text-white font-semibold">
                                            MA
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 mt-2 glass-card border-white/20" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal p-4">
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src="/avatars/01.png" alt="@admin" />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-tertiary text-white font-semibold">
                                                    MA
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold leading-none text-primary">Matka Admin</p>
                                                <p className="text-xs leading-none text-secondary mt-1">
                                                    admin@matka.com
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors">
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors">
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-red-500/10 hover:text-red-500 cursor-pointer transition-colors">
                                    <LogOut className="h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
} 
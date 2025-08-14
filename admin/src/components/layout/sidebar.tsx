"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    BarChart3,
    ChevronDown,
    ChevronRight,
    Home,
    Settings,
    Shield,
    Users,
    FileText,
    Activity,
    Database,
    Palette,
    Sparkles,
    Target,
    Wallet,
    History,
    TrendingUp,
    DollarSign,
    Gamepad2,
    Award,
    ClipboardList,
    Eye,
} from "lucide-react"
import { superNavbar, adminNavbar, distributorNavbar, agentNavbar, NavbarItem } from "@/app/constant";

// Icon map for string-to-component
const iconMap = {
    BarChart3,
    ChevronDown,
    ChevronRight,
    Home,
    Settings,
    Shield,
    Users,
    FileText,
    Activity,
    Database,
    Palette,
    Sparkles,
    Target,
    Wallet,
    History,
    TrendingUp,
    DollarSign,
    Gamepad2,
    Award,
    ClipboardList,
    Eye,
};

function getIcon(iconName: string) {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
}

interface SidebarItemProps {
    item: NavbarItem
    level?: number
}

function SidebarItem({ item, level = 0 }: SidebarItemProps) {
    const pathname = usePathname()
    const [isExpanded, setIsExpanded] = useState(false)
    const hasChildren = item.children && item.children.length > 0
    const isActive = item.href && pathname === item.href

    return (
        <div className="animate-fade-in">
            <div className="flex items-center">
                {hasChildren ? (
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 px-2 sm:px-4 rounded-xl transition-all duration-200 group",
                            level > 0 && "ml-2 sm:ml-4",
                            isActive && "bg-gradient-to-r from-primary/20 to-tertiary/20 text-primary border border-primary/20 shadow-lg dark:bg-gradient-to-r dark:from-primary/40 dark:to-tertiary/40 dark:text-white dark:border-primary/40",
                            !isActive && "hover:bg-card/20 dark:hover:bg-card/30 hover:text-primary dark:text-white"
                        )}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className={cn(
                            "transition-all duration-200",
                            isActive && "text-primary",
                            !isActive && "group-hover:text-primary"
                        )}>
                            {getIcon(item.icon)}
                        </div>
                        <span className="flex-1 text-left font-medium text-primary text-xs sm:text-sm truncate">{item.title}</span>
                        <div className={cn(
                            "transition-all duration-200",
                            isExpanded ? "rotate-180" : "rotate-0"
                        )}>
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                    </Button>
                ) : (
                    <Link href={item.href || "#"}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 px-2 sm:px-4 rounded-xl transition-all duration-200 group",
                                level > 0 && "ml-2 sm:ml-4",
                                isActive && "bg-gradient-to-r from-primary/20 to-tertiary/20 text-primary border border-primary/20 shadow-lg dark:bg-gradient-to-r dark:from-primary/40 dark:to-tertiary/40 dark:text-white dark:border-primary/40",
                                !isActive && "hover:bg-card/20 dark:hover:bg-card/30 hover:text-primary dark:text-primary"
                            )}
                        >
                            <div className={cn(
                                "transition-all duration-200",
                                isActive && "text-primary dark:text-white",
                                !isActive && "group-hover:text-primary dark:text-white"
                            )}>
                                {getIcon(item.icon)}
                            </div>
                            <span className="flex-1 text-left font-medium text-primary dark:text-white text-xs sm:text-sm truncate">{item.title}</span>
                        </Button>
                    </Link>
                )}
            </div>
            {hasChildren && (
                <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                    <div className="mt-2 space-y-1 pl-2 sm:pl-4 border-l border-border dark:border-border">
                        {item.children?.map((child, index) => (
                            <SidebarItem key={index} item={child} level={level + 1} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

interface SidebarProps {
    role?: string;
}

export function Sidebar({ role }: SidebarProps) {
    let items: NavbarItem[] = [];
    if (role === "superadmin") items = superNavbar;
    else if (role === "admin") items = adminNavbar;
    else if (role === "distributor") items = distributorNavbar;
    else if (role === "agent") items = agentNavbar;
    else items = [];

    return (
        <div className="flex h-full w-64 flex-col glass-effect border-r border-border bg-background/80 dark:bg-background/90">
            <div className="flex h-16 items-center border-b border-border px-3 sm:px-6 bg-background/80 dark:bg-background/90">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-lg">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-inverse" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm sm:text-lg dark:text-white text-black truncate">Matka Admin</span>
                        <span className="text-xs text-secondary dark:text-white truncate">Skill Game Management</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto py-4 sm:py-6">
                <nav className="space-y-1 sm:space-y-2 px-2 sm:px-4">
                    {items.map((item: NavbarItem, index: number) => (
                        <SidebarItem key={index} item={item} />
                    ))}
                </nav>
            </div>

            <div className="border-t border-border p-3 sm:p-4 bg-background/80 dark:bg-background/90">
                <Link href="/settings">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-card/20 dark:hover:bg-card/30 transition-all duration-200 cursor-pointer group">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                            <Palette className="h-3 w-3 sm:h-4 sm:w-4 text-inverse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-primary truncate">Theme</p>
                            <p className="text-xs text-secondary truncate">Customize appearance</p>
                        </div>
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
            </div>
        </div>
    )
} 
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
} from "lucide-react"

interface SidebarItem {
    title: string
    href?: string
    icon: React.ReactNode
    children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: <Home className="h-4 w-4" />,
    },
    {
        title: "User Management",
        icon: <Users className="h-4 w-4" />,
        children: [
            {
                title: "All Users",
                href: "/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "User Groups",
                href: "/users/groups",
                icon: <Shield className="h-4 w-4" />,
            },
            {
                title: "User Commissions",
                href: "/users/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Market Management",
        icon: <Target className="h-4 w-4" />,
        children: [
            {
                title: "Kalyan Bazar",
                href: "/markets/kalyan",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Day",
                href: "/markets/milan-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Night",
                href: "/markets/milan-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Day",
                href: "/markets/rajdhani-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Night",
                href: "/markets/rajdhani-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Bid Management",
        icon: <TrendingUp className="h-4 w-4" />,
        children: [
            {
                title: "All Bids",
                href: "/bids",
                icon: <ClipboardList className="h-4 w-4" />,
            },
            {
                title: "Winning Bids",
                href: "/bids/winners",
                icon: <Award className="h-4 w-4" />,
            },
            {
                title: "Bid History",
                href: "/bids/history",
                icon: <History className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Point Management",
        icon: <Wallet className="h-4 w-4" />,
        children: [
            {
                title: "Point Transfer",
                href: "/points/transfer",
                icon: <Wallet className="h-4 w-4" />,
            },
            {
                title: "Transfer History",
                href: "/points/history",
                icon: <History className="h-4 w-4" />,
            },
            {
                title: "Point Balance",
                href: "/points/balance",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Reports",
        icon: <BarChart3 className="h-4 w-4" />,
        children: [
            {
                title: "Market Reports",
                href: "/reports/markets",
                icon: <BarChart3 className="h-4 w-4" />,
            },
            {
                title: "User Reports",
                href: "/reports/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "Commission Reports",
                href: "/reports/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
            {
                title: "Total Summary",
                href: "/reports/summary",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "System",
        icon: <Settings className="h-4 w-4" />,
        children: [
            {
                title: "Settings",
                href: "/settings",
                icon: <Settings className="h-4 w-4" />,
            },
            {
                title: "Logs",
                href: "/system/logs",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
]

interface SidebarItemProps {
    item: SidebarItem
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
                            "w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all duration-200 group",
                            level > 0 && "ml-4",
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
                            {item.icon}
                        </div>
                        <span className="flex-1 text-left font-medium text-primary">{item.title}</span>
                        <div className={cn(
                            "transition-all duration-200",
                            isExpanded ? "rotate-180" : "rotate-0"
                        )}>
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </Button>
                ) : (
                    <Link href={item.href || "#"}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all duration-200 group",
                                level > 0 && "ml-4",
                                isActive && "bg-gradient-to-r from-primary/20 to-tertiary/20 text-primary border border-primary/20 shadow-lg dark:bg-gradient-to-r dark:from-primary/40 dark:to-tertiary/40 dark:text-white dark:border-primary/40",
                                !isActive && "hover:bg-card/20 dark:hover:bg-card/30 hover:text-primary dark:text-primary"
                            )}
                        >
                            <div className={cn(
                                "transition-all duration-200",
                                isActive && "text-primary dark:text-white",
                                !isActive && "group-hover:text-primary dark:text-white"
                            )}>
                                {item.icon}
                            </div>
                            <span className="flex-1 text-left font-medium text-primary dark:text-white">{item.title}</span>
                        </Button>
                    </Link>
                )}
            </div>
            {hasChildren && (
                <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                    <div className="mt-2 space-y-1 pl-4 border-l border-border dark:border-border">
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

// Place role-based navbars here (from your manually added selection)
let superNavbar = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: <Home className="h-4 w-4" />,
    },
    {
        title: "User Management",
        icon: <Users className="h-4 w-4" />,
        children: [
            {
                title: "All Users",
                href: "/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "User Groups",
                href: "/users/groups",
                icon: <Shield className="h-4 w-4" />,
            },
            {
                title: "User Commissions",
                href: "/users/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Market Management",
        icon: <Target className="h-4 w-4" />,
        children: [
            {
                title: "Kalyan Bazar",
                href: "/markets/kalyan",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Day",
                href: "/markets/milan-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Night",
                href: "/markets/milan-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Day",
                href: "/markets/rajdhani-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Night",
                href: "/markets/rajdhani-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Bid Management",
        icon: <TrendingUp className="h-4 w-4" />,
        children: [
            {
                title: "All Bids",
                href: "/bids",
                icon: <ClipboardList className="h-4 w-4" />,
            },
            {
                title: "Winning Bids",
                href: "/bids/winners",
                icon: <Award className="h-4 w-4" />,
            },
            {
                title: "Bid History",
                href: "/bids/history",
                icon: <History className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Point Management",
        icon: <Wallet className="h-4 w-4" />,
        children: [
            {
                title: "Point Transfer",
                href: "/points/transfer",
                icon: <Wallet className="h-4 w-4" />,
            },
            {
                title: "Transfer History",
                href: "/points/history",
                icon: <History className="h-4 w-4" />,
            },
            {
                title: "Point Balance",
                href: "/points/balance",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Reports",
        icon: <BarChart3 className="h-4 w-4" />,
        children: [
            {
                title: "Market Reports",
                href: "/reports/markets",
                icon: <BarChart3 className="h-4 w-4" />,
            },
            {
                title: "User Reports",
                href: "/reports/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "Commission Reports",
                href: "/reports/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
            {
                title: "Total Summary",
                href: "/reports/summary",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "System",
        icon: <Settings className="h-4 w-4" />,
        children: [
            {
                title: "Settings",
                href: "/settings",
                icon: <Settings className="h-4 w-4" />,
            },
            {
                title: "Logs",
                href: "/system/logs",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
]
let adminNavbar = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: <Home className="h-4 w-4" />,
    },
    {
        title: "User Management",
        icon: <Users className="h-4 w-4" />,
        children: [
            {
                title: "All Users",
                href: "/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "User Groups",
                href: "/users/groups",
                icon: <Shield className="h-4 w-4" />,
            },
            {
                title: "User Commissions",
                href: "/users/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Market Management",
        icon: <Target className="h-4 w-4" />,
        children: [
            {
                title: "Kalyan Bazar",
                href: "/markets/kalyan",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Day",
                href: "/markets/milan-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Night",
                href: "/markets/milan-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Day",
                href: "/markets/rajdhani-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Night",
                href: "/markets/rajdhani-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Bid Management",
        icon: <TrendingUp className="h-4 w-4" />,
        children: [
            {
                title: "All Bids",
                href: "/bids",
                icon: <ClipboardList className="h-4 w-4" />,
            },
            {
                title: "Winning Bids",
                href: "/bids/winners",
                icon: <Award className="h-4 w-4" />,
            },
            {
                title: "Bid History",
                href: "/bids/history",
                icon: <History className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Point Management",
        icon: <Wallet className="h-4 w-4" />,
        children: [
            {
                title: "Point Transfer",
                href: "/points/transfer",
                icon: <Wallet className="h-4 w-4" />,
            },
            {
                title: "Transfer History",
                href: "/points/history",
                icon: <History className="h-4 w-4" />,
            },
            {
                title: "Point Balance",
                href: "/points/balance",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Reports",
        icon: <BarChart3 className="h-4 w-4" />,
        children: [
            {
                title: "Market Reports",
                href: "/reports/markets",
                icon: <BarChart3 className="h-4 w-4" />,
            },
            {
                title: "User Reports",
                href: "/reports/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "Commission Reports",
                href: "/reports/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
            {
                title: "Total Summary",
                href: "/reports/summary",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "System",
        icon: <Settings className="h-4 w-4" />,
        children: [
            {
                title: "Settings",
                href: "/settings",
                icon: <Settings className="h-4 w-4" />,
            },
            {
                title: "Logs",
                href: "/system/logs",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
]
let distributorNavbar = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: <Home className="h-4 w-4" />,
    },
    {
        title: "User Management",
        icon: <Users className="h-4 w-4" />,
        children: [
            {
                title: "All Users",
                href: "/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "User Groups",
                href: "/users/groups",
                icon: <Shield className="h-4 w-4" />,
            },
            {
                title: "User Commissions",
                href: "/users/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Market Management",
        icon: <Target className="h-4 w-4" />,
        children: [
            {
                title: "Kalyan Bazar",
                href: "/markets/kalyan",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Day",
                href: "/markets/milan-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Night",
                href: "/markets/milan-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Day",
                href: "/markets/rajdhani-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Night",
                href: "/markets/rajdhani-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Bid Management",
        icon: <TrendingUp className="h-4 w-4" />,
        children: [
            {
                title: "All Bids",
                href: "/bids",
                icon: <ClipboardList className="h-4 w-4" />,
            },
            {
                title: "Winning Bids",
                href: "/bids/winners",
                icon: <Award className="h-4 w-4" />,
            },
            {
                title: "Bid History",
                href: "/bids/history",
                icon: <History className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Point Management",
        icon: <Wallet className="h-4 w-4" />,
        children: [
            {
                title: "Point Transfer",
                href: "/points/transfer",
                icon: <Wallet className="h-4 w-4" />,
            },
            {
                title: "Transfer History",
                href: "/points/history",
                icon: <History className="h-4 w-4" />,
            },
            {
                title: "Point Balance",
                href: "/points/balance",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Reports",
        icon: <BarChart3 className="h-4 w-4" />,
        children: [
            {
                title: "Market Reports",
                href: "/reports/markets",
                icon: <BarChart3 className="h-4 w-4" />,
            },
            {
                title: "User Reports",
                href: "/reports/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "Commission Reports",
                href: "/reports/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
            {
                title: "Total Summary",
                href: "/reports/summary",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "System",
        icon: <Settings className="h-4 w-4" />,
        children: [
            {
                title: "Settings",
                href: "/settings",
                icon: <Settings className="h-4 w-4" />,
            },
            {
                title: "Logs",
                href: "/system/logs",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
]
let agentNavbar = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: <Home className="h-4 w-4" />,
    },
    {
        title: "User Management",
        icon: <Users className="h-4 w-4" />,
        children: [
            {
                title: "All Users",
                href: "/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "User Groups",
                href: "/users/groups",
                icon: <Shield className="h-4 w-4" />,
            },
            {
                title: "User Commissions",
                href: "/users/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Market Management",
        icon: <Target className="h-4 w-4" />,
        children: [
            {
                title: "Kalyan Bazar",
                href: "/markets/kalyan",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Day",
                href: "/markets/milan-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Milan Night",
                href: "/markets/milan-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Day",
                href: "/markets/rajdhani-day",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
            {
                title: "Rajdhani Night",
                href: "/markets/rajdhani-night",
                icon: <Gamepad2 className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Bid Management",
        icon: <TrendingUp className="h-4 w-4" />,
        children: [
            {
                title: "All Bids",
                href: "/bids",
                icon: <ClipboardList className="h-4 w-4" />,
            },
            {
                title: "Winning Bids",
                href: "/bids/winners",
                icon: <Award className="h-4 w-4" />,
            },
            {
                title: "Bid History",
                href: "/bids/history",
                icon: <History className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Point Management",
        icon: <Wallet className="h-4 w-4" />,
        children: [
            {
                title: "Point Transfer",
                href: "/points/transfer",
                icon: <Wallet className="h-4 w-4" />,
            },
            {
                title: "Transfer History",
                href: "/points/history",
                icon: <History className="h-4 w-4" />,
            },
            {
                title: "Point Balance",
                href: "/points/balance",
                icon: <DollarSign className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "Reports",
        icon: <BarChart3 className="h-4 w-4" />,
        children: [
            {
                title: "Market Reports",
                href: "/reports/markets",
                icon: <BarChart3 className="h-4 w-4" />,
            },
            {
                title: "User Reports",
                href: "/reports/users",
                icon: <Users className="h-4 w-4" />,
            },
            {
                title: "Commission Reports",
                href: "/reports/commissions",
                icon: <DollarSign className="h-4 w-4" />,
            },
            {
                title: "Total Summary",
                href: "/reports/summary",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
    {
        title: "System",
        icon: <Settings className="h-4 w-4" />,
        children: [
            {
                title: "Settings",
                href: "/settings",
                icon: <Settings className="h-4 w-4" />,
            },
            {
                title: "Logs",
                href: "/system/logs",
                icon: <Activity className="h-4 w-4" />,
            },
        ],
    },
]

export function Sidebar({ role }: SidebarProps) {
    let items: SidebarItem[] = [];
    if (role === "superadmin") items = superNavbar;
    else if (role === "admin") items = adminNavbar;
    else if (role === "distributor") items = distributorNavbar;
    else if (role === "agent") items = agentNavbar;
    else items = [];

    return (
        <div className="flex h-full w-64 flex-col glass-effect border-r border-border bg-background/80 dark:bg-background/90">
            <div className="flex h-16 items-center border-b border-border px-6 bg-background/80 dark:bg-background/90">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-lg">
                        <Target className="h-5 w-5 text-inverse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg gradient-text text-primary">Matka Admin</span>
                        <span className="text-xs text-secondary dark:text-white">Skill Game Management</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto py-6">
                <nav className="space-y-2 px-4">
                    {items.map((item: SidebarItem, index: number) => (
                        <SidebarItem key={index} item={item} />
                    ))}
                </nav>
            </div>

            <div className="border-t border-border p-4 bg-background/80 dark:bg-background/90">
                <Link href="/settings">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-card/20 dark:hover:bg-card/30 transition-all duration-200 cursor-pointer group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                            <Palette className="h-4 w-4 text-inverse" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-primary">Theme</p>
                            <p className="text-xs text-secondary">Customize appearance</p>
                        </div>
                        <Sparkles className="h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
            </div>
        </div>
    )
} 
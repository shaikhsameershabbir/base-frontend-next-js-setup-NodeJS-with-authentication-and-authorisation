export type NavbarItem = {
    title: string;
    href?: string;
    icon: string;
    children?: NavbarItem[];
};

export const superNavbar: NavbarItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: "Home",
    },
    {
        title: "User Management",
        icon: "Users",
        children: [
            {
                title: "All Admin",
                href: "/users/admin/all",
                icon: "Users",
            },
            {
                title: "All Distributers",
                href: "/users/distributor/all",
                icon: "Users",
            },
            {
                title: "All Agents",
                href: "/users/agent/all",
                icon: "Users",
            },
            {
                title: "All players",
                href: "/users/player/all",
                icon: "Users",
            }
        ],
    },

    {
        title: "Markets Management",
        icon: "Home",
        children: [
            {
                title: "All Markets",
                href: "/markets",
                icon: "ClipboardList",
            },
            {
                title: "Market rank",
                href: "/markets/rank",
                icon: "History",
            },
        ],
    },
    {
        title: "Bid Management",
        icon: "TrendingUp",
        children: [
            {
                title: "All Bids",
                href: "/bids",
                icon: "ClipboardList",
            },
            {
                title: "Bid History",
                href: "/bids/history",
                icon: "History",
            },
        ],
    },
    {
        title: "Point Management",
        icon: "Wallet",
        children: [
            {
                title: "Point Transfer",
                href: "/points/transfer",
                icon: "Wallet",
            },
            {
                title: "Transfer History",
                href: "/points/history",
                icon: "History",
            },
        ],
    },
    {
        title: "Reports",
        icon: "BarChart3",
        children: [
            {
                title: "Market Reports",
                href: "/reports/markets",
                icon: "BarChart3",
            },
            {
                title: "User Reports",
                href: "/reports/users",
                icon: "Users",
            },
            {
                title: "Commission Reports",
                href: "/reports/commissions",
                icon: "DollarSign",
            },
            {
                title: "Total Summary",
                href: "/reports/summary",
                icon: "Activity",
            },
            {
                title: "System",
                icon: "Settings",
                children: [
                    {
                        title: "Settings",
                        href: "/settings",
                        icon: "Settings",
                    },
                    {
                        title: "Logs",
                        href: "/system/logs",
                        icon: "Activity",
                    },
                ],
            },
        ],
    },
];

export const adminNavbar: NavbarItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: "Home",
    },
    {
        title: "User Management",
        icon: "Users",
        children: [
            {
                title: "All Distributers",
                href: "/users/distributor/all",
                icon: "Users",
            },
            {
                title: "All Agents",
                href: "/users/agent/all",
                icon: "Users",
            },
            {
                title: "All players",
                href: "/users/player/all",
                icon: "Users",
            }
        ],
    },
    {
        title: "Markets",
        href: "/markets",
        icon: "Home",
    },
    {
        title: "Bid Management",
        icon: "TrendingUp",
        children: [
            {
                title: "All Bids",
                href: "/bids",
                icon: "ClipboardList",
            },
            {
                title: "Bid History",
                href: "/bids/history",
                icon: "History",
            },
        ],
    },
    {
        title: "Point Management",
        icon: "Wallet",
        children: [
            {
                title: "Point Transfer",
                href: "/points/transfer",
                icon: "Wallet",
            },
            {
                title: "Transfer History",
                href: "/points/history",
                icon: "History",
            },
        ],
    },
    {
        title: "Reports",
        icon: "BarChart3",
        children: [
            {
                title: "Market Reports",
                href: "/reports/markets",
                icon: "BarChart3",
            },
            {
                title: "User Reports",
                href: "/reports/users",
                icon: "Users",
            },
            {
                title: "Commission Reports",
                href: "/reports/commissions",
                icon: "DollarSign",
            },
            {
                title: "Total Summary",
                href: "/reports/summary",
                icon: "Activity",
            },
            {
                title: "System",
                icon: "Settings",
                children: [
                    {
                        title: "Logs",
                        href: "/system/logs",
                        icon: "Activity",
                    },
                ],
            },
        ],
    },
];

export const distributorNavbar: NavbarItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: "Home",
    },
    {
        title: "User Management",
        icon: "Users",
        children: [
            {
                title: "All Agents",
                href: "/users/agent/all",
                icon: "Users",
            },
            {
                title: "All players",
                href: "/users/player/all",
                icon: "Users",
            }
        ],
    },
    {
        title: "Markets",
        href: "/markets",
        icon: "Home",
    },
    {
        title: "Bid Management",
        icon: "TrendingUp",
        children: [
            {
                title: "All Bids",
                href: "/bids",
                icon: "ClipboardList",
            },
            {
                title: "Bid History",
                href: "/bids/history",
                icon: "History",
            },
        ],
    },
    {
        title: "Point Management",
        icon: "Wallet",
        children: [
            {
                title: "Point Transfer",
                href: "/points/transfer",
                icon: "Wallet",
            },
            {
                title: "Transfer History",
                href: "/points/history",
                icon: "History",
            },
        ],
    },
    {
        title: "Reports",
        icon: "BarChart3",
        children: [
            {
                title: "Market Reports",
                href: "/reports/markets",
                icon: "BarChart3",
            },
            {
                title: "User Reports",
                href: "/reports/users",
                icon: "Users",
            },
            {
                title: "Commission Reports",
                href: "/reports/commissions",
                icon: "DollarSign",
            },
            {
                title: "Total Summary",
                href: "/reports/summary",
                icon: "Activity",
            },
            {
                title: "System",
                icon: "Settings",
                children: [
                    {
                        title: "Logs",
                        href: "/system/logs",
                        icon: "Activity",
                    },
                ],
            },
        ],
    },
];

export const agentNavbar: NavbarItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: "Home",
    },
    {
        title: "User Management",
        icon: "Users",
        children: [

            {
                title: "All players",
                href: "/users/player/all",
                icon: "Users",
            }
        ],
    },
    {
        title: "Markets",
        href: "/markets",
        icon: "Home",
    },
    {
        title: "Bid Management",
        icon: "TrendingUp",
        children: [
            {
                title: "All Bids",
                href: "/bids",
                icon: "ClipboardList",
            },
            {
                title: "Bid History",
                href: "/bids/history",
                icon: "History",
            },
        ],
    },
    {
        title: "Point Management",
        icon: "Wallet",
        children: [
            {
                title: "Point Transfer",
                href: "/points/transfer",
                icon: "Wallet",
            },
            {
                title: "Transfer History",
                href: "/points/history",
                icon: "History",
            },
        ],
    },
    {
        title: "Reports",
        icon: "BarChart3",
        children: [
            {
                title: "Market Reports",
                href: "/reports/markets",
                icon: "BarChart3",
            },
            {
                title: "User Reports",
                href: "/reports/users",
                icon: "Users",
            },
            {
                title: "Commission Reports",
                href: "/reports/commissions",
                icon: "DollarSign",
            },
            {
                title: "Total Summary",
                href: "/reports/summary",
                icon: "Activity",
            },
            {
                title: "System",
                icon: "Settings",
                children: [
                    {
                        title: "Logs",
                        href: "/system/logs",
                        icon: "Activity",
                    },
                ],
            },
        ],
    },
];
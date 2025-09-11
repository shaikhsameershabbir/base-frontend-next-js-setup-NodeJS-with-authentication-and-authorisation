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
        href: "/users/admin/all",
        icon: "Users",
    },


    {
        title: "load management",
        icon: "Wallet",
        children: [
            {
                title: "Load ",
                href: "/loadv2",
                icon: "TrendingUp",
            },
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
                icon: "Award",
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
        ],
    },
    {
        title: "Reports",
        icon: "BarChart3",
        children: [
            {
                title: "All Bids",
                href: "/bets",
                icon: "ClipboardList",
            },
            {
                title: "Reports",
                href: "/reports/",
                icon: "BarChart3",
            },

        ],
    },
    {
        title: "Payment Configuration",
        href: "/payment-configuration",
        icon: "QrCode",
    },
    {
        title: "Logs",
        href: "/logs",
        icon: "Activity",
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
        href: "/users/distributor/all",
        icon: "Users",
    },

    {
        title: "load management",
        icon: "Wallet",
        children: [
            {
                title: "Load ",
                href: "/loadv2",
                icon: "TrendingUp",
            },
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
        ],
    },
    {
        title: "Reports",
        icon: "BarChart3",
        children: [
            {
                title: "All Bids",
                href: "/bets",
                icon: "ClipboardList",
            },
            {
                title: "Reports",
                href: "/reports/",
                icon: "BarChart3",
            },

        ],
    },
    {
        title: "Payment Configuration",
        href: "/payment-configuration",
        icon: "QrCode",
    },
    {
        title: "Logs",
        href: "/logs",
        icon: "Activity",
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
        href: "/users/agent/all",
        icon: "Users",
    },

    {
        title: "load management",
        icon: "Wallet",
        children: [
            {
                title: "Load ",
                href: "/loadv2",
                icon: "TrendingUp",
            },
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
        ],
    },
    {
        title: "Reports",
        icon: "BarChart3",
        children: [
            {
                title: "All Bids",
                href: "/bets",
                icon: "ClipboardList",
            },
            {
                title: "Reports",
                href: "/reports/",
                icon: "BarChart3",
            },

        ],
    },
    {
        title: "Logs",
        href: "/logs",
        icon: "Activity",
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
        href: "/users/player/all",
        icon: "Users",
    },

    {
        title: "load management",
        icon: "Wallet",
        children: [
            {
                title: "Load ",
                href: "/loadv2",
                icon: "TrendingUp",
            },
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
        ],
    },
    {
        title: "Reports",
        icon: "BarChart3",
        children: [
            {
                title: "All Bids",
                href: "/bets",
                icon: "ClipboardList",
            },
            {
                title: "Reports",
                href: "/reports/",
                icon: "BarChart3",
            },

        ],
    },
    {
        title: "Logs",
        href: "/logs",
        icon: "Activity",
    },
    {
        title: "Payment Configuration",
        href: "/payment-configuration",
        icon: "CreditCard",
    },
];






// Table data for LeftColumn
export const singlePannaNumbers = [
    128, 129, 120, 130, 140,
    137, 138, 139, 149, 159,
    146, 147, 148, 158, 168,
    236, 156, 157, 167, 230,
    245, 237, 238, 239, 249,
    290, 246, 247, 248, 258,
    380, 345, 256, 257, 267,
    470, 390, 346, 347, 348,
    489, 480, 490, 356, 357,
    560, 570, 580, 590, 456,
    579, 589, 670, 680, 690,
    678, 679, 689, 789, 780,
    123, 124, 125, 126, 127,
    150, 160, 134, 135, 136,
    169, 179, 170, 180, 145,
    178, 250, 189, 234, 190,
    240, 269, 260, 270, 235,
    259, 278, 279, 289, 280,
    268, 340, 350, 360, 370,
    349, 359, 369, 379, 389,
    358, 368, 378, 450, 460,
    367, 458, 459, 469, 479,
    457, 467, 468, 478, 569,
    790, 890, 567, 568, 578
];
export const doublePannaNumbers = [
    100, 110, 166, 112, 113,
    119, 200, 229, 220, 122,
    155, 228, 300, 266, 177,
    227, 255, 337, 338, 339,
    335, 336, 355, 400, 366,
    344, 499, 445, 446, 447,
    399, 660, 599, 455, 500,
    588, 688, 779, 699, 799,
    669, 778, 788, 770, 889,
    114, 115, 116, 117, 118,
    277, 133, 224, 144, 226,
    330, 188, 233, 199, 244,
    448, 223, 288, 225, 299,
    466, 377, 440, 388, 334,
    556, 449, 477, 559, 488,
    600, 557, 558, 577, 550,
    880, 566, 800, 667, 668,
    899, 700, 990, 900, 677
];
export const triplePannaNumbers = [111, 222, 333, 444, 555, 666, 777, 888, 999]

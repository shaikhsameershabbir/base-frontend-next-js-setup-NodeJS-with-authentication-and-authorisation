import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
    children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", children, ...props }, ref) => {
        const getVariantClasses = (variant: string) => {
            switch (variant) {
                case "secondary":
                    return "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200";
                case "destructive":
                    return "border-transparent bg-red-500 text-white hover:bg-red-600";
                case "outline":
                    return "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50";
                case "success":
                    return "border-transparent bg-green-500 text-white hover:bg-green-600";
                case "warning":
                    return "border-transparent bg-yellow-500 text-white hover:bg-yellow-600";
                default:
                    return "border-transparent bg-blue-500 text-white hover:bg-blue-600";
            }
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    getVariantClasses(variant),
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Badge.displayName = "Badge";

export { Badge }; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    description?: string
    icon: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    className?: string
    color?: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger"
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    color = "primary",
}: StatsCardProps) {
    const getColorClasses = (color: string) => {
        switch (color) {
            case "primary":
                return "from-primary/20 to-primary/10 border-primary/20"
            case "secondary":
                return "from-secondary/20 to-secondary/10 border-secondary/20"
            case "tertiary":
                return "from-tertiary/20 to-tertiary/10 border-tertiary/20"
            case "success":
                return "from-green-500/20 to-green-400/10 border-green-500/20"
            case "warning":
                return "from-yellow-500/20 to-yellow-400/10 border-yellow-500/20"
            case "danger":
                return "from-red-500/20 to-red-400/10 border-red-500/20"
            default:
                return "from-primary/20 to-primary/10 border-primary/20"
        }
    }

    const getIconColor = (color: string) => {
        switch (color) {
            case "primary":
                return "text-primary"
            case "secondary":
                return "text-secondary-foreground"
            case "tertiary":
                return "text-tertiary"
            case "success":
                return "text-green-600"
            case "warning":
                return "text-yellow-600"
            case "danger":
                return "text-red-600"
            default:
                return "text-primary"
        }
    }

    return (
        <Card className={cn(
            "glass-card  border-2 bg-gradient-to-br bg-card/80 dark:bg-card/80 backdrop-blur-lg border-border",
            getColorClasses(color),
            className
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn(
                    "h-10 w-10 rounded-xl bg-gradient-to-br from-white/20 to-white/10 dark:from-black/30 dark:to-black/20 flex items-center justify-center shadow-lg",
                    getIconColor(color)
                )}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                {description && (
                    <p className="text-sm text-muted-foreground font-medium">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center gap-2 pt-2">
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                            trend.isPositive
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                            {trend.isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                            from last month
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 
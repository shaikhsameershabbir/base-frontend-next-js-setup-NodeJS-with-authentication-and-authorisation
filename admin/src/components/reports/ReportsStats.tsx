import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BetStats } from '@/lib/reportsApi';
import { TrendingUp, Users, Coins, Target } from 'lucide-react';

interface ReportsStatsProps {
    stats: BetStats | null;
}

export function ReportsStats({ stats }: ReportsStatsProps) {
    if (!stats) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary">Today's Bets</CardTitle>
                    <Target className="h-4 w-4 text-muted" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">{formatNumber(stats.todayBets)}</div>
                    <p className="text-xs text-muted">Total bets placed today</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary">Today's Bet Amount</CardTitle>
                    <Coins className="h-4 w-4 text-muted" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(stats.todayBetAmount)}</div>
                    <p className="text-xs text-muted">Total amount bet today</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary">Today's Winning Bets</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">{formatNumber(stats.todayWinningBets)}</div>
                    <p className="text-xs text-muted">Winning bets today</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">{formatNumber(stats.totalUsers)}</div>
                    <p className="text-xs text-muted">In your hierarchy</p>
                </CardContent>
            </Card>
        </div>
    );
}

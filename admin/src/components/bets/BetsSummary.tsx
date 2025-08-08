import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface BetsSummaryProps {
    summary: {
        totalBets: number;
        totalAmount: number;
        openBets: number;
        openAmount: number;
        closeBets: number;
        closeAmount: number;
    } | null;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

export const BetsSummary: React.FC<BetsSummaryProps> = ({ summary }) => {
    if (!summary) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary">Total Bets</p>
                            <p className="text-2xl font-bold text-primary">{summary.totalBets}</p>
                        </div>
                        <Activity className="h-8 w-8 text-primary" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary">Total Amount</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalAmount)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary">Open Bets</p>
                            <p className="text-2xl font-bold text-green-600">{summary.openBets}</p>
                            <p className="text-sm text-secondary">{formatCurrency(summary.openAmount)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary">Close Bets</p>
                            <p className="text-2xl font-bold text-red-600">{summary.closeBets}</p>
                            <p className="text-sm text-secondary">{formatCurrency(summary.closeAmount)}</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

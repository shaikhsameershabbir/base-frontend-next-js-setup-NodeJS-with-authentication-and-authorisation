import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Eye } from 'lucide-react';

interface Bet {
    _id: string;
    userId: { username: string };
    marketId: { marketName: string };
    type: string;
    betType: string;
    amount: number;
    winAmount?: number | null;
    result?: string;
    claimStatus?: boolean;
    createdAt: string | Date;
}

interface BetsTableProps {
    bets: Bet[];
    loading: boolean;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalBets: number;
        limit: number;
    } | null;
    onViewBet: (betId: string) => void;
    onPageChange: (page: number) => void;
}

const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

const getBetTypeColor = (betType: string) => {
    if (betType === 'open') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (betType === 'close') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'; // for 'both'
};

const getGameTypeColor = (gameType: string) => {
    const colors: { [key: string]: string } = {
        'single': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'double': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        'triple': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        'panna': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        'sangam': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
        'jodi': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
    };
    return colors[gameType.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

export const BetsTable: React.FC<BetsTableProps> = ({
    bets,
    loading,
    pagination,
    onViewBet,
    onPageChange
}) => {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-primary">Bets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-primary">Loading bets...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (bets.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-primary">Bets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-secondary">No bets found with the current filters.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-primary">Bets</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-3 text-primary font-medium">Player</th>
                                <th className="text-left p-3 text-primary font-medium">Market</th>
                                <th className="text-left p-3 text-primary font-medium">Game Type</th>
                                <th className="text-left p-3 text-primary font-medium">Bet Type</th>
                                <th className="text-left p-3 text-primary font-medium">Amount</th>
                                <th className="text-left p-3 text-primary font-medium">Win Amount</th>
                                <th className="text-left p-3 text-primary font-medium">Result</th>
                                <th className="text-left p-3 text-primary font-medium">Claim Status</th>
                                <th className="text-left p-3 text-primary font-medium">Date</th>
                                <th className="text-left p-3 text-primary font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bets.map((bet) => (
                                <tr key={bet._id} className="border-b border-border hover:bg-card/50">
                                    <td className="p-3">
                                        <div>
                                            <p className="font-medium text-primary">{bet.userId.username}</p>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <p className="text-primary">{bet.marketId.marketName}</p>
                                    </td>
                                    <td className="p-3">
                                        <Badge className={getGameTypeColor(bet.type)}>
                                            {bet.type.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <Badge className={getBetTypeColor(bet.betType)}>
                                            {bet.betType.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <p className="font-medium text-primary">{formatCurrency(bet.amount)}</p>
                                    </td>
                                    <td className="p-3">
                                        {bet.winAmount !== null && bet.winAmount !== undefined ? (
                                            <p className="font-medium text-green-600">{formatCurrency(bet.winAmount)}</p>
                                        ) : (
                                            <p className="text-secondary">-</p>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {bet.winAmount && bet.winAmount > 0 ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                WIN
                                            </Badge>
                                        ) : bet.result ? (
                                            <Badge className={bet.result === 'win' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                                                {bet.result === 'win' ? 'WIN' : 'LOSS'}
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                NOT DECLARED
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <Badge className={bet.claimStatus === true ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                                            {bet.claimStatus === true ? 'CLAIMED' : 'NOT CLAIMED'}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <p className="text-secondary">{formatDate(bet.createdAt)}</p>
                                    </td>
                                    <td className="p-3">
                                        <Button
                                            onClick={() => onViewBet(bet._id)}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalBets}
                            itemsPerPage={pagination.limit}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

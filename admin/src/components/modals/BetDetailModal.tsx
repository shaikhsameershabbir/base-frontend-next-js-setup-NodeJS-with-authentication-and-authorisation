"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bet } from '@/lib/betApi';
import { useBets } from '@/hooks/useBets';
import { Eye, Calendar, User, Target, DollarSign, Hash, Clock } from 'lucide-react';

interface BetDetailModalProps {
    betId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BetDetailModal({ betId, isOpen, onClose }: BetDetailModalProps) {
    const [bet, setBet] = useState<Bet | null>(null);
    const [loading, setLoading] = useState(false);
    const { getBetById } = useBets();

    useEffect(() => {
        if (betId && isOpen) {
            loadBetDetails();
        }
    }, [betId, isOpen]);

    const loadBetDetails = async () => {
        if (!betId) return;

        setLoading(true);
        try {
            const betData = await getBetById(betId);
            setBet(betData);
        } catch (error) {
            console.error('Error loading bet details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getBetTypeColor = (betType: string) => {
        return betType === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Bet Details</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-primary">Loading bet details...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!bet) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Bet Details</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                        <p className="text-secondary">Bet not found or access denied.</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Bet Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center gap-2">
                                <Hash className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Bet ID</p>
                                    <p className="font-mono text-primary">{bet._id}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Created At</p>
                                    <p className="text-primary flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(bet.createdAt)}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Game Type</p>
                                    <Badge className={getGameTypeColor(bet.type)}>
                                        {bet.type.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Bet Type</p>
                                    <Badge className={getBetTypeColor(bet.betType)}>
                                        {bet.betType.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Player Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Username</p>
                                    <p className="text-primary font-medium">{bet.userId.username}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Role</p>
                                    <Badge variant="outline" className="text-primary">
                                        {bet.userId.role.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Current Balance</p>
                                    <p className="text-primary font-medium">{formatCurrency(bet.userId.balance)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Player ID</p>
                                    <p className="font-mono text-primary text-sm">{bet.userId._id}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Market Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Market Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Market Name</p>
                                    <p className="text-primary font-medium">{bet.marketId.marketName}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Open Time</p>
                                    <p className="text-primary flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {bet.marketId.openTime}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Close Time</p>
                                    <p className="text-primary flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {bet.marketId.closeTime}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Financial Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Bet Amount</p>
                                    <p className="text-primary font-medium text-lg">{formatCurrency(bet.amount)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Balance Before</p>
                                    <p className="text-primary">{formatCurrency(bet.userBeforeAmount)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Balance After</p>
                                    <p className="text-primary">{formatCurrency(bet.userAfterAmount)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Numbers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-primary">Selected Numbers & Amounts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {Object.entries(bet.selectedNumbers).map(([number, amount]) => (
                                    <div key={number} className="text-center p-3 border rounded-lg bg-card">
                                        <p className="text-lg font-bold text-primary">{number}</p>
                                        <p className="text-sm text-secondary">{formatCurrency(amount)}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-primary">Status Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-secondary">Status</p>
                                    <Badge className={bet.status ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                                        {bet.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                {bet.result && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-secondary">Result</p>
                                        <p className="text-primary font-medium">{bet.result}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 
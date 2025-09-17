import React, { useEffect } from "react";
import { Dialog } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { X, Trophy, Calendar, DollarSign, Target, CheckCircle } from "lucide-react";

interface BetDetail {
    _id: string;
    marketId: {
        _id: string;
        marketName: string;
    };
    type: string;
    betType: string;
    selectedNumbers: { [key: number]: number };
    amount: number;
    userBeforeAmount: number;
    userAfterAmount: number;
    status: boolean;
    result?: string;
    createdAt: string;
    claimStatus?: boolean;
    winAmount?: number;
    marketResult?: string;
    winnerBet?: string;
    winningMode?: string;
}

interface BetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    bet: BetDetail | null;
}

const BetDetailModal: React.FC<BetDetailModalProps> = ({ isOpen, onClose, bet }) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!bet) return null;

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status: boolean, result?: string) => {
        if (!status) return <Badge variant="destructive">Cancelled</Badge>;
        if (result === "won") return <Badge variant="success">Won</Badge>;
        if (result === "lost" || result === "loss") return <Badge variant="destructive">Lost</Badge>;
        return <Badge variant="warning">Pending</Badge>;
    };

    const getClaimStatusBadge = (claimStatus?: boolean, result?: string) => {
        // Don't show claim status for lost bets
        if (result === "loss" || result === "lost") return null;
        if (claimStatus === undefined) return <Badge variant="secondary">N/A</Badge>;
        return claimStatus ? (
            <Badge variant="success">Claimed</Badge>
        ) : (
            <Badge variant="warning">Not Claimed</Badge>
        );
    };

    const formatSelectedNumbers = (numbers: { [key: number]: number }) => {
        return Object.entries(numbers).map(([number, amount]) => ({
            number: parseInt(number),
            amount: amount
        }));
    };

    const isWinner = (item: { number: number; amount: number }) => {
        if (!bet.winnerBet) return false;
        return bet.betType === 'open' ? bet.winnerBet === item.number.toString() :
            bet.betType === 'close' ? bet.winnerBet === item.number.toString() :
                bet.betType === 'both' ? bet.winnerBet.includes(item.number.toString()) : false;
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'block' : 'hidden'}`}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Bet Details</h2>
                            <p className="text-sm text-gray-500">{bet.marketId.marketName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Bet Summary Card */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-bold">{bet.marketId.marketName}</h3>
                                <p className="text-blue-100 capitalize">{bet.type} • {bet.betType}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold">₹{bet.amount}</div>
                                <p className="text-blue-100">Bet Amount</p>
                            </div>
                        </div>

                        {bet.winAmount && bet.winAmount > 0 && (
                            <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-300/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-green-200" />
                                        <span className="text-green-100 font-medium">Win Amount</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-200">₹{bet.winAmount}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <div className="mt-1">{getStatusBadge(bet.status, bet.result)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Claim Status</p>
                                    <div className="mt-1">{getClaimStatusBadge(bet.claimStatus, bet.result)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Numbers */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Target className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Selected Numbers</h3>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {formatSelectedNumbers(bet.selectedNumbers).map((item, index) => {
                                const winner = isWinner(item);
                                return (
                                    <div
                                        key={index}
                                        className={`relative rounded-xl p-4 text-center transition-all duration-200 ${winner
                                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        <div className={`text-2xl font-bold mb-1 ${winner ? 'text-white' : 'text-gray-900'}`}>
                                            {item.number}
                                        </div>
                                        <div className={`text-sm ${winner ? 'text-green-100' : 'text-gray-600'}`}>
                                            ₹{item.amount.toFixed(2)}
                                        </div>
                                        {winner && (
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                                <Trophy className="w-3 h-3 text-yellow-800" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Result Information */}
                    {(bet.marketResult || bet.winnerBet) && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Result Information</h3>
                            </div>

                            <div className="space-y-4">
                                {bet.marketResult && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">Market Result</span>
                                        <span className="text-lg font-bold text-gray-900">{bet.marketResult}</span>
                                    </div>
                                )}

                                {bet.winnerBet && (
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-sm font-medium text-green-700">Winning Number</span>
                                        <span className="text-xl font-bold text-green-600">{bet.winnerBet}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Balance Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Balance Information</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Balance Before</p>
                                <p className="text-xl font-bold text-gray-900">₹{bet.userBeforeAmount}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Balance After</p>
                                <p className="text-xl font-bold text-gray-900">₹{bet.userAfterAmount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Date & Time</span>
                                <span className="text-sm font-medium text-gray-900">{formatDate(bet.createdAt)}</span>
                            </div>

                            {bet.result && (
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600">Bet Status</span>
                                    <span className="text-sm font-medium text-gray-900 capitalize">{bet.result}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BetDetailModal; 
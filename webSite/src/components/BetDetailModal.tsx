import React from "react";
import { Dialog } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { format } from "date-fns";

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
}

interface BetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    bet: BetDetail | null;
}

const BetDetailModal: React.FC<BetDetailModalProps> = ({ isOpen, onClose, bet }) => {
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
        if (result === "lost") return <Badge variant="destructive">Lost</Badge>;
        return <Badge variant="warning">Pending</Badge>;
    };

    const getClaimStatusBadge = (claimStatus?: boolean) => {
        if (claimStatus === undefined) return <Badge variant="secondary">N/A</Badge>;
        return claimStatus ? (
            <Badge variant="success">Claimed</Badge>
        ) : (
            <Badge variant="warning">Not Claimed</Badge>
        );
    };

    const formatSelectedNumbers = (numbers: { [key: number]: number }) => {
        return Object.entries(numbers)
            .map(([number, amount]) => `${number}: ₹${amount}`)
            .join(", ");
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Bet Details">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">{bet.marketId.marketName}</h3>
                            <p className="text-sm opacity-90 capitalize">{bet.type} • {bet.betType}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">₹{bet.amount}</div>
                            <div className="text-sm opacity-90">Total Amount</div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                    {/* Status Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Status Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 font-medium">Status:</span>
                                <div>{getStatusBadge(bet.status, bet.result)}</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 font-medium">Claim Status:</span>
                                <div>{getClaimStatusBadge(bet.claimStatus)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Bet Details Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Bet Details</h4>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-sm text-gray-700 font-medium">Game Type:</span>
                                    <div className="font-semibold capitalize text-gray-900">{bet.type}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700 font-medium">Bet Type:</span>
                                    <div className="font-semibold capitalize text-gray-900">{bet.betType}</div>
                                </div>
                            </div>

                            <div>
                                <span className="text-sm text-gray-700 font-medium">Selected Numbers:</span>
                                <div className="font-medium text-sm mt-1 bg-white rounded-lg p-2 border text-gray-800">
                                    {formatSelectedNumbers(bet.selectedNumbers)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Balance Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <span className="text-sm text-gray-700 font-medium">Balance Before:</span>
                                <div className="font-semibold text-green-600">₹{bet.userBeforeAmount}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-700 font-medium">Balance After:</span>
                                <div className="font-semibold text-green-600">₹{bet.userAfterAmount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Date & Result Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Additional Information</h4>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-700 font-medium">Date & Time:</span>
                                <div className="font-semibold text-gray-900">{formatDate(bet.createdAt)}</div>
                            </div>

                            {bet.result && (
                                <div>
                                    <span className="text-sm text-gray-700 font-medium">Result:</span>
                                    <div className="font-semibold text-gray-900">{bet.result}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-gray-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default BetDetailModal; 
"use client"

import { Card, CardContent } from '@/components/ui/card';

interface ProcessedBetData {
    singleNumbers: { [key: string]: number };
    doubleNumbers: { [key: string]: number };
    singlePanna: { [key: string]: number };
    doublePanna: { [key: string]: number };
    triplePanna: { [key: string]: number };
    halfSangamOpen: { [key: string]: number };
    halfSangamClose: { [key: string]: number };
    fullSangam: { [key: string]: number };
}

interface BetDetails {
    number: string;
    betAmount: number;
    gameType: string;
    winAmount: number;
    riskStatus: { status: string; color: string; icon: string };
}

interface BetDetailsModalProps {
    showModal: boolean;
    betDetails: BetDetails | null;
    processedData: ProcessedBetData | null;
    onClose: () => void;
    calculateWinAmount: (betType: string, betAmount: number, number: string) => number;
}

export function BetDetailsModal({
    showModal,
    betDetails,
    processedData,
    onClose,
    calculateWinAmount
}: BetDetailsModalProps) {
    if (!showModal || !betDetails) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Bet Details Analysis</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <h3 className="text-lg font-bold text-white mb-2">Bet Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Number:</span>
                                        <span className="text-white font-bold">{betDetails.number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Bet Amount:</span>
                                        <span className="text-green-400 font-bold">₹{betDetails.betAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Game Type:</span>
                                        <span className="text-blue-400 font-bold">{betDetails.gameType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-lg">
                                <h3 className="text-lg font-bold text-white mb-2">Winning Analysis</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Win Amount:</span>
                                        <span className="text-yellow-400 font-bold">₹{betDetails.winAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Profit:</span>
                                        <span className="text-green-400 font-bold">₹{(betDetails.winAmount - betDetails.betAmount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">ROI:</span>
                                        <span className="text-purple-400 font-bold">
                                            {((betDetails.winAmount / betDetails.betAmount - 1) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Risk Analysis */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-2">Risk Analysis</h3>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className={`text-sm font-bold ${betDetails.riskStatus.color}`}>
                                    {betDetails.riskStatus.icon} {betDetails.riskStatus.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-400">
                                {betDetails.riskStatus.status === 'SAFE' &&
                                    'This bet amount is considered safe with low risk exposure.'}
                                {betDetails.riskStatus.status === 'LOW RISK' &&
                                    'This bet has moderate risk. Consider reducing the amount if possible.'}
                                {betDetails.riskStatus.status === 'HIGH RISK' &&
                                    'This bet has high risk. Strongly consider reducing the bet amount.'}
                            </div>
                        </div>

                        {/* Winning Rate Breakdown */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-2">Winning Rate Breakdown</h3>
                            <div className="space-y-3 text-sm">
                                {(() => {
                                    const rates = {
                                        singleNumbers: 10, // Updated to 10x
                                        doubleNumbers: 90,
                                        singlePanna: 150,
                                        doublePanna: 300,
                                        triplePanna: 1000,
                                        halfSangamOpen: 1000,
                                        halfSangamClose: 1000,
                                        fullSangam: 10000
                                    };
                                    const rate = rates[betDetails.gameType as keyof typeof rates] || 10;

                                    // Calculate detailed breakdown for panna games
                                    if (['singlePanna', 'doublePanna', 'triplePanna'].includes(betDetails.gameType)) {
                                        const digitSum = betDetails.number.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                                        const singleNumberAmount = processedData?.singleNumbers[digitSum.toString()] || 0;
                                        const pannaWin = betDetails.betAmount * rate;
                                        const digitSumWin = singleNumberAmount * 10; // Updated to 10x

                                        return (
                                            <div className="space-y-3">
                                                <div className="bg-gray-700 p-3 rounded">
                                                    <div className="font-bold text-blue-400 mb-2">Main Panna Win:</div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Bet Amount:</span>
                                                        <span className="text-white">₹{betDetails.betAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Rate:</span>
                                                        <span className="text-yellow-400">{rate}x</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Panna Win:</span>
                                                        <span className="text-green-400 font-bold">₹{pannaWin.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-700 p-3 rounded">
                                                    <div className="font-bold text-purple-400 mb-2">Digit Sum Win:</div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Digit Sum ({betDetails.number}):</span>
                                                        <span className="text-white">{digitSum}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Single Number Bet:</span>
                                                        <span className="text-white">₹{singleNumberAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Single Rate:</span>
                                                        <span className="text-yellow-400">10x</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Calculation:</span>
                                                        <span className="text-white">₹{singleNumberAmount.toLocaleString()} × 10</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Digit Sum Win:</span>
                                                        <span className="text-green-400 font-bold">₹{digitSumWin.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-green-900 p-3 rounded">
                                                    <div className="font-bold text-white mb-2">Total Win:</div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-300">Panna Win:</span>
                                                        <span className="text-green-400">₹{pannaWin.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-300">+ Digit Sum Win:</span>
                                                        <span className="text-green-400">₹{digitSumWin.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-green-600 pt-2 mt-2">
                                                        <span className="text-white font-bold">Total:</span>
                                                        <span className="text-yellow-400 font-bold text-lg">₹{betDetails.winAmount.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Simple calculation for non-panna games
                                        return (
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Winning Rate:</span>
                                                    <span className="text-yellow-400 font-bold">{rate}x</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Calculation:</span>
                                                    <span className="text-white">₹{betDetails.betAmount} × {rate} = ₹{betDetails.winAmount}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    *Winning rates may vary based on game type and market rules
                                                </div>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>

                        {/* Different Bet Amounts */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-2">Other Bet Amounts</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {[1, 5, 10, 50, 100, 500, 1000, 5000].map(amount => {
                                    const winAmount = calculateWinAmount(betDetails.gameType, amount, betDetails.number);
                                    return (
                                        <div key={amount} className="bg-gray-700 p-2 rounded text-center">
                                            <div className="text-gray-400 text-xs">₹{amount}</div>
                                            <div className="text-yellow-400 font-bold">₹{winAmount}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 
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
                        <div className="grid  gap-4">
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

                      
                        </div>

                 

                        {/* Winning Rate Breakdown */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-2">Winning Rate Breakdown</h3>
                            <div className="space-y-3 text-sm">
                                {(() => {
                                    const rates = {
                                        singleNumbers: 9, // Updated to 9x
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
                                        const digitSumWin = singleNumberAmount * 9; // Updated to 9x

                                        return (
                                            <div className="space-y-3">
                                                <div className="bg-gray-700 p-3 rounded">
                                                    <div className="font-bold text-blue-400 mb-2"> Panna Win:</div>
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
                                                    <div className="font-bold text-purple-400 mb-2">Single Number  Sum Win:</div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Single Number  Sum ({betDetails.number}):</span>
                                                        <span className="text-white">{digitSum}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Single Number Bet:</span>
                                                        <span className="text-white">₹{singleNumberAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Single Rate:</span>
                                                        <span className="text-yellow-400">9x</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Calculation:</span>
                                                        <span className="text-white">₹{singleNumberAmount.toLocaleString()} × 9</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Single Number  Sum Win:</span>
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
                                                        <span className="text-gray-300">+ Single Number Sum Win:</span>
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
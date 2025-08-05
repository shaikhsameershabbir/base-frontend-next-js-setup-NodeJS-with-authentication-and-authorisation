"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BetTotals {
    singleNumbers: { total: number; count: number };
    doubleNumbers: { total: number; count: number };
    singlePanna: { total: number; count: number };
    doublePanna: { total: number; count: number };
    triplePanna: { total: number; count: number };
    halfSangamOpen: { total: number; count: number };
    halfSangamClose: { total: number; count: number };
    fullSangam: { total: number; count: number };
    overall: { total: number; count: number };
}

interface BetTotalsProps {
    betTotals: BetTotals | null;
    cuttingAmount: string;
    onExportAllPDF: () => void;
}

export function BetTotals({
    betTotals,
    cuttingAmount,
    onExportAllPDF
}: BetTotalsProps) {
    if (!betTotals) return null;

    return (
        <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-white">Bet Totals Summary</CardTitle>
                        <div className="text-sm text-gray-400">
                            Total Amount: ₹{betTotals.overall.total.toLocaleString()} | Total Numbers: {betTotals.overall.count}
                            {cuttingAmount && cuttingAmount !== '' && ` | Showing bets ≥ ₹${parseInt(cuttingAmount).toLocaleString()}`}
                        </div>
                    </div>
                    <Button
                        onClick={onExportAllPDF}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                    >
                        📄 Export All PDF
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Single Numbers</div>
                        <div className="text-lg font-bold text-green-400">₹{betTotals.singleNumbers.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{betTotals.singleNumbers.count} numbers</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Double Numbers</div>
                        <div className="text-lg font-bold text-blue-400">₹{betTotals.doubleNumbers.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{betTotals.doubleNumbers.count} numbers</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Single Panna</div>
                        <div className="text-lg font-bold text-purple-400">₹{betTotals.singlePanna.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{betTotals.singlePanna.count} numbers</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Double Panna</div>
                        <div className="text-lg font-bold text-yellow-400">₹{betTotals.doublePanna.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{betTotals.doublePanna.count} numbers</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Triple Panna</div>
                        <div className="text-lg font-bold text-red-400">₹{betTotals.triplePanna.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{betTotals.triplePanna.count} numbers</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Half Sangam Open</div>
                        <div className="text-lg font-bold text-pink-400">₹{betTotals.halfSangamOpen.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{betTotals.halfSangamOpen.count} numbers</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Half Sangam Close</div>
                        <div className="text-lg font-bold text-indigo-400">₹{betTotals.halfSangamClose.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{betTotals.halfSangamClose.count} numbers</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Full Sangam</div>
                        <div className="text-lg font-bold text-orange-400">₹{betTotals.fullSangam.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{betTotals.fullSangam.count} numbers</div>
                    </div>
                </div>

                {/* Overall Total */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                    <div className="text-center">
                        <div className="text-sm text-white opacity-90">Overall Total</div>
                        <div className="text-2xl font-bold text-white">₹{betTotals.overall.total.toLocaleString()}</div>
                        <div className="text-sm text-white opacity-75">{betTotals.overall.count} total numbers</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 
import { Card, CardContent } from '@/components/ui/card';

interface TotalBetAmountProps {
    data: any;
    selectedBetType: string;
    cuttingAmount: string;
}

export const TotalBetAmount = ({ data, selectedBetType, cuttingAmount }: TotalBetAmountProps) => {
    if (!data) return null;

    // Calculate COMPLETE grand total of ALL bet amounts
    const calculateCompleteGrandTotal = () => {
        let grandTotal = 0;
        const cuttingValue = parseFloat(cuttingAmount) || 0;

        // Process ALL data from the raw data structure
        if (data?.data) {
            // Process singles data based on selectedBetType
            if (data.data.single) {
                for (let digit = 0; digit < 10; digit++) {
                    const digitStr = digit.toString();
                    let digitAmount = 0;

                    if (selectedBetType === 'all') {
                        const openAmount = data.data.single.open?.[digitStr] || 0;
                        const closeAmount = data.data.single.close?.[digitStr] || 0;
                        digitAmount = openAmount + closeAmount;
                    } else if (selectedBetType === 'open') {
                        digitAmount = data.data.single.open?.[digitStr] || 0;
                    } else if (selectedBetType === 'close') {
                        digitAmount = data.data.single.close?.[digitStr] || 0;
                    }

                    // Apply cutting filter and "1 60" filter
                    if (digitAmount > cuttingValue && !(digitStr === "1" && digitAmount === 60)) {
                        grandTotal += digitAmount;
                    }
                }
            }

            // Process ALL other bet types
            Object.entries(data.data).forEach(([betType, betData]) => {
                // Skip singles as it's already processed
                if (betType === 'single') return;

                if (betData && typeof betData === 'object') {
                    // Handle different data structures
                    if (betData.open || betData.close) {
                        // Structure: { open: {...}, close: {...} }
                        const openData = betData.open || {};
                        const closeData = betData.close || {};

                        let betTypeTotal = 0;

                        // Process open data
                        if (selectedBetType === 'all' || selectedBetType === 'open') {
                            Object.entries(openData).forEach(([number, amount]) => {
                                const numAmount = amount as number;
                                if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                    betTypeTotal += numAmount;
                                }
                            });
                        }

                        // Process close data
                        if (selectedBetType === 'all' || selectedBetType === 'close') {
                            Object.entries(closeData).forEach(([number, amount]) => {
                                const numAmount = amount as number;
                                if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                    betTypeTotal += numAmount;
                                }
                            });
                        }

                        grandTotal += betTypeTotal;
                    } else if (betData.both) {
                        // Structure: { both: {...} }
                        Object.entries(betData.both).forEach(([number, amount]) => {
                            const numAmount = amount as number;
                            if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                grandTotal += numAmount;
                            }
                        });
                    } else {
                        // Direct structure: { number: amount, ... }
                        Object.entries(betData).forEach(([number, amount]) => {
                            const numAmount = amount as number;
                            if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                grandTotal += numAmount;
                            }
                        });
                    }
                }
            });
        }

        return grandTotal;
    };

    const completeGrandTotal = calculateCompleteGrandTotal();

    // Calculate breakdown by game type
    const calculateBreakdown = () => {
        const breakdown: Record<string, number> = {};
        const cuttingValue = parseFloat(cuttingAmount) || 0;

        // Calculate singles breakdown
        let singlesTotal = 0;
        if (data?.data?.single) {
            for (let digit = 0; digit < 10; digit++) {
                const digitStr = digit.toString();
                let digitAmount = 0;

                if (selectedBetType === 'all') {
                    const openAmount = data.data.single.open?.[digitStr] || 0;
                    const closeAmount = data.data.single.close?.[digitStr] || 0;
                    digitAmount = openAmount + closeAmount;
                } else if (selectedBetType === 'open') {
                    digitAmount = data.data.single.open?.[digitStr] || 0;
                } else if (selectedBetType === 'close') {
                    digitAmount = data.data.single.close?.[digitStr] || 0;
                }

                if (digitAmount > cuttingValue && !(digitStr === "1" && digitAmount === 60)) {
                    singlesTotal += digitAmount;
                }
            }
        }
        if (singlesTotal > 0) {
            breakdown.single = singlesTotal;
        }

        // Calculate all other bet types
        if (data?.data) {
            Object.entries(data.data).forEach(([betType, betData]) => {
                // Skip singles as it's already processed
                if (betType === 'single') return;

                let betTypeTotal = 0;

                if (betData && typeof betData === 'object') {
                    // Handle different data structures
                    if (betData.open || betData.close) {
                        // Structure: { open: {...}, close: {...} }
                        const openData = betData.open || {};
                        const closeData = betData.close || {};

                        // Process open data
                        if (selectedBetType === 'all' || selectedBetType === 'open') {
                            Object.entries(openData).forEach(([number, amount]) => {
                                const numAmount = amount as number;
                                if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                    betTypeTotal += numAmount;
                                }
                            });
                        }

                        // Process close data
                        if (selectedBetType === 'all' || selectedBetType === 'close') {
                            Object.entries(closeData).forEach(([number, amount]) => {
                                const numAmount = amount as number;
                                if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                    betTypeTotal += numAmount;
                                }
                            });
                        }
                    } else if (betData.both) {
                        // Structure: { both: {...} }
                        Object.entries(betData.both).forEach(([number, amount]) => {
                            const numAmount = amount as number;
                            if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                betTypeTotal += numAmount;
                            }
                        });
                    } else {
                        // Direct structure: { number: amount, ... }
                        Object.entries(betData).forEach(([number, amount]) => {
                            const numAmount = amount as number;
                            if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                betTypeTotal += numAmount;
                            }
                        });
                    }
                }

                if (betTypeTotal > 0) {
                    breakdown[betType] = betTypeTotal;
                }
            });
        }

        return breakdown;
    };

    const breakdown = calculateBreakdown();

    return (
        <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Complete Grand Total */}
                    <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-700">
                        <div className="text-2xl font-bold text-red-400">
                            ₹{completeGrandTotal.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                            Complete Grand Total
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            All Bet Types Combined
                        </div>
                    </div>

                    {/* Single Game Type */}
                    <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700">
                        <div className="text-xl font-bold text-green-400">
                            ₹{(breakdown.single || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                            Single
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {breakdown.single ? `${((breakdown.single / completeGrandTotal) * 100).toFixed(1)}%` : '0%'}
                        </div>
                    </div>

                    {/* Single Panna */}
                    <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700">
                        <div className="text-xl font-bold text-purple-400">
                            ₹{(breakdown.single_panna || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                            Single Panna
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {breakdown.single_panna ? `${((breakdown.single_panna / completeGrandTotal) * 100).toFixed(1)}%` : '0%'}
                        </div>
                    </div>

                    {/* Double Panna */}
                    <div className="text-center p-4 bg-orange-900/20 rounded-lg border border-orange-700">
                        <div className="text-xl font-bold text-orange-400">
                            ₹{(breakdown.double_panna || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                            Double Panna
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {breakdown.double_panna ? `${((breakdown.double_panna / completeGrandTotal) * 100).toFixed(1)}%` : '0%'}
                        </div>
                    </div>
                </div>

                {/* Additional breakdown for other game types */}
                {Object.entries(breakdown).filter(([key]) =>
                    !['single', 'single_panna', 'double_panna'].includes(key)
                ).length > 0 && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(breakdown).filter(([key]) =>
                                !['single', 'single_panna', 'double_panna'].includes(key)
                            ).map(([key, amount]) => (
                                <div key={key} className="text-center p-3 bg-gray-800 rounded-lg border border-gray-600">
                                    <div className="text-lg font-bold text-gray-300">
                                        ₹{amount.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-300">
                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {((amount / completeGrandTotal) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                {/* Filter Summary */}
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-300">
                        <span className="font-semibold">Active Filters:</span>
                        <span className="ml-2">
                            {selectedBetType === 'all' ? 'All Bets' :
                                selectedBetType === 'open' ? 'Open Bets' : 'Close Bets'}
                        </span>
                        {cuttingAmount && (
                            <span className="ml-2">
                                • Min Amount: ₹{parseFloat(cuttingAmount).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 
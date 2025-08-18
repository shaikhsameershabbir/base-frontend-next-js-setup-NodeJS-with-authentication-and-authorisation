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
                    const betDataObj = betData as any;
                    // Handle different data structures
                    if (betDataObj.open || betDataObj.close) {
                        // Structure: { open: {...}, close: {...} }
                        const openData = betDataObj.open || {};
                        const closeData = betDataObj.close || {};

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
                    } else if (betDataObj.both) {
                        // Structure: { both: {...} }
                        Object.entries(betDataObj.both).forEach(([number, amount]) => {
                            const numAmount = amount as number;
                            if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                grandTotal += numAmount;
                            }
                        });
                    } else {
                        // Direct structure: { number: amount, ... }
                        Object.entries(betDataObj).forEach(([number, amount]) => {
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

        // Calculate Double (2-digit numbers from various bet types)
        let doubleTotal = 0;
        const betTypesToCheck = ['jodi', 'half_bracket', 'full_bracket', 'family_panel'];

        betTypesToCheck.forEach(betType => {
            if (data?.data?.[betType]) {
                const betData = data.data[betType];
                const betDataObj = betData as any;

                // Handle different data structures
                let entries: [string, number][] = [];

                if (betDataObj.both) {
                    entries = Object.entries(betDataObj.both);
                } else if (betDataObj.open || betDataObj.close) {
                    const openData = betDataObj.open || {};
                    const closeData = betDataObj.close || {};

                    if (selectedBetType === 'all' || selectedBetType === 'open') {
                        entries.push(...Object.entries(openData) as [string, number][]);
                    }
                    if (selectedBetType === 'all' || selectedBetType === 'close') {
                        entries.push(...Object.entries(closeData) as [string, number][]);
                    }
                }

                entries.forEach(([number, amount]) => {
                    const numAmount = amount as number;

                    // Only process 2-digit numbers
                    if (number.length === 2 && /^\d{2}$/.test(number)) {
                        if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                            doubleTotal += numAmount;
                        }
                    }
                });
            }
        });

        if (doubleTotal > 0) {
            breakdown.double = doubleTotal;
        }

        // Calculate all other bet types
        if (data?.data) {
            Object.entries(data.data).forEach(([betType, betData]) => {
                // Skip singles and double bet types as they're already processed
                if (betType === 'single' || betTypesToCheck.includes(betType)) return;

                let betTypeTotal = 0;

                if (betData && typeof betData === 'object') {
                    const betDataObj = betData as any;
                    // Handle different data structures
                    if (betDataObj.open || betDataObj.close) {
                        // Structure: { open: {...}, close: {...} }
                        const openData = betDataObj.open || {};
                        const closeData = betDataObj.close || {};

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
                    } else if (betDataObj.both) {
                        // Structure: { both: {...} }
                        Object.entries(betDataObj.both).forEach(([number, amount]) => {
                            const numAmount = amount as number;
                            if (numAmount > cuttingValue && !(number === "1" && numAmount === 60)) {
                                betTypeTotal += numAmount;
                            }
                        });
                    } else {
                        // Direct structure: { number: amount, ... }
                        Object.entries(betDataObj).forEach(([number, amount]) => {
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
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-300">Complete Grand Total:</span>
                    <span className="text-xl font-bold text-red-400">
                        ₹{completeGrandTotal.toLocaleString()}
                    </span>
                </div>
                <div className="text-xs text-gray-400">
                    <span>Filters: </span>
                    <span>
                        {selectedBetType === 'all' ? 'All Bets' :
                            selectedBetType === 'open' ? 'Open Bets' : 'Close Bets'}
                    </span>
                    {cuttingAmount && (
                        <span className="ml-2">
                            • Min: ₹{parseFloat(cuttingAmount).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}; 
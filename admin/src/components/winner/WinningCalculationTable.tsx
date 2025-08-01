import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { organizeDataByGameTypes, getDigitSum, getGameTypeAndAmount } from './utils';
import { WINNING_RATES } from './constants';
import { exportToPDF } from './pdfExport';

interface WinningCalculationTableProps {
    data: any;
    selectedBetType: string;
    cuttingAmount: string;
    sortOrder: 'asc' | 'desc';
    onSortOrderChange: (order: 'asc' | 'desc') => void;
    onExportPDF: (gameType: string, gameTypeLabel: string) => void;
    onShowModal: (entry: any) => void;
}

export const WinningCalculationTable = ({
    data,
    selectedBetType,
    cuttingAmount,
    sortOrder,
    onSortOrderChange,
    onExportPDF,
    onShowModal
}: WinningCalculationTableProps) => {
    if (!data) return null;

    // Organize data by game types
    const organizedData = organizeDataByGameTypes(data);
    if (!organizedData) return null;

    // Create table data organized by digit sum (0-9)
    const tableData: Record<number, Array<{ number: string, amount: number, gameType: string, rate: number, winningAmount: number, betBreakdown: string }>> = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
    };

    // Process all numbers and categorize by digit sum
    Object.entries(organizedData).forEach(([category, numbers]) => {
        if (category === 'halfSangam' || category === 'fullSangam') return; // Skip sangam for now

        Object.entries(numbers as Record<string, number>).forEach(([number, amount]) => {
            // Skip single digits (0-9) and double digits (00-99)
            if (number.length === 1 || number.length === 2) return;

            // Apply cutting filter
            const cuttingValue = parseFloat(cuttingAmount) || 0;
            if (amount <= cuttingValue) return;

            // Validate number format
            if (!/^\d+$/.test(number)) {
                console.warn('Invalid number format:', number);
                return;
            }

            const digitSum = getDigitSum(number);

            // Validate digitSum is a valid number between 0-9
            if (isNaN(digitSum) || digitSum < 0 || digitSum > 9) {
                console.warn('Invalid digit sum:', digitSum, 'for number:', number);
                return;
            }

            // Ensure tableData[digitSum] exists
            if (!tableData[digitSum]) {
                tableData[digitSum] = [];
            }

            const { type, rate, amount: winningAmount } = getGameTypeAndAmount(number, amount);

            // For triple digits, also calculate winning for the digit sum
            let totalWinningAmount = winningAmount;
            let combinedNumbers = number;
            let betBreakdown = `${category}: ₹${amount.toLocaleString()} = ₹${winningAmount.toLocaleString()}`;

            if (number.length === 3) {
                const digitSumStr = digitSum.toString();
                const digitSumAmount = organizedData.single?.[digitSumStr] || 0;
                const digitSumWinning = digitSumAmount * WINNING_RATES.single;
                totalWinningAmount += digitSumWinning;
                combinedNumbers = `${number}-${digitSum}`;

                if (digitSumAmount > 0) {
                    betBreakdown += ` | Single(${digitSum}): ₹${digitSumAmount.toLocaleString()} = ₹${digitSumWinning.toLocaleString()}`;
                }
            }

            // Add total calculation
            betBreakdown += ` | Total Win = ₹${totalWinningAmount.toLocaleString()}`;

            tableData[digitSum].push({
                number: combinedNumbers,
                amount,
                gameType: type,
                rate,
                winningAmount: totalWinningAmount,
                betBreakdown
            });
        });
    });

    // Calculate comprehensive statistics
    const columnStats = Object.entries(tableData).map(([digit, entries]) => {
        const totalBetAmount = entries.reduce((sum, e) => sum + e.amount, 0);
        const totalWinningAmount = entries.reduce((sum, e) => sum + e.winningAmount, 0);
        const gameTypeBreakdown = entries.reduce((acc, e) => {
            acc[e.gameType] = (acc[e.gameType] || 0) + e.amount;
            return acc;
        }, {} as Record<string, number>);

        return {
            digit: parseInt(digit),
            totalNumbers: entries.length,
            totalBetAmount,
            totalWinningAmount,
            gameTypeBreakdown,
            riskRatio: totalWinningAmount / totalBetAmount,
            entries
        };
    });

    // Sort columns by total winning amount (highest risk first)
    columnStats.sort((a, b) => b.totalWinningAmount - a.totalWinningAmount);

    // Sort entries within each column by winning amount
    Object.values(tableData).forEach(entries => {
        entries.sort((a, b) => {
            if (sortOrder === 'desc') {
                return b.winningAmount - a.winningAmount;
            } else {
                return a.winningAmount - b.winningAmount;
            }
        });
    });

    return (
        <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
                <CardTitle className="text-white">Winning Calculation Table</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Sort Controls */}
                <div className="flex justify-end mb-4">
                    <Button variant="outline" onClick={() => onSortOrderChange('asc')} className="mr-2">
                        Ascending
                    </Button>
                    <Button variant="outline" onClick={() => onSortOrderChange('desc')} className="mr-2">
                        Descending
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    {/* Single Section Header */}
                    {(() => {
                        // Calculate total singles amount
                        let totalSinglesAmount = 0;
                        for (let digit = 0; digit < 10; digit++) {
                            const digitStr = digit.toString();
                            let digitSingles = 0;

                            if (selectedBetType === 'all') {
                                const openAmount = data?.data?.single?.open?.[digitStr] || 0;
                                const closeAmount = data?.data?.single?.close?.[digitStr] || 0;
                                digitSingles = openAmount + closeAmount;
                            } else if (selectedBetType === 'open') {
                                digitSingles = data?.data?.single?.open?.[digitStr] || 0;
                            } else if (selectedBetType === 'close') {
                                digitSingles = data?.data?.single?.close?.[digitStr] || 0;
                            }
                            totalSinglesAmount += digitSingles;
                        }

                        return (
                            <div className="mb-4 border border-gray-600 bg-gray-700 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="font-bold text-white text-lg">
                                            🎯 Single
                                        </div>
                                        <div className="text-green-400 font-bold">
                                            Total: ₹{totalSinglesAmount.toLocaleString()}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => onExportPDF('single', 'Single')}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        📄 Export PDF
                                    </Button>
                                </div>
                            </div>
                        );
                    })()}

                    <table className="w-full border-collapse border border-gray-600">
                        <thead>
                            <tr className="bg-gray-800">
                                {(() => {
                                    // Calculate singles amount for each column based on selectedBetType filter
                                    const singlesAmounts = [];
                                    const cuttingValue = parseFloat(cuttingAmount) || 0;

                                    for (let digit = 0; digit < 10; digit++) {
                                        const digitStr = digit.toString();
                                        let totalSingles = 0;

                                        if (selectedBetType === 'all') {
                                            // Show both open and close
                                            const openAmount = data?.data?.single?.open?.[digitStr] || 0;
                                            const closeAmount = data?.data?.single?.close?.[digitStr] || 0;
                                            totalSingles = openAmount + closeAmount;
                                        } else if (selectedBetType === 'open') {
                                            // Show only open
                                            totalSingles = data?.data?.single?.open?.[digitStr] || 0;
                                        } else if (selectedBetType === 'close') {
                                            // Show only close
                                            totalSingles = data?.data?.single?.close?.[digitStr] || 0;
                                        }

                                        // Apply cutting filter to singles amounts
                                        if (totalSingles <= cuttingValue) {
                                            singlesAmounts.push(null); // Empty column
                                        } else {
                                            singlesAmounts.push(totalSingles);
                                        }
                                    }

                                    return singlesAmounts.map((amount, index) => (
                                        <th key={index} className="border border-gray-600 p-2 text-center text-white">
                                            <div className="text-lg font-bold">{index}</div>
                                            {amount !== null ? (
                                                <>
                                                    <div className="text-xs text-green-400">
                                                        ₹{amount.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {selectedBetType === 'all' ? 'Singles' :
                                                            selectedBetType === 'open' ? 'Open Singles' :
                                                                'Close Singles'}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-xs text-gray-500">No data</div>
                                            )}
                                        </th>
                                    ));
                                })()}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Separate rows by game types */}
                            {(() => {
                                const gameTypes = [
                                    { key: 'singlePanna', label: 'Single Panna', icon: '🎯' },
                                    { key: 'doublePanna', label: 'Double Panna', icon: '🎲' },
                                    { key: 'triplePanna', label: 'Triple Panna', icon: '👑' }
                                ];
                                const rows: JSX.Element[] = [];

                                gameTypes.forEach((gameType) => {
                                    // Calculate total bet amount for this game type from organized data
                                    let totalBetAmount = 0;

                                    // Sum up all bet amounts for this game type from the organized data
                                    Object.values(tableData).forEach(columnEntries => {
                                        columnEntries.forEach(entry => {
                                            if (entry.gameType === gameType.key) {
                                                totalBetAmount += entry.amount;
                                            }
                                        });
                                    });

                                    // Find the maximum number of entries for this game type across all columns
                                    const maxEntriesForGameType = Math.max(...Object.values(tableData).map(col =>
                                        col.filter(entry => entry.gameType === gameType.key).length
                                    ));

                                    for (let i = 0; i < maxEntriesForGameType; i++) {
                                        const row: JSX.Element[] = [];

                                        // Add game type header for first row of each game type
                                        if (i === 0) {
                                            row.push(
                                                <td key="header" colSpan={10} className="border border-gray-600 p-2 text-center bg-gray-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="font-bold text-white text-lg">
                                                                {gameType.icon} {gameType.label}
                                                            </div>
                                                            <div className="text-green-400 font-bold">
                                                                Total: ₹{totalBetAmount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={() => onExportPDF(gameType.key, gameType.label)}
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            📄 Export PDF
                                                        </Button>
                                                    </div>
                                                </td>
                                            );
                                            rows.push(<tr key={`${gameType.key}-header`}>{row}</tr>);
                                        }

                                        // Create data row for this game type
                                        const dataRow: JSX.Element[] = [];
                                        for (let col = 0; col < 10; col++) {
                                            const entriesForGameType = tableData[col].filter(entry => entry.gameType === gameType.key);
                                            const entry = entriesForGameType[i];

                                            dataRow.push(
                                                <td key={col} className="border border-gray-600 p-2 text-center text-sm">
                                                    {entry ? (
                                                        <div className="space-y-2 p-2 bg-gray-800 rounded">
                                                            {/* Number and Game Type */}
                                                            <div className="font-bold text-blue-400 text-lg">{entry.number}</div>

                                                            {/* Bet Amount */}
                                                            <div className="text-xs">
                                                                <span className="text-gray-400">Bet:</span>
                                                                <span className="text-green-400 font-bold ml-1">₹{entry.amount.toLocaleString()}</span>
                                                            </div>

                                                            {/* Winning Amount */}
                                                            <div className="text-xs">
                                                                <span className="text-gray-400">Win:</span>
                                                                <span className="text-yellow-400 font-bold ml-1">₹{entry.winningAmount.toLocaleString()}</span>
                                                            </div>

                                                            {/* Risk Level Indicator */}
                                                            <div className={`text-xs px-1 rounded ${entry.winningAmount > 1000000 ? 'bg-red-900/50 text-red-300' :
                                                                entry.winningAmount > 500000 ? 'bg-orange-900/50 text-orange-300' :
                                                                    entry.winningAmount > 100000 ? 'bg-yellow-900/50 text-yellow-300' :
                                                                        'bg-green-900/50 text-green-300'
                                                                }`}>
                                                                {entry.winningAmount > 1000000 ? '🔥 HIGH RISK' :
                                                                    entry.winningAmount > 500000 ? '⚠️ MEDIUM RISK' :
                                                                        entry.winningAmount > 100000 ? '⚡ LOW RISK' :
                                                                            '✅ SAFE'}
                                                            </div>

                                                            {/* Click to see details */}
                                                            <button
                                                                onClick={() => onShowModal(entry)}
                                                                className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                                                            >
                                                                📊 View Details
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </td>
                                            );
                                        }
                                        rows.push(<tr key={`${gameType.key}-${i}`}>{dataRow}</tr>);
                                    }
                                });

                                return rows;
                            })()}
                        </tbody>
                    </table>
                </div>

                {/* Detailed Statistics */}
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-3">📈 Detailed Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-700 rounded">
                            <h4 className="font-bold text-white mb-2">🏆 Highest Risk Columns</h4>
                            <div className="text-sm space-y-1">
                                {columnStats.slice(0, 3).map((stat, index) => (
                                    <div key={stat.digit} className="flex justify-between">
                                        <span className="text-gray-300">{index + 1}. Column {stat.digit}:</span>
                                        <span className="text-red-400 font-bold">₹{stat.totalWinningAmount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 bg-gray-700 rounded">
                            <h4 className="font-bold text-white mb-2">💰 Total Exposure</h4>
                            <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Total Bet Amount:</span>
                                    <span className="text-green-400">₹{columnStats.reduce((sum, s) => sum + s.totalBetAmount, 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Total Risk Amount:</span>
                                    <span className="text-red-400 font-bold">₹{columnStats.reduce((sum, s) => sum + s.totalWinningAmount, 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Overall Risk Ratio:</span>
                                    <span className="text-yellow-400 font-bold">
                                        {(columnStats.reduce((sum, s) => sum + s.totalWinningAmount, 0) /
                                            columnStats.reduce((sum, s) => sum + s.totalBetAmount, 0)).toFixed(1)}x
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-gray-700 rounded">
                            <h4 className="font-bold text-white mb-2">🎲 Game Type Distribution</h4>
                            <div className="text-sm space-y-1">
                                {(() => {
                                    const gameTypeTotals = columnStats.reduce((acc, stat) => {
                                        Object.entries(stat.gameTypeBreakdown).forEach(([type, amount]) => {
                                            acc[type] = (acc[type] || 0) + amount;
                                        });
                                        return acc;
                                    }, {} as Record<string, number>);

                                    return Object.entries(gameTypeTotals)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([type, amount]) => (
                                            <div key={type} className="flex justify-between">
                                                <span className="text-gray-300">{type}:</span>
                                                <span className="text-blue-400">₹{amount.toLocaleString()}</span>
                                            </div>
                                        ));
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 
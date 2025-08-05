"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

interface DetailedBetDataProps {
    processedData: ProcessedBetData | null;
    selectedBetType: string;
    cuttingAmount: string;
    expandedSections: Record<string, boolean>;
    onToggleSection: (sectionKey: string) => void;
    onExportPDF: (sectionKey: string, data: { [key: string]: number }) => void;
    onShowBetDetails: (details: BetDetails) => void;
    calculateWinAmount: (betType: string, betAmount: number, number: string) => number;
    getRiskStatus: (betAmount: number, winAmount: number) => { status: string; color: string; icon: string };
}

export function DetailedBetData({
    processedData,
    selectedBetType,
    cuttingAmount,
    expandedSections,
    onToggleSection,
    onExportPDF,
    onShowBetDetails,
    calculateWinAmount,
    getRiskStatus
}: DetailedBetDataProps) {
    if (!processedData) return null;

    const getColumnForNumber = (betType: string, number: string): number => {
        switch (betType) {
            case 'singleNumbers':
                return parseInt(number);
            case 'doubleNumbers':
                return parseInt(number) % 10; // Last digit
            case 'singlePanna':
            case 'doublePanna':
            case 'triplePanna':
                // Calculate digit sum and use that as column
                return number.split('').reduce((sum, digit) => sum + parseInt(digit), 0) % 10;
            case 'halfSangamOpen':
            case 'halfSangamClose':
            case 'fullSangam':
                // For sangam, use the first digit or a specific pattern
                return parseInt(number.charAt(0));
            default:
                return 0;
        }
    };

    const renderSection = (title: string, data: { [key: string]: number }, color: string, sectionKey: string) => {
        const sortedEntries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
        const totalAmount = Object.values(data).reduce((sum, amount) => sum + amount, 0);
        const count = Object.keys(data).length;

        // Group entries by column
        const columnData: Record<number, Array<[string, number]>> = {
            0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
        };

        sortedEntries.forEach(([number, amount]) => {
            const column = getColumnForNumber(sectionKey, number);
            if (!columnData[column]) {
                columnData[column] = [];
            }
            columnData[column].push([number, amount]);
        });

        // Find the maximum number of entries across all columns
        const maxEntries = Math.max(...Object.values(columnData).map(col => col.length));

        return (
            <div key={sectionKey} className="mb-4 border border-gray-600 bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="font-bold text-white text-lg">
                            {sectionKey === 'singleNumbers' ? '🔢 Single Numbers' :
                                sectionKey === 'doubleNumbers' ? '🔢 Double Numbers' :
                                    sectionKey === 'singlePanna' ? '🎯 Single Panna' :
                                        sectionKey === 'doublePanna' ? '🎲 Double Panna' :
                                            sectionKey === 'triplePanna' ? '👑 Triple Panna' :
                                                sectionKey === 'halfSangamOpen' ? '🎪 Half Sangam Open' :
                                                    sectionKey === 'halfSangamClose' ? '🎪 Half Sangam Close' :
                                                        sectionKey === 'fullSangam' ? '🎭 Full Sangam' : title}
                        </div>
                        <div className="text-green-400 font-bold">
                            Total: ₹{totalAmount.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-sm">
                            {count} numbers
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => onToggleSection(sectionKey)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                        >
                            {expandedSections[sectionKey] ? 'Collapse' : 'Expand'}
                        </Button>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => onExportPDF(sectionKey, data)}
                        >
                            📄 Export PDF
                        </Button>
                    </div>
                </div>

                {/* Table - Collapsible */}
                {expandedSections[sectionKey] && maxEntries > 0 && (
                    <table className="w-full border-collapse border border-gray-600 mt-3">
                        <thead>
                            <tr className="bg-gray-800">
                                {Array.from({ length: 10 }, (_, index) => (
                                    <th key={index} className="border border-gray-600 p-2 text-center text-white">
                                        <div className="text-lg font-bold">{index}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: maxEntries }, (_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Array.from({ length: 10 }, (_, colIndex) => {
                                        const columnEntries = columnData[colIndex] || [];
                                        const entry = columnEntries[rowIndex];

                                        return (
                                            <td key={colIndex} className="border border-gray-600 p-2 text-center text-sm">
                                                {entry ? (
                                                    <div className="space-y-2 p-2 bg-gray-800 rounded">
                                                        {/* Number */}
                                                        <div className="font-bold text-blue-400 text-lg">{entry[0]}</div>

                                                        {/* Bet Amount */}
                                                        <div className="text-xs">
                                                            <span className="text-gray-400">Bet:</span>
                                                            <span className="text-green-400 font-bold ml-1">₹{entry[1].toLocaleString()}</span>
                                                        </div>

                                                        {/* Winning Amount */}
                                                        <div className="text-xs">
                                                            <span className="text-gray-400">Win:</span>
                                                            <span className="text-yellow-400 font-bold ml-1">₹{calculateWinAmount(sectionKey, entry[1], entry[0]).toLocaleString()}</span>
                                                        </div>

                                                        {/* Risk Level Indicator */}
                                                        {(() => {
                                                            const winAmount = calculateWinAmount(sectionKey, entry[1], entry[0]);
                                                            const risk = getRiskStatus(entry[1], winAmount);
                                                            return (
                                                                <div className={`text-xs px-1 rounded ${risk.color.replace('text-', 'bg-').replace('-400', '-900/50')} ${risk.color}`}>
                                                                    {risk.icon} {risk.status}
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* Click to see details */}
                                                        <button
                                                            onClick={() => {
                                                                const winAmount = calculateWinAmount(sectionKey, entry[1], entry[0]);
                                                                const riskStatus = getRiskStatus(entry[1], winAmount);

                                                                onShowBetDetails({
                                                                    number: entry[0],
                                                                    betAmount: entry[1],
                                                                    gameType: sectionKey,
                                                                    winAmount,
                                                                    riskStatus
                                                                });
                                                            }}
                                                            className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                                                        >
                                                            📊 View Details
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 text-xs">-</div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    return (
        <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
                <CardTitle className="text-white">Detailed Bet Data</CardTitle>
                <div className="text-sm text-gray-400">
                    Filtered by: {selectedBetType === 'all' ? 'All Bet Types' : selectedBetType === 'open' ? 'Open Only' : 'Close Only'}
                    {cuttingAmount && cuttingAmount !== '' && ` | Cutting Amount: ₹${parseInt(cuttingAmount).toLocaleString()}+`}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {renderSection('Single Numbers (0-9)', processedData.singleNumbers, 'text-green-400', 'singleNumbers')}
                {renderSection('Double Numbers (00-99)', processedData.doubleNumbers, 'text-blue-400', 'doubleNumbers')}
                {renderSection('Single Panna', processedData.singlePanna, 'text-purple-400', 'singlePanna')}
                {renderSection('Double Panna', processedData.doublePanna, 'text-yellow-400', 'doublePanna')}
                {renderSection('Triple Panna', processedData.triplePanna, 'text-red-400', 'triplePanna')}
                {renderSection('Half Sangam Open', processedData.halfSangamOpen, 'text-pink-400', 'halfSangamOpen')}
                {renderSection('Half Sangam Close', processedData.halfSangamClose, 'text-indigo-400', 'halfSangamClose')}
                {renderSection('Full Sangam', processedData.fullSangam, 'text-orange-400', 'fullSangam')}
            </CardContent>
        </Card>
    );
} 
"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { singlePannaNumbers, doublePannaNumbers, triplePannaNumbers, WINNING_RATES } from '@/components/winner/constants';
import toast from 'react-hot-toast';

interface HierarchicalUser {
    _id: string;
    username: string;
    parentId?: string;
}

interface Market {
    _id: string;
    marketName: string;
}

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

interface FiltersSectionProps {
    // Filter states
    selectedDate: string;
    selectedBetType: string;
    selectedUser: string;
    selectedMarket: string;
    selectedAdmin: string;
    selectedDistributor: string;
    selectedAgent: string;
    selectedPlayer: string;
    cuttingAmount: string;
    currentDataUser: string;

    // Hierarchical data
    hierarchicalUsers: Record<string, HierarchicalUser[]>;
    assignedMarkets: Market[];

    // Result declaration states
    resultType: 'open' | 'close';
    resultNumber: string;
    targetDate: string;
    declareLoading: boolean;

    // Market results for close validation
    marketResults: any;

    // Processed data for win calculation
    processedData: ProcessedBetData | null;

    // Handlers
    onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDateSubmit: () => void;
    onTodayClick: () => void;
    onMarketChange: (marketId: string) => void;
    onBetTypeChange: (betType: string) => void;
    onCuttingAmountChange: (value: string) => void;
    onAdminChange: (adminId: string) => void;
    onDistributorChange: (distributorId: string) => void;
    onAgentChange: (agentId: string) => void;
    onPlayerChange: (playerId: string) => void;
    onClearFilters: () => void;
    onResultTypeChange: (type: 'open' | 'close') => void;
    onResultNumberChange: (value: string) => void;
    onTargetDateChange: (value: string) => void;
    onDeclareResult: () => void;
    canDeclareClose: () => boolean;
    getDayName: (date: Date) => string;
    calculateWinAmount: (betType: string, betAmount: number, number: string) => number;
}

export function FiltersSection({
    selectedDate,
    selectedBetType,
    selectedUser,
    selectedMarket,
    selectedAdmin,
    selectedDistributor,
    selectedAgent,
    selectedPlayer,
    cuttingAmount,
    currentDataUser,
    hierarchicalUsers,
    assignedMarkets,
    resultType,
    resultNumber,
    targetDate,
    declareLoading,
    marketResults,
    processedData,
    onDateChange,
    onDateSubmit,
    onTodayClick,
    onMarketChange,
    onBetTypeChange,
    onCuttingAmountChange,
    onAdminChange,
    onDistributorChange,
    onAgentChange,
    onPlayerChange,
    onClearFilters,
    onResultTypeChange,
    onResultNumberChange,
    onTargetDateChange,
    onDeclareResult,
    canDeclareClose,
    getDayName,
    calculateWinAmount
}: FiltersSectionProps) {
    return (
        <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
                <CardTitle className="text-white">Filters</CardTitle>
                {/* Status Indicator */}
                {currentDataUser !== 'all' && (
                    <div className="mt-2">
                        <span className="text-sm text-blue-400">
                            📊 Showing hierarchical data for selected user and all downline
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Date Filter */}
                    <div className="space-y-3">
                        <Label className="text-gray-300 font-medium">Date Filter</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={onDateChange}
                                className="flex-1"
                            />
                            <Button onClick={onDateSubmit} disabled={!selectedDate} size="sm" className="whitespace-nowrap">
                                Load
                            </Button>
                        </div>
                        <Button variant="outline" onClick={onTodayClick} size="sm" className="w-full sm:w-auto">
                            Today
                        </Button>
                    </div>

                    {/* Market Filter */}
                    <div className="space-y-3">
                        <Label className="text-gray-300 font-medium">Market Filter</Label>
                        <Select value={selectedMarket} onValueChange={onMarketChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select market" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Markets</SelectItem>
                                {assignedMarkets.map((market) => (
                                    <SelectItem key={market._id} value={market._id}>
                                        {market.marketName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bet Type Filter */}
                    <div className="space-y-3">
                        <Label className="text-gray-300 font-medium">Bet Type Filter</Label>
                        <Select value={selectedBetType} onValueChange={onBetTypeChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select bet type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Bet Types</SelectItem>
                                <SelectItem value="open">Open Only</SelectItem>
                                <SelectItem value="close">Close Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cutting Amount Filter */}
                    <div className="space-y-3">
                        <Label className="text-gray-300 font-medium">Cutting Amount</Label>
                        <Input
                            type="number"
                            placeholder="Show bets ≥ amount (e.g., 1000)"
                            value={cuttingAmount}
                            onChange={(e) => onCuttingAmountChange(e.target.value)}
                            className="flex-1"
                        />
                        {cuttingAmount && cuttingAmount !== '' && (
                            <div className="text-xs text-blue-400">
                                Showing bets ≥ ₹{parseInt(cuttingAmount).toLocaleString()}
                            </div>
                        )}
                    </div>

                    {/* Hierarchical User Selection */}
                    <div className="space-y-3 lg:col-span-2 xl:col-span-1">
                        <Label className="text-gray-300 font-medium">User Hierarchy</Label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                            {/* Admin Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Admin</Label>
                                <Select value={selectedAdmin} onValueChange={onAdminChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select admin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Admins</SelectItem>
                                        {hierarchicalUsers.admin?.map((admin) => (
                                            <SelectItem key={admin._id} value={admin._id}>
                                                {admin.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Distributor Selection - Only show if admin is selected */}
                            {selectedAdmin !== 'all' && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Distributor</Label>
                                    <Select value={selectedDistributor} onValueChange={onDistributorChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select distributor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Distributors</SelectItem>
                                            {hierarchicalUsers.distributor?.filter(dist => dist.parentId === selectedAdmin).map((distributor) => (
                                                <SelectItem key={distributor._id} value={distributor._id}>
                                                    {distributor.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Agent Selection - Only show if distributor is selected */}
                            {selectedDistributor !== 'all' && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Agent</Label>
                                    <Select value={selectedAgent} onValueChange={onAgentChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select agent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Agents</SelectItem>
                                            {hierarchicalUsers.agent?.filter(agent => agent.parentId === selectedDistributor).map((agent) => (
                                                <SelectItem key={agent._id} value={agent._id}>
                                                    {agent.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Player Selection - Only show if agent is selected */}
                            {selectedAgent !== 'all' && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Player</Label>
                                    <Select value={selectedPlayer} onValueChange={onPlayerChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select player" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Players</SelectItem>
                                            {hierarchicalUsers.player?.filter(player => player.parentId === selectedAgent).map((player) => (
                                                <SelectItem key={player._id} value={player._id}>
                                                    {player.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Simple Result Declaration */}
                <div className="mt-6 border-t border-gray-700 pt-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white mb-2">🎯 Declare Result</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Result Type */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Result Type</Label>
                            <div className="flex space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="resultType"
                                        value="open"
                                        checked={resultType === 'open'}
                                        onChange={() => onResultTypeChange('open')}
                                    />
                                    <span className="text-gray-300">Open</span>
                                </label>
                                <label className={`flex items-center space-x-2 ${canDeclareClose() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                                    <input
                                        type="radio"
                                        name="resultType"
                                        value="close"
                                        checked={resultType === 'close'}
                                        onChange={() => {
                                            if (canDeclareClose()) {
                                                onResultTypeChange('close');
                                            } else {
                                                toast.error('Open result must be declared first');
                                            }
                                        }}
                                        disabled={!canDeclareClose()}
                                    />
                                    <span className={`${canDeclareClose() ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Close {canDeclareClose() ? '' : '(Open Required)'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Result Number */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Result Number</Label>
                            <Input
                                type="text"
                                placeholder="Enter number (1-3 digits)"
                                value={resultNumber}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow 1-3 digits and numeric characters
                                    if (value.length <= 3 && /^\d*$/.test(value)) {
                                        onResultNumberChange(value);
                                    }
                                }}
                                onBlur={(e) => {
                                    const value = e.target.value;
                                    if (value.length === 1) {
                                        // Single number (0-9) - always valid
                                        if (!/^[0-9]$/.test(value)) {
                                            onResultNumberChange('');
                                            toast.error('Please enter a valid single number (0-9)');
                                        }
                                    } else if (value.length === 2) {
                                        // Double number (00-99) - always valid
                                        if (!/^[0-9]{2}$/.test(value)) {
                                            onResultNumberChange('');
                                            toast.error('Please enter a valid double number (00-99)');
                                        }
                                    } else if (value.length === 3) {
                                        const num = parseInt(value);
                                        const allPannaNumbers = [...singlePannaNumbers, ...doublePannaNumbers, ...triplePannaNumbers];
                                        if (!allPannaNumbers.includes(num)) {
                                            onResultNumberChange('');
                                            toast.error('Please enter a valid panna number from the game list');
                                        }
                                    }
                                }}
                                className="text-center text-lg font-bold"
                            />
                            <div className="text-xs text-gray-400">
                                Enter a valid number: Single (0-9), Double (00-99), or Panna (3-digit)
                            </div>
                            {resultNumber && resultNumber.length > 0 && (
                                <div className="space-y-2">
                                    {resultNumber.length === 3 && (
                                        <div className="text-xs text-blue-400">
                                            Main will be: {(() => {
                                                const digits = resultNumber.split('').map(d => parseInt(d));
                                                const sum = digits.reduce((a, b) => a + b, 0);
                                                return sum > 9 ? sum % 10 : sum;
                                            })()}
                                        </div>
                                    )}

                                </div>
                            )}
                            {/* Panna Number Suggestions */}
                            {resultNumber && resultNumber.length > 0 && (
                                <div className="text-xs text-green-400">
                                    Suggestions: {
                                        [...singlePannaNumbers, ...doublePannaNumbers, ...triplePannaNumbers]
                                            .filter(num => num.toString().includes(resultNumber))
                                            .slice(0, 5)
                                            .join(', ')
                                    }
                                </div>
                            )}

                            {/* Total Win Amount Preview */}
                            {resultNumber && resultNumber.length > 0 && processedData && (() => {
                                let totalWinAmount = 0;
                                let gameType = '';
                                let gameTypeName = '';

                                if (resultNumber.length === 1) {
                                    // Single number (0-9)
                                    gameType = 'singleNumbers';
                                    gameTypeName = 'Single Number';
                                    const amount = processedData.singleNumbers[resultNumber] || 0;
                                    totalWinAmount = calculateWinAmount(gameType, amount, resultNumber);
                                } else if (resultNumber.length === 2) {
                                    // Double number (00-99)
                                    gameType = 'doubleNumbers';
                                    gameTypeName = 'Double Number';
                                    const amount = processedData.doubleNumbers[resultNumber] || 0;
                                    totalWinAmount = calculateWinAmount(gameType, amount, resultNumber);
                                } else if (resultNumber.length === 3) {
                                    const num = parseInt(resultNumber);

                                    if (singlePannaNumbers.includes(num)) {
                                        gameType = 'singlePanna';
                                        gameTypeName = 'Single Panna';
                                    } else if (doublePannaNumbers.includes(num)) {
                                        gameType = 'doublePanna';
                                        gameTypeName = 'Double Panna';
                                    } else if (triplePannaNumbers.includes(num.toString().padStart(3, '0'))) {
                                        gameType = 'triplePanna';
                                        gameTypeName = 'Triple Panna';
                                    }

                                    if (gameType) {
                                        // Calculate win for the panna number itself
                                        const pannaData = processedData[gameType as keyof ProcessedBetData] as { [key: string]: number };
                                        const pannaAmount = pannaData[resultNumber] || 0;

                                        if (resultType === 'open') {
                                            // For open results - standard calculation
                                            if (['singlePanna', 'doublePanna', 'triplePanna'].includes(gameType)) {
                                                // For panna games, calculate both panna win and digit sum win
                                                const pannaWin = pannaAmount * WINNING_RATES[gameType as keyof typeof WINNING_RATES];
                                                const digitSum = resultNumber.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                                                const singleNumberAmount = processedData.singleNumbers[digitSum.toString()] || 0;
                                                const digitSumWin = singleNumberAmount * WINNING_RATES.single;
                                                totalWinAmount = pannaWin + digitSumWin;
                                            } else {
                                                // For non-panna games, use the calculateWinAmount function
                                                totalWinAmount = calculateWinAmount(gameType, pannaAmount, resultNumber);
                                            }
                                        } else if (resultType === 'close') {
                                            // For close results - complex calculation with open result
                                            let baseWinAmount = 0;

                                            // 1. Standard panna and digit sum calculation
                                            if (['singlePanna', 'doublePanna', 'triplePanna'].includes(gameType)) {
                                                const pannaWin = pannaAmount * WINNING_RATES[gameType as keyof typeof WINNING_RATES];
                                                const digitSum = resultNumber.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                                                const singleNumberAmount = processedData.singleNumbers[digitSum.toString()] || 0;
                                                const digitSumWin = singleNumberAmount * WINNING_RATES.single;
                                                baseWinAmount = pannaWin + digitSumWin;
                                            } else {
                                                baseWinAmount = calculateWinAmount(gameType, pannaAmount, resultNumber);
                                            }

                                            // 2. Get open result from market results
                                            const today = new Date();
                                            const dayName = getDayName(today);
                                            const dayResult = marketResults?.results?.[dayName as keyof typeof marketResults.results];

                                            if (dayResult?.open) {
                                                const openResult = dayResult.open.toString();
                                                const openMain = dayResult.main;

                                                // 3. Calculate combined main (openMain + closeMain)
                                                const closeMain = resultNumber.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                                                const combinedMain = parseInt(openMain.toString() + closeMain.toString());

                                                // 4. Check for double number bet on combined main
                                                const doubleNumberAmount = processedData.doubleNumbers[combinedMain.toString()] || 0;
                                                const doubleNumberWin = doubleNumberAmount * WINNING_RATES.double;

                                                // 5. Check for half sangam open (openMain X closePanna)
                                                const halfSangamOpenPattern = `${openMain}X${resultNumber}`;
                                                const halfSangamOpenAmount = processedData.halfSangamOpen[halfSangamOpenPattern] || 0;
                                                const halfSangamOpenWin = halfSangamOpenAmount * WINNING_RATES.halfSangam;

                                                // 6. Check for half sangam close (openPanna X closeMain)
                                                const halfSangamClosePattern = `${openResult}X${closeMain}`;
                                                const halfSangamCloseAmount = processedData.halfSangamClose[halfSangamClosePattern] || 0;
                                                const halfSangamCloseWin = halfSangamCloseAmount * WINNING_RATES.halfSangam;

                                                // 7. Check for full sangam (openPanna X openMain X closePanna)
                                                const fullSangamPattern = `${openResult}X${openMain}X${resultNumber}`;
                                                const fullSangamAmount = processedData.fullSangam[fullSangamPattern] || 0;
                                                const fullSangamWin = fullSangamAmount * WINNING_RATES.fullSangam;

                                                // 8. Calculate total
                                                totalWinAmount = baseWinAmount + doubleNumberWin + halfSangamOpenWin + halfSangamCloseWin + fullSangamWin;
                                            } else {
                                                // If no open result, use standard calculation
                                                totalWinAmount = baseWinAmount;
                                            }
                                        }
                                    }
                                }

                                if (gameType && totalWinAmount > 0) {
                                    return (
                                        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                                            <div className="text-xs text-yellow-400 font-bold mb-1">
                                                💰 Total Potential Win Amount:
                                            </div>
                                            <div className="text-lg font-bold text-yellow-400">
                                                ₹{totalWinAmount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {gameTypeName} • Based on current filtered data
                                            </div>

                                            {/* Win Amount Breakdown */}
                                            {(() => {
                                                if (resultType === 'open') {
                                                    // Open result breakdown
                                                    if (['singlePanna', 'doublePanna', 'triplePanna'].includes(gameType)) {
                                                        const pannaData = processedData[gameType as keyof ProcessedBetData] as { [key: string]: number };
                                                        const pannaAmount = pannaData[resultNumber] || 0;
                                                        const pannaWin = pannaAmount * WINNING_RATES[gameType as keyof typeof WINNING_RATES];
                                                        const digitSum = resultNumber.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                                                        const singleNumberAmount = processedData.singleNumbers[digitSum.toString()] || 0;
                                                        const digitSumWin = singleNumberAmount * WINNING_RATES.single;

                                                        return (
                                                            <div className="mt-3 space-y-2 text-xs">
                                                                <div className="border-t border-yellow-600/30 pt-2">
                                                                    <div className="text-blue-400 font-bold mb-1">📊 Win Amount Breakdown:</div>

                                                                    {/* Main Panna Win */}
                                                                    <div className="bg-blue-900/20 p-2 rounded mb-2">
                                                                        <div className="text-blue-400 font-bold">Main Panna Win:</div>
                                                                        <div className="text-gray-300">Bet Amount: ₹{pannaAmount.toLocaleString()}</div>
                                                                        <div className="text-gray-300">Rate: {WINNING_RATES[gameType as keyof typeof WINNING_RATES]}x</div>
                                                                        <div className="text-green-400 font-bold">Panna Win: ₹{pannaWin.toLocaleString()}</div>
                                                                    </div>

                                                                    {/* Digit Sum Win */}
                                                                    <div className="bg-purple-900/20 p-2 rounded mb-2">
                                                                        <div className="text-purple-400 font-bold">Digit Sum Win:</div>
                                                                        <div className="text-gray-300">Digit Sum ({resultNumber}): {digitSum}</div>
                                                                        <div className="text-gray-300">Single Number Bet: ₹{singleNumberAmount.toLocaleString()}</div>
                                                                        <div className="text-gray-300">Single Rate: {WINNING_RATES.single}x</div>
                                                                        <div className="text-green-400 font-bold">Digit Sum Win: ₹{digitSumWin.toLocaleString()}</div>
                                                                    </div>

                                                                    {/* Total */}
                                                                    <div className="bg-green-900/20 p-2 rounded">
                                                                        <div className="text-green-400 font-bold">Total Win:</div>
                                                                        <div className="text-gray-300">Panna Win: ₹{pannaWin.toLocaleString()}</div>
                                                                        <div className="text-gray-300">+ Digit Sum Win: ₹{digitSumWin.toLocaleString()}</div>
                                                                        <div className="text-yellow-400 font-bold text-sm">Total: ₹{totalWinAmount.toLocaleString()}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    } else {
                                                        // For single and double numbers, show simple breakdown
                                                        const gameData = processedData[gameType as keyof ProcessedBetData] as { [key: string]: number };
                                                        const amount = gameData[resultNumber] || 0;
                                                        const winAmount = amount * WINNING_RATES[gameType as keyof typeof WINNING_RATES];

                                                        return (
                                                            <div className="mt-3 space-y-2 text-xs">
                                                                <div className="border-t border-yellow-600/30 pt-2">
                                                                    <div className="text-blue-400 font-bold mb-1">📊 Win Amount Breakdown:</div>
                                                                    <div className="bg-blue-900/20 p-2 rounded">
                                                                        <div className="text-blue-400 font-bold">{gameTypeName} Win:</div>
                                                                        <div className="text-gray-300">Bet Amount: ₹{amount.toLocaleString()}</div>
                                                                        <div className="text-gray-300">Rate: {WINNING_RATES[gameType as keyof typeof WINNING_RATES]}x</div>
                                                                        <div className="text-green-400 font-bold">Total Win: ₹{winAmount.toLocaleString()}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                } else if (resultType === 'close') {
                                                    // Close result breakdown
                                                    const today = new Date();
                                                    const dayName = getDayName(today);
                                                    const dayResult = marketResults?.results?.[dayName as keyof typeof marketResults.results];

                                                    if (dayResult?.open) {
                                                        const openResult = dayResult.open.toString();
                                                        const openMain = dayResult.main;
                                                        const closeMain = resultNumber.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                                                        const combinedMain = parseInt(openMain.toString() + closeMain.toString());

                                                        // Calculate all components
                                                        const pannaData = processedData[gameType as keyof ProcessedBetData] as { [key: string]: number };
                                                        const pannaAmount = pannaData[resultNumber] || 0;
                                                        const pannaWin = pannaAmount * WINNING_RATES[gameType as keyof typeof WINNING_RATES];
                                                        const digitSum = resultNumber.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                                                        const singleNumberAmount = processedData.singleNumbers[digitSum.toString()] || 0;
                                                        const digitSumWin = singleNumberAmount * WINNING_RATES.single;

                                                        const doubleNumberAmount = processedData.doubleNumbers[combinedMain.toString()] || 0;
                                                        const doubleNumberWin = doubleNumberAmount * WINNING_RATES.double;

                                                        const halfSangamOpenPattern = `${openMain}X${resultNumber}`;
                                                        const halfSangamOpenAmount = processedData.halfSangamOpen[halfSangamOpenPattern] || 0;
                                                        const halfSangamOpenWin = halfSangamOpenAmount * WINNING_RATES.halfSangam;

                                                        const halfSangamClosePattern = `${openResult}X${closeMain}`;
                                                        const halfSangamCloseAmount = processedData.halfSangamClose[halfSangamClosePattern] || 0;
                                                        const halfSangamCloseWin = halfSangamCloseAmount * WINNING_RATES.halfSangam;

                                                        const fullSangamPattern = `${openResult}X${openMain}X${resultNumber}`;
                                                        const fullSangamAmount = processedData.fullSangam[fullSangamPattern] || 0;
                                                        const fullSangamWin = fullSangamAmount * WINNING_RATES.fullSangam;

                                                        return (
                                                            <div className="mt-3 space-y-2 text-xs">
                                                                <div className="border-t border-yellow-600/30 pt-2">
                                                                    <div className="text-blue-400 font-bold mb-1">📊 Close Result Breakdown:</div>

                                                                    {/* Base Win */}
                                                                    <div className="bg-blue-900/20 p-2 rounded mb-2">
                                                                        <div className="text-blue-400 font-bold">Base Win (Close Panna + Digit Sum):</div>
                                                                        <div className="text-gray-300">Panna Win: ₹{pannaWin.toLocaleString()}</div>
                                                                        <div className="text-gray-300">Digit Sum Win: ₹{digitSumWin.toLocaleString()}</div>
                                                                        <div className="text-green-400 font-bold">Base Total: ₹{(pannaWin + digitSumWin).toLocaleString()}</div>
                                                                    </div>

                                                                    {/* Combined Main Win */}
                                                                    <div className="bg-purple-900/20 p-2 rounded mb-2">
                                                                        <div className="text-purple-400 font-bold">Combined Main Win:</div>
                                                                        <div className="text-gray-300">Open Main: {openMain} + Close Main: {closeMain} = {combinedMain}</div>
                                                                        <div className="text-gray-300">Double Number Bet: ₹{doubleNumberAmount.toLocaleString()}</div>
                                                                        <div className="text-gray-300">Rate: {WINNING_RATES.double}x</div>
                                                                        <div className="text-green-400 font-bold">Combined Main Win: ₹{doubleNumberWin.toLocaleString()}</div>
                                                                    </div>

                                                                    {/* Half Sangam Open */}
                                                                    <div className="bg-orange-900/20 p-2 rounded mb-2">
                                                                        <div className="text-orange-400 font-bold">Half Sangam Open:</div>
                                                                        <div className="text-gray-300">Pattern: {openMain}X{resultNumber}</div>
                                                                        <div className="text-gray-300">Bet Amount: ₹{halfSangamOpenAmount.toLocaleString()}</div>
                                                                        <div className="text-gray-300">Rate: {WINNING_RATES.halfSangam}x</div>
                                                                        <div className="text-green-400 font-bold">Half Sangam Open Win: ₹{halfSangamOpenWin.toLocaleString()}</div>
                                                                    </div>

                                                                    {/* Half Sangam Close */}
                                                                    <div className="bg-red-900/20 p-2 rounded mb-2">
                                                                        <div className="text-red-400 font-bold">Half Sangam Close:</div>
                                                                        <div className="text-gray-300">Pattern: {openResult}X{closeMain}</div>
                                                                        <div className="text-gray-300">Bet Amount: ₹{halfSangamCloseAmount.toLocaleString()}</div>
                                                                        <div className="text-gray-300">Rate: {WINNING_RATES.halfSangam}x</div>
                                                                        <div className="text-green-400 font-bold">Half Sangam Close Win: ₹{halfSangamCloseWin.toLocaleString()}</div>
                                                                    </div>

                                                                    {/* Full Sangam */}
                                                                    <div className="bg-indigo-900/20 p-2 rounded mb-2">
                                                                        <div className="text-indigo-400 font-bold">Full Sangam:</div>
                                                                        <div className="text-gray-300">Pattern: {openResult}X{openMain}X{resultNumber}</div>
                                                                        <div className="text-gray-300">Bet Amount: ₹{fullSangamAmount.toLocaleString()}</div>
                                                                        <div className="text-gray-300">Rate: {WINNING_RATES.fullSangam}x</div>
                                                                        <div className="text-green-400 font-bold">Full Sangam Win: ₹{fullSangamWin.toLocaleString()}</div>
                                                                    </div>

                                                                    {/* Total */}
                                                                    <div className="bg-green-900/20 p-2 rounded">
                                                                        <div className="text-green-400 font-bold">Total Close Win:</div>
                                                                        <div className="text-gray-300">Base Win: ₹{(pannaWin + digitSumWin).toLocaleString()}</div>
                                                                        <div className="text-gray-300">+ Combined Main: ₹{doubleNumberWin.toLocaleString()}</div>
                                                                        <div className="text-gray-300">+ Half Sangam Open: ₹{halfSangamOpenWin.toLocaleString()}</div>
                                                                        <div className="text-gray-300">+ Half Sangam Close: ₹{halfSangamCloseWin.toLocaleString()}</div>
                                                                        <div className="text-gray-300">+ Full Sangam: ₹{fullSangamWin.toLocaleString()}</div>
                                                                        <div className="text-yellow-400 font-bold text-sm">Total: ₹{totalWinAmount.toLocaleString()}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    } else {
                                                        // No open result available
                                                        return (
                                                            <div className="mt-3 space-y-2 text-xs">
                                                                <div className="border-t border-yellow-600/30 pt-2">
                                                                    <div className="text-red-400 font-bold mb-1">⚠️ No Open Result Available:</div>
                                                                    <div className="text-gray-300">Open result must be declared first to calculate close result wins.</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                }
                                            })()}
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        {/* Target Date */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Target Date</Label>
                            <Input
                                type="date"
                                value={targetDate}
                                onChange={(e) => onTargetDateChange(e.target.value)}
                                className="text-center"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">&nbsp;</Label>
                            <Button
                                onClick={onDeclareResult}
                                disabled={
                                    declareLoading ||
                                    selectedMarket === 'all' ||
                                    !resultNumber ||
                                    !targetDate ||
                                    resultNumber.length !== 3 ||
                                    ![...singlePannaNumbers, ...doublePannaNumbers, ...triplePannaNumbers].includes(parseInt(resultNumber))
                                }
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                {declareLoading ? 'Declaring...' : `Declare ${resultType}`}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Clear Filters Button */}
                <div className="mt-6 flex justify-center">
                    <Button variant="outline" onClick={onClearFilters} size="sm" className="px-6">
                        Clear All Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 
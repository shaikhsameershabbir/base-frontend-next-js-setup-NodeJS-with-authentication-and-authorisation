"use client"

import { useState, useEffect } from 'react';
import { winnerApi, type WinnerResponse, type WinnerData, type CompleteTotals, type HierarchicalUser, type Market } from '@/lib/winnerApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/layout/admin-layout';
import jsPDF from 'jspdf';

// Import the panna numbers arrays
const singlePannaNumbers = [
    128, 129, 120, 130, 140,
    137, 138, 139, 149, 159,
    146, 147, 148, 158, 168,
    236, 156, 157, 167, 230,
    245, 237, 238, 239, 249,
    290, 246, 247, 248, 258,
    380, 345, 256, 257, 267,
    470, 390, 346, 347, 348,
    489, 480, 490, 356, 357,
    560, 570, 580, 590, 456,
    579, 589, 670, 680, 690,
    678, 679, 689, 789, 780,
    123, 124, 125, 126, 127,
    150, 160, 134, 135, 136,
    169, 179, 170, 180, 145,
    178, 250, 189, 234, 190,
    240, 269, 260, 270, 235,
    259, 278, 279, 289, 280,
    268, 340, 350, 360, 370,
    349, 359, 369, 379, 389,
    358, 368, 378, 450, 460,
    367, 458, 459, 469, 479,
    457, 467, 468, 478, 569,
    790, 890, 567, 568, 578
];

const doublePannaNumbers = [
    100, 110, 166, 112, 113,
    119, 200, 229, 220, 122,
    155, 228, 300, 266, 177,
    227, 255, 337, 338, 339,
    335, 336, 355, 400, 366,
    344, 499, 445, 446, 447,
    399, 660, 599, 455, 500,
    588, 688, 779, 699, 799,
    669, 778, 788, 770, 889,
    114, 115, 116, 117, 118,
    277, 133, 224, 144, 226,
    330, 188, 233, 199, 244,
    448, 223, 288, 225, 299,
    466, 377, 440, 388, 334,
    556, 449, 477, 559, 488,
    600, 557, 558, 577, 550,
    880, 566, 800, 667, 668,
    899, 700, 990, 900, 677
];

const triplePannaNumbers = [0, 111, 222, 333, 444, 555, 666, 777, 888, 999];

// Winning rates
const WINNING_RATES = {
    single: 9,
    double: 90,
    singlePanna: 150,
    doublePanna: 300,
    triplePanna: 1000,
    halfSangam: 1000,
    fullSangam: 10000
};

// Function to calculate digit sum and get last digit
const getDigitSum = (number: string): number => {
    return number.split('').reduce((sum, digit) => sum + parseInt(digit), 0) % 10;
};

// Function to determine game type and calculate winning amount
const getGameTypeAndAmount = (number: string, amount: number) => {
    const numLength = number.length;
    const numValue = parseInt(number);

    if (numLength === 1) {
        return { type: 'single', rate: WINNING_RATES.single, amount: amount * WINNING_RATES.single };
    } else if (numLength === 2) {
        return { type: 'double', rate: WINNING_RATES.double, amount: amount * WINNING_RATES.double };
    } else if (numLength === 3) {
        // Handle "000" specially - it's a triple panna but different from 0
        if (number === "000") {
            return { type: 'triplePanna', rate: WINNING_RATES.triplePanna, amount: amount * WINNING_RATES.triplePanna };
        }

        if (triplePannaNumbers.includes(numValue)) {
            return { type: 'triplePanna', rate: WINNING_RATES.triplePanna, amount: amount * WINNING_RATES.triplePanna };
        } else if (singlePannaNumbers.includes(numValue)) {
            return { type: 'singlePanna', rate: WINNING_RATES.singlePanna, amount: amount * WINNING_RATES.singlePanna };
        } else if (doublePannaNumbers.includes(numValue)) {
            return { type: 'doublePanna', rate: WINNING_RATES.doublePanna, amount: amount * WINNING_RATES.doublePanna };
        } else {
            return { type: 'double', rate: WINNING_RATES.double, amount: amount * WINNING_RATES.double };
        }
    }
    return { type: 'unknown', rate: 0, amount: 0 };
};

export default function WinnerPage() {
    const [data, setData] = useState<WinnerResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedGameType, setSelectedGameType] = useState<string>('all');
    const [selectedBetType, setSelectedBetType] = useState<string>('all'); // 'all', 'open', 'close'

    // Hierarchical filter states
    const [hierarchicalUsers, setHierarchicalUsers] = useState<Record<string, HierarchicalUser[]>>({});
    const [assignedMarkets, setAssignedMarkets] = useState<Market[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedMarket, setSelectedMarket] = useState<string>('all');
    const [selectedUserRole, setSelectedUserRole] = useState<string>('all');
    const [loadingFilters, setLoadingFilters] = useState(false);

    // Cascading selection states
    const [selectedAdmin, setSelectedAdmin] = useState<string>('all');
    const [selectedDistributor, setSelectedDistributor] = useState<string>('all');
    const [selectedAgent, setSelectedAgent] = useState<string>('all');
    const [selectedPlayer, setSelectedPlayer] = useState<string>('all');

    // Status tracking
    const [currentDataUser, setCurrentDataUser] = useState<string>('all');

    // Modal state for detailed breakdown
    const [selectedEntry, setSelectedEntry] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    // Sorting state
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Cutting filter state
    const [cuttingAmount, setCuttingAmount] = useState<string>('');

    // PDF Export functions
    const exportAllToPDF = () => {
        try {
            const doc = new jsPDF();

            // Get market name
            const selectedMarketName = selectedMarket !== 'all'
                ? assignedMarkets.find(market => market._id === selectedMarket)?.marketName || 'All Markets'
                : 'All Markets';

            // Get current date and time
            const now = new Date();
            const currentDate = now.toLocaleDateString('en-IN');
            const currentTime = now.toLocaleTimeString('en-IN');

            // Add title
            doc.setFontSize(16);
            doc.text('Complete Bet Data Report', 14, 20);

            // Add market name
            doc.setFontSize(10);
            doc.text(`Market: ${selectedMarketName}`, 14, 30);

            // Add date and filters info
            doc.text(`Date: ${selectedDate || 'Today'}`, 14, 35);
            doc.text(`Bet Type: ${selectedBetType}`, 14, 40);

            // Add PDF creation time
            doc.text(`Generated on: ${currentDate} at ${currentTime}`, 14, 45);

            let yPosition = 65;

            // Define all game types to export
            const gameTypes = [
                { key: 'single', label: 'Single' },
                { key: 'singlePanna', label: 'Single Panna' },
                { key: 'doublePanna', label: 'Double Panna' },
                { key: 'triplePanna', label: 'Triple Panna' }
            ];

            // Export each game type
            gameTypes.forEach((gameType, index) => {
                // Get data for this game type
                const gameData: Array<{ number: string; amount: number; winningAmount: number }> = [];

                // Use the same data organization logic as the web interface
                const organizedData = organizeDataByGameTypes(data);
                if (!organizedData) return;

                // Create table data organized by digit sum (0-9) - same as web interface
                const tableData: Record<number, Array<{ number: string, amount: number, gameType: string, rate: number, winningAmount: number, betBreakdown: string }>> = {
                    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
                };

                // Process all numbers and categorize by digit sum (same as web interface)
                Object.entries(organizedData).forEach(([category, numbers]) => {
                    if (category === 'halfSangam' || category === 'fullSangam') return; // Skip sangam for now

                    Object.entries(numbers as Record<string, number>).forEach(([number, amount]) => {
                        // For single game type, include single digits (0-9)
                        // For other game types, skip single digits (0-9) and double digits (00-99)
                        if (gameType.key !== 'single' && (number.length === 1 || number.length === 2)) return;

                        // Apply cutting filter
                        const cuttingValue = parseFloat(cuttingAmount) || 0;
                        if (amount <= cuttingValue) return;

                        // Filter out "1 60" entries
                        if (number === "1" && amount === 60) return;

                        // Validate number format
                        if (!/^\d+$/.test(number)) {
                            return;
                        }

                        const digitSum = getDigitSum(number);

                        // Validate digitSum is a valid number between 0-9
                        if (isNaN(digitSum) || digitSum < 0 || digitSum > 9) {
                            return;
                        }

                        // Ensure tableData[digitSum] exists
                        if (!tableData[digitSum]) {
                            tableData[digitSum] = [];
                        }

                        const { type, rate, amount: winningAmount } = getGameTypeAndAmount(number, amount);

                        // For single digits, use the number as is
                        let totalWinningAmount = winningAmount;
                        let combinedNumbers = number;
                        let betBreakdown = `${category}: ₹${amount.toLocaleString()} = ₹${winningAmount.toLocaleString()}`;

                        // For triple digits, also calculate winning for the digit sum
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

                // Extract data for the specific game type (same as web interface)
                Object.values(tableData).forEach(columnEntries => {
                    columnEntries.forEach(entry => {
                        if (entry.gameType === gameType.key) {
                            gameData.push({
                                number: entry.number,
                                amount: entry.amount,
                                winningAmount: entry.winningAmount
                            });
                        }
                    });
                });

                if (gameData.length > 0) {
                    // Add game type header
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${gameType.label} - Bet Data`, 14, yPosition);
                    yPosition += 10;

                    // Add table header
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Bet Number', 14, yPosition);
                    doc.text('Bet Amount', 45, yPosition);
                    doc.text('Bet Number', 85, yPosition);
                    doc.text('Bet Amount', 116, yPosition);
                    doc.text('Bet Number', 156, yPosition);
                    doc.text('Bet Amount', 187, yPosition);
                    yPosition += 10;

                    // Add table data
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');

                    // Process data in groups of 3 for 3 columns
                    for (let i = 0; i < gameData.length; i += 3) {
                        if (yPosition > 280) {
                            // Add new page if running out of space
                            doc.addPage();
                            yPosition = 20;
                        }

                        const row = gameData.slice(i, i + 3);

                        // First column
                        if (row[0]) {
                            doc.text(row[0].number, 14, yPosition);
                            doc.text(`${row[0].amount.toLocaleString()}`, 45, yPosition);
                        }

                        // Second column
                        if (row[1]) {
                            doc.text(row[1].number, 85, yPosition);
                            doc.text(`${row[1].amount.toLocaleString()}`, 116, yPosition);
                        }

                        // Third column
                        if (row[2]) {
                            doc.text(row[2].number, 156, yPosition);
                            doc.text(`${row[2].amount.toLocaleString()}`, 187, yPosition);
                        }

                        yPosition += 7;
                    }

                    yPosition += 15; // Add space between sections
                }
            });

            // Save PDF
            doc.save(`Complete_Bet_Data_${selectedDate || 'today'}.pdf`);
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const exportToPDF = (gameType: string, gameTypeLabel: string) => {
        try {
            const doc = new jsPDF();

            // Use the exact same logic as the web interface to get the data
            const gameData: Array<{ number: string; amount: number; winningAmount: number }> = [];

            // Organize data by game types (same as web interface)
            const organizedData = organizeDataByGameTypes(data);
            if (!organizedData) {
                alert(`No data available for ${gameTypeLabel}`);
                return;
            }

            // Create table data organized by digit sum (0-9) - same as web interface
            const tableData: Record<number, Array<{ number: string, amount: number, gameType: string, rate: number, winningAmount: number, betBreakdown: string }>> = {
                0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
            };

            // Process all numbers and categorize by digit sum (same as web interface)
            Object.entries(organizedData).forEach(([category, numbers]) => {
                if (category === 'halfSangam' || category === 'fullSangam') return; // Skip sangam for now

                Object.entries(numbers as Record<string, number>).forEach(([number, amount]) => {
                    // For single game type, include single digits (0-9)
                    // For other game types, skip single digits (0-9) and double digits (00-99)
                    if (gameType !== 'single' && (number.length === 1 || number.length === 2)) return;

                    // Apply cutting filter
                    const cuttingValue = parseFloat(cuttingAmount) || 0;
                    if (amount <= cuttingValue) return;

                    // Filter out "1 60" entries
                    if (number === "1" && amount === 60) return;

                    // Validate number format
                    if (!/^\d+$/.test(number)) {
                        return;
                    }

                    const digitSum = getDigitSum(number);

                    // Validate digitSum is a valid number between 0-9
                    if (isNaN(digitSum) || digitSum < 0 || digitSum > 9) {
                        return;
                    }

                    // Ensure tableData[digitSum] exists
                    if (!tableData[digitSum]) {
                        tableData[digitSum] = [];
                    }

                    const { type, rate, amount: winningAmount } = getGameTypeAndAmount(number, amount);

                    // For single digits, use the number as is
                    let totalWinningAmount = winningAmount;
                    let combinedNumbers = number;
                    let betBreakdown = `${category}: ₹${amount.toLocaleString()} = ₹${winningAmount.toLocaleString()}`;

                    // For triple digits, also calculate winning for the digit sum
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

            // Extract data for the specific game type (same as web interface)
            Object.values(tableData).forEach(columnEntries => {
                columnEntries.forEach(entry => {
                    if (entry.gameType === gameType) {
                        gameData.push({
                            number: entry.number,
                            amount: entry.amount,
                            winningAmount: entry.winningAmount
                        });
                    }
                });
            });



            if (gameData.length === 0) {
                alert(`No data available for ${gameTypeLabel}`);
                return;
            }

            // Get market name
            const selectedMarketName = selectedMarket !== 'all'
                ? assignedMarkets.find(market => market._id === selectedMarket)?.marketName || 'All Markets'
                : 'All Markets';

            // Get current date and time
            const now = new Date();
            const currentDate = now.toLocaleDateString('en-IN');
            const currentTime = now.toLocaleTimeString('en-IN');

            // Add title
            doc.setFontSize(16);
            doc.text(`${gameTypeLabel} - Bet Data`, 14, 20);

            // Add market name
            doc.setFontSize(10);
            doc.text(`Market: ${selectedMarketName}`, 14, 30);

            // Add date and filters info
            doc.text(`Date: ${selectedDate || 'Today'}`, 14, 35);
            doc.text(`Bet Type: ${selectedBetType}`, 14, 40);

            // Add PDF creation time
            doc.text(`Generated on: ${currentDate} at ${currentTime}`, 14, 45);

            // Add table header
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Bet Number', 14, 65);
            doc.text('Bet Amount', 45, 65);
            doc.text('Bet Number', 85, 65);
            doc.text('Bet Amount', 116, 65);
            doc.text('Bet Number', 156, 65);
            doc.text('Bet Amount', 187, 65);

            // Add table data
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            let yPosition = 75;

            // Process data in groups of 3 for 3 columns
            for (let i = 0; i < gameData.length; i += 3) {
                if (yPosition > 280) {
                    // Add new page if running out of space
                    doc.addPage();
                    yPosition = 20;
                }

                const row = gameData.slice(i, i + 3);

                // First column
                if (row[0]) {
                    doc.text(row[0].number, 14, yPosition);
                    doc.text(`${row[0].amount.toLocaleString()}`, 45, yPosition);
                }

                // Second column
                if (row[1]) {
                    doc.text(row[1].number, 85, yPosition);
                    doc.text(`${row[1].amount.toLocaleString()}`, 116, yPosition);
                }

                // Third column
                if (row[2]) {
                    doc.text(row[2].number, 156, yPosition);
                    doc.text(`${row[2].amount.toLocaleString()}`, 187, yPosition);
                }

                yPosition += 7;
            }

            // Save PDF
            doc.save(`${gameTypeLabel}_${selectedDate || 'today'}.pdf`);
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    useEffect(() => {
        fetchWinnerData();
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            setLoadingFilters(true);
            const [usersResponse, marketsResponse] = await Promise.all([
                winnerApi.getHierarchicalUsers(),
                winnerApi.getAssignedMarkets()
            ]);
            setHierarchicalUsers(usersResponse.data);
            setAssignedMarkets(marketsResponse.data);
        } catch (err: any) {
            console.error('Failed to fetch filters:', err);
        } finally {
            setLoadingFilters(false);
        }
    };

    const fetchWinnerData = async (date?: string, userId?: string, marketId?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await winnerApi.getAllWinners(date, userId, marketId);
            setData(response);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch winner data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleDateSubmit = () => {
        if (selectedDate) {
            const userId = selectedUser !== 'all' ? selectedUser : undefined;
            setCurrentDataUser(userId || 'all');
            fetchWinnerData(selectedDate, userId, selectedMarket !== 'all' ? selectedMarket : undefined);
        }
    };

    const handleTodayClick = () => {
        setSelectedDate('');
        const userId = selectedUser !== 'all' ? selectedUser : undefined;
        setCurrentDataUser(userId || 'all');
        fetchWinnerData(undefined, userId, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleUserChange = (userId: string) => {
        setSelectedUser(userId);
        fetchWinnerData(selectedDate || undefined, userId !== 'all' ? userId : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleMarketChange = (marketId: string) => {
        setSelectedMarket(marketId);
        const userId = selectedUser !== 'all' ? selectedUser : undefined;
        setCurrentDataUser(userId || 'all');
        fetchWinnerData(selectedDate || undefined, userId, marketId !== 'all' ? marketId : undefined);
    };

    const handleUserRoleChange = (role: string) => {
        setSelectedUserRole(role);
        setSelectedUser('all'); // Reset user selection when role changes
    };

    const handleAdminChange = (adminId: string) => {
        setSelectedAdmin(adminId);
        setSelectedDistributor('all');
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setSelectedUser(adminId !== 'all' ? adminId : 'all');
        setCurrentDataUser(adminId !== 'all' ? adminId : 'all');
        fetchWinnerData(selectedDate || undefined, adminId !== 'all' ? adminId : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleDistributorChange = (distributorId: string) => {
        setSelectedDistributor(distributorId);
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setSelectedUser(distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchWinnerData(selectedDate || undefined, distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleAgentChange = (agentId: string) => {
        setSelectedAgent(agentId);
        setSelectedPlayer('all');
        setSelectedUser(agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchWinnerData(selectedDate || undefined, agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handlePlayerChange = (playerId: string) => {
        setSelectedPlayer(playerId);
        setSelectedUser(playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchWinnerData(selectedDate || undefined, playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleBetTypeChange = (betType: string) => {
        setSelectedBetType(betType);
    };

    const clearFilters = () => {
        setSelectedUser('all');
        setSelectedMarket('all');
        setSelectedUserRole('all');
        setSelectedDate('');
        setSelectedAdmin('all');
        setSelectedDistributor('all');
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setSelectedBetType('all');
        setCuttingAmount(''); // Clear cutting amount
        setCurrentDataUser('all');
        fetchWinnerData();
    };

    // Function to organize data by game types
    const organizeDataByGameTypes = (rawData: any) => {
        if (!rawData || !rawData.data) return null;

        // Organize data by result type
        const organizedData: any = {
            singlePanna: {},
            doublePanna: {},
            triplePanna: {},
            halfSangam: {},
            fullSangam: {}
        };

        // Handle the correct data structure where rawData.data is an object with game types
        if (typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
            // Process each game type in the data
            Object.entries(rawData.data).forEach(([gameType, betTypes]: [string, any]) => {
                if (!organizedData[gameType]) {
                    organizedData[gameType] = {};
                }

                // Process each bet type (open, close, both)
                Object.entries(betTypes).forEach(([betType, numbers]: [string, any]) => {
                    if (typeof numbers === 'object' && numbers !== null) {
                        // Process each number and its amount
                        Object.entries(numbers).forEach(([number, amount]: [string, any]) => {
                            if (!organizedData[gameType][number]) {
                                organizedData[gameType][number] = 0;
                            }
                            organizedData[gameType][number] += amount;
                        });
                    }
                });
            });
        } else if (Array.isArray(rawData.data)) {
            // Fallback for array structure (if it exists)
            rawData.data.forEach((result: any) => {
                const { resultType, resultValue, amount } = result;

                if (!organizedData[resultType]) {
                    organizedData[resultType] = {};
                }

                if (!organizedData[resultType][resultValue]) {
                    organizedData[resultType][resultValue] = 0;
                }

                organizedData[resultType][resultValue] += amount;
            });
        } else {
            console.warn('Unexpected data structure:', rawData.data);
            return organizedData;
        }

        return organizedData;
    };

    const renderFilters = () => {
        return (
            <Card className="mb-6 bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Filters</CardTitle>
                    {/* Status Indicator */}
                    {currentDataUser !== 'all' && (
                        <div className="mt-2">
                            <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-700">
                                📊 Showing hierarchical data for selected user and all downline
                            </Badge>
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
                                    onChange={handleDateChange}
                                    className="flex-1"
                                />
                                <Button onClick={handleDateSubmit} disabled={!selectedDate} size="sm" className="whitespace-nowrap">
                                    Load
                                </Button>
                            </div>
                            <Button variant="outline" onClick={handleTodayClick} size="sm" className="w-full sm:w-auto">
                                Today
                            </Button>
                        </div>

                        {/* Market Filter */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Market Filter</Label>
                            <Select value={selectedMarket} onValueChange={handleMarketChange}>
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
                            <Select value={selectedBetType} onValueChange={handleBetTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select bet type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Bets</SelectItem>
                                    <SelectItem value="open">Open Bets</SelectItem>
                                    <SelectItem value="close">Close Bets</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Cutting Filter */}
                        <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Cutting Filter</Label>
                            <Input
                                type="number"
                                placeholder="Enter minimum bet amount"
                                value={cuttingAmount}
                                onChange={(e) => setCuttingAmount(e.target.value)}
                                className="w-full"
                            />
                            <div className="text-xs text-gray-400">
                                Show only numbers with bet amount greater than this value
                            </div>
                        </div>

                        {/* Hierarchical User Selection */}
                        <div className="space-y-3 lg:col-span-2 xl:col-span-1">
                            <Label className="text-gray-300 font-medium">User Hierarchy</Label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                                {/* Admin Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-400">Admin</Label>
                                    <Select value={selectedAdmin} onValueChange={handleAdminChange}>
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
                                        <Select value={selectedDistributor} onValueChange={handleDistributorChange}>
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
                                        <Select value={selectedAgent} onValueChange={handleAgentChange}>
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
                                        <Select value={selectedPlayer} onValueChange={handlePlayerChange}>
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

                    {/* Clear Filters Button */}
                    <div className="mt-6 flex justify-center">
                        <Button variant="outline" onClick={clearFilters} size="sm" className="px-6">
                            Clear All Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // const renderJsonData = () => {
    //     if (!data) return null;

    //     // Organize data by game types
    //     const organizedData = organizeDataByGameTypes(data);

    //     const displayData = {
    //         originalData: data,
    //         organizedByGameTypes: organizedData,
    //         filters: {
    //             selectedBetType,
    //             selectedDate,
    //             selectedMarket,
    //             selectedUser,
    //             selectedAdmin,
    //             selectedDistributor,
    //             selectedAgent,
    //             selectedPlayer
    //         }
    //     };

    //     return (
    //         <Card className="mb-6 bg-gray-900 border-gray-700">
    //             <CardHeader>
    //                 <CardTitle className="text-white">
    //                     Winner Data (JSON Format) - {selectedBetType !== 'all' ? `${selectedBetType.toUpperCase()} Bets` : 'All Bets'}
    //                 </CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //                 <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-96">
    //                     <pre className="text-green-400 text-sm whitespace-pre-wrap">
    //                         {JSON.stringify(displayData, null, 2)}
    //                     </pre>
    //                 </div>
    //             </CardContent>
    //         </Card>
    //     );
    // };

    const renderWinningCalculationTable = () => {
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
                        <Button variant="outline" onClick={() => setSortOrder('asc')} className="mr-2">
                            Ascending
                        </Button>
                        <Button variant="outline" onClick={() => setSortOrder('desc')} className="mr-2">
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
                                            onClick={() => exportToPDF('single', 'Single')}
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
                                                                onClick={() => exportToPDF(gameType.key, gameType.label)}
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
                                                                    onClick={() => {
                                                                        setSelectedEntry(entry);
                                                                        setShowModal(true);
                                                                    }}
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

    // Detailed Breakdown Modal
    const renderDetailedModal = () => {
        if (!showModal || !selectedEntry) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">📊 Detailed Breakdown</h2>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-400 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Number and Game Type */}
                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="text-lg font-bold text-blue-400 mb-2">{selectedEntry.number}</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-400">Game Type:</span>
                                <span className="text-purple-400 bg-purple-900/20 px-2 py-1 rounded">{selectedEntry.gameType}</span>
                            </div>
                        </div>

                        {/* Financial Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-4 rounded">
                                <h4 className="font-bold text-white mb-2">💰 Financial Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Bet Amount:</span>
                                        <span className="text-green-400 font-bold">₹{selectedEntry.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Winning Rate:</span>
                                        <span className="text-blue-400 font-bold">₹{selectedEntry.rate.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Winning Amount:</span>
                                        <span className="text-yellow-400 font-bold">₹{selectedEntry.winningAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Risk Ratio:</span>
                                        <span className="text-red-400 font-bold">{(selectedEntry.winningAmount / selectedEntry.amount).toFixed(1)}x</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 p-4 rounded">
                                <h4 className="font-bold text-white mb-2">📋 Bet Sources & Calculations</h4>
                                <div className="text-sm space-y-2">
                                    {(() => {
                                        const sources = selectedEntry.betBreakdown.split(' | ');
                                        const totalWin = sources.find((s: string) => s.includes('Total Win'));
                                        const otherSources = sources.filter((s: string) => !s.includes('Total Win'));

                                        return (
                                            <>
                                                {otherSources.map((source: string, index: number) => (
                                                    <div key={index} className="bg-gray-700 p-2 rounded">
                                                        <div className="text-gray-300">• {source}</div>
                                                    </div>
                                                ))}
                                                {totalWin && (
                                                    <div className="bg-yellow-900/20 p-2 rounded border border-yellow-500">
                                                        <div className="text-yellow-400 font-bold text-lg">
                                                            {totalWin}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="bg-gray-800 p-4 rounded">
                            <h4 className="font-bold text-white mb-2">⚠️ Risk Assessment</h4>
                            <div className="space-y-2">
                                <div className={`p-2 rounded ${selectedEntry.winningAmount > 1000000 ? 'bg-red-900/30 border border-red-500' :
                                    selectedEntry.winningAmount > 500000 ? 'bg-orange-900/30 border border-orange-500' :
                                        selectedEntry.winningAmount > 100000 ? 'bg-yellow-900/30 border border-yellow-500' :
                                            'bg-green-900/30 border border-green-500'
                                    }`}>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg">
                                            {selectedEntry.winningAmount > 1000000 ? '🔥' :
                                                selectedEntry.winningAmount > 500000 ? '⚠️' :
                                                    selectedEntry.winningAmount > 100000 ? '⚡' :
                                                        '✅'}
                                        </span>
                                        <span className="font-bold text-white">
                                            {selectedEntry.winningAmount > 1000000 ? 'HIGH RISK - Avoid this number' :
                                                selectedEntry.winningAmount > 500000 ? 'MEDIUM RISK - Consider carefully' :
                                                    selectedEntry.winningAmount > 100000 ? 'LOW RISK - Relatively safe' :
                                                        'SAFE - Good choice'}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-300">
                                    <p><strong>Recommendation:</strong> {
                                        selectedEntry.winningAmount > 1000000 ? 'This number has extremely high winning potential. Consider choosing a different number to minimize risk.' :
                                            selectedEntry.winningAmount > 500000 ? 'This number has significant winning potential. Evaluate if the risk is acceptable.' :
                                                selectedEntry.winningAmount > 100000 ? 'This number has moderate winning potential. Generally acceptable risk level.' :
                                                    'This number has low winning potential. Safe choice for minimizing risk.'
                                    }</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 bg-black min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading winner data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 bg-black min-h-screen">
                <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <Button onClick={() => fetchWinnerData()}>Retry</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="container mx-auto p-4 sm:p-6 space-y-6 bg-black min-h-screen">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Winner Management</h1>
                        <p className="text-gray-400 text-sm sm:text-base">View and analyze winner data with hierarchical filters</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={exportAllToPDF}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            📄 Export All PDF
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                {renderFilters()}

                {/* JSON Data Display */}
                {/* {renderJsonData()} */}

                {/* Winning Calculation Table */}
                {renderWinningCalculationTable()}

                {/* Detailed Breakdown Modal */}
                {renderDetailedModal()}
            </div>
        </AdminLayout>
    );
}
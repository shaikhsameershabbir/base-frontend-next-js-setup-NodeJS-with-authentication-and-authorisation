"use client"

import { useState, useEffect } from 'react';
import { loadApiV2, type LoadV2Response, type HierarchicalUser, type Market } from '@/lib/loadApiV2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/layout/admin-layout';
import { WINNING_RATES, singlePannaNumbers, doublePannaNumbers, triplePannaNumbers } from '@/components/winner/constants';
import { declareResult, getMarketResults, getAllResults, type Result, type DeclareResultRequest } from '@/lib/api-service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import {
    FiltersSection,
    TodayResults,
    BetDetailsModal,
    BetTotals,
    DetailedBetData
} from '@/components/loadv2';

// Types for processed data
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

// Types for totals
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

interface BetDetails {
    number: string;
    betAmount: number;
    gameType: string;
    winAmount: number;
    riskStatus: { status: string; color: string; icon: string };
}

export default function LoadV2Page() {
    const [data, setData] = useState<LoadV2Response | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedBetType, setSelectedBetType] = useState<string>('all');

    // Hierarchical filter states
    const [hierarchicalUsers, setHierarchicalUsers] = useState<Record<string, HierarchicalUser[]>>({});
    const [assignedMarkets, setAssignedMarkets] = useState<Market[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedMarket, setSelectedMarket] = useState<string>('all');
    const [loadingFilters, setLoadingFilters] = useState(false);

    // Cascading selection states
    const [selectedAdmin, setSelectedAdmin] = useState<string>('all');
    const [selectedDistributor, setSelectedDistributor] = useState<string>('all');
    const [selectedAgent, setSelectedAgent] = useState<string>('all');
    const [selectedPlayer, setSelectedPlayer] = useState<string>('all');

    // Status tracking
    const [currentDataUser, setCurrentDataUser] = useState<string>('all');

    // Cutting filter state
    const [cuttingAmount, setCuttingAmount] = useState<string>('');

    // Processed data state
    const [processedData, setProcessedData] = useState<ProcessedBetData | null>(null);
    const [betTotals, setBetTotals] = useState<BetTotals | null>(null);

    // Expanded sections state for detailed bet data
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        singleNumbers: true,
        doubleNumbers: true,
        singlePanna: true,
        doublePanna: true,
        triplePanna: true,
        halfSangamOpen: true,
        halfSangamClose: true,
        fullSangam: true
    });

    // Declare result states
    const [resultType, setResultType] = useState<'open' | 'close'>('open');
    const [resultNumber, setResultNumber] = useState<string>('');
    const [targetDate, setTargetDate] = useState<string>(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    });
    const [declareLoading, setDeclareLoading] = useState(false);

    const [marketResults, setMarketResults] = useState<import('@/lib/api-service').Result | null>(null);
    const [allResults, setAllResults] = useState<import('@/lib/api-service').Result[]>([]);
    const [loadingResults, setLoadingResults] = useState(false);

    // Details modal state
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBetDetails, setSelectedBetDetails] = useState<BetDetails | null>(null);

    useEffect(() => {
        fetchLoadData();
        fetchFilters();
        fetchAllResults();
    }, []);

    // Auto-refresh today's results every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (selectedMarket && selectedMarket !== 'all') {
                fetchMarketResults(selectedMarket);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [selectedMarket]);

    useEffect(() => {
        if (selectedMarket && selectedMarket !== 'all') {
            fetchMarketResults(selectedMarket);
        } else {
            setMarketResults(null);
        }
    }, [selectedMarket]);

    // Auto-switch to open if close is selected but open is not declared
    useEffect(() => {
        if (resultType === 'close' && !canDeclareClose()) {
            setResultType('open');
        }
    }, [marketResults, resultType, targetDate]);

    // Process bet data when data changes
    useEffect(() => {
        if (data) {
            const processed = processBetData(data.data.bets, selectedBetType);
            setProcessedData(processed);

            // Calculate totals
            const totals = calculateBetTotals(processed);
            setBetTotals(totals);
        }
    }, [data, selectedBetType, cuttingAmount]);

    const calculateBetTotals = (processedData: ProcessedBetData): BetTotals => {
        const calculateCategoryTotal = (category: { [key: string]: number }) => {
            const total = Object.values(category).reduce((sum, amount) => sum + amount, 0);
            const count = Object.keys(category).length;
            return { total, count };
        };

        const singleNumbers = calculateCategoryTotal(processedData.singleNumbers);
        const doubleNumbers = calculateCategoryTotal(processedData.doubleNumbers);
        const singlePanna = calculateCategoryTotal(processedData.singlePanna);
        const doublePanna = calculateCategoryTotal(processedData.doublePanna);
        const triplePanna = calculateCategoryTotal(processedData.triplePanna);
        const halfSangamOpen = calculateCategoryTotal(processedData.halfSangamOpen);
        const halfSangamClose = calculateCategoryTotal(processedData.halfSangamClose);
        const fullSangam = calculateCategoryTotal(processedData.fullSangam);

        // Calculate overall totals
        const overallTotal = singleNumbers.total + doubleNumbers.total + singlePanna.total +
            doublePanna.total + triplePanna.total + halfSangamOpen.total +
            halfSangamClose.total + fullSangam.total;
        const overallCount = singleNumbers.count + doubleNumbers.count + singlePanna.count +
            doublePanna.count + triplePanna.count + halfSangamOpen.count +
            halfSangamClose.count + fullSangam.count;

        return {
            singleNumbers,
            doubleNumbers,
            singlePanna,
            doublePanna,
            triplePanna,
            halfSangamOpen,
            halfSangamClose,
            fullSangam,
            overall: { total: overallTotal, count: overallCount }
        };
    };

    const processBetData = (bets: any[], betTypeFilter: string): ProcessedBetData => {
        const result: ProcessedBetData = {
            singleNumbers: {},
            doubleNumbers: {},
            singlePanna: {},
            doublePanna: {},
            triplePanna: {},
            halfSangamOpen: {},
            halfSangamClose: {},
            fullSangam: {}
        };

        bets.forEach(bet => {
            // Filter by betType
            if (betTypeFilter !== 'all') {
                if (betTypeFilter === 'open' && bet.betType !== 'open' && bet.betType !== 'both') {
                    return;
                }
                if (betTypeFilter === 'close' && bet.betType !== 'close' && bet.betType !== 'both') {
                    return;
                }
            }

            const selectedNumbers = bet.selectedNumbers || {};

            Object.entries(selectedNumbers).forEach(([key, amount]) => {
                const numKey = key.toString();
                const numAmount = Number(amount);

                // Single Numbers (0-9)
                if (/^[0-9]$/.test(numKey)) {
                    result.singleNumbers[numKey] = (result.singleNumbers[numKey] || 0) + numAmount;
                }

                // Double Numbers (00-99)
                if (/^[0-9]{2}$/.test(numKey)) {
                    result.doubleNumbers[numKey] = (result.doubleNumbers[numKey] || 0) + numAmount;
                }

                // Single Panna (3 digits, matches singlePannaNumbers)
                if (/^[0-9]{3}$/.test(numKey) && singlePannaNumbers.includes(parseInt(numKey))) {
                    result.singlePanna[numKey] = (result.singlePanna[numKey] || 0) + numAmount;
                }

                // Double Panna (3 digits, matches doublePannaNumbers)
                if (/^[0-9]{3}$/.test(numKey) && doublePannaNumbers.includes(parseInt(numKey))) {
                    result.doublePanna[numKey] = (result.doublePanna[numKey] || 0) + numAmount;
                }

                // Triple Panna (3 digits, matches triplePannaNumbers)
                if (/^[0-9]{3}$/.test(numKey) && triplePannaNumbers.includes(numKey)) {
                    result.triplePanna[numKey] = (result.triplePanna[numKey] || 0) + numAmount;
                }

                // Half Sangam Open (pattern: digitX3digit)
                if (/^[0-9]X[0-9]{3}$/.test(numKey)) {
                    result.halfSangamOpen[numKey] = (result.halfSangamOpen[numKey] || 0) + numAmount;
                }

                // Half Sangam Close (pattern: 3digitXdigit)
                if (/^[0-9]{3}X[0-9]$/.test(numKey)) {
                    result.halfSangamClose[numKey] = (result.halfSangamClose[numKey] || 0) + numAmount;
                }

                // Full Sangam (pattern: 3digitX2digitX3digit)
                if (/^[0-9]{3}X[0-9]{2}X[0-9]{3}$/.test(numKey)) {
                    result.fullSangam[numKey] = (result.fullSangam[numKey] || 0) + numAmount;
                }
            });
        });

        // Apply cutting filter if specified
        if (cuttingAmount && cuttingAmount !== '') {
            const cuttingValue = Number(cuttingAmount);

            // Filter out entries below the cutting amount
            Object.keys(result).forEach(category => {
                const categoryData = result[category as keyof ProcessedBetData] as { [key: string]: number };
                const filteredData: { [key: string]: number } = {};

                Object.entries(categoryData).forEach(([key, amount]) => {
                    if (amount >= cuttingValue) {
                        filteredData[key] = amount;
                    }
                });

                result[category as keyof ProcessedBetData] = filteredData as any;
            });
        }

        return result;
    };

    const fetchFilters = async () => {
        try {
            setLoadingFilters(true);
            const [usersResponse, marketsResponse] = await Promise.all([
                loadApiV2.getHierarchicalUsers(),
                loadApiV2.getAssignedMarkets()
            ]);
            setHierarchicalUsers(usersResponse.data);
            setAssignedMarkets(marketsResponse.data);
        } catch (err: any) {
            console.error('Failed to fetch filters:', err);
        } finally {
            setLoadingFilters(false);
        }
    };

    const fetchLoadData = async (date?: string, userId?: string, marketId?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await loadApiV2.getAllLoads(date, userId, marketId);
            setData(response);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchMarketResults = async (marketId: string) => {
        try {
            setLoadingResults(true);
            const response = await getMarketResults(marketId);
            setMarketResults(response.data);
        } catch (error: any) {
            console.error('Failed to fetch market results:', error);
            toast.error('Failed to fetch market results');
        } finally {
            setLoadingResults(false);
        }
    };

    const fetchAllResults = async () => {
        try {
            setLoadingResults(true);
            const response = await getAllResults();
            setAllResults(response.data);
        } catch (error: any) {
            console.error('Failed to fetch all results:', error);
            toast.error('Failed to fetch all results');
        } finally {
            setLoadingResults(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleDateSubmit = () => {
        if (selectedDate) {
            const userId = selectedUser !== 'all' ? selectedUser : undefined;
            setCurrentDataUser(userId || 'all');
            fetchLoadData(selectedDate, userId, selectedMarket !== 'all' ? selectedMarket : undefined);
        }
    };

    const handleTodayClick = () => {
        setSelectedDate('');
        const userId = selectedUser !== 'all' ? selectedUser : undefined;
        setCurrentDataUser(userId || 'all');
        fetchLoadData(undefined, userId, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleUserChange = (userId: string) => {
        setSelectedUser(userId);
        fetchLoadData(selectedDate || undefined, userId !== 'all' ? userId : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleMarketChange = (marketId: string) => {
        setSelectedMarket(marketId);
        const userId = selectedUser !== 'all' ? selectedUser : undefined;
        setCurrentDataUser(userId || 'all');
        fetchLoadData(selectedDate || undefined, userId, marketId !== 'all' ? marketId : undefined);
    };

    const handleAdminChange = (adminId: string) => {
        setSelectedAdmin(adminId);
        setSelectedDistributor('all');
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setSelectedUser(adminId !== 'all' ? adminId : 'all');
        setCurrentDataUser(adminId !== 'all' ? adminId : 'all');
        fetchLoadData(selectedDate || undefined, adminId !== 'all' ? adminId : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleDistributorChange = (distributorId: string) => {
        setSelectedDistributor(distributorId);
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setSelectedUser(distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchLoadData(selectedDate || undefined, distributorId !== 'all' ? distributorId : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleAgentChange = (agentId: string) => {
        setSelectedAgent(agentId);
        setSelectedPlayer('all');
        setSelectedUser(agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchLoadData(selectedDate || undefined, agentId !== 'all' ? agentId : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handlePlayerChange = (playerId: string) => {
        setSelectedPlayer(playerId);
        setSelectedUser(playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        setCurrentDataUser(playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : 'all');
        fetchLoadData(selectedDate || undefined, playerId !== 'all' ? playerId : selectedAgent !== 'all' ? selectedAgent : selectedDistributor !== 'all' ? selectedDistributor : selectedAdmin !== 'all' ? selectedAdmin : undefined, selectedMarket !== 'all' ? selectedMarket : undefined);
    };

    const handleCuttingAmountChange = (value: string) => {
        setCuttingAmount(value);
    };

    const handleBetTypeChange = (betType: string) => {
        setSelectedBetType(betType);
    };

    const handleDeclareResult = async () => {
        if (!selectedMarket || selectedMarket === 'all' || !resultNumber) {
            toast.error('Please select a specific market and enter a result number');
            return;
        }

        const number = parseInt(resultNumber);
        if (isNaN(number) || number < 100 || number > 999) {
            toast.error('Result number must be a 3-digit panna number (100-999)');
            return;
        }

        // Check if it's a valid panna number (optional validation)
        const validPannaNumbers = [...singlePannaNumbers, ...doublePannaNumbers, ...triplePannaNumbers];
        if (!validPannaNumbers.includes(number)) {
            toast.error('Please enter a valid panna number');
            return;
        }

        try {
            setDeclareLoading(true);

            // Additional validation for close result
            if (resultType === 'close' && marketResults) {
                const dayName = getDayName(new Date(targetDate));
                const dayResult = marketResults.results[dayName as keyof import('@/lib/api-service').WeeklyResult];
                if (!dayResult || !dayResult.open) {
                    toast.error('Open result must be declared before declaring close result');
                    return;
                }
            }

            const requestData: DeclareResultRequest = {
                marketId: selectedMarket,
                resultType,
                resultNumber: number,
                targetDate: targetDate
            };

            const response = await declareResult(requestData);

            if (response.success) {
                toast.success(response.message);
                setResultNumber('');
                // Refresh results
                await fetchMarketResults(selectedMarket);
                await fetchAllResults();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Failed to declare result:', error);
            toast.error(error.response?.data?.message || 'Failed to declare result');
        } finally {
            setDeclareLoading(false);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Not declared';
        return new Date(date).toLocaleString('en-IN');
    };

    // Helper function to get day name from date
    const getDayName = (date: Date): string => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    };

    // Helper function to check if close can be declared for the selected date
    const canDeclareClose = (): boolean => {
        if (!marketResults || !targetDate) return false;

        const dayName = getDayName(new Date(targetDate));
        const dayResult = marketResults.results[dayName as keyof import('@/lib/api-service').WeeklyResult];

        const canDeclare = !!(dayResult && dayResult.open !== null && dayResult.open !== undefined);

        return canDeclare;
    };

    const calculateWinAmount = (betType: string, betAmount: number, number: string): number => {
        switch (betType) {
            case 'singleNumbers':
                return betAmount * WINNING_RATES.single;
            case 'doubleNumbers':
                return betAmount * WINNING_RATES.double;
            case 'singlePanna':
                // Main panna win: betAmount * 150
                const pannaWin = betAmount * WINNING_RATES.singlePanna;
                // Digit sum win: sum of digits * 10 (if that single number has bets)
                const digitSum = number.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                const singleNumberAmount = processedData?.singleNumbers[digitSum.toString()] || 0;
                const digitSumWin = singleNumberAmount * WINNING_RATES.single;
                return pannaWin + digitSumWin;
            case 'doublePanna':
                // Main panna win: betAmount * 300
                const doublePannaWin = betAmount * WINNING_RATES.doublePanna;
                // Digit sum win: sum of digits * 10 (if that single number has bets)
                const digitSum2 = number.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                const singleNumberAmount2 = processedData?.singleNumbers[digitSum2.toString()] || 0;
                const digitSumWin2 = singleNumberAmount2 * WINNING_RATES.single;
                return doublePannaWin + digitSumWin2;
            case 'triplePanna':
                // Main panna win: betAmount * 1000
                const triplePannaWin = betAmount * WINNING_RATES.triplePanna;
                // Digit sum win: sum of digits * 10 (if that single number has bets)
                const digitSum3 = number.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                const singleNumberAmount3 = processedData?.singleNumbers[digitSum3.toString()] || 0;
                const digitSumWin3 = singleNumberAmount3 * WINNING_RATES.single;
                return triplePannaWin + digitSumWin3;
            case 'halfSangamOpen':
            case 'halfSangamClose':
                return betAmount * WINNING_RATES.halfSangam;
            case 'fullSangam':
                return betAmount * WINNING_RATES.fullSangam;
            default:
                return betAmount * WINNING_RATES.single; // default to single rate
        }
    };

    const getRiskStatus = (betAmount: number, winAmount: number): { status: string; color: string; icon: string } => {
        // Simple risk calculation based on bet amount and win amount
        if (betAmount <= 500) {
            return { status: 'SAFE', color: 'text-green-400', icon: '✓' };
        } else if (betAmount <= 1500) {
            return { status: 'LOW RISK', color: 'text-orange-400', icon: '⚡' };
        } else {
            return { status: 'HIGH RISK', color: 'text-red-400', icon: '⚠' };
        }
    };

    const clearFilters = () => {
        setSelectedUser('all');
        setSelectedMarket('all');
        setSelectedDate('');
        setSelectedAdmin('all');
        setSelectedDistributor('all');
        setSelectedAgent('all');
        setSelectedPlayer('all');
        setCuttingAmount(''); // Clear cutting amount
        setSelectedBetType('all'); // Clear bet type filter
        setCurrentDataUser('all');
        setResultNumber(''); // Clear result number
        setResultType('open'); // Reset result type
        setTargetDate(() => {
            const today = new Date();
            return today.toISOString().split('T')[0];
        });
        fetchLoadData();
    };

    const toggleSection = (sectionKey: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    const exportToPDF = (sectionKey: string, data: { [key: string]: number }) => {
        const doc = new jsPDF();

        // Get current date
        const today = new Date();
        const dateString = today.toLocaleDateString('en-IN');

        // Get market name
        const marketName = assignedMarkets.find(market => market._id === selectedMarket)?.marketName || 'All Markets';

        // Get bet type
        const betTypeText = selectedBetType === 'all' ? 'All Bet Types' :
            selectedBetType === 'open' ? 'Open Only' : 'Close Only';

        // Get game type based on section
        const getGameType = (key: string) => {
            switch (key) {
                case 'singleNumbers': return 'Single Numbers';
                case 'doubleNumbers': return 'Double Numbers';
                case 'singlePanna': return 'Single Panna';
                case 'doublePanna': return 'Double Panna';
                case 'triplePanna': return 'Triple Panna';
                case 'halfSangamOpen': return 'Half Sangam Open';
                case 'halfSangamClose': return 'Half Sangam Close';
                case 'fullSangam': return 'Full Sangam';
                default: return 'Unknown';
            }
        };

        const gameType = getGameType(sectionKey);

        // Header information
        doc.setFontSize(16);
        doc.text('Bet Data Report', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Market Name: ${marketName}`, 20, 35);
        doc.text(`Game Type: ${gameType}`, 20, 45);
        doc.text(`Date: ${dateString}`, 20, 55);
        doc.text(`Bet Type: ${betTypeText}`, 20, 65);

        // Calculate and show total amount
        const total = Object.values(data).reduce((sum, amount) => sum + amount, 0);
        doc.text(`Total Amount: Rs. ${total.toLocaleString()}`, 20, 75);

        // Prepare table data with 3 columns per row
        const entries = Object.entries(data);
        const tableData = [];

        for (let i = 0; i < entries.length; i += 3) {
            const row = [];
            for (let j = 0; j < 3; j++) {
                if (i + j < entries.length) {
                    const [number, amount] = entries[i + j];
                    row.push(number, `Rs. ${amount.toLocaleString()}`);
                } else {
                    row.push('', ''); // Empty cells for incomplete rows
                }
            }
            tableData.push(row);
        }

        // Add table with 6 columns (3 pairs of Bet Number and Bet Amount)
        autoTable(doc, {
            head: [['Bet Number', 'Bet Amount', 'Bet Number', 'Bet Amount', 'Bet Number', 'Bet Amount']],
            body: tableData,
            startY: 90,
            styles: {
                fontSize: 8,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
        });

        // Footer
        const finalY = (doc as any).lastAutoTable.finalY || 90;
        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, finalY + 20);
        doc.text(`Total Numbers: ${Object.keys(data).length}`, 20, finalY + 30);

        // Save the PDF
        const fileName = `${marketName}_${gameType}_${dateString.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
    };

    const exportAllToPDF = () => {
        if (!processedData) return;

        const doc = new jsPDF();

        // Get current date
        const today = new Date();
        const dateString = today.toLocaleDateString('en-IN');

        // Get market name
        const marketName = assignedMarkets.find(market => market._id === selectedMarket)?.marketName || 'All Markets';

        // Get bet type
        const betTypeText = selectedBetType === 'all' ? 'All Bet Types' :
            selectedBetType === 'open' ? 'Open Only' : 'Close Only';

        // Header information
        doc.setFontSize(16);
        doc.text('Complete Bet Data Report', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Market Name: ${marketName}`, 20, 35);
        doc.text(`Date: ${dateString}`, 20, 45);
        doc.text(`Bet Type: ${betTypeText}`, 20, 55);

        // Calculate and show total amount for all sections
        const totalAmount = Object.values(processedData).reduce((sum, category) => {
            return sum + Object.values(category as { [key: string]: number }).reduce((catSum, amount) => catSum + amount, 0);
        }, 0);
        doc.text(`Total Amount: Rs. ${totalAmount.toLocaleString()}`, 20, 65);

        let currentY = 80;

        // Export each section
        const sections = [
            { key: 'singleNumbers', title: 'Single Numbers' },
            { key: 'doubleNumbers', title: 'Double Numbers' },
            { key: 'singlePanna', title: 'Single Panna' },
            { key: 'doublePanna', title: 'Double Panna' },
            { key: 'triplePanna', title: 'Triple Panna' },
            { key: 'halfSangamOpen', title: 'Half Sangam Open' },
            { key: 'halfSangamClose', title: 'Half Sangam Close' },
            { key: 'fullSangam', title: 'Full Sangam' }
        ];

        sections.forEach((section, index) => {
            const data = processedData[section.key as keyof ProcessedBetData] as { [key: string]: number };
            const total = Object.values(data).reduce((sum, amount) => sum + amount, 0);

            // Section header
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${section.title} - Total: Rs. ${total.toLocaleString()}`, 20, currentY);
            currentY += 10;

            // Prepare table data with 3 columns per row
            const entries = Object.entries(data);
            const tableData = [];

            for (let i = 0; i < entries.length; i += 3) {
                const row = [];
                for (let j = 0; j < 3; j++) {
                    if (i + j < entries.length) {
                        const [number, amount] = entries[i + j];
                        row.push(number, `Rs. ${amount.toLocaleString()}`);
                    } else {
                        row.push('', ''); // Empty cells for incomplete rows
                    }
                }
                tableData.push(row);
            }

            // Add table with 6 columns (3 pairs of Bet Number and Bet Amount)
            autoTable(doc, {
                head: [['Bet Number', 'Bet Amount', 'Bet Number', 'Bet Amount', 'Bet Number', 'Bet Amount']],
                body: tableData,
                startY: currentY,
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
            });

            currentY = (doc as any).lastAutoTable.finalY + 15;

            // Add page break if needed
            if (currentY > 250 && index < sections.length - 1) {
                doc.addPage();
                currentY = 20;
            }
        });

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, currentY + 10);
        doc.text(`Total Numbers: ${Object.keys(processedData).reduce((sum, key) => sum + Object.keys(processedData[key as keyof ProcessedBetData] as any).length, 0)}`, 20, currentY + 20);

        // Save the PDF
        const fileName = `${marketName}_Complete_Report_${dateString.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
    };

    const handleShowBetDetails = (details: BetDetails) => {
        setSelectedBetDetails(details);
        setShowDetailsModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedBetDetails(null);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 bg-black min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading load data...</p>
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
                            <Button onClick={() => fetchLoadData()}>Retry</Button>
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Load </h1>
                    </div>
                </div>

                {/* Filters Section */}
                <FiltersSection
                    selectedDate={selectedDate}
                    selectedBetType={selectedBetType}
                    selectedUser={selectedUser}
                    selectedMarket={selectedMarket}
                    selectedAdmin={selectedAdmin}
                    selectedDistributor={selectedDistributor}
                    selectedAgent={selectedAgent}
                    selectedPlayer={selectedPlayer}
                    cuttingAmount={cuttingAmount}
                    currentDataUser={currentDataUser}
                    hierarchicalUsers={hierarchicalUsers}
                    assignedMarkets={assignedMarkets}
                    resultType={resultType}
                    resultNumber={resultNumber}
                    targetDate={targetDate}
                    declareLoading={declareLoading}
                    marketResults={marketResults}
                    processedData={processedData}
                    onDateChange={handleDateChange}
                    onDateSubmit={handleDateSubmit}
                    onTodayClick={handleTodayClick}
                    onMarketChange={handleMarketChange}
                    onBetTypeChange={handleBetTypeChange}
                    onCuttingAmountChange={handleCuttingAmountChange}
                    onAdminChange={handleAdminChange}
                    onDistributorChange={handleDistributorChange}
                    onAgentChange={handleAgentChange}
                    onPlayerChange={handlePlayerChange}
                    onClearFilters={clearFilters}
                    onResultTypeChange={setResultType}
                    onResultNumberChange={setResultNumber}
                    onTargetDateChange={setTargetDate}
                    onDeclareResult={handleDeclareResult}
                    canDeclareClose={canDeclareClose}
                    getDayName={getDayName}
                    calculateWinAmount={calculateWinAmount}
                />

                {/* Today's Results */}
                <TodayResults
                    marketResults={marketResults}
                    selectedMarket={selectedMarket}
                    assignedMarkets={assignedMarkets}
                    getDayName={getDayName}
                    formatDate={formatDate}
                />

                {/* Bet Totals */}
                <BetTotals
                    betTotals={betTotals}
                    cuttingAmount={cuttingAmount}
                    onExportAllPDF={exportAllToPDF}
                />

                {/* Detailed Bet Data */}
                <DetailedBetData
                    processedData={processedData}
                    selectedBetType={selectedBetType}
                    cuttingAmount={cuttingAmount}
                    expandedSections={expandedSections}
                    onToggleSection={toggleSection}
                    onExportPDF={exportToPDF}
                    onShowBetDetails={handleShowBetDetails}
                    calculateWinAmount={calculateWinAmount}
                    getRiskStatus={getRiskStatus}
                />

                {/* Bet Details Modal */}
                <BetDetailsModal
                    showModal={showDetailsModal}
                    betDetails={selectedBetDetails}
                    processedData={processedData}
                    onClose={handleCloseModal}
                    calculateWinAmount={calculateWinAmount}
                />

                {/* Results History */}


                {/* JSON Data Display
                {data && (
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white">Raw JSON Data</CardTitle>
                            <div className="text-sm text-gray-400">
                                Total Bets: {data.data.summary.totalBets} |
                                Total Amount: ₹{data.data.summary.totalAmount.toLocaleString()} |
                                Unique Users: {data.data.summary.uniqueUsers} |
                                Unique Markets: {data.data.summary.uniqueMarkets}
                                {cuttingAmount && ` | Cutting Amount: ₹${parseInt(cuttingAmount).toLocaleString()}`}
                            </div>
                            {data.data.filters.hierarchicalFilter && (
                                <div className="text-sm text-blue-400 mt-2 p-2 bg-blue-900/20 rounded border border-blue-700">
                                    <strong>Hierarchical Filter Applied:</strong>
                                    <br />• Current User: {data.data.filters.hierarchicalFilter.currentUser} ({data.data.filters.hierarchicalFilter.currentUserRole})
                                    <br />• Users in Hierarchy: {data.data.filters.hierarchicalFilter.targetUserIds}
                                    <br />• Showing only bets from your hierarchy
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-96">
                                <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )} */}

                {!data && !loading && (
                    <Card className="bg-gray-900 border-gray-700">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-gray-400">No data available. Use filters to load data.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
} 
"use client"

import { useState, useEffect } from 'react';
import { loadApiV2, type LoadV2Response, type HierarchicalUser, type Market } from '@/lib/loadApiV2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/layout/admin-layout';
import { singlePannaNumbers, doublePannaNumbers, triplePannaNumbers, jodiNumbers, doubleNumbers } from '@/components/winner/constants';
import { declareResult, getMarketResults, getAllResults, type Result, type DeclareResultRequest } from '@/lib/api-service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

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
    const [declareLoading, setDeclareLoading] = useState(false);
    const [marketResults, setMarketResults] = useState<Result | null>(null);
    const [allResults, setAllResults] = useState<Result[]>([]);
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        fetchLoadData();
        fetchFilters();
        fetchAllResults();
    }, []);

    useEffect(() => {
        if (selectedMarket && selectedMarket !== 'all') {
            fetchMarketResults(selectedMarket);
        } else {
            setMarketResults(null);
        }
    }, [selectedMarket]);

    // Auto-switch to open if close is selected but open is not declared
    useEffect(() => {
        if (resultType === 'close' && marketResults && !marketResults.open) {
            setResultType('open');
        }
    }, [marketResults, resultType]);

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

                // Full Sangam (pattern: 3digit-2digit-3digit, no X)
                if (/^[0-9]{3}-[0-9]{2}-[0-9]{3}$/.test(numKey)) {
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
            if (resultType === 'close' && marketResults && !marketResults.open) {
                toast.error('Open result must be declared before declaring close result');
                return;
            }

            const requestData: DeclareResultRequest = {
                marketId: selectedMarket,
                resultType,
                resultNumber: number
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

    const getResultStatus = (result: Result | null, type: 'open' | 'close') => {
        if (!result) return { declared: false, number: null, time: null };

        if (type === 'open') {
            return {
                declared: result.open !== null,
                number: result.open,
                time: result.openDeclationTime
            };
        } else {
            return {
                declared: result.close !== null,
                number: result.close,
                time: result.closeDeclationTime
            };
        }
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
        fetchLoadData();
    };

    const renderFilters = () => {
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
                                onChange={(e) => handleCuttingAmountChange(e.target.value)}
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

                    {/* Declare Result Section */}
                    <div className="mt-6 border-t border-gray-700 pt-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white mb-2">🎯 Declare Result</h3>
                            <p className="text-sm text-gray-400">
                                Declare open or close results for the selected market using 3-digit panna numbers.
                                Main result is automatically calculated (sum of digits).
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Result Type Selection */}
                            <div className="space-y-3">
                                <Label className="text-gray-300 font-medium">Result Type</Label>
                                <Select value={resultType} onValueChange={(value: 'open' | 'close') => setResultType(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open Result</SelectItem>
                                        <SelectItem
                                            value="close"
                                            disabled={!marketResults || !marketResults.open}
                                        >
                                            Close Result {(!marketResults || !marketResults.open) && '(Open Required)'}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {(!marketResults || !marketResults.open) && resultType === 'close' && (
                                    <div className="text-xs text-orange-400">
                                        ⚠️ Open result must be declared first
                                    </div>
                                )}
                            </div>

                            {/* Result Number Input */}
                            <div className="space-y-3">
                                <Label className="text-gray-300 font-medium">Result Number</Label>
                                <Input
                                    type="number"
                                    min="100"
                                    max="999"
                                    placeholder="100-999"
                                    value={resultNumber}
                                    onChange={(e) => setResultNumber(e.target.value)}
                                    className="text-center text-lg font-bold"
                                />
                                <div className="text-xs text-gray-400">
                                    Enter a 3-digit panna number (e.g., 123, 355, 778)
                                </div>
                                {resultNumber && resultNumber.length === 3 && (
                                    <div className="text-xs text-blue-400">
                                        Main will be: {(() => {
                                            const digits = resultNumber.split('').map(d => parseInt(d));
                                            const sum = digits.reduce((a, b) => a + b, 0);
                                            return sum > 9 ? sum % 10 : sum;
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="space-y-3">
                                <Label className="text-gray-300 font-medium">&nbsp;</Label>
                                <Button
                                    onClick={handleDeclareResult}
                                    disabled={
                                        declareLoading ||
                                        selectedMarket === 'all' ||
                                        !resultNumber ||
                                        (resultType === 'close' && (!marketResults || !marketResults.open))
                                    }
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {declareLoading ? 'Declaring...' : `Declare ${resultType.charAt(0).toUpperCase() + resultType.slice(1)}`}
                                </Button>
                            </div>

                            {/* Current Market Status */}
                            <div className="space-y-3">
                                <Label className="text-gray-300 font-medium">Market Status</Label>
                                <div className="text-sm text-gray-400">
                                    {selectedMarket === 'all' ? (
                                        <span className="text-orange-400">Select a specific market</span>
                                    ) : (
                                        <span className="text-green-400">
                                            {assignedMarkets.find(m => m._id === selectedMarket)?.marketName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Current Results Display */}
                        {selectedMarket && selectedMarket !== 'all' && marketResults && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(() => {
                                    const openStatus = getResultStatus(marketResults, 'open');
                                    const closeStatus = getResultStatus(marketResults, 'close');

                                    return (
                                        <>
                                            <div className="bg-gray-800 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-300">Open Result</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${openStatus.declared
                                                        ? 'bg-green-900 text-green-400'
                                                        : 'bg-gray-700 text-gray-400'
                                                        }`}>
                                                        {openStatus.declared ? 'DECLARED' : 'NOT DECLARED'}
                                                    </span>
                                                </div>
                                                {openStatus.declared && (
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-400">{openStatus.number}</div>
                                                        <div className="text-xs text-gray-400">{formatDate(openStatus.time)}</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-gray-800 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-300">Close Result</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${closeStatus.declared
                                                        ? 'bg-green-900 text-green-400'
                                                        : 'bg-gray-700 text-gray-400'
                                                        }`}>
                                                        {closeStatus.declared ? 'DECLARED' : 'NOT DECLARED'}
                                                    </span>
                                                </div>
                                                {closeStatus.declared && (
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-400">{closeStatus.number}</div>
                                                        <div className="text-xs text-gray-400">{formatDate(closeStatus.time)}</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-gray-800 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-300">Main Result</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${marketResults.main !== null
                                                        ? 'bg-yellow-900 text-yellow-400'
                                                        : 'bg-gray-700 text-gray-400'
                                                        }`}>
                                                        {marketResults.main !== null ? 'CALCULATED' : 'NOT CALCULATED'}
                                                    </span>
                                                </div>
                                                {marketResults.main !== null && (
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-yellow-400">{marketResults.main}</div>
                                                        <div className="text-xs text-gray-400">Combined Result</div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
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

    const renderProcessedData = () => {
        if (!processedData) return null;

        return (
            <Card className="mb-6 bg-gray-900 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Processed Bet Data (JSON)</CardTitle>
                    <div className="text-sm text-gray-400">
                        Filtered by: {selectedBetType === 'all' ? 'All Bet Types' : selectedBetType === 'open' ? 'Open Only' : 'Close Only'}
                        {cuttingAmount && cuttingAmount !== '' && ` | Cutting Amount: ₹${parseInt(cuttingAmount).toLocaleString()}+`}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-96">
                        <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                            {JSON.stringify(processedData, null, 2)}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderBetTotals = () => {
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
                            onClick={exportAllToPDF}
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
    };

    const renderDetailedBetData = () => {
        if (!processedData) return null;

        const toggleSection = (sectionKey: string) => {
            setExpandedSections(prev => ({
                ...prev,
                [sectionKey]: !prev[sectionKey]
            }));
        };

        const calculateWinAmount = (betType: string, betAmount: number, number: string): number => {
            const rates = {
                single: 9,
                double: 90,
                singlePanna: 150,
                doublePanna: 300,
                triplePanna: 1000,
                halfSangam: 1000,
                fullSangam: 10000
            };

            let baseWin = 0;

            switch (betType) {
                case 'singleNumbers':
                    return betAmount * rates.single;
                case 'doubleNumbers':
                    return betAmount * rates.double;
                case 'singlePanna':
                    baseWin = betAmount * rates.singlePanna;
                    // Add single number win based on digit sum
                    const digitSum = number.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                    const singleNumberAmount = processedData?.singleNumbers[digitSum.toString()] || 0;
                    const singleWin = singleNumberAmount * rates.single;
                    return baseWin + singleWin;
                case 'doublePanna':
                    baseWin = betAmount * rates.doublePanna;
                    // Add single number win based on digit sum
                    const digitSum2 = number.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                    const singleNumberAmount2 = processedData?.singleNumbers[digitSum2.toString()] || 0;
                    const singleWin2 = singleNumberAmount2 * rates.single;
                    return baseWin + singleWin2;
                case 'triplePanna':
                    baseWin = betAmount * rates.triplePanna;
                    // Add single number win based on digit sum
                    const digitSum3 = number.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
                    const singleNumberAmount3 = processedData?.singleNumbers[digitSum3.toString()] || 0;
                    const singleWin3 = singleNumberAmount3 * rates.single;
                    return baseWin + singleWin3;
                case 'halfSangamOpen':
                case 'halfSangamClose':
                    return betAmount * rates.halfSangam;
                case 'fullSangam':
                    return betAmount * rates.fullSangam;
                default:
                    return betAmount * 9; // default to single rate
            }
        };

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
                                onClick={() => toggleSection(sectionKey)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                {expandedSections[sectionKey] ? 'Collapse' : 'Expand'}
                            </Button>
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => exportToPDF(sectionKey, data)}
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Load V2 - JSON View</h1>
                        <p className="text-gray-400 text-sm sm:text-base">View raw load data in JSON format with filters</p>
                    </div>
                </div>

                {/* Filters */}
                {renderFilters()}

                {/* Processed Data Display */}
                {processedData && renderProcessedData()}

                {/* Bet Totals Display */}
                {betTotals && renderBetTotals()}

                {/* Detailed Bet Data Display */}
                {processedData && renderDetailedBetData()}

                {/* Results History */}
                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">All Results History</CardTitle>
                        <div className="text-sm text-gray-400">
                            Recent result declarations across all markets
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingResults ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : allResults.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-600">
                                    <thead>
                                        <tr className="bg-gray-800">
                                            <th className="border border-gray-600 p-3 text-left text-white">Market</th>
                                            <th className="border border-gray-600 p-3 text-center text-white">Open</th>
                                            <th className="border border-gray-600 p-3 text-center text-white">Close</th>
                                            <th className="border border-gray-600 p-3 text-center text-white">Main</th>
                                            <th className="border border-gray-600 p-3 text-center text-white">Total Win</th>
                                            <th className="border border-gray-600 p-3 text-center text-white">Declared By</th>
                                            <th className="border border-gray-600 p-3 text-center text-white">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allResults.map((result) => (
                                            <tr key={result._id} className="border border-gray-600 hover:bg-gray-800">
                                                <td className="border border-gray-600 p-3 text-white">
                                                    {result.marketId.marketName}
                                                </td>
                                                <td className="border border-gray-600 p-3 text-center">
                                                    {result.open !== null ? (
                                                        <span className="text-green-400 font-bold">{result.open}</span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="border border-gray-600 p-3 text-center">
                                                    {result.close !== null ? (
                                                        <span className="text-blue-400 font-bold">{result.close}</span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="border border-gray-600 p-3 text-center">
                                                    {result.main !== null ? (
                                                        <span className="text-yellow-400 font-bold">{result.main}</span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="border border-gray-600 p-3 text-center text-yellow-400 font-bold">
                                                    {result.totalWin}
                                                </td>
                                                <td className="border border-gray-600 p-3 text-center text-gray-300">
                                                    {result.declaredBy.username}
                                                </td>
                                                <td className="border border-gray-600 p-3 text-center text-gray-300">
                                                    {new Date(result.createdAt).toLocaleDateString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                No results declared yet
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* JSON Data Display */}
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
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-96">
                                <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
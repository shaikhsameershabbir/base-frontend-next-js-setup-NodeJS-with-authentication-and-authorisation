git  client"

import { useState, useEffect } from 'react';
import { winnerApi, type WinnerResponse, type WinnerData, type CompleteTotals, type HierarchicalUser, type Market } from '@/lib/winnerApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/layout/admin-layout';
import {
    WinnerFilters,
    DetailedModal,
    WinningCalculationTable,
    TotalBetAmount,
    JsonDataViewer,
    exportToPDF,
    exportAllToPDF,
    PDFExportData
} from '@/components/winner';

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

    const handleCuttingAmountChange = (value: string) => {
        setCuttingAmount(value);
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

    const handleExportPDF = (gameType: string, gameTypeLabel: string) => {
        const exportData: PDFExportData = {
            data,
            selectedDate,
            selectedBetType,
            selectedMarket,
            assignedMarkets,
            cuttingAmount
        };
        exportToPDF(gameType, gameTypeLabel, exportData);
    };

    const handleExportAllPDF = () => {
        const exportData: PDFExportData = {
            data,
            selectedDate,
            selectedBetType,
            selectedMarket,
            assignedMarkets,
            cuttingAmount
        };
        exportAllToPDF(exportData);
    };

    const handleShowModal = (entry: any) => {
        setSelectedEntry(entry);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEntry(null);
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
                            onClick={handleExportAllPDF}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            📄 Export All PDF
                        </Button>
                    </div>
                </div>

                {/* JSON Data Viewer */}
                <JsonDataViewer data={data} />

                {/* Total Bet Amount Summary */}
                <TotalBetAmount
                    data={data}
                    selectedBetType={selectedBetType}
                    cuttingAmount={cuttingAmount}
                />

                {/* Filters */}
                <WinnerFilters
                    selectedDate={selectedDate}
                    selectedGameType={selectedGameType}
                    selectedBetType={selectedBetType}
                    hierarchicalUsers={hierarchicalUsers}
                    assignedMarkets={assignedMarkets}
                    selectedUser={selectedUser}
                    selectedMarket={selectedMarket}
                    selectedUserRole={selectedUserRole}
                    loadingFilters={loadingFilters}
                    currentDataUser={currentDataUser}
                    selectedAdmin={selectedAdmin}
                    selectedDistributor={selectedDistributor}
                    selectedAgent={selectedAgent}
                    selectedPlayer={selectedPlayer}
                    cuttingAmount={cuttingAmount}
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
                />

                {/* Winning Calculation Table */}
                <WinningCalculationTable
                    data={data}
                    selectedBetType={selectedBetType}
                    cuttingAmount={cuttingAmount}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    onExportPDF={handleExportPDF}
                    onShowModal={handleShowModal}
                />

                {/* Detailed Breakdown Modal */}
                <DetailedModal
                    showModal={showModal}
                    selectedEntry={selectedEntry}
                    onClose={handleCloseModal}
                />
            </div>
        </AdminLayout>
    );
}
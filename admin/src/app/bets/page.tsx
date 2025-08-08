"use client"

import React from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button } from '@/components/ui/button';
import { BetDetailModal } from '@/components/modals/BetDetailModal';
import { BetsSummary, BetsFilters, BetsTable, ErrorDisplay } from '@/components/bets';
import { useBetsManagement } from '@/hooks/useBetsManagement';
import { RefreshCw } from 'lucide-react';

export default function BetsPage() {
    const {
        bets,
        loading,
        error,
        summary,
        pagination,
        filters,
        hierarchyOptions,
        currentUserRole,
        selectedBetId,
        isDetailModalOpen,
        handleFilterChange,
        handleHierarchyChange,
        handlePageChange,
        handleViewBet,
        handleCloseModal,
        clearError,
        getBets
    } = useBetsManagement();



    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Bets Management</h1>
                        <p className="text-secondary">View and manage all bets with hierarchical filtering</p>
                    </div>
                    <Button onClick={getBets} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Summary Cards */}
                <BetsSummary summary={summary} />

                {/* Filters */}
                <BetsFilters
                    filters={filters}
                    currentUserRole={currentUserRole}
                    hierarchyOptions={hierarchyOptions}
                    onFilterChange={handleFilterChange}
                    onHierarchyChange={handleHierarchyChange}
                />

                {/* Error Display */}
                <ErrorDisplay error={error} onClearError={clearError} />

                {/* Bets Table */}
                <BetsTable
                    bets={bets}
                    loading={loading}
                    pagination={pagination}
                    onViewBet={handleViewBet}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Bet Detail Modal */}
            <BetDetailModal
                betId={selectedBetId}
                isOpen={isDetailModalOpen}
                onClose={handleCloseModal}
            />
        </AdminLayout>
    );
}
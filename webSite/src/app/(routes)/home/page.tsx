'use client';

import BottomNav from "@/app/components/BottomNav";
import SimpleMarketGrid from "@/app/components/SimpleMarketGrid";
import Message from "@/app/components/Message";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketData } from "@/contexts/MarketDataContext";
import MessageSection from "@/app/components/Message";

// Memoized loading component to prevent re-renders
const LoadingState = React.memo(() => (
    <div className="flex justify-center items-center h-full">
        <div className="text-lg text-primary">Loading markets...</div>
    </div>
));

LoadingState.displayName = 'LoadingState';

// Memoized error component
const ErrorState = React.memo(({ error }: { error: string }) => (
    <div className="flex justify-center items-center h-full">
        <div className="text-lg text-red-500">{error}</div>
    </div>
));

ErrorState.displayName = 'ErrorState';

// Memoized empty state component
const EmptyState = React.memo(() => (
    <div className="flex justify-center items-center h-full">
        <div className="text-lg text-muted">No markets assigned to you</div>
    </div>
));

EmptyState.displayName = 'EmptyState';

export default function Home() {
    const { markets, marketResults, loading, error, fetchData } = useMarketData();
    const [isHydrated, setIsHydrated] = useState(false);

    // Handle hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Note: Data fetching is handled by MarketDataContext
    // No need for additional event listeners here to prevent multiple reloads

    // Sort markets by rank - memoized to prevent unnecessary re-sorting
    const sortedMarkets = useMemo(() => {
        return [...markets].sort((a, b) => {
            if (a.rank === undefined && b.rank === undefined) return 0;
            if (a.rank === undefined) return 1;
            if (b.rank === undefined) return -1;
            return a.rank - b.rank;
        });
    }, [markets]);

    // Refresh handler - memoized to prevent unnecessary re-renders
    const handleRefresh = useCallback(() => {
        // Manual refresh triggered
        fetchData();
    }, [fetchData]);

    // Memoized content renderer to prevent unnecessary re-renders
    const renderContent = useMemo(() => {
        if (!isHydrated) {
            return (
                <div className="flex justify-center items-center h-full">
                    <div className="text-lg text-primary">Initializing...</div>
                </div>
            );
        }

        if (loading) {
            return <LoadingState />;
        }

        if (error) {
            return <ErrorState error={error} />;
        }

        if (markets.length === 0) {
            return <EmptyState />;
        }

        return (
            <SimpleMarketGrid
                markets={sortedMarkets}
                marketResults={marketResults}
            />
        );
    }, [isHydrated, loading, error, markets.length, sortedMarkets, marketResults]);

    return (
        <main className="h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="flex px-4 py-2 bg-white items-center relative min-h-[56px] flex-shrink-0">

                <div className="absolute right-4">
                    <Button
                        onClick={handleRefresh}
                        variant="default"
                        className="rounded-full"
                        size="icon"
                        aria-label="Refresh Markets"
                    >
                        <RefreshCcw className="text-primary" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pb-20">
                {renderContent}
            </div>

            {/* Footer */}
            <BottomNav />
        </main>
    );
}

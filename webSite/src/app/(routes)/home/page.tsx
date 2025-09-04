'use client';

import BottomNav from "@/app/components/BottomNav";
import MarketCard from "@/app/components/MarketCard";
import VirtualizedMarketGrid from "@/app/components/VirtualizedMarketGrid";
import Message from "@/app/components/Message";
import React, { useMemo, useCallback } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketData } from "@/contexts/MarketDataContext";

interface Market {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
    isGolden?: boolean;
    rank?: number;
    weekDays?: number;
    isAssigned: boolean;
    assignmentId: string;
}

interface MarketResult {
    _id: string;
    marketId: string;
    weekStartDate: string;
    weekEndDate: string;
    weekDays: number;
    results: {
        [key: string]: {
            open: string | null;
            main: string | null;
            close: string | null;
            openDeclationTime: string | null;
            closeDeclationTime: string | null;
        };
    };
}

const HomeContent = React.memo(() => {
    const { markets, marketResults, loading, error, fetchData } = useMarketData();

    // Memoize sorted markets to prevent unnecessary re-sorting
    const sortedMarkets = useMemo(() => {
        return [...markets].sort((a, b) => {
            // Sort by rank (null ranks go to the end)
            if (a.rank === undefined && b.rank === undefined) return 0;
            if (a.rank === undefined) return 1;
            if (b.rank === undefined) return -1;
            return a.rank - b.rank;
        });
    }, [markets]);

    // Memoize the refresh handler
    const handleRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Determine if we should use virtualization (for 40+ markets)
    const shouldUseVirtualization = sortedMarkets.length >= 40;

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="pt-16">
                <div className="flex px-4 mb-2 bg-white items-center relative min-h-[56px]">
                    <div className="flex-1 flex justify-center items-center">
                        <Message />
                    </div>
                    <div className="absolute right-4">
                        <Button onClick={handleRefresh} variant="default" className="rounded-full" size="icon" aria-label="Refresh Markets">
                            <RefreshCcw className="text-primary" />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-primary">Loading markets...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-red-500">{error}</div>
                    </div>
                ) : markets.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-muted">No markets assigned to you</div>
                    </div>
                ) : shouldUseVirtualization ? (
                    <div className="pt-4 pb-20">
                        <VirtualizedMarketGrid
                            markets={sortedMarkets}
                            marketResults={marketResults}
                            itemsPerRow={3}
                            itemHeight={200}
                            containerHeight={600}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-4 pb-20">
                        {sortedMarkets.map((market) => {
                            const marketResult = marketResults[market._id];

                            return (
                                <MarketCard
                                    key={market._id}
                                    market={market}
                                    marketResult={marketResult}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            <BottomNav />
        </main>
    );
});

HomeContent.displayName = 'HomeContent';

export default function Home() {
    return <HomeContent />;
}

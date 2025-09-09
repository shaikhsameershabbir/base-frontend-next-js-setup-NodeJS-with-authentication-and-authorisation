'use client';

import BottomNav from "@/app/components/BottomNav";
import SimpleMarketGrid from "@/app/components/SimpleMarketGrid";
import Message from "@/app/components/Message";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketData } from "@/contexts/MarketDataContext";




const HomeContent = React.memo(() => {
    const { markets, marketResults, loading, error, fetchData } = useMarketData();
    const [isHydrated, setIsHydrated] = useState(false);

    // Handle hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Sort markets by rank
    const sortedMarkets = useMemo(() => {
        return [...markets].sort((a, b) => {
            if (a.rank === undefined && b.rank === undefined) return 0;
            if (a.rank === undefined) return 1;
            if (b.rank === undefined) return -1;
            return a.rank - b.rank;
        });
    }, [markets]);

    // Refresh handler
    const handleRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);
    return (
        <main className="h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="flex px-4 py-2 bg-white items-center relative min-h-[56px] flex-shrink-0">
                <div className="flex-1 flex justify-center items-center">
                    <Message />
                </div>
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
                {!isHydrated ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-lg text-primary">Initializing...</div>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-lg text-primary">Loading markets...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-lg text-red-500">{error}</div>
                    </div>
                ) : markets.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-lg text-muted">No markets assigned to you</div>
                    </div>
                ) : (
                    <SimpleMarketGrid
                        markets={sortedMarkets}
                        marketResults={marketResults}
                    />
                )}
            </div>

            {/* Footer */}
            <BottomNav />
        </main>
    );
});

HomeContent.displayName = 'HomeContent';

export default function Home() {
    return <HomeContent />;
}

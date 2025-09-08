'use client';

import React, { useState, useEffect, useMemo } from 'react';
import MarketCard from './MarketCard';

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
    resultDate: string;
    results: {
        open: string | null;
        main: string | null;
        close: string | null;
        openDeclationTime: string | null;
        closeDeclationTime: string | null;
    };
}

interface SimpleMarketGridProps {
    markets: Market[];
    marketResults: Record<string, MarketResult>;
}

const SimpleMarketGrid: React.FC<SimpleMarketGridProps> = ({
    markets,
    marketResults
}) => {
    const [visibleCount, setVisibleCount] = useState(0);
    const [isRendering, setIsRendering] = useState(false);

    // Determine if we need progressive rendering
    const needsProgressiveRendering = markets.length > 50;
    const batchSize = 20; // Render 20 markets at a time
    const delayBetweenBatches = 16; // 60fps

    // Reset when markets change
    useEffect(() => {
        if (needsProgressiveRendering) {
            setVisibleCount(0);
            setIsRendering(true);

            // Start with first batch immediately
            setVisibleCount(Math.min(batchSize, markets.length));
        } else {
            // For small datasets, show all immediately
            setVisibleCount(markets.length);
            setIsRendering(false);
        }
    }, [markets, needsProgressiveRendering, batchSize]);

    // Progressive rendering for large datasets
    useEffect(() => {
        if (!isRendering || visibleCount >= markets.length) {
            setIsRendering(false);
            return;
        }

        const timer = setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + batchSize, markets.length));
        }, delayBetweenBatches);

        return () => clearTimeout(timer);
    }, [isRendering, visibleCount, markets.length, batchSize, delayBetweenBatches]);

    // Get markets to render
    const visibleMarkets = useMemo(() => {
        return markets.slice(0, visibleCount);
    }, [markets, visibleCount]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-4">
            {visibleMarkets.map((market) => {
                const marketResult = marketResults[market._id];
                return (
                    <MarketCard
                        key={market._id}
                        market={market}
                        marketResult={marketResult}
                    />
                );
            })}

            {/* Loading indicator for large datasets */}
            {isRendering && visibleCount < markets.length && (
                <div className="col-span-full flex justify-center items-center py-8">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-sm">
                            Loading markets... ({visibleCount}/{markets.length})
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleMarketGrid;

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

interface BatchMarketGridProps {
    markets: Market[];
    marketResults: Record<string, MarketResult>;
    batchSize?: number;
    delayBetweenBatches?: number;
    className?: string;
}

const BatchMarketGrid: React.FC<BatchMarketGridProps> = ({
    markets,
    marketResults,
    batchSize = 12, // Default to 12 markets per batch (4 rows of 3)
    delayBetweenBatches = 16, // 16ms delay between batches (60fps)
    className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-4 pb-20 scrollbar-hide"
}) => {
    const [visibleCount, setVisibleCount] = useState(0);
    const [isRendering, setIsRendering] = useState(false);

    // Reset visible count when markets change
    useEffect(() => {
        setVisibleCount(0);
        setIsRendering(markets.length > 0);

        // Start rendering immediately if we have markets
        if (markets.length > 0) {
            // Use a small delay to ensure the component is mounted
            const timer = setTimeout(() => {
                setVisibleCount(Math.min(batchSize, markets.length));
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [markets, batchSize]);

    // Progressive rendering effect using requestAnimationFrame for smoother rendering
    useEffect(() => {
        if (!isRendering || visibleCount >= markets.length) {
            setIsRendering(false);
            return;
        }

        const renderNextBatch = () => {
            const nextBatchSize = Math.min(batchSize, markets.length - visibleCount);
            setVisibleCount(prev => prev + nextBatchSize);
        };

        // Use requestAnimationFrame for smoother rendering
        const rafId = requestAnimationFrame(() => {
            const timer = setTimeout(renderNextBatch, delayBetweenBatches);
            return () => clearTimeout(timer);
        });

        return () => {
            cancelAnimationFrame(rafId);
        };
    }, [isRendering, visibleCount, markets.length, batchSize, delayBetweenBatches]);

    // Show all markets immediately if the count is small
    useEffect(() => {
        if (markets.length <= batchSize && markets.length > 0) {
            setVisibleCount(markets.length);
            setIsRendering(false);
        }
    }, [markets.length, batchSize]);

    // Get markets to render
    const visibleMarkets = useMemo(() => {
        return markets.slice(0, visibleCount);
    }, [markets, visibleCount]);

    // Check if we're still rendering
    const isStillRendering = isRendering && visibleCount < markets.length;

    return (
        <div className={className}>
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

            {/* Loading indicator for remaining markets */}
            {isStillRendering && (
                <div className="col-span-full flex justify-center items-center py-4">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">
                            Loading markets... ({visibleCount}/{markets.length})
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchMarketGrid;

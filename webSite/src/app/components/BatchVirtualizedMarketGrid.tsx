'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
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

interface BatchVirtualizedMarketGridProps {
    markets: Market[];
    marketResults: Record<string, MarketResult>;
    itemsPerRow?: number;
    itemHeight?: number;
    containerHeight?: number | string;
    initialBatchSize?: number;
    delayBetweenBatches?: number;
}

const BatchVirtualizedMarketGrid: React.FC<BatchVirtualizedMarketGridProps> = ({
    markets,
    marketResults,
    itemsPerRow = 3,
    itemHeight = 200,
    containerHeight = "calc(100vh - 200px)",
    initialBatchSize = 12, // Show first 12 markets initially
    delayBetweenBatches = 100
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
    const [loadedCount, setLoadedCount] = useState(0);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Reset loaded count when markets change
    useEffect(() => {
        setLoadedCount(0);
        setIsInitialLoading(markets.length > 0);
    }, [markets]);

    // Progressive loading effect
    useEffect(() => {
        if (!isInitialLoading || loadedCount >= markets.length) {
            setIsInitialLoading(false);
            return;
        }

        const timer = setTimeout(() => {
            const nextBatchSize = Math.min(initialBatchSize, markets.length - loadedCount);
            setLoadedCount(prev => prev + nextBatchSize);
        }, delayBetweenBatches);

        return () => clearTimeout(timer);
    }, [isInitialLoading, loadedCount, markets.length, initialBatchSize, delayBetweenBatches]);

    // Calculate visible range based on loaded markets
    const visibleRange = useMemo(() => {
        const startIndex = Math.floor(scrollTop / itemHeight) * itemsPerRow;
        const heightValue = typeof containerHeight === 'string' ? 400 : containerHeight;
        const endIndex = Math.min(
            startIndex + Math.ceil(heightValue / itemHeight) * itemsPerRow + itemsPerRow,
            loadedCount // Use loadedCount instead of markets.length
        );
        return { startIndex, endIndex };
    }, [scrollTop, itemHeight, containerHeight, itemsPerRow, loadedCount]);

    // Get visible markets from loaded markets
    const visibleMarkets = useMemo(() => {
        const loadedMarkets = markets.slice(0, loadedCount);
        return loadedMarkets.slice(visibleRange.startIndex, visibleRange.endIndex);
    }, [markets, loadedCount, visibleRange]);

    // Calculate total height based on loaded markets
    const totalHeight = Math.ceil(loadedCount / itemsPerRow) * itemHeight;

    // Handle scroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    // Calculate offset for visible items
    const offsetY = Math.floor(visibleRange.startIndex / itemsPerRow) * itemHeight;

    return (
        <div
            ref={setContainerRef}
            className="overflow-auto overscroll-contain scrollbar-hide"
            style={{
                height: containerHeight,
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none' // IE/Edge
            }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0
                    }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
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
                    </div>
                </div>
            </div>

            {/* Loading indicator for remaining markets */}
            {isInitialLoading && loadedCount < markets.length && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">
                            Loading markets... ({loadedCount}/{markets.length})
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchVirtualizedMarketGrid;

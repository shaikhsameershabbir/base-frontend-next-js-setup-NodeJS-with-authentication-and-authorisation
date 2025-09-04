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

interface VirtualizedMarketGridProps {
    markets: Market[];
    marketResults: Record<string, MarketResult>;
    itemsPerRow?: number;
    itemHeight?: number;
    containerHeight?: number;
}

const VirtualizedMarketGrid: React.FC<VirtualizedMarketGridProps> = ({
    markets,
    marketResults,
    itemsPerRow = 3,
    itemHeight = 200,
    containerHeight = 600
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

    // Calculate visible range
    const visibleRange = useMemo(() => {
        const startIndex = Math.floor(scrollTop / itemHeight) * itemsPerRow;
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / itemHeight) * itemsPerRow + itemsPerRow,
            markets.length
        );
        return { startIndex, endIndex };
    }, [scrollTop, itemHeight, containerHeight, itemsPerRow, markets.length]);

    // Get visible markets
    const visibleMarkets = useMemo(() => {
        return markets.slice(visibleRange.startIndex, visibleRange.endIndex);
    }, [markets, visibleRange]);

    // Calculate total height
    const totalHeight = Math.ceil(markets.length / itemsPerRow) * itemHeight;

    // Handle scroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    // Calculate offset for visible items
    const offsetY = Math.floor(visibleRange.startIndex / itemsPerRow) * itemHeight;

    return (
        <div
            ref={setContainerRef}
            className="overflow-auto"
            style={{ height: containerHeight }}
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
        </div>
    );
};

export default VirtualizedMarketGrid;

'use client';

import React, { useMemo } from 'react';
import MarketCard from './MarketCard';
import MessageSection from './Message';

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

// Optimized market card renderer with better memoization
const MarketCardWrapper = React.memo(({ market, marketResult }: {
    market: Market;
    marketResult: MarketResult | undefined
}) => (
    <MarketCard
        market={market}
        marketResult={marketResult}
    />
), (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
        prevProps.market._id === nextProps.market._id &&
        prevProps.market.marketName === nextProps.market.marketName &&
        prevProps.market.openTime === nextProps.market.openTime &&
        prevProps.market.closeTime === nextProps.market.closeTime &&
        prevProps.market.isActive === nextProps.market.isActive &&
        prevProps.market.isGolden === nextProps.market.isGolden &&
        prevProps.market.rank === nextProps.market.rank &&
        prevProps.market.weekDays === nextProps.market.weekDays &&
        prevProps.marketResult === nextProps.marketResult
    );
});

MarketCardWrapper.displayName = 'MarketCardWrapper';

const SimpleMarketGrid: React.FC<SimpleMarketGridProps> = React.memo(({
    markets,
    marketResults
}) => {
    // Memoize the markets with their results to prevent unnecessary re-renders
    const marketsWithResults = useMemo(() => {
        if (!markets.length) return [];

        return markets.map(market => ({
            market,
            marketResult: marketResults[market._id] || null
        }));
    }, [markets, marketResults]);

    // Early return for empty markets
    if (!marketsWithResults.length) {
        return (
            <>
                <div className='sticky top-0 z-10'><MessageSection /></div>
                <div className="flex justify-center items-center py-8">
                    <div className="text-lg text-muted">No markets available</div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className='sticky top-0 z-10'><MessageSection /></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4">
                {marketsWithResults.map(({ market, marketResult }) => (
                    <MarketCardWrapper
                        key={market._id}
                        market={market}
                        marketResult={marketResult}
                    />
                ))}
            </div>
        </>
    );
});

SimpleMarketGrid.displayName = 'SimpleMarketGrid';

export default SimpleMarketGrid;

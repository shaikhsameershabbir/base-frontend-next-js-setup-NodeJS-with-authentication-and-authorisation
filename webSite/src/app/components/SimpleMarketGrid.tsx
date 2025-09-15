'use client';

import React, { useMemo, useCallback } from 'react';
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

// Memoized market card renderer to prevent unnecessary re-renders
const MarketCardWrapper = React.memo(({ market, marketResult }: { market: Market; marketResult: MarketResult | undefined }) => (
    <MarketCard
        key={market._id}
        market={market}
        marketResult={marketResult}
    />
));

MarketCardWrapper.displayName = 'MarketCardWrapper';

const SimpleMarketGrid: React.FC<SimpleMarketGridProps> = React.memo(({
    markets,
    marketResults
}) => {
    // Memoize the markets with their results to prevent unnecessary re-renders
    const marketsWithResults = useMemo(() => {
        return markets.map(market => ({
            market,
            marketResult: marketResults[market._id]
        }));
    }, [markets, marketResults]);

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

export default SimpleMarketGrid;

'use client';

import React from 'react';
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
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-4">
            {markets.map((market) => {
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
    );
};

export default SimpleMarketGrid;

'use client';

import BottomNav from "@/app/components/BottomNav";
import MarketCard from "@/app/components/MarketCard";
import Header from "@/app/components/Header";
import Message from "@/app/components/Message";
import React from "react";
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
            open: number | null;
            main: number | null;
            close: number | null;
            openDeclationTime: string | null;
            closeDeclationTime: string | null;
        };
    };
}

interface MarketStatus {
    status: string;
    isOpen: boolean;
    timeUntilOpen?: number;
    timeUntilClose?: number;
}

function HomeContent() {
    const { markets, marketResults, loading, error, fetchData } = useMarketData();
    const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

    // Update current time every minute
    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Get market status
    const getMarketStatus = (market: Market): MarketStatus => {
        const now = currentTime;

        // Parse market times using the same method as MarketCard
        const closeTime = new Date(market.closeTime);

        // Create Date objects for today with the market times
        const today = new Date();
        const todayCloseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), closeTime.getHours(), closeTime.getMinutes());

        // Check if market is currently open based on backend logic
        // Market is open from midnight (00:00) to 15 minutes before closeTime
        const noBettingStart = new Date(todayCloseTime.getTime() - (15 * 60 * 1000)); // 15 minutes before close
        const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // 00:00 AM

        // Debug logging
        console.log(`Market: ${market.marketName}`);
        console.log(`Current Time: ${now.toLocaleTimeString()}`);
        console.log(`Close Time: ${todayCloseTime.toLocaleTimeString()}`);
        console.log(`No Betting Start: ${noBettingStart.toLocaleTimeString()}`);
        console.log(`Midnight: ${midnight.toLocaleTimeString()}`);

        const isOpen = now >= midnight && now < noBettingStart;
        const timeUntilOpen = midnight.getTime() - now.getTime();
        const timeUntilClose = todayCloseTime.getTime() - now.getTime();

        let status = 'Closed';
        if (now < midnight) {
            status = 'Opening Soon';
        } else if (isOpen) {
            status = 'Open';
        } else if (now >= noBettingStart && now < todayCloseTime) {
            status = 'Closing Soon';
        } else {
            status = 'Closed';
        }

        console.log(`Status: ${status}, IsOpen: ${isOpen}`);

        return {
            status,
            isOpen,
            timeUntilOpen: timeUntilOpen > 0 ? timeUntilOpen : undefined,
            timeUntilClose: timeUntilClose > 0 ? timeUntilClose : undefined
        };
    };

    // Get market status color
    const getMarketStatusColor = (market: Market): string => {
        const status = getMarketStatus(market);
        if (status.isOpen) return 'text-green-600';
        if (status.status === 'Opening Soon') return 'text-yellow-600';
        if (status.status === 'Closing Soon') return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="pt-16">
                <div className="flex px-4 mb-2 bg-white items-center relative min-h-[56px]">
                    <div className="flex-1 flex justify-center items-center">
                        <Message />
                    </div>
                    <div className="absolute right-4">
                        <Button onClick={fetchData} variant="default" className="rounded-full" size="icon" aria-label="Refresh Markets">
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
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-4 pb-20">
                        {markets
                            .sort((a, b) => {
                                // Sort by rank (null ranks go to the end)
                                if (a.rank === undefined && b.rank === undefined) return 0;
                                if (a.rank === undefined) return 1;
                                if (b.rank === undefined) return -1;
                                return a.rank - b.rank;
                            })
                            .map((market) => {
                                const status = getMarketStatus(market);
                                const statusColor = getMarketStatusColor(market);
                                const marketResult = marketResults[market._id];

                                return (
                                    <MarketCard
                                        key={market._id}
                                        market={market}
                                        status={status.status}
                                        statusColor={statusColor}
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
}

export default function Home() {
    return <HomeContent />;
}

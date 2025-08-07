'use client';

import BottomNav from "@/app/components/BottomNav";
import MarketCard from "@/app/components/MarketCard";
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

        // Parse market times
        const openTime = new Date(market.openTime);
        const closeTime = new Date(market.closeTime);

        // Create Date objects for today with the market times
        const today = new Date();
        const todayOpenTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), openTime.getHours(), openTime.getMinutes());
        const todayCloseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), closeTime.getHours(), closeTime.getMinutes());

        // Calculate loading periods (15 minutes before each time)
        const openLoadingStart = new Date(todayOpenTime.getTime() - (15 * 60 * 1000));
        const closeLoadingStart = new Date(todayCloseTime.getTime() - (15 * 60 * 1000));

        // Market day starts at midnight
        const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

        let status = 'Closed';
        let isOpen = false;

        // Before midnight: Market closed
        if (now < midnight) {
            status = 'Opening Soon';
            isOpen = false;
        }
        // Open betting: From midnight to open loading start
        else if (now >= midnight && now < openLoadingStart) {
            status = 'Open';
            isOpen = true;
        }
        // Open loading: 15 minutes before open time to open time
        else if (now >= openLoadingStart && now < todayOpenTime) {
            status = 'Loading';
            isOpen = false;
        }
        // Close betting: From open time to close loading start
        else if (now >= todayOpenTime && now < closeLoadingStart) {
            status = 'Close Only';
            isOpen = true;
        }
        // Close loading: 15 minutes before close time to close time
        else if (now >= closeLoadingStart && now < todayCloseTime) {
            status = 'Loading';
            isOpen = false;
        }
        // After close time: Market closed
        else {
            status = 'Closed';
            isOpen = false;
        }

        const timeUntilOpen = midnight.getTime() - now.getTime();
        const timeUntilClose = todayCloseTime.getTime() - now.getTime();

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
        if (status.status === 'Open') return 'text-green-600';
        if (status.status === 'Close Only') return 'text-blue-600';
        if (status.status === 'Loading') return 'text-orange-600';
        if (status.status === 'Opening Soon') return 'text-yellow-600';
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

'use client';

import BottomNav from "@/app/components/BottomNav";
import MarketCard from "@/app/components/MarketCard";
import Header from "@/app/components/Header";
import Message from "@/app/components/Message";
import { marketsAPI } from "@/lib/api/auth";
import { betAPI } from "@/lib/api/bet";
import React, { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const [markets, setMarkets] = useState<Market[]>([]);
    const [marketResults, setMarketResults] = useState<Record<string, MarketResult>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Fetch all data
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch markets
            const marketsResponse = await marketsAPI.getAssignedMarkets();
            if (!marketsResponse.success || !marketsResponse.data) {
                throw new Error(marketsResponse.message || 'Failed to fetch markets');
            }

            const marketsData = marketsResponse.data.assignments.map((assignment: any) => {
                if (assignment.marketData) {
                    return {
                        ...assignment.marketData,
                        isAssigned: true,
                        assignmentId: assignment._id
                    };
                }
                return {
                    ...assignment.marketId,
                    isAssigned: true,
                    assignmentId: assignment._id
                };
            });

            setMarkets(marketsData);

            // Fetch all market results in a single API call
            const marketIds = marketsData.map(market => market._id);
            const resultsResponse = await betAPI.getAllMarketResults(marketIds);

            if (resultsResponse.success && resultsResponse.data) {
                const resultsMap: Record<string, MarketResult> = {};
                resultsResponse.data.forEach((item: any) => {
                    if (item.success && item.data) {
                        resultsMap[item.marketId] = item.data;
                    }
                });
                setMarketResults(resultsMap);
            }
        } catch (error: any) {
            setError(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    // Get market status
    const getMarketStatus = (market: Market): MarketStatus => {
        const now = currentTime;
        const open = new Date(market.openTime);
        const close = new Date(market.closeTime);

        // Adjust for same-day comparison
        const today = new Date();
        open.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
        close.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());

        const isOpen = now >= open && now <= close;
        const timeUntilOpen = open.getTime() - now.getTime();
        const timeUntilClose = close.getTime() - now.getTime();

        let status = 'Closed';
        if (isOpen) {
            status = 'Open';
        } else if (now < open) {
            status = 'Opening Soon';
        } else {
            status = 'Closed';
        }

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

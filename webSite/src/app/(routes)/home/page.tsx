'use client';

import BottomNav from "@/app/components/BottomNav";
import MarketCard from "@/app/components/MarketCard";
import Header from "@/app/components/Header";
import Message from "@/app/components/Message";
import { useMarkets } from "@/contexts/MarketsContext";
import React from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function Home() {
    const { state, getMarketStatus, getMarketStatusColor, fetchMarkets } = useMarkets();
    return (
        <main className="min-h-screen bg-gray-100">
            <div className="pt-16">
                <div className="flex px-4 mb-2 bg-white items-center relative min-h-[56px]">
                    <div className="flex-1 flex justify-center items-center">
                        <Message />
                    </div>
                    <div className="absolute right-4">
                        <Button onClick={fetchMarkets} variant="default" className="rounded-full" size="icon" aria-label="Refresh Markets">
                            <RefreshCcw className="text-primary" />
                        </Button>
                    </div>
                </div>


                {state.loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-primary">Loading markets...</div>
                    </div>
                ) : state.error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-red-500">{state.error}</div>
                    </div>
                ) : state.markets.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-muted">No markets assigned to you</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-4 pb-20">
                        {state.markets
                            .sort((a, b) => {
                                // Sort by rank (null ranks go to the end)
                                if (a.rank === undefined && b.rank === undefined) return 0;
                                if (a.rank === undefined) return 1;
                                if (b.rank === undefined) return -1;
                                return a.rank - b.rank;
                            })
                            .map((market, index: number) => {
                                const status = getMarketStatus(market);
                                const statusColor = getMarketStatusColor(market);

                                return (
                                    <MarketCard
                                        key={market._id}
                                        market={market}
                                        status={status}
                                        statusColor={statusColor}
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

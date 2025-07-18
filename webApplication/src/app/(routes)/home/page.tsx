'use client';

import BottomNav from "@/app/components/BottomNav";
import MarketCard from "@/app/components/MarketCard";
import Header from "@/app/components/Header";
import Message from "@/app/components/Message";
import { useMarkets } from "@/contexts/MarketsContext";
import React from "react";


export default function Home() {
    const { state, getMarketStatus, getMarketStatusColor } = useMarkets();

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="pt-16">
                <Message />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-4 max-h-[500px] overflow-y-auto">
                        {state.markets.map((market, index: number) => {
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

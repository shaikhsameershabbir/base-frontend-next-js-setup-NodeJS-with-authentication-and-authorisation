'use client';

import React, { useCallback, useMemo } from "react";
import { PlayCircle, Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import WinningNumbers from "./WinningNumbers";
import { useMarketStatus } from "@/hooks/useMarketStatus";

interface MarketCardProps {
  market: {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
    isGolden?: boolean;
    rank?: number;
    weekDays?: number;
  };
  marketResult?: any;
}

const MarketCard: React.FC<MarketCardProps> = React.memo(({
  market,
  marketResult,
}) => {
  const router = useRouter();
  const marketStatus = useMarketStatus(market);
  const handlePlayClick = useCallback(() => {
    if (!marketStatus?.isOpen) {
      return;
    }

    // Convert market name to URL-friendly format and navigate
    const gameId = market._id.toLowerCase().replace(/\s+/g, '-');
    router.push(`/games/${gameId}`);
  }, [marketStatus?.isOpen, market._id, router]);

  // Format time for display - memoized to prevent recalculation
  const formatTimeDisplay = useCallback((timeStr: string): string => {
    try {
      if (!timeStr || typeof timeStr !== 'string') {
        return 'Invalid Time';
      }

      // Handle ISO date string format
      if (timeStr.includes('T')) {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) {
          return 'Invalid Time';
        }
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }

      // Handle simple time format (HH:MM)
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        return 'Invalid Time';
      }
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeStr || 'Invalid Time';
    }
  }, []);



  return (
    <div
      className="relative border-2 border-[#7b7b79] rounded-[18px] shadow-lg overflow-hidden transition-transform duration-200 hover:scale-102 hover:shadow-2xl flex flex-col"
      style={{
        background: market.isGolden
          ? "linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)"
          : "#ffffff",
        borderTopColor: "#7b7b79",
        borderTopWidth: "3px",
      }}
    >
      {/* Center Content */}
      <div className="flex flex-col items-center justify-center text-center py-2 px-2 flex-1 min-h-[120px]">
        <h3
          className="text-2xl font-extrabold text-[#b80000] drop-shadow-lg mb-1"
          style={{
            fontFamily: "'Pepper Sans', sans-serif",
            textShadow: "2px 2px 8px #fff, 0 0 2px #0000",
            letterSpacing: "1px",
          }}
        >
          {market.marketName}
        </h3>

        {/* Market Status - Only show when closed today */}
        {marketStatus?.status === 'closed_today' && (
          <div className="mb-2">
            <div className="text-sm font-medium text-red-600">
              Market closed
            </div>
          </div>
        )}

        {/* Main Content Row */}
        <div className="flex flex-row items-center justify-between w-full">
          {/* Center - Result and Times */}
          <div className="flex flex-col items-center flex-1">
            {/* Winning Numbers Section */}
            <div className="mb-2">
              <WinningNumbers
                marketId={market._id}
                marketName={market.marketName}
                openTime={market.openTime}
                closeTime={market.closeTime}
                weekDays={market.weekDays || 7}
                marketResult={marketResult}
              />
            </div>

            {/* Time Display */}
            <div className="flex items-center gap-2 text-[15px] text-black">
              <span className="font-bold">{formatTimeDisplay(market.openTime)}</span>
              <span className="mx-1">|</span>
              <span className="font-bold">{formatTimeDisplay(market.closeTime)}</span>
            </div>
          </div>

          {/* Right Side - Play Button */}
          <div className="flex flex-col items-center justify-center ml-4">
            <button
              onClick={handlePlayClick}
              disabled={!marketStatus?.isOpen}
              className={`border-2 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 ${marketStatus?.isOpen
                ? 'border-black bg-white hover:bg-gray-50 cursor-pointer'
                : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                }`}
            >
              <PlayCircle
                className={`w-8 h-8 rounded-full ${marketStatus?.isOpen
                  ? 'bg-primary text-white'
                  : 'text-gray-400 bg-gray-200'
                  }`}
              />
            </button>
            <span className={`text-sm mt-1 font-bold ${marketStatus?.isOpen ? 'text-green-600' : 'text-red-800'
              }`}>
              {marketStatus?.isOpen ? 'Play' : 'Closed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

MarketCard.displayName = 'MarketCard';

export default MarketCard;

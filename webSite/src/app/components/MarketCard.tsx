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

// Memoized time formatter to avoid recalculation
const formatTimeDisplay = (timeStr: string): string => {
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
};

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

  // Memoize formatted times to avoid recalculation on every render
  const formattedTimes = useMemo(() => ({
    openTime: formatTimeDisplay(market.openTime),
    closeTime: formatTimeDisplay(market.closeTime)
  }), [market.openTime, market.closeTime]);



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
      {/* Main Content - Perfectly Centered */}
      <div className="flex flex-col items-center justify-center text-center py-3 px-3 sm:py-4 sm:px-4 flex-1 min-h-[120px] sm:min-h-[140px] relative">
        {/* Market Name */}
        <h3
          className="text-lg sm:text-2xl font-extrabold text-[#b80000] drop-shadow-lg mb-2 sm:mb-3"
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

        {/* Winning Numbers Section - Centered */}
        <div className="mb-2 sm:mb-3">
          <WinningNumbers
            marketId={market._id}
            marketName={market.marketName}
            openTime={market.openTime}
            closeTime={market.closeTime}
            weekDays={market.weekDays || 7}
            marketResult={marketResult}
          />
        </div>

        {/* Time Display - Centered */}
        <div className="flex items-center gap-1 sm:gap-2 text-base sm:text-xl text-black">
          <span className="font-bold">{formattedTimes.openTime}</span>
          <span className="mx-1">|</span>
          <span className="font-bold">{formattedTimes.closeTime}</span>
        </div>

        {/* Play Button - Vertically centered on the right */}
        <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
          <button
            onClick={handlePlayClick}
            disabled={!marketStatus?.isOpen}
            className={`border-2 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-200 ${marketStatus?.isOpen
              ? 'border-black bg-white hover:bg-gray-50 cursor-pointer'
              : 'border-gray-300 bg-gray-100 cursor-not-allowed'
              }`}
          >
            <PlayCircle
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${marketStatus?.isOpen
                ? 'bg-primary text-white'
                : 'text-gray-400 bg-gray-200'
                }`}
            />
          </button>
          <span className={`text-xs mt-1 font-bold ${marketStatus?.isOpen ? 'text-green-600' : 'text-red-800'
            }`}>
            {marketStatus?.isOpen ? 'Play' : 'Closed'}
          </span>
        </div>
      </div>
    </div>
  );
});

MarketCard.displayName = 'MarketCard';

export default MarketCard;

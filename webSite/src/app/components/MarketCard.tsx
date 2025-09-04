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
    // Only allow navigation if market is open
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
      console.error('Error parsing time:', timeStr, error);
      return timeStr || 'Invalid Time';
    }
  }, []);

  // Get status icon based on market status - memoized
  const statusIcon = useMemo(() => {
    if (!marketStatus) return null;

    switch (marketStatus.status) {
      case 'open_betting':
        return <span className="text-green-600">●</span>;
      case 'close_betting':
        return <span className="text-blue-600">●</span>;
      case 'open_loading':
      case 'close_loading':
        return <Clock className="w-4 h-4 text-orange-600 animate-pulse" />;
      case 'closed_today':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <span className="text-gray-500">●</span>;
    }
  }, [marketStatus?.status]);

  return (
    <div className={`rounded-2xl p-4 mb-4 mx-2 ${market.isGolden ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300' : 'bg-white'}`}>
      <div className="rounded-2xl flex justify-between items-start">
        <div className="rounded-2xl flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-800">{market.marketName}</h2>
            {statusIcon}
          </div>

          {/* Market Status - Only show when closed today */}
          {marketStatus?.status === 'closed_today' && (
            <div className="mb-2">
              <div className="text-sm font-medium text-red-600">
                Market closed today
              </div>
            </div>
          )}

          {/* Winning Numbers Section */}
          <WinningNumbers
            marketId={market._id}
            marketName={market.marketName}
            openTime={market.openTime}
            closeTime={market.closeTime}
            weekDays={market.weekDays || 7}
            marketResult={marketResult}
          />

          <div className="flex gap-4 mt-2">
            <div>
              <p className="text-sm text-gray-600 font-bold">Time Open:</p>
              <p className="text-orange-500 font-semibold">
                {formatTimeDisplay(market.openTime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-bold">Time Close:</p>
              <p className="text-orange-500 font-semibold">
                {formatTimeDisplay(market.closeTime)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center ml-4 self-stretch">
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
          <span className={`text-sm font-medium mt-2 ${marketStatus?.isOpen ? 'text-green-600' : 'text-red-800'
            }`}>
            {marketStatus?.isOpen ? 'Play Now' : 'Market Closed'}
          </span>
        </div>
      </div>
    </div>
  );
});

MarketCard.displayName = 'MarketCard';

export default MarketCard;

'use client';

import React from "react";
import Image from "next/image";
import { CalendarDays, PlayCircle, Star, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import WinningNumbers from "./WinningNumbers";

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
  status?: string;
  statusColor?: string;
}

const MarketCard: React.FC<MarketCardProps> = ({
  market,
  status,
  statusColor = "text-green-500",
}) => {
  const router = useRouter();

  const handlePlayClick = () => {
    // Convert market name to URL-friendly format and navigate
    const gameId = market._id.toLowerCase().replace(/\s+/g, '-');
    router.push(`/games/${gameId}`);
  };

  return (
    <div className={`rounded-xl p-4 mb-4 mx-2 ${market.isGolden ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300' : 'bg-white'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-800">{market.marketName}</h2>
            {market.isGolden && (
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
            )}
            {market.rank && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                <Hash className="w-3 h-3" />
                {market.rank}
              </div>
            )}
          </div>


          {/* Winning Numbers Section */}
          <WinningNumbers
            marketId={market._id}
            marketName={market.marketName}
            openTime={market.openTime}
            closeTime={market.closeTime}
            weekDays={market.weekDays || 7}
          />

          <div className="flex gap-4 mt-2">
            <div>
              <p className="text-sm text-gray-600 font-bold">Time Open:</p>
              <p className="text-orange-500 font-semibold">
                {new Date(market.openTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-bold">Time Close:</p>
              <p className="text-orange-500 font-semibold">
                {new Date(market.closeTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 ml-4">
          <div className="flex flex-col items-center">
            <button
              onClick={handlePlayClick}
              className="border-2 border-black bg-white rounded-full w-12 h-12 flex items-center justify-center"
            >
              <PlayCircle
                className={`w-8 h-8 rounded-full ${status === "Market close for today"
                  ? "text-white bg-black"
                  : " bg-primary text-white"
                  }`}
              />
            </button>
            <span className="text-sm font-medium mt-1 text-black">Play Now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;

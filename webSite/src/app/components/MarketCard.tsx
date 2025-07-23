'use client';

import React from "react";
import Image from "next/image";
import { CalendarDays, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface MarketCardProps {
  market: {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
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
    const gameId = market.marketName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/games/${gameId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 mx-2">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{market.marketName}</h2>
          <p className={`${statusColor} text-sm mt-1 font-bold`}>{status}</p>
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
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8">
            <CalendarDays className="w-8 h-8 text-black" />
          </div>
          &ensp;
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

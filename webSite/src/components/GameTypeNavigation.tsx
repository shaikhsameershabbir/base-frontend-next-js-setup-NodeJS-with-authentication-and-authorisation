"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';

interface GameType {
    id: string;
    name: string;
    color: string;
}

const gameTypes: GameType[] = [
    { id: "single", name: "Single", color: "from-emerald-400 to-teal-500" },
    { id: "jodi-digits", name: "Jodi", color: "from-violet-400 to-purple-500" },
    { id: "single-panna", name: "SP", color: "from-amber-400 to-orange-500" },
    { id: "double-panna", name: "DP", color: "from-rose-400 to-pink-500" },
    { id: "triple-panna", name: "TP", color: "from-cyan-400 to-blue-500" },
    { id: "sp-motor", name: "SP Motor", color: "from-lime-400 to-green-500" },
    { id: "dp-motor", name: "DP Motor", color: "from-red-400 to-rose-500" },
    { id: "SP_DP", name: "Common", color: "from-indigo-400 to-purple-500" },
    { id: "red-bracket", name: "Bracket", color: "from-yellow-400 to-orange-500" },
    { id: "cycle-panna", name: "Cycle", color: "from-blue-400 to-cyan-500" },
    { id: "family-panel", name: "Family", color: "from-pink-400 to-rose-500" },
    { id: "sangam", name: "Sangam", color: "from-purple-400 to-indigo-500" },
];

interface GameTypeNavigationProps {
    currentGameType?: string;
    marketId?: string;
    className?: string;
}

const GameTypeNavigation: React.FC<GameTypeNavigationProps> = ({
    currentGameType,
    marketId,
    className = ""
}) => {
    const router = useRouter();
    const params = useParams();
    const currentMarketId = marketId || params.id;

    const handleGameTypeClick = (gameTypeId: string) => {
        if (currentMarketId) {
            router.push(`/games/${currentMarketId}/${gameTypeId}`);
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg p-2 border border-gray-100 ${className}`}>
            {/* Responsive grid layout */}
            <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
                {gameTypes.map((gameType) => {
                    const isActive = currentGameType === gameType.id;
                    return (
                        <button
                            key={gameType.id}
                            onClick={() => handleGameTypeClick(gameType.id)}
                            className={`
                                flex items-center justify-center
                                px-1 py-1 rounded-2xl border-2 transition-all duration-200
                                text-xs font-medium truncate 
                                ${isActive
                                    ? `bg-gradient-to-r ${gameType.color} text-white border-transparent shadow-lg scale-105`
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100 hover:shadow-md'
                                }
                            `}
                            title={gameType.name}
                        >
                            {gameType.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GameTypeNavigation;

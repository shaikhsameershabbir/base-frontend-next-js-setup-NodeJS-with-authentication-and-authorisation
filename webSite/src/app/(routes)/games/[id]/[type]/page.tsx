'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { useGameData } from '@/contexts/GameDataContext';
// Import game type components
import SingleGame from './components/SingleGame';
import JodiGame from './components/JodiGame';
import SangamGame from './components/SangamGame';
import BaseMotorGame from './components/BaseMotorGame';
import RedBracket from './components/RedBracket';
import FamilyPanel from './components/FamilyPanel';
import OddEven from './components/OddEven';
import AllInOneGame from './components/AllInOneGame';
import SinglePanna from './components/SinglePanna';
import DoublePanna from './components/Doublepanna';
import TriplePanna from './components/Triplepanna';
import CyclePanna from './components/CyclePanna';
import CommonSpDp from './components/CommonSpDp'
import HalfSangamA from './components/HalfSangamA';
import HalfSangamB from './components/HalfSangamB';

const GameTypePage = () => {
  const params = useParams();
  const gameId = params.id as string;
  const gameType = params.type as string;
  const { getMarketStatus } = useGameData();
  const [marketName, setMarketName] = useState<string>('Market');

  // Get market details from centralized context
  useEffect(() => {
    const marketStatusData = getMarketStatus(gameId);
    if (marketStatusData) {
      setMarketName(marketStatusData.marketName || 'Market');
    }
  }, [gameId, getMarketStatus]);

  const renderGameComponent = () => {
    switch (gameType) {
      case 'all-in-one':
        return <AllInOneGame gameId={gameId} />;
      case 'single':
        return <SingleGame marketId={gameId} marketName={marketName} />;
      case 'jodi-digits':
        return <JodiGame marketId={gameId} marketName={marketName} />;
      case 'single-panna':
        return <SinglePanna marketId={gameId} marketName={marketName} />;
      case 'double-panna':
        return <DoublePanna marketId={gameId} marketName={marketName} />;
      case 'triple-panna':
        return <TriplePanna marketId={gameId} marketName={marketName} />;
      case 'sp-motor':
        return <BaseMotorGame marketId={gameId} marketName={marketName} gameType="SP" />;
      case 'dp-motor':
        return <BaseMotorGame marketId={gameId} marketName={marketName} gameType="DP" />;
      case 'SP_DP':
        return <CommonSpDp marketId={gameId} marketName={marketName} />
      case 'red-bracket':
        return <RedBracket marketId={gameId} marketName={marketName} />;
      case 'cycle-panna':
        return <CyclePanna marketId={gameId} marketName={marketName} />;
      case 'family-panel':
        return <FamilyPanel marketId={gameId} marketName={marketName} />;
      case 'sangam':
        return <SangamGame marketId={gameId} marketName={marketName} />;


      default:
        return <div>Game type not found</div>;
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="pt-16 pb-16">
        <div className="p-4">
          {renderGameComponent()}
        </div>
      </div>
      <BottomNav />
    </main>
  );
};

export default GameTypePage; 
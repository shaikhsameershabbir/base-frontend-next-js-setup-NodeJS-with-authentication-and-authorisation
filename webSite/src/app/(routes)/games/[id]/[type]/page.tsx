'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { useMarketData } from '@/contexts/MarketDataContext';
// Import game type components
import SingleGame from './components/SingleGame';
import JodiGame from './components/JodiGame';
import SangamGame from './components/SangamGame';
import BaseMotorGame from './components/BaseMotorGame';
import RedBracket from './components/RedBracket';
import FamilyPanel from './components/FamilyPanel';

import SinglePanna from './components/SinglePanna';
import DoublePanna from './components/Doublepanna';
import TriplePanna from './components/Triplepanna';
import CyclePanna from './components/CyclePanna';
import CommonSpDp from './components/CommonSpDp'
import HalfSangamA from './components/HalfSangamA';
import HalfSangamB from './components/HalfSangamB';

const GameTypePageContent = () => {
  const params = useParams();
  const gameId = params.id as string;
  const gameType = params.type as string;
  const { markets, getMarketResult } = useMarketData();
  const [marketName, setMarketName] = useState<string>('Market');
  const [loading, setLoading] = useState(true);

  // Get market details from context
  useEffect(() => {
    const market = markets.find(m => m._id === gameId);
    if (market) {
      setMarketName(market.marketName || 'Market');
    }
    setLoading(false);
  }, [markets, gameId]);

  const marketResult = getMarketResult(gameId);

  const renderGameComponent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-primary">Loading game...</div>
        </div>
      );
    }

    switch (gameType) {

      case 'single':
        return <SingleGame marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />;
      case 'jodi-digits':
        return <JodiGame marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />;
      case 'single-panna':
        return <SinglePanna marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />;
      case 'double-panna':
        return <DoublePanna marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />;
      case 'triple-panna':
        return <TriplePanna marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />;
      case 'sp-motor':
        return <BaseMotorGame marketId={gameId} marketName={marketName} gameType="SP" marketResult={marketResult} />;
      case 'dp-motor':
        return <BaseMotorGame marketId={gameId} marketName={marketName} gameType="DP" marketResult={marketResult} />;
      case 'SP_DP':
        return <CommonSpDp marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />
      case 'red-bracket':
        return <RedBracket marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />;
      case 'cycle-panna':
        return <CyclePanna marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />;
      case 'family-panel':
        return <FamilyPanel marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />;
      case 'sangam':
        return <SangamGame marketId={gameId} marketName={marketName} marketResult={marketResult} gameType={gameType} />;

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

const GameTypePage = () => {
  return <GameTypePageContent />;
};

export default GameTypePage; 
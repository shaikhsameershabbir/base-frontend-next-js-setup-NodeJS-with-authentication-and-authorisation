'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { betAPI } from '@/lib/api/bet';
// Import game type components
import SingleGame from './components/SingleGame';
import JodiGame from './components/JodiGame';
import SangamGame from './components/SangamGame';
import SpMotor from './components/SpMotor';
import DpMotor from './components/DpMoter';
import RedBracket from './components/RedBracket';
import FamilyPanel from './components/FamilyPanel';
import OddEven from './components/OddEven';
import AllInOneGame from './components/AllInOneGame';
import SinglePanna from './components/SinglePanna';
import DoublePanna from './components/Doublepanna';
import TriplePanna from './components/Triplepanna';
import CyclePanna from './components/CyclePanna';
import SpDpTp from './components/SpDpTp'
import HalfSangamA from './components/HalfSangamA';
import HalfSangamB from './components/HalfSangamB';

const GameTypePage = () => {
  const params = useParams();
  const gameId = params.id as string;
  const gameType = params.type as string;
  const [marketName, setMarketName] = useState<string>('Market');

  // Fetch market details
  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const response = await betAPI.getMarketStatus(gameId);
        if (response.success && response.data) {
          setMarketName(response.data.marketName || 'Market');
        }
      } catch (error) {
        console.error('Error fetching market status:', error);
      }
    };

    fetchMarketStatus();
  }, [gameId]);

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
        return <SpMotor gameId={gameId} />;
      case 'dp-motor':
        return <DpMotor gameId={gameId} />;
      case 'SP_DP_TP':
        return <SpDpTp gameId={gameId} />
      case 'red-bracket':
        return <RedBracket gameId={gameId} />;
      case 'cycle-panna':
        return <CyclePanna gameId={gameId} />;
      case 'family-panel':
        return <FamilyPanel gameId={gameId} />;
      case 'half-sangam-a':
        return <HalfSangamA gameId={gameId} />;
      case 'half-sangam-b':
        return <HalfSangamB gameId={gameId} />;
      case 'full-sangam':
        return <SangamGame gameId={gameId} />;
      case 'odd-even':
        return <OddEven gameId={gameId} />;
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
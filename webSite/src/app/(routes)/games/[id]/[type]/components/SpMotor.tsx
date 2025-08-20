import React from 'react';
import BaseMotorGame from './BaseMotorGame';
import GameTypeNavigation from '@/components/GameTypeNavigation';

interface SpMotorProps {
  marketId: string;
  marketName?: string;
  gameType: 'SP' | 'DP';
}

const SpMotor: React.FC<SpMotorProps> = ({ marketId, marketName, gameType }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-1 sm:p-2">
      <div className="max-w-4xl mx-auto">
        {/* Game Type Navigation */}
        <GameTypeNavigation currentGameType="sp-motor" marketId={marketId} className="mb-2 sm:mb-4" />

        <BaseMotorGame marketId={marketId} marketName={marketName} gameType={gameType} />
      </div>
    </div>
  );
};

export default SpMotor;
import React from 'react';
import BaseMotorGame from './BaseMotorGame';
import GameTypeNavigation from '@/components/GameTypeNavigation';

interface DpMotorProps {
  marketId: string;
  marketName?: string;
}

const DpMotor: React.FC<DpMotorProps> = ({ marketId, marketName }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2">
      <div className="max-w-4xl mx-auto">
        {/* Game Type Navigation */}
        <GameTypeNavigation currentGameType="dp-motor" marketId={marketId} className="mb-4" />

        <BaseMotorGame marketId={marketId} marketName={marketName} gameType="DP" />
      </div>
    </div>
  );
};

export default DpMotor;
import React from 'react';
import BaseMotorGame from './BaseMotorGame';

interface SpMotorProps {
  marketId: string;
  marketName?: string;
  gameType: 'SP' | 'DP';
}

const SpMotor: React.FC<SpMotorProps> = ({ marketId, marketName, gameType }) => {
  return <BaseMotorGame marketId={marketId} marketName={marketName} gameType={gameType} />;
};

export default SpMotor;
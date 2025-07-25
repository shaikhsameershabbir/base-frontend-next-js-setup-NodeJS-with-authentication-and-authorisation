import React from 'react';
import BaseMotorGame from './BaseMotorGame';

interface SpMotorProps {
  gameId: string;
  gameType: 'SP' | 'DP';
}

const SpMotor: React.FC<SpMotorProps> = ({ gameId, gameType }) => {
  return <BaseMotorGame marketId={gameId} gameType={gameType} />;
};

export default SpMotor;
import React from 'react';
import BaseMotorGame from './BaseMotorGame';

interface SpMotorProps {
  gameId: string;
}

const SpMotor: React.FC<SpMotorProps> = ({ gameId }) => {
  return <BaseMotorGame gameId={gameId} gameType="SP" />;
};

export default SpMotor;
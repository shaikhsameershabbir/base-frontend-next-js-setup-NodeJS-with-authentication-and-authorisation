import React from 'react';
import BaseMotorGame from './BaseMotorGame';

interface DpMotorProps {
  gameId: string;
}

const DpMotor: React.FC<DpMotorProps> = ({ gameId }) => {
  return <BaseMotorGame gameId={gameId} gameType="DP" />;
};

export default DpMotor;
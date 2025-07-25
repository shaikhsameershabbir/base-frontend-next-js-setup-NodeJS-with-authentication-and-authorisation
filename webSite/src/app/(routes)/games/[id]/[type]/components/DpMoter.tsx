import React from 'react';
import BaseMotorGame from './BaseMotorGame';

interface DpMotorProps {
  marketId: string;
  marketName?: string;
}

const DpMotor: React.FC<DpMotorProps> = ({ marketId, marketName }) => {
  return <BaseMotorGame marketId={marketId} marketName={marketName} gameType="DP" />;
};

export default DpMotor;
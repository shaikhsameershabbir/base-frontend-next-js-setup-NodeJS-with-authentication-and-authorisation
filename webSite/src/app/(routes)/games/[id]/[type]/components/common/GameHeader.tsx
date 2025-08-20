import React from 'react';

interface GameHeaderProps {
    marketName: string;
    gameTypeName: string;
    statusColor?: 'green' | 'red';
    showBetTypeButtons?: boolean;
    selectedBetType?: 'open' | 'close' | 'both';
    onBetTypeChange?: (type: 'open' | 'close' | 'both') => void;
    openAllowed?: boolean;
    closeAllowed?: boolean;
    betTypeDisplay?: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({
    marketName,
    gameTypeName,
    statusColor = 'green',
    showBetTypeButtons = false,
    selectedBetType,
    onBetTypeChange,
    openAllowed = false,
    closeAllowed = false,
    betTypeDisplay
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 mb-2 sm:mb-4 border border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 ${statusColor === 'green' ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                    <span className="text-sm sm:text-lg font-bold text-gray-800">{marketName} - {gameTypeName}</span>

                    <div className="flex gap-1 sm:gap-2">
                        {showBetTypeButtons ? (
                            <>
                                {openAllowed && (
                                    <button
                                        type="button"
                                        onClick={() => onBetTypeChange?.('open')}
                                        className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-200 ${selectedBetType === 'open'
                                            ? 'text-white bg-green-600 shadow-md scale-105'
                                            : 'text-green-700 bg-green-100 hover:bg-green-200 hover:shadow-sm'
                                            }`}
                                    >
                                        OPEN
                                    </button>
                                )}
                                {closeAllowed && (
                                    <button
                                        type="button"
                                        onClick={() => onBetTypeChange?.('close')}
                                        className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-200 ${selectedBetType === 'close'
                                            ? 'text-white bg-blue-600 shadow-md scale-105'
                                            : 'text-blue-700 bg-blue-100 hover:bg-blue-200 hover:shadow-sm'
                                            }`}
                                    >
                                        CLOSE
                                    </button>
                                )}
                            </>
                        ) : betTypeDisplay ? (
                            <span className="text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-purple-600 text-white shadow-md">
                                {betTypeDisplay}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameHeader;

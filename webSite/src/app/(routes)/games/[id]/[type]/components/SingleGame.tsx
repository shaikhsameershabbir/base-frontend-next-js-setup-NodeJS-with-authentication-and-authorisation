import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import { isBetTypeAllowed, isBettingAllowed } from '@/lib/utils/marketUtils';
import GameTypeNavigation from '@/components/GameTypeNavigation';

interface SingleGameProps {
  marketId: string;
  marketName?: string;
  marketResult?: any;
  gameType?: string;
}

const SingleGame: React.FC<SingleGameProps> = ({ marketId, marketName = 'Market', marketResult, gameType = 'single' }) => {
  const { state: { user }, updateBalance } = useAuthContext();
  const { showError, showSuccess, showInfo } = useNotification();
  const { getMarketStatus, fetchMarketStatus } = useMarketData();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [marketStatus, setMarketStatus] = useState<any>(null);

  // Helper function to get game type display name
  const getGameTypeName = (type: string): string => {
    const gameTypeNames: { [key: string]: string } = {
      'single': 'Single Game',
      'jodi-digits': 'Jodi Game',
      'single-panna': 'Single Panna',
      'double-panna': 'Double Panna',
      'triple-panna': 'Triple Panna',
      'sp-motor': 'SP Motor',
      'dp-motor': 'DP Motor',
      'SP_DP': 'SP/DP Game',
      'red-bracket': 'Red Bracket',
      'cycle-panna': 'Cycle Panna',
      'family-panel': 'Family Panel',
      'sangam': 'Sangam Game'
    };
    return gameTypeNames[type] || 'Single Game';
  };

  // Helper function to get game type description
  const getGameTypeDescription = (type: string): string => {
    const gameTypeDescriptions: { [key: string]: string } = {
      'single': 'Select individual digits to bet on',
      'jodi-digits': 'Select two digits combination',
      'single-panna': 'Select single panna numbers',
      'double-panna': 'Select double panna numbers',
      'triple-panna': 'Select triple panna numbers',
      'sp-motor': 'SP Motor game selection',
      'dp-motor': 'DP Motor game selection',
      'SP_DP': 'SP/DP combination game',
      'red-bracket': 'Red bracket game selection',
      'cycle-panna': 'Cycle panna game selection',
      'family-panel': 'Family panel game selection',
      'sangam': 'Sangam game selection'
    };
    return gameTypeDescriptions[type] || 'Select individual digits to bet on';
  };

  // Store each digit's value as a number (sum of all clicks/inputs)
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  });
  const [total, setTotal] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<'open' | 'close'>('open');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Get market status from context or fetch if not available
  useEffect(() => {
    const getStatus = async () => {
      try {
        // Use the centralized fetch function
        const status = await fetchMarketStatus(marketId);
        if (status) {
          setMarketStatus(status);
        }
      } catch (error) {
        console.error('Failed to fetch market status:', error);
      }
    };

    getStatus();
  }, [marketId, fetchMarketStatus]);

  // Check if a specific bet type is allowed using utility function
  const checkBetTypeAllowed = (betType: 'open' | 'close'): boolean => {
    return isBetTypeAllowed(betType, marketStatus);
  };

  // Calculate total whenever amounts change
  useEffect(() => {
    const sum = Object.values(amounts).reduce((acc, val) => acc + val, 0);
    setTotal(sum);
  }, [amounts]);

  // Update selectedBetType when it changes
  useEffect(() => {
    if (selectedBetType) {
      // Reset digit inputs when bet type changes
      setAmounts({
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
      });
      setSelectedAmount(null);
    }
  }, [selectedBetType]);

  // Set default bet type when market status changes
  useEffect(() => {
    if (marketStatus) {
      // Only set default if no bet type is currently selected
      if (selectedBetType === null) {
        if (checkBetTypeAllowed('open')) {
          setSelectedBetType('open');
        } else if (checkBetTypeAllowed('close')) {
          setSelectedBetType('close');
        }
      } else {
        // If current bet type is no longer allowed, switch to an allowed one
        if (!checkBetTypeAllowed(selectedBetType)) {
          if (checkBetTypeAllowed('open')) {
            setSelectedBetType('open');
          } else if (checkBetTypeAllowed('close')) {
            setSelectedBetType('close');
          }
        }
      }
    }
  }, [marketStatus, checkBetTypeAllowed, selectedBetType]);

  // When an amount is selected, just set selectedAmount (do not clear digit inputs)
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // When a digit is clicked, if amount is selected, add that amount to the digit's value
  const handleDigitClick = (digit: number, isRightClick: boolean = false) => {
    if (selectedAmount === null) {
      showError('Amount Required', 'Please select an amount first.');
      return;
    }

    setAmounts(prev => ({
      ...prev,
      [digit]: isRightClick
        ? Math.max(0, prev[digit] - selectedAmount)
        : prev[digit] + selectedAmount
    }));
  };

  // Handle Even/Odd selection
  const handleEvenOddSelect = (type: 'even' | 'odd', isRightClick: boolean = false) => {
    if (selectedAmount === null) {
      showError('Amount Required', 'Please select an amount first.');
      return;
    }

    const newAmounts = { ...amounts };
    if (type === 'even') {
      // Set amount for even digits (0, 2, 4, 6, 8)
      [0, 2, 4, 6, 8].forEach(digit => {
        newAmounts[digit] = isRightClick
          ? Math.max(0, newAmounts[digit] - selectedAmount)
          : newAmounts[digit] + selectedAmount;
      });
    } else {
      // Set amount for odd digits (1, 3, 5, 7, 9)
      [1, 3, 5, 7, 9].forEach(digit => {
        newAmounts[digit] = isRightClick
          ? Math.max(0, newAmounts[digit] - selectedAmount)
          : newAmounts[digit] + selectedAmount;
      });
    }
    setAmounts(newAmounts);
  };

  // Handle right click events
  const handleRightClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  // Handle mobile long press for subtract functionality
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState<boolean>(false);

  const handleTouchStart = (action: () => void, subtractAction: () => void) => {
    const timer = setTimeout(() => {
      setIsLongPressing(true);
      subtractAction();
      showInfo('Long Press', 'Long press to subtract amount');
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleClick = (action: () => void) => {
    // Only execute if not a long press
    if (!isLongPressing) {
      action();
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  // Automatically determine the current bet type based on market status
  const getCurrentBetType = (): 'open' | 'close' | null => {
    if (!marketStatus) return null;

    if (marketStatus.status === 'open_betting') {
      return 'open'; // During open betting, default to open
    }
    if (marketStatus.status === 'close_betting') {
      return 'close';
    }
    return null;
  };

  // Check if betting is currently allowed using utility function
  const checkBettingAllowed = (): boolean => {
    return isBettingAllowed(marketStatus);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user has sufficient balance
    if (!user) {
      showError('Authentication Error', 'User not authenticated. Please login again.');
      return;
    }

    if (user.balance < total) {
      showError('Insufficient Balance', `You have ₹${user.balance.toLocaleString()} but need ₹${total.toLocaleString()}`);
      return;
    }

    if (total === 0) {
      showError('No Selection', 'Please select at least one number to bet on.');
      return;
    }

    // Frontend time validation
    if (!checkBettingAllowed()) {
      const statusMessage = marketStatus?.message || 'Betting is not allowed at this time';
      showError('Betting Not Allowed', statusMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine which bet types are available
      const canBetOpen = checkBetTypeAllowed('open');
      const canBetClose = checkBetTypeAllowed('close');

      if (!canBetOpen && !canBetClose) {
        showError('No Betting Available', 'No betting available at this time');
        return;
      }

      // Use the user's selected bet type
      if (!checkBetTypeAllowed(selectedBetType)) {
        showError('Betting Not Available', `${selectedBetType.toUpperCase()} betting is not available at this time`);
        return;
      }

      // Call the bet API
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'single',
        betType: selectedBetType,
        numbers: amounts,
        amount: total
      });

      if (response.success && response.data) {
        // Update user balance with the new balance from the response
        updateBalance(response.data.userAfterAmount);

        showSuccess('Bet Placed Successfully', `Amount: ₹${total.toLocaleString()}`);

        // Reset the form
        setAmounts({
          0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
        });
        setSelectedAmount(null);
      } else {
        showError('Bet Failed', response.message || 'Failed to place bet');
      }
    } catch (error: any) {
      console.error('Bet placement error:', error);
      showError('Bet Failed', error.message || 'Failed to place bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAmounts({
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    });
    setSelectedAmount(null);
    // Reset to default bet type based on current availability
    if (checkBetTypeAllowed('open')) {
      setSelectedBetType('open');
    } else if (checkBetTypeAllowed('close')) {
      setSelectedBetType('close');
    }
  };

  // Amount options for mapping
  const amountOptions = [5, 10, 50, 100, 200, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-1 sm:p-2">
      <div className="max-w-4xl mx-auto">
        {/* Game Type Navigation */}
        <GameTypeNavigation currentGameType="single" marketId={marketId} className="mb-2 sm:mb-4" />

        {/* Compact Header */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-2 sm:mb-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-base sm:text-lg font-bold text-gray-800">{marketName} {getGameTypeName(gameType)}</span>

              <div className="flex gap-1 sm:gap-2">
                {(() => {
                  const openAllowed = checkBetTypeAllowed('open');
                  const closeAllowed = checkBetTypeAllowed('close');
                  return (
                    <>
                      {openAllowed && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBetType('open');
                          }}
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
                          onClick={() => {
                            setSelectedBetType('close');
                          }}
                          className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-200 ${selectedBetType === 'close'
                            ? 'text-white bg-blue-600 shadow-md scale-105'
                            : 'text-blue-700 bg-blue-100 hover:bg-blue-200 hover:shadow-sm'
                            }`}
                        >
                          CLOSE
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

          </div>

        </div>

        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
            {/* Compact Amount Selection */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h2 className="text-sm sm:text-base font-bold text-gray-800">Select Amount</h2>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {amountOptions.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`relative group transition-all duration-200 rounded-xl p-1.5 sm:p-3 text-center font-bold ${selectedAmount === amt
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    onClick={() => handleAmountSelect(amt)}
                  >
                    <div className="text-xs sm:text-base font-bold">{amt}</div>
                    {selectedAmount === amt && (
                      <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-1 h-1 sm:w-2 sm:h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Total Display */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-3 sm:p-4 text-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs sm:text-sm opacity-90 mb-1">Total Amount</div>
                <div className="text-xl sm:text-2xl font-bold">₹{total.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Compact Digits Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h2 className="text-sm sm:text-base font-bold text-gray-800">Select Digits</h2>
              </div>

            </div>

            {/* Even/Odd Quick Selection */}
            <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
              <button
                type="button"
                onClick={() => handleClick(() => handleEvenOddSelect('even'))}
                onContextMenu={(e) => handleRightClick(e, () => handleEvenOddSelect('even', true))}
                onTouchStart={() => handleTouchStart(
                  () => handleEvenOddSelect('even'),
                  () => handleEvenOddSelect('even', true)
                )}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                disabled={selectedAmount === null || isSubmitting}
                title={`Click/Tap: Add ${selectedAmount || 0} to all even digits, Right click/Long press: Subtract ${selectedAmount || 0} from all even digits`}
                className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold py-1.5 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm shadow-md hover:shadow-lg"
              >
                Even (0,2,4,6,8)
              </button>
              <button
                type="button"
                onClick={() => handleClick(() => handleEvenOddSelect('odd'))}
                onContextMenu={(e) => handleRightClick(e, () => handleEvenOddSelect('odd', true))}
                onTouchStart={() => handleTouchStart(
                  () => handleEvenOddSelect('odd'),
                  () => handleEvenOddSelect('odd', true)
                )}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                disabled={selectedAmount === null || isSubmitting}
                title={`Click/Tap: Add ${selectedAmount || 0} to all odd digits, Right click/Long press: Subtract ${selectedAmount || 0} from all odd digits`}
                className="flex-1 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-semibold py-1.5 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm shadow-md hover:shadow-lg"
              >
                Odd (1,3,5,7,9)
              </button>
            </div>

            {/* Optimized Digits Grid - More compact for mobile */}
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-1.5 sm:gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="group">
                  <div className="text-center mb-1 sm:mb-2">
                    <span className="text-xs sm:text-sm font-bold text-gray-600">{i}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClick(() => handleDigitClick(i))}
                    onContextMenu={(e) => handleRightClick(e, () => handleDigitClick(i, true))}
                    onTouchStart={() => handleTouchStart(
                      () => handleDigitClick(i),
                      () => handleDigitClick(i, true)
                    )}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    disabled={selectedAmount === null || isSubmitting}
                    title={`Click/Tap: Add ${selectedAmount || 0}, Right click/Long press: Subtract ${selectedAmount || 0}`}
                    className={`w-full aspect-square rounded-xl border-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${amounts[i] && amounts[i] > 0
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-lg'
                      : selectedAmount === null
                        ? 'bg-gray-100 border-gray-200 text-gray-400'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                      } ${isLongPressing ? 'scale-95' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      {amounts[i] > 0 ? (
                        <span className="text-xs sm:text-sm font-bold">{amounts[i]}</span>
                      ) : (
                        <svg className="w-3 h-3 sm:w-5 sm:h-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-200 border border-gray-200 text-xs sm:text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </div>
            </button>

            <button
              type="submit"
              disabled={total === 0 || isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1.5 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Placing Bet...</span>
                    <span className="sm:hidden">Placing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SingleGame;
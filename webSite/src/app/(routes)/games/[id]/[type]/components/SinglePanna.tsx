"use client";
import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import { findValidNumbers } from '@/lib/utils';
import { singlePannaNumbers } from '@/app/constant/constant';
import React, { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import { isBetTypeAllowed, isBettingAllowed } from '@/lib/utils/marketUtils';
import GameTypeNavigation from '@/components/GameTypeNavigation';

interface SubRangeType {
  [key: string]: number[];
}

interface SinglePannaProps {
  marketId: string;
  marketName?: string;
  marketResult?: any;
  gameType: string;
}

const SinglePanna: React.FC<SinglePannaProps> = ({ marketId, marketName = 'Market', marketResult, gameType }) => {
  const { state: { user }, updateBalance } = useAuthContext();
  const { showError, showSuccess, showInfo } = useNotification();
  const { getMarketStatus, fetchMarketStatus } = useMarketData();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [marketStatus, setMarketStatus] = useState<any>(null);

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

  // Store each panna's value as a number (sum of all clicks/inputs)
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [selectedBetType, setSelectedBetType] = useState<'open' | 'close' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const subRanges: SubRangeType = {
    "0": [127, 136, 145, 190, 235, 280, 370, 389, 460, 479, 569, 578],
    "1": [128, 137, 146, 236, 245, 290, 380, 470, 489, 560, 579, 678],
    "2": [129, 138, 147, 156, 237, 246, 345, 390, 480, 570, 589, 679],
    "3": [120, 139, 148, 157, 238, 247, 256, 346, 490, 580, 670, 689],
    "4": [130, 149, 158, 167, 239, 248, 257, 347, 356, 590, 680, 789],
    "5": [140, 159, 168, 230, 249, 258, 267, 348, 357, 456, 690, 780],
    "6": [123, 150, 169, 178, 240, 259, 268, 349, 358, 367, 457, 790],
    "7": [124, 160, 170, 250, 269, 278, 340, 359, 368, 458, 467, 890],
    "8": [125, 134, 170, 189, 260, 279, 350, 369, 378, 459, 468, 567],
    "9": [126, 135, 180, 234, 270, 289, 360, 379, 450, 469, 478, 568],
  };

  // Calculate total whenever amounts change
  const total = Object.values(amounts).reduce((sum, val) => sum + val, 0);

  // Check if a specific bet type is allowed using utility function
  const checkBetTypeAllowed = (betType: 'open' | 'close'): boolean => {
    return isBetTypeAllowed(betType, marketStatus);
  };

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

  // Reset amounts and selectedAmount when selectedBetType changes
  useEffect(() => {
    setAmounts({});
    setSelectedAmount(null);
  }, [selectedBetType]);

  // Check if betting is currently allowed using utility function
  const checkBettingAllowed = (): boolean => {
    return isBettingAllowed(marketStatus);
  };

  // When an amount is selected, just set selectedAmount (do not clear inputs)
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // When a panna is clicked, if amount is selected, add that amount to the panna's value
  const handlePannaClick = (panna: number, isRightClick: boolean = false) => {
    if (selectedAmount === null) {
      showError('Amount Required', 'Please select an amount first.');
      return;
    }

    setAmounts(prev => ({
      ...prev,
      [panna]: isRightClick
        ? Math.max(0, (prev[panna] || 0) - selectedAmount)
        : (prev[panna] || 0) + selectedAmount
    }));
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
      showError('No Selection', 'Please select at least one panna to bet on.');
      return;
    }

    // Frontend time validation
    if (!checkBettingAllowed()) {
      const statusMessage = marketStatus?.message || 'Betting is not allowed at this time';
      showError('Betting Not Allowed', statusMessage);
      return;
    }

    // Use the user's selected bet type
    if (!checkBetTypeAllowed(selectedBetType!)) {
      showError('Betting Not Available', `${selectedBetType!.toUpperCase()} betting is not available at this time`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the bet API
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'single_panna',
        betType: selectedBetType!,
        numbers: amounts,
        amount: total
      });

      if (response.success && response.data) {
        // Update user balance with the new balance from the response
        updateBalance(response.data.userAfterAmount);

        showSuccess('Bet Placed Successfully', `Amount: ₹${total.toLocaleString()}`);

        // Reset the form
        setAmounts({});
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
    setAmounts({});
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

  // Helper function for game type display
  const getGameTypeName = (type: string): string => {
    const gameTypes: { [key: string]: string } = {
      'single': 'Single',
      'double': 'Double',
      'triple': 'Triple',
      'jodi': 'Jodi',
      'jodi-digits': 'Jodi Digits',
      'single-panna': 'Single Panna',
      'double-panna': 'Double Panna',
      'triple-panna': 'Triple Panna',
      'panel': 'Panel',
      'family-panel': 'Family Panel',
      'cycle-panna': 'Cycle Panna',
      'half-sangam': 'Half Sangam',
      'full-sangam': 'Full Sangam',
      'sp-dp-tp': 'SP/DP/TP',
      'motor': 'Motor'
    };
    return gameTypes[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2">
      <div className="max-w-4xl mx-auto">
        {/* Game Type Navigation */}
        <GameTypeNavigation currentGameType="single-panna" marketId={marketId} className="mb-2 sm:mb-4" />

        {/* Compact Header */}
        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 mb-2 sm:mb-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm sm:text-lg font-bold text-gray-800">{marketName} {getGameTypeName(gameType)}</span>

              <div className="flex gap-1 sm:gap-2">
                {checkBetTypeAllowed('open') && (
                  <button
                    type="button"
                    onClick={() => setSelectedBetType('open')}
                    className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-200 ${selectedBetType === 'open'
                      ? 'text-white bg-green-600 shadow-md scale-105'
                      : 'text-green-700 bg-green-100 hover:bg-green-200 hover:shadow-sm'
                      }`}
                  >
                    OPEN
                  </button>
                )}
                {checkBetTypeAllowed('close') && (
                  <button
                    type="button"
                    onClick={() => setSelectedBetType('close')}
                    className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-200 ${selectedBetType === 'close'
                      ? 'text-white bg-blue-600 shadow-md scale-105'
                      : 'text-blue-700 bg-blue-100 hover:bg-blue-200 hover:shadow-sm'
                      }`}
                  >
                    CLOSE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
            {/* Compact Amount Selection */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-2 sm:p-4 border border-gray-100">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                <h2 className="text-sm sm:text-base font-bold text-gray-800">Select Amount</h2>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
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
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-2 sm:p-4 text-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs sm:text-sm opacity-90 mb-0.5 sm:mb-1">Total Amount</div>
                <div className="text-lg sm:text-2xl font-bold">₹{total.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Compact Digit Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
              <h2 className="text-sm sm:text-base font-bold text-gray-800">Select Digit</h2>
            </div>

            {/* Optimized Digits Grid - More compact for mobile */}
            <div className="grid grid-cols-10 sm:grid-cols-10 lg:grid-cols-10 gap-1 sm:gap-2 lg:gap-3 mb-3 sm:mb-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="group">
                  <div className="text-center mb-0.5 sm:mb-1 lg:mb-2">
                    <span className="text-xs sm:text-sm font-bold text-gray-600">{i}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNumber(i)}
                    disabled={isSubmitting}
                    className={`w-full aspect-square rounded-xl border-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${selectedNumber === i
                      ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white border-purple-500 shadow-lg'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-xs sm:text-sm font-bold">{i}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Compact Panna Selection */}
            <div className="grid grid-cols-6 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-1 sm:gap-1.5 lg:gap-2">
              {subRanges[selectedNumber.toString()].map((panna) => (
                <div key={panna} className="group">
                  <div className="text-center mb-0.5 sm:mb-1">
                    <span className="text-xs font-bold text-gray-600">{panna}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClick(() => handlePannaClick(panna))}
                    onContextMenu={(e) => handleRightClick(e, () => handlePannaClick(panna, true))}
                    onTouchStart={() => handleTouchStart(
                      () => handlePannaClick(panna),
                      () => handlePannaClick(panna, true)
                    )}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    disabled={selectedAmount === null || isSubmitting}
                    title={`Click/Tap: Add ${selectedAmount || 0}, Right click/Long press: Subtract ${selectedAmount || 0}`}
                    className={`w-full aspect-square rounded-xl border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${amounts[panna] && amounts[panna] > 0
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-md'
                      : selectedAmount === null
                        ? 'bg-gray-100 border-gray-200 text-gray-400'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm'
                      } ${isLongPressing ? 'scale-95' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      {amounts[panna] > 0 ? (
                        <span className="text-xs font-bold">{amounts[panna]}</span>
                      ) : (
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
                    <svg className="animate-spin -ml-1 mr-1 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

export default SinglePanna;

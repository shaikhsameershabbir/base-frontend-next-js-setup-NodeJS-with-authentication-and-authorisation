"use client";
import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { useGameData } from '@/contexts/GameDataContext';
import { useNotification } from '@/contexts/NotificationContext';

interface SubRangeType {
  [key: string]: number[];
}

interface DoublePannaProps {
  marketId: string;
  marketName?: string;
}

const DoublePanna: React.FC<DoublePannaProps> = ({ marketId, marketName = 'Market' }) => {
  const { state: { user }, updateBalance } = useAuthContext();
  const { getCurrentTime, getMarketStatus, fetchMarketStatus } = useGameData();
  const { showError, showSuccess, showInfo } = useNotification();

  // Store each panna's value as a number (sum of all clicks/inputs)
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [selectedBetType, setSelectedBetType] = useState<'open' | 'close' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const subRanges: SubRangeType = {
    "0": [118, 226, 224, 299, 334, 488, 550, 668, 677],
    "1": [100, 119, 155, 227, 335, 344, 399, 588, 669],
    "2": [110, 200, 228, 255, 336, 499, 660, 688, 778],
    "3": [166, 229, 300, 337, 355, 445, 599, 779, 788],
    "4": [112, 220, 266, 338, 400, 446, 455, 699, 770],
    "5": [113, 122, 177, 339, 366, 447, 500, 799, 889],
    "6": [114, 177, 330, 448, 466, 556, 600, 880, 899],
    "7": [115, 133, 188, 223, 377, 449, 557, 566, 700],
    "8": [116, 224, 223, 288, 440, 477, 558, 800, 990],
    "9": [117, 144, 199, 255, 388, 559, 577, 667, 900],
  };

  // Check if a specific bet type is allowed
  const isBetTypeAllowed = (betType: 'open' | 'close'): boolean => {
    const marketStatusData = getMarketStatus(marketId);
    if (!marketStatusData) return false;

    if (betType === 'open') {
      // Open betting is only allowed during open_betting period
      return marketStatusData.status === 'open_betting';
    } else {
      // Close betting is allowed during both open_betting and close_betting periods
      return marketStatusData.status === 'open_betting' || marketStatusData.status === 'close_betting';
    }
  };

  // Calculate total whenever amounts change
  const total = Object.values(amounts).reduce((sum, val) => sum + val, 0);

  // Fetch market status when component mounts
  useEffect(() => {
    fetchMarketStatus(marketId);
  }, [marketId, fetchMarketStatus]);

  // Update selectedBetType when it changes
  useEffect(() => {
    if (selectedBetType) {
      // Reset digit inputs when bet type changes
      setAmounts({});
      setSelectedAmount(null);
    }
  }, [selectedBetType]);

  // Set default bet type when market status changes
  useEffect(() => {
    const marketStatusData = getMarketStatus(marketId);
    if (marketStatusData) {
      // Only set default if no bet type is currently selected
      if (selectedBetType === null) {
        if (isBetTypeAllowed('open')) {
          setSelectedBetType('open');
        } else if (isBetTypeAllowed('close')) {
          setSelectedBetType('close');
        }
      } else {
        // If current bet type is no longer allowed, switch to an allowed one
        if (!isBetTypeAllowed(selectedBetType)) {
          if (isBetTypeAllowed('open')) {
            setSelectedBetType('open');
          } else if (isBetTypeAllowed('close')) {
            setSelectedBetType('close');
          }
        }
      }
    }
  }, [marketId, getMarketStatus, isBetTypeAllowed, selectedBetType]);

  // Check if betting is currently allowed
  const isBettingAllowed = (): boolean => {
    return isBetTypeAllowed('open') || isBetTypeAllowed('close');
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
    if (!isBettingAllowed()) {
      const statusMessage = getMarketStatus(marketId)?.message || 'Betting is not allowed at this time';
      showError('Betting Not Allowed', statusMessage);
      return;
    }

    // Use the user's selected bet type
    if (!isBetTypeAllowed(selectedBetType!)) {
      showError('Betting Not Available', `${selectedBetType!.toUpperCase()} betting is not available at this time`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the bet API
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'double_panna',
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
    if (isBetTypeAllowed('open')) {
      setSelectedBetType('open');
    } else if (isBetTypeAllowed('close')) {
      setSelectedBetType('close');
    }
  };

  // Amount options for mapping
  const amountOptions = [5, 10, 50, 100, 200, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold text-gray-800">{marketName}</span>

              <div className="flex gap-2">
                {(() => {
                  const openAllowed = isBetTypeAllowed('open');
                  const closeAllowed = isBetTypeAllowed('close');
                  return (
                    <>
                      {openAllowed && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBetType('open');
                          }}
                          className={`text-xs font-semibold px-2 py-1 rounded-full transition-all duration-200 ${selectedBetType === 'open'
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
                          className={`text-xs font-semibold px-2 py-1 rounded-full transition-all duration-200 ${selectedBetType === 'close'
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Compact Amount Selection */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-800">Select Amount</h2>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {amountOptions.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`relative group transition-all duration-200 rounded-xl p-3 text-center font-bold ${selectedAmount === amt
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    onClick={() => handleAmountSelect(amt)}
                  >
                    <div className="text-base font-bold">{amt}</div>
                    {selectedAmount === amt && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Total Display */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-4 text-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm opacity-90 mb-1">Total Amount</div>
                <div className="text-2xl font-bold">₹{total.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Compact Digit Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h2 className="text-base font-bold text-gray-800">Select Digit</h2>
            </div>

            {/* Optimized Digits Grid - More compact for desktop */}
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-3 mb-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="group">
                  <div className="text-center mb-2">
                    <span className="text-sm font-bold text-gray-600">{i}</span>
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
                      <span className="text-sm font-bold">{i}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Compact Panna Selection */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
              {subRanges[selectedNumber.toString()].map((panna) => (
                <div key={panna} className="group">
                  <div className="text-center mb-1">
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
                    className={`w-full aspect-square rounded-md border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${amounts[panna] && amounts[panna] > 0
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
                        <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-gray-200 text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </div>
            </button>

            <button
              type="submit"
              disabled={total === 0 || isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <div className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Bet...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default DoublePanna;

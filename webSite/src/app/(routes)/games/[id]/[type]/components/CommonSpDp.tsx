"use client";
import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import { singlePannaNumbers, doublePannaNumbers } from '@/app/constant/constant';
import React, { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import { isBetTypeAllowed, isBettingAllowed } from '@/lib/utils/marketUtils';
import GameTypeNavigation from '@/components/GameTypeNavigation';

interface CommonSpDpProps {
  marketId: string;
  marketName?: string;
  gameType: string;
  marketResult?: any;
}

const CommonSpDp: React.FC<CommonSpDpProps> = ({ marketId, marketName = 'Market', gameType, marketResult }) => {
  const { state: { user }, updateBalance } = useAuthContext();
  const { showError, showSuccess, showInfo } = useNotification();
  const { getMarketStatus, fetchMarketStatus } = useMarketData();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [marketStatus, setMarketStatus] = useState<any>(null);

  // Store each panna's value as a number (sum of all clicks/inputs)
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({});
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<'open' | 'close' | null>(null);
  const [selectedGameMode, setSelectedGameMode] = useState<'SP' | 'DP' | 'SP-DP'>('SP');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [inputDigits, setInputDigits] = useState<string>('');
  const [validPannas, setValidPannas] = useState<string[]>([]);

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
        const status = await fetchMarketStatus(marketId);
        if (status) {
          setMarketStatus(status);
        }
      } catch (error) {
        // Error fetching market status
      }
    };
    getStatus();
  }, [marketId, fetchMarketStatus]);

  // Check if a specific bet type is allowed using utility function
  const checkBetTypeAllowed = (betType: 'open' | 'close'): boolean => {
    return isBetTypeAllowed(betType, marketStatus);
  };

  // Calculate total whenever amounts change
  const total = Object.values(amounts).reduce((sum, val) => sum + val, 0);

  // Update selectedBetType when it changes
  useEffect(() => {
    if (selectedBetType) {
      // Reset digit inputs when bet type changes
      setAmounts({});
      setSelectedAmount(null);
      setInputDigits('');
      setValidPannas([]);
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
  }, [marketStatus, isBetTypeAllowed, selectedBetType]);

  // Filter pannas based on input digits and game mode
  useEffect(() => {
    if (inputDigits && inputDigits.length > 0) {
      // Split input into individual digits and convert to strings
      const digits = inputDigits.split('').map(d => d.toString());
      let filteredPannas: string[] = [];

      if (selectedGameMode === 'SP') {
        // Filter single panna numbers that contain any of the input digits
        filteredPannas = singlePannaNumbers
          .filter(num => {
            const numStr = num.toString().padStart(3, '0');
            // Check if any of the input digits is present in the panna
            return digits.some(digit => numStr.includes(digit));
          })
          .map(num => num.toString().padStart(3, '0'));
      } else if (selectedGameMode === 'DP') {
        // Filter double panna numbers that contain any of the input digits
        filteredPannas = doublePannaNumbers
          .filter(num => {
            const numStr = num.toString().padStart(3, '0');
            // Check if any of the input digits is present in the panna
            return digits.some(digit => numStr.includes(digit));
          })
          .map(num => num.toString().padStart(3, '0'));
      } else if (selectedGameMode === 'SP-DP') {
        // Filter both single and double panna numbers that contain any of the input digits
        const spPannas = singlePannaNumbers
          .filter(num => {
            const numStr = num.toString().padStart(3, '0');
            // Check if any of the input digits is present in the panna
            return digits.some(digit => numStr.includes(digit));
          })
          .map(num => num.toString().padStart(3, '0'));

        const dpPannas = doublePannaNumbers
          .filter(num => {
            const numStr = num.toString().padStart(3, '0');
            // Check if any of the input digits is present in the panna
            return digits.some(digit => numStr.includes(digit));
          })
          .map(num => num.toString().padStart(3, '0'));

        filteredPannas = [...spPannas, ...dpPannas];
      }

      setValidPannas(filteredPannas);

      // Automatically place the selected amount on all valid pannas
      if (selectedAmount !== null) {
        const newAmounts: { [key: string]: number } = {};
        filteredPannas.forEach(panna => {
          newAmounts[panna] = selectedAmount;
        });
        setAmounts(newAmounts);
      } else {
        // Reset amounts for new pannas if no amount is selected
        const newAmounts: { [key: string]: number } = {};
        filteredPannas.forEach(panna => {
          newAmounts[panna] = 0;
        });
        setAmounts(newAmounts);
      }
    } else {
      setValidPannas([]);
      setAmounts({});
    }
  }, [inputDigits, selectedGameMode, selectedAmount]);

  // Check if betting is currently allowed using utility function
  const checkBettingAllowed = (): boolean => {
    return isBettingAllowed(marketStatus);
  };

  // When an amount is selected, just set selectedAmount (do not clear inputs)
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
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

    if (!inputDigits || inputDigits.length === 0) {
      showError('Invalid Input', 'Please enter digits to generate pannas.');
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
      // Determine game type based on selected mode
      let gameType: string;
      if (selectedGameMode === 'SP') {
        gameType = 'common_sp';
      } else if (selectedGameMode === 'DP') {
        gameType = 'common_dp';
      } else {
        gameType = 'common_sp_dp';
      }

      // Call the bet API
      const response = await betAPI.placeBet({
        marketId,
        gameType,
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
        setInputDigits('');
        setValidPannas([]);
      } else {
        showError('Bet Failed', response.message || 'Failed to place bet');
      }
    } catch (error: any) {
      // Bet placement error
      showError('Bet Failed', error.message || 'Failed to place bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAmounts({});
    setSelectedAmount(null);
    setInputDigits('');
    setValidPannas([]);
    // Reset to default bet type based on current availability
    if (checkBetTypeAllowed('open')) {
      setSelectedBetType('open');
    } else if (checkBetTypeAllowed('close')) {
      setSelectedBetType('close');
    }
  };

  // Amount options for mapping
  const amountOptions = [5, 10, 50, 100, 200, 500, 1000, 5000];

  // Helper function to get game type display name
  const getGameTypeName = (type: string): string => {
    switch (type) {
      case 'SP_DP':
        return 'SP/DP Common';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2">
      <div className="max-w-4xl mx-auto">
        {/* Game Type Navigation */}
        <GameTypeNavigation currentGameType="SP_DP" marketId={marketId} className="mb-2 sm:mb-4" />

        {/* Compact Header */}
        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 mb-2 sm:mb-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm sm:text-lg font-bold text-gray-800">{marketName} - {getGameTypeName(gameType)}</span>

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

          {/* Game Mode Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
              <h2 className="text-sm sm:text-base font-bold text-gray-800">Select Game Mode</h2>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(['SP', 'DP', 'SP-DP'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedGameMode(mode)}
                  className={`p-2 sm:p-3 rounded-xl font-semibold transition-all duration-200 ${selectedGameMode === mode
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-orange-300 hover:shadow-md'
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Input Digits Section */}
          <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
              <h2 className="text-sm sm:text-base font-bold text-gray-800">Enter Digits</h2>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={inputDigits}
                onChange={(e) => setInputDigits(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter digits (e.g., 12345)"
                className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-black text-sm sm:text-base"
                maxLength={10}
              />
              <div className="flex items-center">
                <span className="text-xs sm:text-sm text-gray-600">
                  {validPannas.length > 0 ? `${validPannas.length} pannas found` : 'Enter digits'}
                </span>
              </div>
            </div>
          </div>

          {/* Valid Pannas Display */}
          {validPannas.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 border border-gray-100">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                <h2 className="text-sm sm:text-base font-bold text-gray-800">Filtered Pannas (Auto-placed)</h2>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1 sm:gap-1.5 lg:gap-2">
                {validPannas.map((panna) => (
                  <div key={panna} className="group">
                    <div className="text-center mb-0.5 sm:mb-1">
                      <span className="text-xs font-bold text-gray-600">{panna}</span>
                    </div>
                    <div className={`w-full aspect-square rounded-xl border transition-all duration-200 ${amounts[panna] && amounts[panna] > 0
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-md'
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        {amounts[panna] > 0 ? (
                          <span className="text-xs font-bold">{amounts[panna]}</span>
                        ) : (
                          <span className="text-xs text-gray-400">₹0</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              disabled={total === 0 || isSubmitting || validPannas.length === 0}
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

export default CommonSpDp;
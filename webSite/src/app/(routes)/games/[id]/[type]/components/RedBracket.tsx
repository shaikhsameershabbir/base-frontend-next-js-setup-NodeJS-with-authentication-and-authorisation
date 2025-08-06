"use client";
import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useMarketData } from '@/contexts/MarketDataContext';

interface RedBracketProps {
  marketId: string;
  marketName?: string;
  marketResult?: any;
}

const RedBracket: React.FC<RedBracketProps> = ({ marketId, marketName = 'Market', marketResult }) => {
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

  // Core state from SingleGame
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<'both' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // RedBracket specific state
  const [selectedBracketType, setSelectedBracketType] = useState<'half' | 'full' | ''>('');
  const [bracketNumber, setBracketNumber] = useState<string>('');
  const [bracketNumbers, setBracketNumbers] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({});
  const [total, setTotal] = useState<number>(0);

  // Calculate total whenever amounts change
  useEffect(() => {
    const sum = Object.values(amounts).reduce((acc, val) => acc + val, 0);
    setTotal(sum);
  }, [amounts]);

  // Check if betting is allowed (only during open betting for RedBracket)
  const isBettingAllowed = (): boolean => {
    if (!marketStatus) return false;
    return marketStatus.status === 'open_betting';
  };

  // Set default bet type when market status changes
  useEffect(() => {
    if (marketStatus) {
      // Only set default if no bet type is currently selected
      if (selectedBetType === null) {
        // RedBracket game only allows 'both' betting type
        setSelectedBetType('both');
      } else {
        // If current bet type is no longer allowed, switch to an allowed one
        if (!isBettingAllowed()) {
          // RedBracket game only allows 'both' betting type
          setSelectedBetType('both');
        }
      }
    }
  }, [marketStatus, selectedBetType]);

  // Reset amounts and selectedAmount when selectedBetType changes
  useEffect(() => {
    setAmounts({});
    setSelectedAmount(null);
  }, [selectedBetType]);

  // Generate bracket numbers when type or number changes
  useEffect(() => {
    if (selectedBracketType === 'half' && bracketNumber) {
      const num = parseInt(bracketNumber);
      if (num >= 1 && num <= 9) {
        const numbers: string[] = [];
        for (let i = 1; i <= 9; i++) {
          const sum = i + num;
          if (sum <= 9) {
            // Create two numbers: first digit + sum, and sum + first digit
            const firstNum = parseInt(i.toString() + sum.toString());
            const secondNum = parseInt(sum.toString() + i.toString());
            numbers.push(firstNum.toString().padStart(2, '0'));
            numbers.push(secondNum.toString().padStart(2, '0'));
          }
        }
        setBracketNumbers(Array.from(new Set(numbers))); // Remove duplicates
      } else {
        setBracketNumbers([]);
      }
    } else if (selectedBracketType === 'full') {
      // Full bracket: 11, 22, 33, 44, 55, 66, 77, 88, 99
      setBracketNumbers(['11', '22', '33', '44', '55', '66', '77', '88', '99']);
    } else {
      setBracketNumbers([]);
    }
  }, [selectedBracketType, bracketNumber]);

  // Auto-place amount on all bracket numbers when amount is selected
  useEffect(() => {
    if (selectedAmount !== null && bracketNumbers.length > 0) {
      const newAmounts: { [key: string]: number } = {};
      bracketNumbers.forEach(num => {
        newAmounts[num] = selectedAmount;
      });
      setAmounts(newAmounts);
    } else if (selectedAmount === null) {
      setAmounts({});
    }
  }, [selectedAmount, bracketNumbers]);

  // When an amount is selected
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // Handle bracket number input
  const handleBracketNumberChange = (value: string) => {
    const num = parseInt(value);
    if (value === '' || (num >= 1 && num <= 9)) {
      setBracketNumber(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showError('Authentication Error', 'User not authenticated. Please login again.');
      return;
    }

    if (!selectedBracketType) {
      showError('Selection Required', 'Please select a bracket type.');
      return;
    }

    if (selectedBracketType === 'half' && !bracketNumber) {
      showError('Input Required', 'Please enter a bracket number (1-9).');
      return;
    }

    if (user.balance < total) {
      showError('Insufficient Balance', `You have ₹${user.balance.toLocaleString()} but need ₹${total.toLocaleString()}`);
      return;
    }

    if (total === 0) {
      showError('No Selection', 'Please select an amount to bet.');
      return;
    }

    if (!isBettingAllowed()) {
      const statusMessage = marketStatus?.message || 'Betting is not allowed at this time';
      showError('Betting Not Allowed', statusMessage);
      return;
    }

    // RedBracket game only allows betting during open betting period
    if (!isBettingAllowed()) {
      showError('Betting Not Available', 'RedBracket betting is only available during open betting period');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the bet API - RedBracket game always sends 'both' as bet type
      const response = await betAPI.placeBet({
        marketId,
        gameType: selectedBracketType === 'half' ? 'half_bracket' : 'full_bracket',
        betType: 'both',
        numbers: amounts,
        amount: total
      });

      if (response.success && response.data) {
        updateBalance(response.data.userAfterAmount);
        showSuccess('Bet Placed Successfully', `Amount: ₹${total.toLocaleString()}`);

        // Reset the form
        setSelectedBracketType('');
        setBracketNumber('');
        setBracketNumbers([]);
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
    setSelectedBracketType('');
    setBracketNumber('');
    setBracketNumbers([]);
    setAmounts({});
    setSelectedAmount(null);
    // RedBracket game always uses 'both' bet type
    setSelectedBetType('both');
  };

  // Amount options
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
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-600 text-white shadow-md">
                  BOTH
                </span>
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

          {/* Bracket Type Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h2 className="text-base font-bold text-gray-800">Select Bracket Type</h2>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center py-3 rounded-lg border transition-all font-semibold text-lg
                  ${selectedBracketType === 'half'
                    ? "bg-gradient-to-br from-purple-400 to-purple-600 text-white border-purple-500 shadow-lg"
                    : "bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                  }`}
                onClick={() => setSelectedBracketType('half')}
              >
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="9" stroke={selectedBracketType === 'half' ? "#fff" : "#8B5CF6"} strokeWidth="2" fill={selectedBracketType === 'half' ? "#fff" : "none"} />
                    {selectedBracketType === 'half' && (
                      <circle cx="10" cy="10" r="5" fill="#8B5CF6" />
                    )}
                  </svg>
                </span>
                Half Bracket
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center py-3 rounded-lg border transition-all font-semibold text-lg
                  ${selectedBracketType === 'full'
                    ? "bg-gradient-to-br from-purple-400 to-purple-600 text-white border-purple-500 shadow-lg"
                    : "bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md"
                  }`}
                onClick={() => setSelectedBracketType('full')}
              >
                <span className="mr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="9" stroke={selectedBracketType === 'full' ? "#fff" : "#8B5CF6"} strokeWidth="2" fill={selectedBracketType === 'full' ? "#fff" : "none"} />
                    {selectedBracketType === 'full' && (
                      <circle cx="10" cy="10" r="5" fill="#8B5CF6" />
                    )}
                  </svg>
                </span>
                Full Bracket
              </button>
            </div>

            {/* Bracket Number Input for Half Bracket */}
            {selectedBracketType === 'half' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Bracket Number (1-9)
                </label>
                <input
                  type="number"
                  value={bracketNumber}
                  onChange={(e) => handleBracketNumberChange(e.target.value)}
                  min="1"
                  max="9"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  placeholder="Enter number 1-9"
                />
                {bracketNumber && (
                  <div className="mt-2 text-sm text-gray-600">
                    Example: If you enter {bracketNumber}, numbers will be generated like:
                    {Array.from({ length: Math.min(3, 9) }, (_, i) => {
                      const num = i + 1;
                      const sum = num + parseInt(bracketNumber);
                      if (sum <= 9) {
                        return ` ${num}${sum} and ${sum}${num}`;
                      }
                      return '';
                    }).filter(Boolean).join(',')}...
                  </div>
                )}
              </div>
            )}

            {/* Generated Numbers Display */}
            {bracketNumbers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generated Numbers ({bracketNumbers.length} numbers)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                  {bracketNumbers.map((num, index) => (
                    <div key={index} className="group">
                      <div className="text-center mb-1">
                        <span className="text-xs font-bold text-gray-600">{num}</span>
                      </div>
                      <div className="w-full aspect-square rounded-md border bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-md flex items-center justify-center">
                        <span className="text-xs font-bold">{selectedAmount || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              disabled={total === 0 || isSubmitting || !selectedBracketType || (selectedBracketType === 'half' && !bracketNumber)}
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

export default RedBracket;
"use client";
import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { singlePannaNumbers, doublePannaNumbers, triplePannaNumbers } from '@/app/constant/constant';
import { useGameData } from '@/contexts/GameDataContext';
import { useNotification } from '@/contexts/NotificationContext';

interface SangamGameProps {
  marketId: string;
  marketName?: string;
}

type SangamType = 'half_open' | 'half_close' | 'full';

const SangamGame: React.FC<SangamGameProps> = ({ marketId, marketName = 'Market' }) => {
  const { state: { user }, updateBalance } = useAuthContext();
  const { getCurrentTime, getMarketStatus, fetchMarketStatus } = useGameData();
  const { showError, showSuccess, showInfo } = useNotification();

  // Core state from SinglePanna
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<'both'>('both');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // SangamGame specific state
  const [selectedSangamType, setSelectedSangamType] = useState<SangamType>('half_open');
  const [pannaInput, setPannaInput] = useState<string>('');
  const [digitInput, setDigitInput] = useState<string>('');
  const [secondPannaInput, setSecondPannaInput] = useState<string>('');
  const [filteredPannas, setFilteredPannas] = useState<number[]>([]);
  const [filteredSecondPannas, setFilteredSecondPannas] = useState<number[]>([]);
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({});
  const [total, setTotal] = useState<number>(0);

  // Calculate total whenever amounts change
  useEffect(() => {
    const sum = Object.values(amounts).reduce((acc, val) => acc + val, 0);
    setTotal(sum);
  }, [amounts]);

  // Fetch market status when component mounts
  useEffect(() => {
    fetchMarketStatus(marketId);
  }, [marketId, fetchMarketStatus]);

  // Set default bet type when market status changes
  useEffect(() => {
    const marketStatusData = getMarketStatus(marketId);
    if (marketStatusData) {
      // SangamGame only allows 'both' betting type
      setSelectedBetType('both');
    }
  }, [marketId, getMarketStatus]);

  // Filter panna numbers based on input
  useEffect(() => {
    if (pannaInput && pannaInput.length > 0) {
      const inputStr = pannaInput.toString();
      const allPannas = [...singlePannaNumbers, ...doublePannaNumbers, ...triplePannaNumbers];

      const filtered = allPannas.filter(panna => {
        const pannaStr = panna.toString().padStart(3, '0');
        return pannaStr.startsWith(inputStr);
      });

      setFilteredPannas(filtered);
    } else {
      setFilteredPannas([]);
    }
  }, [pannaInput]);

  // Filter second panna numbers for full sangam
  useEffect(() => {
    if (secondPannaInput && secondPannaInput.length > 0) {
      const inputStr = secondPannaInput.toString();
      const allPannas = [...singlePannaNumbers, ...doublePannaNumbers, ...triplePannaNumbers];

      const filtered = allPannas.filter(panna => {
        const pannaStr = panna.toString().padStart(3, '0');
        return pannaStr.startsWith(inputStr);
      });

      setFilteredSecondPannas(filtered);
    } else {
      setFilteredSecondPannas([]);
    }
  }, [secondPannaInput]);

  // Calculate sum of digits for full sangam
  const calculateDigitSum = (number: number): number => {
    return number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  };

  // Get last digit of sum
  const getLastDigit = (sum: number): number => {
    return sum % 10;
  };

  // When an amount is selected, just set selectedAmount (do not clear inputs)
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  const handlePannaInputChange = (value: string) => {
    setPannaInput(value);
  };

  const handleSecondPannaInputChange = (value: string) => {
    setSecondPannaInput(value);
  };

  const handleDigitInputChange = (value: string) => {
    setDigitInput(value);
  };

  const handlePannaSelect = (panna: number) => {
    if (selectedAmount === null) {
      showError('Amount Required', 'Please select an amount first.');
      return;
    }

    const sangamKey = `${panna}_${selectedSangamType}`;
    setAmounts(prev => ({
      ...prev,
      [sangamKey]: (prev[sangamKey] || 0) + selectedAmount
    }));
  };

  const handleFirstPannaSelect = (panna: number) => {
    if (selectedAmount === null) {
      showError('Amount Required', 'Please select an amount first.');
      return;
    }

    const sangamKey = `${panna}_${selectedSangamType}`;
    setAmounts(prev => ({
      ...prev,
      [sangamKey]: (prev[sangamKey] || 0) + selectedAmount
    }));
  };

  const handleSecondPannaSelect = (panna: number) => {
    if (selectedAmount === null) {
      showError('Amount Required', 'Please select an amount first.');
      return;
    }

    const sangamKey = `${panna}_${selectedSangamType}`;
    setAmounts(prev => ({
      ...prev,
      [sangamKey]: (prev[sangamKey] || 0) + selectedAmount
    }));
  };

  const handleFullSangamSelect = (firstPanna: number, secondPanna: number) => {
    if (selectedAmount === null) {
      showError('Amount Required', 'Please select an amount first.');
      return;
    }

    const sum = calculateDigitSum(firstPanna + secondPanna);
    const lastDigit = getLastDigit(sum);
    const sangamKey = `${firstPanna}_${secondPanna}_${lastDigit}_full`;
    setAmounts(prev => ({
      ...prev,
      [sangamKey]: (prev[sangamKey] || 0) + selectedAmount
    }));
  };

  const handleSangamClick = (sangamKey: string, isRightClick: boolean = false) => {
    if (selectedAmount === null) {
      showError('Amount Required', 'Please select an amount first.');
      return;
    }

    setAmounts(prev => ({
      ...prev,
      [sangamKey]: isRightClick
        ? Math.max(0, (prev[sangamKey] || 0) - selectedAmount)
        : (prev[sangamKey] || 0) + selectedAmount
    }));
  };

  // Handle right click events
  const handleRightClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  // Check if betting is allowed (only during open betting for Sangam)
  const isBettingAllowed = (): boolean => {
    const marketStatusData = getMarketStatus(marketId);
    if (!marketStatusData) return false;
    return marketStatusData.status === 'open_betting';
  };

  // Check if sangam game is allowed (only before open time closes)
  const isSangamAllowed = (): boolean => {
    return isBettingAllowed();
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
      showError('No Selection', 'Please select at least one sangam to bet on.');
      return;
    }

    // Frontend time validation
    if (!isBettingAllowed()) {
      const marketStatusData = getMarketStatus(marketId);
      const statusMessage = marketStatusData?.message || 'Betting is not allowed at this time';
      showError('Betting Not Allowed', statusMessage);
      return;
    }

    // Check if sangam is allowed
    if (!isSangamAllowed()) {
      showError('Sangam Not Available', 'Sangam betting is not available at this time');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the bet API
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'sangam',
        betType: selectedBetType,
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
        setPannaInput('');
        setDigitInput('');
        setSecondPannaInput('');
        setFilteredPannas([]);
        setFilteredSecondPannas([]);
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
    setPannaInput('');
    setDigitInput('');
    setSecondPannaInput('');
    setFilteredPannas([]);
    setFilteredSecondPannas([]);
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
                <button
                  type="button"
                  className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-600 text-white shadow-md"
                >
                  SANGAM
                </button>
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

          {/* Sangam Type Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <h2 className="text-base font-bold text-gray-800">Select Sangam Type</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(['half_open', 'half_close', 'full'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedSangamType(type)}
                  className={`p-3 rounded-xl font-semibold transition-all duration-200 ${selectedSangamType === type
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-orange-300 hover:shadow-md'
                    }`}
                >
                  {type.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Input Sections based on Sangam Type */}
          {selectedSangamType === 'half_open' && (
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-800">Half Open Sangam</h2>
              </div>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={pannaInput}
                  onChange={(e) => handlePannaInputChange(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter panna (e.g., 123)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                  maxLength={3}
                />
                <input
                  type="text"
                  value={digitInput}
                  onChange={(e) => handleDigitInputChange(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter digit (0-9)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                  maxLength={1}
                />
              </div>

              {/* Filtered Pannas Display */}
              {filteredPannas.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                  {filteredPannas.map((panna) => (
                    <div key={panna} className="group">
                      <div className="text-center mb-1">
                        <span className="text-xs font-bold text-gray-600">{panna}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePannaSelect(panna)}
                        disabled={selectedAmount === null || isSubmitting}
                        className={`w-full aspect-square rounded-md border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${amounts[`${panna}_${selectedSangamType}`] && amounts[`${panna}_${selectedSangamType}`] > 0
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-md'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          {amounts[`${panna}_${selectedSangamType}`] > 0 ? (
                            <span className="text-xs font-bold">{amounts[`${panna}_${selectedSangamType}`]}</span>
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
              )}
            </div>
          )}

          {selectedSangamType === 'half_close' && (
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-800">Half Close Sangam</h2>
              </div>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={pannaInput}
                  onChange={(e) => handlePannaInputChange(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter panna (e.g., 123)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                  maxLength={3}
                />
                <input
                  type="text"
                  value={digitInput}
                  onChange={(e) => handleDigitInputChange(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter digit (0-9)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                  maxLength={1}
                />
              </div>

              {/* Filtered Pannas Display */}
              {filteredPannas.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                  {filteredPannas.map((panna) => (
                    <div key={panna} className="group">
                      <div className="text-center mb-1">
                        <span className="text-xs font-bold text-gray-600">{panna}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePannaSelect(panna)}
                        disabled={selectedAmount === null || isSubmitting}
                        className={`w-full aspect-square rounded-md border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${amounts[`${panna}_${selectedSangamType}`] && amounts[`${panna}_${selectedSangamType}`] > 0
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-md'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          {amounts[`${panna}_${selectedSangamType}`] > 0 ? (
                            <span className="text-xs font-bold">{amounts[`${panna}_${selectedSangamType}`]}</span>
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
              )}
            </div>
          )}

          {selectedSangamType === 'full' && (
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-800">Full Sangam</h2>
              </div>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={pannaInput}
                  onChange={(e) => handlePannaInputChange(e.target.value.replace(/\D/g, ''))}
                  placeholder="First panna (e.g., 123)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                  maxLength={3}
                />
                <input
                  type="text"
                  value={secondPannaInput}
                  onChange={(e) => handleSecondPannaInputChange(e.target.value.replace(/\D/g, ''))}
                  placeholder="Second panna (e.g., 456)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                  maxLength={3}
                />
              </div>

              {/* Full Sangam Combinations */}
              {filteredPannas.length > 0 && filteredSecondPannas.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                  {filteredPannas.map((firstPanna) =>
                    filteredSecondPannas.map((secondPanna) => {
                      const sum = calculateDigitSum(firstPanna + secondPanna);
                      const lastDigit = getLastDigit(sum);
                      const sangamKey = `${firstPanna}_${secondPanna}_${lastDigit}_full`;
                      return (
                        <div key={sangamKey} className="group">
                          <div className="text-center mb-1">
                            <span className="text-xs font-bold text-gray-600">{firstPanna}+{secondPanna}={lastDigit}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFullSangamSelect(firstPanna, secondPanna)}
                            disabled={selectedAmount === null || isSubmitting}
                            className={`w-full aspect-square rounded-md border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${amounts[sangamKey] && amounts[sangamKey] > 0
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-md'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50 hover:shadow-sm'
                              }`}
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              {amounts[sangamKey] > 0 ? (
                                <span className="text-xs font-bold">{amounts[sangamKey]}</span>
                              ) : (
                                <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

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

export default SangamGame;
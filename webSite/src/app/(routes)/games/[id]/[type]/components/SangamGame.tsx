"use client";
import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { singlePannaNumbers, doublePannaNumbers, triplePannaNumbers } from '@/app/constant/constant';

interface SangamGameProps {
  marketId: string;
  marketName?: string;
}

type SangamType = 'half_open' | 'half_close' | 'full';

const SangamGame: React.FC<SangamGameProps> = ({ marketId, marketName = 'Market' }) => {
  const { state: { user }, updateBalance } = useAuthContext();

  // Core state from SinglePanna
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<'open' | 'close'>('open');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

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

  // Fetch market status and current time
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const [timeResponse, statusResponse] = await Promise.all([
          betAPI.getCurrentTime(),
          betAPI.getMarketStatus(marketId)
        ]);

        if (timeResponse.success) {
          setCurrentTime(timeResponse.data.formattedTime);
        }

        if (statusResponse.success) {
          setMarketStatus(statusResponse.data);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();

    // Update time every minute
    const timeInterval = setInterval(() => {
      betAPI.getCurrentTime().then(response => {
        if (response.success) {
          setCurrentTime(response.data.formattedTime);
        }
      }).catch(console.error);
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [marketId]);

  // Set default bet type when market status changes
  useEffect(() => {
    if (marketStatus) {
      if (isBetTypeAllowed('open')) {
        setSelectedBetType('open');
      } else if (isBetTypeAllowed('close')) {
        setSelectedBetType('close');
      }
    }
  }, [marketStatus]);

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

  // When an amount is selected
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // Handle panna input change
  const handlePannaInputChange = (value: string) => {
    // Only allow numbers and limit to 3 digits
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 3) {
      setPannaInput(numericValue);
    }
  };

  // Handle second panna input change for full sangam
  const handleSecondPannaInputChange = (value: string) => {
    // Only allow numbers and limit to 3 digits
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 3) {
      setSecondPannaInput(numericValue);
    }
  };

  // Handle digit input change
  const handleDigitInputChange = (value: string) => {
    // Only allow single digit 0-9
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 1) {
      setDigitInput(numericValue);
    }
  };

  // Handle panna selection for half sangam
  const handlePannaSelect = (panna: number) => {
    if (selectedSangamType === 'half_open') {
      if (!digitInput) {
        toast.error('Please enter a digit (0-9) first');
        return;
      }
    } else if (selectedSangamType === 'half_close') {
      if (!digitInput) {
        toast.error('Please enter a digit (0-9) first');
        return;
      }
    }

    if (selectedAmount === null) {
      toast.error('Please select an amount first');
      return;
    }

    let sangamKey = '';
    if (selectedSangamType === 'half_open') {
      sangamKey = `${panna}X${digitInput}`;
    } else if (selectedSangamType === 'half_close') {
      sangamKey = `${digitInput}X${panna}`;
    }

    setAmounts(prev => ({
      ...prev,
      [sangamKey]: (prev[sangamKey] || 0) + selectedAmount
    }));
  };

  // Handle first panna selection for full sangam
  const handleFirstPannaSelect = (panna: number) => {
    setPannaInput(panna.toString());
  };

  // Handle second panna selection for full sangam
  const handleSecondPannaSelect = (panna: number) => {
    setSecondPannaInput(panna.toString());
  };

  // Handle full sangam selection
  const handleFullSangamSelect = (firstPanna: number, secondPanna: number) => {
    if (selectedAmount === null) {
      toast.error('Please select an amount first');
      return;
    }

    const firstSum = calculateDigitSum(firstPanna);
    const secondSum = calculateDigitSum(secondPanna);
    const firstLastDigit = getLastDigit(firstSum);
    const secondLastDigit = getLastDigit(secondSum);

    const sangamKey = `${firstPanna}-${firstLastDigit}${secondLastDigit}-${secondPanna}`;

    setAmounts(prev => ({
      ...prev,
      [sangamKey]: (prev[sangamKey] || 0) + selectedAmount
    }));
  };

  // Handle sangam bet click (add/subtract amount)
  const handleSangamClick = (sangamKey: string, isRightClick: boolean = false) => {
    if (selectedAmount === null) {
      toast.error('Please select an amount first.');
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

  // Check if a specific bet type is allowed
  const isBetTypeAllowed = (betType: 'open' | 'close'): boolean => {
    if (!marketStatus) return false;

    if (betType === 'open') {
      return marketStatus.status === 'open_betting';
    } else {
      return marketStatus.status === 'open_betting' || marketStatus.status === 'close_betting';
    }
  };

  // Check if betting is currently allowed
  const isBettingAllowed = (): boolean => {
    return isBetTypeAllowed('open') || isBetTypeAllowed('close');
  };

  // Check if sangam game is allowed (only before open time closes)
  const isSangamAllowed = (): boolean => {
    return marketStatus?.status === 'open_betting';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('User not authenticated. Please login again.');
      return;
    }

    if (!isSangamAllowed()) {
      toast.error('Sangam game can only be played before open time closes.');
      return;
    }

    if (user.balance < total) {
      toast.error(`Insufficient balance. You have ₹${user.balance.toLocaleString()} but need ₹${total.toLocaleString()}`);
      return;
    }

    if (total === 0) {
      toast.error('Please place at least one bet.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'sangam',
        betType: 'open', // Sangam is always open betting
        numbers: amounts,
        amount: total
      });

      if (response.success && response.data) {
        updateBalance(response.data.userAfterAmount);
        toast.success(`Sangam bet placed successfully! Amount: ₹${total.toLocaleString()}`);

        // Reset the form
        setPannaInput('');
        setDigitInput('');
        setSecondPannaInput('');
        setFilteredPannas([]);
        setFilteredSecondPannas([]);
        setAmounts({});
        setSelectedAmount(null);
      } else {
        toast.error(response.message || 'Failed to place bet');
      }
    } catch (error: any) {
      console.error('Bet placement error:', error);
      toast.error(error.message || 'Failed to place bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPannaInput('');
    setDigitInput('');
    setSecondPannaInput('');
    setFilteredPannas([]);
    setFilteredSecondPannas([]);
    setAmounts({});
    setSelectedAmount(null);
  };

  // Amount options
  const amountOptions = [5, 10, 50, 100, 200, 500, 1000, 5000];

  // Get all sangam bets for display
  const sangamBets = Object.entries(amounts).filter(([_, amount]) => amount > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${isSangamAllowed() ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-lg font-bold text-gray-800">{marketName}</span>

              <div className="flex gap-2">
                {isSangamAllowed() ? (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full text-green-700 bg-green-100">
                    SANGAM OPEN
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full text-red-700 bg-red-100">
                    SANGAM CLOSED
                  </span>
                )}
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
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h2 className="text-base font-bold text-gray-800">Select Sangam Type</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedSangamType('half_open');
                  setPannaInput('');
                  setDigitInput('');
                  setSecondPannaInput('');
                  setFilteredPannas([]);
                  setFilteredSecondPannas([]);
                }}
                className={`p-3 rounded-xl border-2 transition-all duration-200 font-semibold ${selectedSangamType === 'half_open'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                  }`}
              >
                <div className="text-sm font-bold">Half Sangam Open</div>
                <div className="text-xs opacity-75">123X6</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSangamType('half_close');
                  setPannaInput('');
                  setDigitInput('');
                  setSecondPannaInput('');
                  setFilteredPannas([]);
                  setFilteredSecondPannas([]);
                }}
                className={`p-3 rounded-xl border-2 transition-all duration-200 font-semibold ${selectedSangamType === 'half_close'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  }`}
              >
                <div className="text-sm font-bold">Half Sangam Close</div>
                <div className="text-xs opacity-75">4X123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSangamType('full');
                  setPannaInput('');
                  setDigitInput('');
                  setSecondPannaInput('');
                  setFilteredPannas([]);
                  setFilteredSecondPannas([]);
                }}
                className={`p-3 rounded-xl border-2 transition-all duration-200 font-semibold ${selectedSangamType === 'full'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
                  }`}
              >
                <div className="text-sm font-bold">Full Sangam</div>
                <div className="text-xs opacity-75">123-64-112</div>
              </button>
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h2 className="text-base font-bold text-gray-800">Sangam Input</h2>
            </div>

            {selectedSangamType === 'full' ? (
              // Full Sangam - Two panna inputs
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Panna (3 digits)
          </label>
          <input
            type="text"
                    value={pannaInput}
                    onChange={(e) => handlePannaInputChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    placeholder="Enter 3 digits (e.g., 123)"
                    maxLength={3}
          />
        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Second Panna (3 digits)
                  </label>
                  <input
                    type="text"
                    value={secondPannaInput}
                    onChange={(e) => handleSecondPannaInputChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    placeholder="Enter 3 digits (e.g., 112)"
                    maxLength={3}
                  />
                </div>
              </div>
            ) : (
              // Half Sangam - Panna and digit inputs
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {selectedSangamType === 'half_close' ? (
                  // Half Sangam Close - Digit first, then Panna
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Digit (0-9)
          </label>
          <input
            type="text"
                        value={digitInput}
                        onChange={(e) => handleDigitInputChange(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        placeholder="Enter digit 0-9"
                        maxLength={1}
          />
        </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Panna (3 digits)
                      </label>
                      <input
                        type="text"
                        value={pannaInput}
                        onChange={(e) => handlePannaInputChange(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        placeholder="Enter 3 digits (e.g., 123)"
                        maxLength={3}
                      />
                    </div>
                  </>
                ) : (
                  // Half Sangam Open - Panna first, then Digit
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Panna (3 digits)
          </label>
          <input
                        type="text"
                        value={pannaInput}
                        onChange={(e) => handlePannaInputChange(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        placeholder="Enter 3 digits (e.g., 123)"
                        maxLength={3}
          />
        </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Digit (0-9)
                      </label>
                      <input
                        type="text"
                        value={digitInput}
                        onChange={(e) => handleDigitInputChange(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        placeholder="Enter digit 0-9"
                        maxLength={1}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Filtered Panna Options */}
            {pannaInput && filteredPannas.length > 0 && selectedSangamType !== 'full' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Pannas ({filteredPannas.length} found)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                  {filteredPannas.map((panna) => (
                    <button
                      key={panna}
                      type="button"
                      onClick={() => handlePannaSelect(panna)}
                      disabled={!digitInput || selectedAmount === null || !isSangamAllowed()}
                      className="w-full aspect-square rounded-md border bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-xs font-bold">{panna}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* First Panna Suggestions for Full Sangam */}
            {selectedSangamType === 'full' && pannaInput && filteredPannas.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Panna Suggestions ({filteredPannas.length} found)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                  {filteredPannas.map((panna) => (
        <button
                      key={panna}
                      type="button"
                      onClick={() => handleFirstPannaSelect(panna)}
                      className="w-full aspect-square rounded-md border bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-xs font-bold">{panna}</span>
                      </div>
        </button>
                  ))}
                </div>
              </div>
            )}

            {/* Second Panna Suggestions for Full Sangam */}
            {selectedSangamType === 'full' && secondPannaInput && filteredSecondPannas.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Second Panna Suggestions ({filteredSecondPannas.length} found)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                  {filteredSecondPannas.map((panna) => (
                    <button
                      key={panna}
                      type="button"
                      onClick={() => handleSecondPannaSelect(panna)}
                      className="w-full aspect-square rounded-md border bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-xs font-bold">{panna}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full Sangam Panna Options */}
            {selectedSangamType === 'full' && pannaInput && secondPannaInput && filteredPannas.length > 0 && filteredSecondPannas.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Sangam Combinations
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredPannas.slice(0, 3).map((firstPanna) =>
                    filteredSecondPannas.slice(0, 3).map((secondPanna) => {
                      const firstSum = calculateDigitSum(firstPanna);
                      const secondSum = calculateDigitSum(secondPanna);
                      const firstLastDigit = getLastDigit(firstSum);
                      const secondLastDigit = getLastDigit(secondSum);
                      const sangamKey = `${firstPanna}-${firstLastDigit}${secondLastDigit}-${secondPanna}`;

                      return (
                        <button
                          key={`${firstPanna}-${secondPanna}`}
                          type="button"
                          onClick={() => handleFullSangamSelect(firstPanna, secondPanna)}
                          disabled={selectedAmount === null || !isSangamAllowed()}
                          className="p-3 rounded-lg border bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <div className="text-sm font-bold">{sangamKey}</div>
                          <div className="text-xs text-gray-500">
                            {firstPanna}({firstSum}) + {secondPanna}({secondSum})
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected Sangam Bets */}
          {sangamBets.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-800">Selected Sangam Bets ({sangamBets.length})</h2>
      </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {sangamBets.map(([sangamKey, amount]) => (
                  <button
                    key={sangamKey}
                    type="button"
                    onClick={() => handleSangamClick(sangamKey)}
                    onContextMenu={(e) => handleRightClick(e, () => handleSangamClick(sangamKey, true))}
                    disabled={selectedAmount === null || !isSangamAllowed()}
                    className="relative group transition-all duration-200 rounded-lg p-3 text-center font-bold bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-sm font-bold">{sangamKey}</div>
                    <div className="text-xs opacity-90">₹{amount}</div>
                  </button>
                ))}
              </div>
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
              disabled={total === 0 || isSubmitting || !isSangamAllowed()}
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default SangamGame;
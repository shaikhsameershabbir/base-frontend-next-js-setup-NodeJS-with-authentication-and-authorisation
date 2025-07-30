"use client";
import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { family } from '@/app/constant/constant';
import { useGameData } from '@/contexts/GameDataContext';

interface FamilyPanelProps {
  marketId: string;
  marketName?: string;
}

const FamilyPanel: React.FC<FamilyPanelProps> = ({ marketId, marketName = 'Market' }) => {
  const { state: { user }, updateBalance } = useAuthContext();
  const { getCurrentTime, getMarketStatus, fetchMarketStatus } = useGameData();

  // Core state from SinglePanna
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<'both'>('both');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);



  // FamilyPanel specific state
  const [inputNumber, setInputNumber] = useState<string>('');
  const [familyNumbers, setFamilyNumbers] = useState<number[]>([]);
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});
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
      // FamilyPanel game only allows 'both' betting type
      setSelectedBetType('both');
    }
  }, [marketId, getMarketStatus]);

  // Find family numbers when input changes
  useEffect(() => {
    if (inputNumber && inputNumber.trim() !== '') {
      const num = parseInt(inputNumber);
      if (!isNaN(num) && num >= 0 && num <= 99) {
        // Find the family that contains this number
        const foundFamily = family.find(familyGroup =>
          familyGroup.includes(num)
        );

        if (foundFamily) {
          setFamilyNumbers(foundFamily);
        } else {
          setFamilyNumbers([]);
        }
      } else {
        setFamilyNumbers([]);
      }
    } else {
      setFamilyNumbers([]);
    }
  }, [inputNumber]);

  // Auto-place amount on all family numbers when amount is selected
  useEffect(() => {
    if (selectedAmount !== null && familyNumbers.length > 0) {
      const newAmounts: { [key: number]: number } = {};
      familyNumbers.forEach(num => {
        newAmounts[num] = selectedAmount;
      });
      setAmounts(newAmounts);
    } else if (selectedAmount === null) {
      setAmounts({});
    }
  }, [selectedAmount, familyNumbers]);

  // When an amount is selected
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // Handle input number change
  const handleInputNumberChange = (value: string) => {
    const num = parseInt(value);
    if (value === '' || (!isNaN(num) && num >= 0 && num <= 99)) {
      setInputNumber(value);
    }
  };

  // Check if betting is allowed (only during open betting for FamilyPanel)
  const isBettingAllowed = (): boolean => {
    const marketStatusData = getMarketStatus(marketId);
    if (!marketStatusData) return false;
    return marketStatusData.status === 'open_betting';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('User not authenticated. Please login again.');
      return;
    }

    if (!inputNumber || inputNumber.trim() === '') {
      toast.error('Please enter a number.');
      return;
    }

    if (familyNumbers.length === 0) {
      toast.error('No family found for the entered number.');
      return;
    }

    if (user.balance < total) {
      toast.error(`Insufficient balance. You have ₹${user.balance.toLocaleString()} but need ₹${total.toLocaleString()}`);
      return;
    }

    if (total === 0) {
      toast.error('Please select an amount to bet.');
      return;
    }

    if (!isBettingAllowed()) {
      const statusMessage = getMarketStatus(marketId)?.message || 'Betting is not allowed at this time';
      toast.error(statusMessage);
      return;
    }

    // FamilyPanel game only allows betting during open betting period
    if (!isBettingAllowed()) {
      toast.error('FamilyPanel betting is only available during open betting period');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the bet API - FamilyPanel game always sends 'both' as bet type
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'family_panel',
        betType: 'both',
        numbers: amounts,
        amount: total
      });

      if (response.success && response.data) {
        updateBalance(response.data.userAfterAmount);
        toast.success(`Bet placed successfully! Amount: ₹${total.toLocaleString()}`);

        // Reset the form
        setInputNumber('');
        setFamilyNumbers([]);
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
    setInputNumber('');
    setFamilyNumbers([]);
    setAmounts({});
    setSelectedAmount(null);
    // FamilyPanel game always uses 'both' bet type
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

          {/* Number Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h2 className="text-base font-bold text-gray-800">Enter Number</h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Number (0-99)
              </label>
              <input
                type="number"
                value={inputNumber}
                onChange={(e) => handleInputNumberChange(e.target.value)}
                min="0"
                max="99"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                placeholder="Enter number 0-99"
              />
              {inputNumber && familyNumbers.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Family members for {inputNumber}: {familyNumbers.map(num => num.toString().padStart(2, '0')).join(', ')}
                </div>
              )}
            </div>

            {/* Family Numbers Display */}
            {familyNumbers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Numbers ({familyNumbers.length} numbers)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                  {familyNumbers.map((num, index) => (
                    <div key={index} className="group">
                      <div className="text-center mb-1">
                        <span className="text-xs font-bold text-gray-600">{num.toString().padStart(2, '0')}</span>
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
              disabled={total === 0 || isSubmitting || !inputNumber || familyNumbers.length === 0}
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

export default FamilyPanel;
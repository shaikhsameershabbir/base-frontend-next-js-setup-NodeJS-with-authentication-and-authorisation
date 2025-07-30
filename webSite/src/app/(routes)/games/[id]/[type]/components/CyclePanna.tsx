"use client";
import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGameData } from '@/contexts/GameDataContext';

interface CyclePannaProps {
  marketId: string;
  marketName?: string;
}

const CyclePanna: React.FC<CyclePannaProps> = ({ marketId, marketName = 'Market' }) => {
  const { state: { user }, updateBalance } = useAuthContext();
  const { getCurrentTime, getMarketStatus, fetchMarketStatus } = useGameData();

  // Core state from SinglePanna
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<'open' | 'close'>('open');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);



  // CyclePanna specific state
  const [inputNumber, setInputNumber] = useState<string>('');
  const [cycleNumbers, setCycleNumbers] = useState<number[]>([]);
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});
  const [total, setTotal] = useState<number>(0);

  // Cycle Panna data
  const cyclePannaData: { [key: string]: number[] } = {
    "10": [100, 110, 120, 130, 140, 150, 160, 170, 180, 190],
    "11": [110, 111, 112, 113, 114, 115, 116, 117, 118, 119],
    "12": [112, 120, 122, 123, 124, 125, 126, 127, 128, 129],
    "13": [113, 123, 130, 133, 134, 135, 136, 137, 138, 139],
    "14": [114, 124, 134, 140, 144, 145, 146, 147, 148, 149],
    "15": [115, 125, 135, 145, 150, 155, 156, 157, 158, 159],
    "16": [116, 126, 136, 146, 156, 160, 166, 167, 168, 169],
    "17": [117, 127, 137, 147, 157, 167, 170, 177, 178, 179],
    "18": [118, 128, 138, 148, 158, 168, 178, 180, 188, 189],
    "19": [119, 129, 139, 149, 159, 169, 179, 189, 190, 199],
    "20": [120, 200, 220, 230, 240, 250, 260, 270, 280, 290],
    "22": [122, 220, 223, 224, 225, 226, 227, 228, 229, 222],
    "23": [123, 230, 233, 234, 235, 236, 237, 238, 239, 223],
    "24": [124, 240, 244, 245, 246, 247, 248, 249, 224, 234],
    "25": [125, 250, 255, 256, 257, 258, 259, 225, 235, 245],
    "26": [126, 260, 266, 267, 268, 269, 226, 236, 246, 256],
    "27": [127, 270, 277, 278, 279, 227, 237, 247, 257, 267],
    "28": [128, 280, 288, 289, 228, 238, 248, 258, 268, 278],
    "29": [129, 290, 299, 229, 239, 249, 259, 269, 279, 289],
    "30": [130, 230, 300, 330, 340, 350, 360, 370, 380, 390],
    "34": [134, 234, 334, 340, 344, 345, 346, 347, 348, 349],
    "35": [135, 350, 355, 335, 345, 235, 356, 357, 358, 359],
    "36": [136, 360, 366, 336, 346, 356, 367, 368, 369, 236],
    "37": [137, 370, 377, 337, 347, 357, 367, 378, 379, 237],
    "38": [138, 380, 388, 238, 338, 348, 358, 368, 378, 389],
    "39": [139, 390, 399, 349, 359, 369, 379, 389, 239, 339],
    "40": [140, 240, 340, 400, 440, 450, 460, 470, 480, 490],
    "44": [144, 244, 344, 440, 449, 445, 446, 447, 448, 444],
    "45": [145, 245, 345, 450, 456, 457, 458, 459, 445, 455],
    "46": [146, 460, 446, 467, 468, 469, 246, 346, 456, 466],
    "47": [147, 470, 447, 478, 479, 247, 347, 457, 467, 477],
    "48": [148, 480, 489, 248, 348, 448, 488, 458, 468, 478],
    "49": [149, 490, 499, 449, 459, 469, 479, 489, 249, 349],
    "50": [500, 550, 150, 250, 350, 450, 560, 570, 580, 590],
    "55": [155, 556, 557, 558, 559, 255, 355, 455, 555, 550],
    "56": [156, 556, 567, 568, 569, 356, 256, 456, 560, 566],
    "57": [157, 257, 357, 457, 557, 578, 579, 570, 567, 577],
    "58": [158, 558, 568, 578, 588, 589, 580, 258, 358, 458],
    "59": [159, 259, 359, 459, 559, 569, 579, 589, 590, 599],
    "60": [600, 160, 260, 360, 460, 560, 660, 670, 680, 690],
    "66": [660, 667, 668, 669, 666, 166, 266, 366, 466, 566],
    "67": [670, 167, 267, 367, 467, 567, 667, 678, 679, 677],
    "68": [680, 688, 668, 678, 168, 268, 368, 468, 568, 689],
    "69": [690, 169, 269, 369, 469, 569, 669, 679, 689, 699],
    "70": [700, 170, 270, 370, 470, 570, 670, 770, 780, 790],
    "77": [770, 177, 277, 377, 477, 577, 677, 778, 779, 777],
    "78": [178, 278, 378, 478, 578, 678, 778, 788, 789, 780],
    "79": [179, 279, 379, 479, 579, 679, 779, 789, 799, 790],
    "80": [180, 280, 380, 480, 580, 680, 780, 880, 800, 890],
    "88": [188, 288, 388, 488, 588, 688, 788, 889, 888, 880],
    "89": [189, 289, 389, 489, 589, 689, 789, 889, 890, 899],
    "90": [900, 190, 290, 390, 490, 590, 690, 790, 890, 900],
    "99": [199, 299, 399, 499, 599, 699, 799, 899, 990, 999]
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
      if (isBetTypeAllowed('open')) {
        setSelectedBetType('open');
      } else if (isBetTypeAllowed('close')) {
        setSelectedBetType('close');
      }
    }
  }, [marketId, getMarketStatus, isBetTypeAllowed]);

  // Find cycle numbers when input changes
  useEffect(() => {
    if (inputNumber && inputNumber.trim() !== '') {
      const cycleNumbers = cyclePannaData[inputNumber];
      if (cycleNumbers) {
        setCycleNumbers(cycleNumbers);
      } else {
        setCycleNumbers([]);
      }
    } else {
      setCycleNumbers([]);
    }
  }, [inputNumber]);

  // Auto-place amount on all cycle numbers when amount is selected
  useEffect(() => {
    if (selectedAmount !== null && cycleNumbers.length > 0) {
      const newAmounts: { [key: number]: number } = {};
      cycleNumbers.forEach(num => {
        newAmounts[num] = selectedAmount;
      });
      setAmounts(newAmounts);
    } else if (selectedAmount === null) {
      setAmounts({});
    }
  }, [selectedAmount, cycleNumbers]);

  // When an amount is selected
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // Handle input number change
  const handleInputNumberChange = (value: string) => {
    // Allow any input, validation will happen on blur or submit
    setInputNumber(value);
  };

  // Validate input on blur
  const handleInputBlur = () => {
    const num = parseInt(inputNumber);
    if (inputNumber && (isNaN(num) || num < 10 || num > 99)) {
      toast.error('Please enter a number between 10 and 99');
      setInputNumber('');
      setCycleNumbers([]);
    }
  };



  // Check if betting is currently allowed
  const isBettingAllowed = (): boolean => {
    return isBetTypeAllowed('open') || isBetTypeAllowed('close');
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

    if (cycleNumbers.length === 0) {
      toast.error('No cycle panna found for the entered number.');
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

    if (!isBetTypeAllowed(selectedBetType)) {
      toast.error(`${selectedBetType.toUpperCase()} betting is not available at this time`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'cycle_panna',
        betType: selectedBetType,
        numbers: amounts,
        amount: total
      });

      if (response.success && response.data) {
        updateBalance(response.data.userAfterAmount);
        toast.success(`Bet placed successfully! Amount: ₹${total.toLocaleString()}`);

        // Reset the form
        setInputNumber('');
        setCycleNumbers([]);
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
    setCycleNumbers([]);
    setAmounts({});
    setSelectedAmount(null);
    if (isBetTypeAllowed('open')) {
      setSelectedBetType('open');
    } else if (isBetTypeAllowed('close')) {
      setSelectedBetType('close');
    }
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
                {isBetTypeAllowed('open') && (
                  <button
                    type="button"
                    onClick={() => setSelectedBetType('open')}
                    className={`text-xs font-semibold px-2 py-1 rounded-full transition-all duration-200 ${selectedBetType === 'open'
                      ? 'text-white bg-green-600 shadow-md scale-105'
                      : 'text-green-700 bg-green-100 hover:bg-green-200 hover:shadow-sm'
                      }`}
                  >
                    OPEN
                  </button>
                )}
                {isBetTypeAllowed('close') && (
                  <button
                    type="button"
                    onClick={() => setSelectedBetType('close')}
                    className={`text-xs font-semibold px-2 py-1 rounded-full transition-all duration-200 ${selectedBetType === 'close'
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
                Enter Number (10-99)
              </label>
              <input
                type="number"
                value={inputNumber}
                onChange={(e) => handleInputNumberChange(e.target.value)}
                onBlur={handleInputBlur}
                min="10"
                max="99"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                placeholder="Enter number 10-99"
              />
              {inputNumber && cycleNumbers.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Cycle panna for {inputNumber}: {cycleNumbers.length} numbers will be selected
                </div>
              )}
            </div>

            {/* Cycle Numbers Display */}
            {cycleNumbers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cycle Panna Numbers ({cycleNumbers.length} numbers)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                  {cycleNumbers.map((num, index) => (
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
              disabled={total === 0 || isSubmitting || !inputNumber || cycleNumbers.length === 0}
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

export default CyclePanna;
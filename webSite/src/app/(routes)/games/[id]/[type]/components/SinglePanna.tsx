"use client";
import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGameData } from '@/contexts/GameDataContext';

interface SubRangeType {
  [key: string]: number[];
}

interface SinglePannaProps {
  marketId: string;
  marketName?: string;
}

const SinglePanna: React.FC<SinglePannaProps> = ({ marketId, marketName = 'Market' }) => {
  const { state: { user }, updateBalance } = useAuthContext();
  const { getCurrentTime, getMarketStatus, fetchMarketStatus } = useGameData();

  // Store each panna's value as a number (sum of all clicks/inputs)
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [selectedBetType, setSelectedBetType] = useState<'open' | 'close'>('open');
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
      toast.error('Please select an amount first.');
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
      toast.info('Long press to subtract amount');
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
      toast.error('User not authenticated. Please login again.');
      return;
    }

    if (user.balance < total) {
      toast.error(`Insufficient balance. You have ₹${user.balance.toLocaleString()} but need ₹${total.toLocaleString()}`);
      return;
    }

    if (total === 0) {
      toast.error('Please select at least one panna to bet on.');
      return;
    }

    // Frontend time validation
    if (!isBettingAllowed()) {
      const statusMessage = getMarketStatus(marketId)?.message || 'Betting is not allowed at this time';
      toast.error(statusMessage);
      return;
    }

    // Use the user's selected bet type
    if (!isBetTypeAllowed(selectedBetType)) {
      toast.error(`${selectedBetType.toUpperCase()} betting is not available at this time`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the bet API
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'single_panna',
        betType: selectedBetType,
        numbers: amounts,
        amount: total
      });

      if (response.success && response.data) {
        // Update user balance with the new balance from the response
        updateBalance(response.data.userAfterAmount);

        toast.success(`Bet placed successfully! Amount: ₹${total.toLocaleString()}`);

        // Reset the form
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

export default SinglePanna;

import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface JodiGameProps {
  marketId: string;
  marketName?: string;
}

const JodiGame: React.FC<JodiGameProps> = ({ marketId, marketName = 'Market' }) => {
  const { state: { user }, updateBalance } = useAuthContext();

  // Store each digit's value as a number (sum of all clicks/inputs)
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});
  const [total, setTotal] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<number | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<'open' | 'close'>('open');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

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

  // Automatically determine the current bet type based on market status
  const getCurrentBetType = (): 'open' | 'close' | null => {
    if (!marketStatus) return null;

    if (marketStatus.status === 'open_betting') {
      return 'open'; // During open betting, default to open
    } else if (marketStatus.status === 'close_betting') {
      return 'close'; // During close betting, default to close
    }

    return null;
  };

  // Check if a specific bet type is allowed
  const isBetTypeAllowed = (betType: 'open' | 'close'): boolean => {
    if (!marketStatus) return false;

    if (betType === 'open') {
      // Open betting is only allowed during open_betting period
      return marketStatus.status === 'open_betting';
    } else {
      // Close betting is allowed during both open_betting and close_betting periods
      return marketStatus.status === 'open_betting' || marketStatus.status === 'close_betting';
    }
  };

  // Check if betting is currently allowed
  const isBettingAllowed = (): boolean => {
    const currentBetType = getCurrentBetType();
    return currentBetType !== null;
  };

  // When an amount is selected, just set selectedAmount (do not clear digit inputs)
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // When a digit input is clicked, if amount is selected, add that amount to the digit's value
  const handleDigitClick = (digit: number, isRightClick: boolean = false) => {
    if (selectedAmount === null) {
      toast.error('Please select an amount first.');
      return;
    }

    setAmounts(prev => ({
      ...prev,
      [digit]: isRightClick
        ? Math.max(0, (prev[digit] || 0) - selectedAmount)
        : (prev[digit] || 0) + selectedAmount
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
      toast.error('Please select at least one number to bet on.');
      return;
    }

    // Frontend time validation
    if (!isBettingAllowed()) {
      const statusMessage = marketStatus?.message || 'Betting is not allowed at this time';
      toast.error(statusMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine which bet types are available
      const canBetOpen = isBetTypeAllowed('open');
      const canBetClose = isBetTypeAllowed('close');

      if (!canBetOpen && !canBetClose) {
        toast.error('No betting available at this time');
        return;
      }

      // Use the user's selected bet type
      if (!isBetTypeAllowed(selectedBetType)) {
        toast.error(`${selectedBetType.toUpperCase()} betting is not available at this time`);
        return;
      }

      // Call the bet API
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'jodi',
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
        setSelectedRange(null);
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
    setSelectedRange(null);
    // Reset to default bet type based on current availability
    if (isBetTypeAllowed('open')) {
      setSelectedBetType('open');
    } else if (isBetTypeAllowed('close')) {
      setSelectedBetType('close');
    }
  };

  // Amount options for mapping
  const amountOptions = [5, 10, 50, 100, 200, 500, 1000, 5000];

  // Range options for 0-99 (10 ranges)
  const rangeOptions = Array.from({ length: 10 }).map((_, idx) => {
    const start = idx * 10;
    const end = start + 9;
    return { start, end, label: `${start} to ${end}` };
  });

  // Digits to show: all 0-99 by default, or just the selected range if set
  const digitsToShow =
    typeof selectedRange === "number"
      ? Array.from({ length: 10 }).map((_, i) => selectedRange + i)
      : Array.from({ length: 100 }).map((_, i) => i);

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

          {/* Range Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-800">Select Range (Optional)</h2>
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={typeof selectedRange === "number" ? selectedRange : ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSelectedRange(isNaN(val) ? null : val);
                }}
              >
                <option value="">All Numbers (0-99)</option>
                {rangeOptions.map((range, idx) => (
                  <option key={idx} value={range.start}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compact Digits Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-800">Select Digits</h2>
              </div>
            </div>

            {/* Optimized Digits Grid */}
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
              {digitsToShow.map((digit) => (
                <div key={digit} className="group">
                  <div className="text-center mb-2">
                    <span className="text-sm font-bold text-gray-600">{digit.toString().padStart(2, '0')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClick(() => handleDigitClick(digit))}
                    onContextMenu={(e) => handleRightClick(e, () => handleDigitClick(digit, true))}
                    onTouchStart={() => handleTouchStart(
                      () => handleDigitClick(digit),
                      () => handleDigitClick(digit, true)
                    )}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    disabled={selectedAmount === null || isSubmitting}
                    title={`Click/Tap: Add ${selectedAmount || 0}, Right click/Long press: Subtract ${selectedAmount || 0}`}
                    className={`w-full aspect-square rounded-xl border-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${amounts[digit] && amounts[digit] > 0
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-lg'
                      : selectedAmount === null
                        ? 'bg-gray-100 border-gray-200 text-gray-400'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                      } ${isLongPressing ? 'scale-95' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      {amounts[digit] > 0 ? (
                        <span className="text-sm font-bold">{amounts[digit]}</span>
                      ) : (
                        <svg className="w-5 h-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default JodiGame;
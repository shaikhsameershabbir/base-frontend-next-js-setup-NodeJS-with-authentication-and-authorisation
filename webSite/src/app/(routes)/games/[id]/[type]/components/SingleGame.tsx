import { useAuthContext } from '@/contexts/AuthContext';
import { betAPI } from '@/lib/api/bet';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SingleGameProps {
  marketId: string;
  marketName?: string;
}

const SingleGame: React.FC<SingleGameProps> = ({ marketId, marketName = 'Market' }) => {
  const { state: { user }, updateBalance } = useAuthContext();

  // Store each digit's value as a number (sum of all clicks/inputs)
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  });
  const [total, setTotal] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
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

  // When an amount is selected, just set selectedAmount (do not clear digit inputs)
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // When a digit is clicked, if amount is selected, add that amount to the digit's value
  const handleDigitClick = (digit: number, isRightClick: boolean = false) => {
    if (selectedAmount === null) {
      toast.error('Please select an amount first.');
      return;
    }

    setAmounts(prev => ({
      ...prev,
      [digit]: isRightClick
        ? Math.max(0, prev[digit] - selectedAmount)
        : prev[digit] + selectedAmount
    }));
  };

  // Handle Even/Odd selection
  const handleEvenOddSelect = (type: 'even' | 'odd', isRightClick: boolean = false) => {
    if (selectedAmount === null) {
      toast.error('Please select an amount first.');
      return;
    }

    const newAmounts = { ...amounts };
    if (type === 'even') {
      // Set amount for even digits (0, 2, 4, 6, 8)
      [0, 2, 4, 6, 8].forEach(digit => {
        newAmounts[digit] = isRightClick
          ? Math.max(0, newAmounts[digit] - selectedAmount)
          : newAmounts[digit] + selectedAmount;
      });
    } else {
      // Set amount for odd digits (1, 3, 5, 7, 9)
      [1, 3, 5, 7, 9].forEach(digit => {
        newAmounts[digit] = isRightClick
          ? Math.max(0, newAmounts[digit] - selectedAmount)
          : newAmounts[digit] + selectedAmount;
      });
    }
    setAmounts(newAmounts);
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

  // Check if betting is allowed for the selected bet type
  const isBettingAllowedForType = (betType: 'open' | 'close'): boolean => {
    if (!marketStatus) return false;

    if (betType === 'open') {
      return marketStatus.status === 'open_betting';
    } else {
      return marketStatus.status === 'close_betting';
    }
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
    if (!isBettingAllowedForType(selectedBetType)) {
      const statusMessage = marketStatus?.message || 'Betting is not allowed at this time';
      toast.error(statusMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the bet API
      const response = await betAPI.placeBet({
        marketId,
        gameType: 'single',
        betType: selectedBetType,
        numbers: amounts,
        amount: total
      });

      if (response.success && response.data) {
        // Update user balance with the new balance from the response
        updateBalance(response.data.userAfterAmount);

        toast.success(`Bet placed successfully! Amount: ₹${total.toLocaleString()}`);

        // Reset the form
        setAmounts({
          0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
        });
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
    setAmounts({
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    });
    setSelectedAmount(null);
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
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${marketStatus?.status === 'open_betting'
                  ? 'text-green-600 bg-green-50'
                  : marketStatus?.status === 'close_betting'
                    ? 'text-blue-600 bg-blue-50'
                    : marketStatus?.status === 'no_betting'
                      ? 'text-yellow-600 bg-yellow-50'
                      : marketStatus?.status === 'closing_soon'
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-red-600 bg-red-50'
                }`}>
                {marketStatus?.status === 'open_betting' ? 'OPEN BETTING' :
                  marketStatus?.status === 'close_betting' ? 'CLOSE BETTING' :
                    marketStatus?.status === 'no_betting' ? 'NO BETTING' :
                      marketStatus?.status === 'closing_soon' ? 'CLOSING SOON' :
                        'CLOSED'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Current Time (IST)</div>
              <div className="text-lg font-bold text-gray-800">
                {currentTime || new Date().toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Kolkata'
                })}
              </div>
            </div>
          </div>
          {marketStatus?.message && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              {marketStatus.message}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bet Type Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <h2 className="text-base font-bold text-gray-800">Select Bet Type</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedBetType('open')}
                disabled={!isBettingAllowedForType('open')}
                className={`relative group transition-all duration-200 rounded-xl p-3 text-center font-bold ${selectedBetType === 'open'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                  : isBettingAllowedForType('open')
                    ? 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-green-300 hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50'
                  }`}
              >
                <div className="text-base font-bold">OPEN</div>
                {selectedBetType === 'open' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {!isBettingAllowedForType('open') && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedBetType('close')}
                disabled={!isBettingAllowedForType('close')}
                className={`relative group transition-all duration-200 rounded-xl p-3 text-center font-bold ${selectedBetType === 'close'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                  : isBettingAllowedForType('close')
                    ? 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-red-300 hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50'
                  }`}
              >
                <div className="text-base font-bold">CLOSE</div>
                {selectedBetType === 'close' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {!isBettingAllowedForType('close') && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

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

          {/* Compact Digits Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-800">Select Digits</h2>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                💡 Tap: Add | Long press: Subtract
              </div>
            </div>

            {/* Even/Odd Quick Selection */}
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => handleClick(() => handleEvenOddSelect('even'))}
                onContextMenu={(e) => handleRightClick(e, () => handleEvenOddSelect('even', true))}
                onTouchStart={() => handleTouchStart(
                  () => handleEvenOddSelect('even'),
                  () => handleEvenOddSelect('even', true)
                )}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                disabled={selectedAmount === null || isSubmitting}
                title={`Click/Tap: Add ${selectedAmount || 0} to all even digits, Right click/Long press: Subtract ${selectedAmount || 0} from all even digits`}
                className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
              >
                Even (0,2,4,6,8)
              </button>
              <button
                type="button"
                onClick={() => handleClick(() => handleEvenOddSelect('odd'))}
                onContextMenu={(e) => handleRightClick(e, () => handleEvenOddSelect('odd', true))}
                onTouchStart={() => handleTouchStart(
                  () => handleEvenOddSelect('odd'),
                  () => handleEvenOddSelect('odd', true)
                )}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                disabled={selectedAmount === null || isSubmitting}
                title={`Click/Tap: Add ${selectedAmount || 0} to all odd digits, Right click/Long press: Subtract ${selectedAmount || 0} from all odd digits`}
                className="flex-1 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
              >
                Odd (1,3,5,7,9)
              </button>
            </div>

            {/* Optimized Digits Grid - More compact for desktop */}
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="group">
                  <div className="text-center mb-2">
                    <span className="text-sm font-bold text-gray-600">{i}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClick(() => handleDigitClick(i))}
                    onContextMenu={(e) => handleRightClick(e, () => handleDigitClick(i, true))}
                    onTouchStart={() => handleTouchStart(
                      () => handleDigitClick(i),
                      () => handleDigitClick(i, true)
                    )}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    disabled={selectedAmount === null || isSubmitting}
                    title={`Click/Tap: Add ${selectedAmount || 0}, Right click/Long press: Subtract ${selectedAmount || 0}`}
                    className={`w-full aspect-square rounded-xl border-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${amounts[i] && amounts[i] > 0
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-lg'
                      : selectedAmount === null
                        ? 'bg-gray-100 border-gray-200 text-gray-400'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                      } ${isLongPressing ? 'scale-95' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      {amounts[i] > 0 ? (
                        <span className="text-sm font-bold">{amounts[i]}</span>
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

export default SingleGame;
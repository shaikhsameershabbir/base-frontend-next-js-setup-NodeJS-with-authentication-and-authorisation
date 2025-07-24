import React, { useState, useEffect } from 'react';

interface SingleGameProps {
  gameId: string;
}

const SingleGame: React.FC<SingleGameProps> = ({ gameId }) => {
  // Store each digit's value as a number (sum of all clicks/inputs)
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  });
  const [total, setTotal] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  // Calculate total whenever amounts change
  useEffect(() => {
    const sum = Object.values(amounts).reduce((acc, val) => acc + val, 0);
    setTotal(sum);
  }, [amounts]);

  // When an amount is selected, just set selectedAmount (do not clear digit inputs)
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // When a digit input is focused, if no amount is selected, show alert
  const handleDigitInputFocus = () => {
    if (selectedAmount === null) {
      window.alert('Please select an amount first.');
    }
  };

  // When a digit input is clicked, if amount is selected, add that amount to the digit's value
  const handleDigitInputClick = (digit: number) => {
    if (selectedAmount !== null) {
      setAmounts(prev => ({
        ...prev,
        [digit]: prev[digit] + selectedAmount
      }));
    }
  };

  // Allow manual input: user can type any number, but only if amount is selected
  // If no amount is selected, show alert and do not update
  const handleAmountChange = (digit: number, value: string) => {
    if (selectedAmount === null) {
      window.alert('Please select an amount first.');
      return;
    }
    // Only allow positive integers or empty string
    const num = parseInt(value, 10);
    if (value === '' || (Number.isInteger(num) && num >= 0)) {
      setAmounts(prev => ({
        ...prev,
        [digit]: value === '' ? 0 : num
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the bid submission
    console.log({
      gameId,
      type: 'single',
      amounts,
      total
    });
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
    <form
      className="w-full max-w-7xl mx-auto px-2 sm:px-4 pb-4 pt-3 shadow-2xl bg-white rounded-xl"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <input
          type="date"
          className="border-2 border-black px-3 py-2 text-black w-full sm:w-auto text-center justify-center"
          value={new Date().toISOString().split('T')[0]}
          readOnly
        />
        <select className="border-2 border-black px-3 py-2 text-black w-full sm:w-auto">
          <option>TIME BAZAR Open</option>
          <option>TIME BAZAR Close</option>
        </select>
      </div>

      <div className="mb-6 rounded-sm">
        <h2 className="text-lg sm:text-xl font-bold text-black">Select Amount</h2>
        <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
          {amountOptions.map((amt) => (
            <button
              key={amt}
              type="button"
              className={`px-3 py-2 border-2 border-black text-black font-semibold text-sm w-full ${selectedAmount === amt ? 'bg-primary text-white' : ''}`}
              onClick={() => handleAmountSelect(amt)}
            >
              ₹ {amt}
            </button>
          ))}
        </div>
        {selectedAmount === null && (
          <div className="text-red-500 text-xs mt-2">* Please select an amount before entering digits</div>
        )}
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-bold text-black">Select Digits</h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 mt-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-base font-semibold text-black mb-1">{i}</span>
              <input
                type="text"
                value={amounts[i] === 0 ? '' : amounts[i]}
                onFocus={handleDigitInputFocus}
                onClick={() => handleDigitInputClick(i)}
                onChange={(e) => handleAmountChange(i, e.target.value)}
                className={`border-2 border-black px-3 py-2 text-black w-full text-center justify-center font-bold ${
                  amounts[i] && amounts[i] > 0 ? 'bg-secondary bg-opacity-20' : ''
                }`}
                min={0}
                inputMode="numeric"
                readOnly={selectedAmount === null}
                style={{
                  ...(selectedAmount === null
                    ? { backgroundColor: '#f3f3f3', cursor: 'not-allowed' }
                    : {}),
                }}
              />
            </div>
          ))}
        </div>
      </div>

        <div className="flex-1 flex items-center justify-center mx-2 pt-4">
          <span className="text-2xl sm:text-2xl font-semibold text-black">
            Total: ₹ {total}
          </span>
        </div>

      <div className="flex flex-row items-center justify-between gap-3 mt-3">
        <button
          type="button"
          className="px-6 py-3 border-2 border-black text-black font-semibold text-sm w-auto"
          onClick={handleReset}
        >
          Reset
        </button>
        
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white font-semibold text-sm w-auto"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default SingleGame;
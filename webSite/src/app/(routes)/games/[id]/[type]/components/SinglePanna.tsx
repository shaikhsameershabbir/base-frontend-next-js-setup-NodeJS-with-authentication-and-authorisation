"use client";
import { useState } from "react";

interface SubRangeType {
  [key: string]: number[];
}

interface SinglePannaProps {
  gameId: string;
}

const SinglePanna = ({ gameId }: SinglePannaProps) => {
  const [selectedGameType, setSelectedGameType] = useState<"open" | "close">("open");
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

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

  // Amount options for mapping (from JodiGame)
  const amountOptions = [5, 10, 50, 100, 200, 500, 1000, 5000];

  // When an amount is selected, just set selectedAmount (do not clear inputs)
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
  };

  // When a panna input is clicked, if amount is selected, add that amount to the panna's value
  const handlePannaInputClick = (panna: number) => {
    if (selectedAmount !== null) {
      setAmounts(prev => ({
        ...prev,
        [panna]: (prev[panna] || 0) + selectedAmount
      }));
    }
  };

  // Allow manual input: user can type any number, but only if amount is selected
  // If no amount is selected, show alert and do not update
  const handleAmountChange = (panna: number, value: string) => {
    if (selectedAmount === null) {
      window.alert('Please select an amount first.');
      return;
    }
    // Only allow positive integers or empty string
    const num = parseInt(value, 10);
    if (value === '' || (Number.isInteger(num) && num >= 0)) {
      setAmounts(prev => ({
        ...prev,
        [panna]: value === '' ? 0 : num
      }));
    }
  };

  const calculateTotal = () => {
    return Object.values(amounts).reduce((sum, amount) => sum + (amount || 0), 0);
  };

  const handleReset = () => {
    setAmounts({});
    setSelectedAmount(null);
  };

  return (
    <div className="p-4 mb-4 bg-white rounded-xl">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-black">Select Game Type:</h2>
          <button
            onClick={() => setSelectedGameType("close")}
            className="absolute right-4 top-4 bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded"
          >
            CLOSE
          </button>
          <div className="flex justify-start gap-4 mb-4 ">
            <button
              className={`px-4 py-2 rounded-md text-black ${
                selectedGameType === "open"
                  ? "bg-primary text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setSelectedGameType("open")}
            >
              Open
            </button>
            <button
              className={`px-4 py-2 rounded-md text-black ${
                selectedGameType === "close"
                  ? "bg-primary text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setSelectedGameType("close")}
            >
              Close
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-sm">
          <h2 className="text-lg sm:text-xl font-bold text-black justify-center text-center">Select Amount</h2>
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
            <div className="text-red-500 text-xs mt-2">* Please select an amount before entering pannas</div>
          )}
        </div>

        <h2 className="text-lg sm:text-lg font-semibold text-black text-center justify-center">Select Panna Digits</h2>

        <div className="grid grid-cols-10 sm:grid-cols-10 gap-1 mb-4= text-black text-center justify-center">
          {[...Array(10)].map((_, index) => (
            <button
              key={index}
              className={`p-2 sm:p-2 text-lg sm:text-xl font-bold rounded-md border ${
                selectedNumber === index
                  ? "bg-primary text-white"
                  : "bg-white border-primay"
              }`}
              onClick={() => setSelectedNumber(index)}
            >
              {index}
            </button>
          ))}
        </div>

        {/* Changed grid-cols-2 to grid-cols-3 for 3 columns in one row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {subRanges[selectedNumber.toString()].map((number) => (
            <div
              key={number}
              className="flex border border-black rounded-md overflow-hidden"
            >
              <div className="bg-primary text-white p-2 sm:p-4 text-base sm:text-xl font-bold min-w-[60px] sm:min-w-[100px] flex items-center justify-center">
                {number}
              </div>
              <input
                type="text"
                className={`flex-1 p-2 sm:p-4 outline-none text-black w-full text-center font-bold ${
                  amounts[number] && amounts[number] > 0 ? 'bg-secondary bg-opacity-20' : ''
                }`}
                min={0}
                inputMode="numeric"
                value={amounts[number] === 0 || amounts[number] === undefined ? '' : amounts[number]}
                onFocus={() => {
                  if (selectedAmount === null) {
                    window.alert('Please select an amount first.');
                  }
                }}
                onClick={() => handlePannaInputClick(number)}
                onChange={(e) => handleAmountChange(number, e.target.value)}
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

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-black">
              Total Amount
              <br />
              ₹ {calculateTotal()}
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <button
                type="button"
                className="px-6 py-3 border-2 border-black text-black font-semibold text-sm w-auto"
                onClick={handleReset}
              >
                Reset
              </button>
              <button className="bg-primary text-white font-bold py-3 px-6 rounded-md">
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePanna;

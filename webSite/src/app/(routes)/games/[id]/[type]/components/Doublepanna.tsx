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
  const [amounts, setAmounts] = useState<{ [key: number]: string }>({});

  const subRanges: SubRangeType = {
    "0": [550, 668, 224, 299, 226, 488, 677, 118, 334],
    "1": [100, 119, 155, 227, 335, 344, 399, 588, 669],
    "2": [200, 110, 228, 255, 336, 499, 660, 688, 778],
    "3": [300, 166, 229, 337, 355, 445, 599, 779, 788],
    "4": [400, 112, 220, 266, 338, 446, 455, 699, 770],
    "5": [500, 113, 122, 177, 339, 366, 447, 799, 889],
    "6": [600, 114, 177, 330, 448, 466, 556, 880, 899],
    "7": [700, 115, 133, 188, 223, 377, 449, 557, 556],
    "8": [800, 116, 224, 223, 288, 440, 477, 558, 990],
    "9": [900, 117, 144, 199, 255, 388, 559, 577, 667],
  };

  const handleAmountChange = (number: number, value: string) => {
    setAmounts(prev => ({
      ...prev,
      [number]: value
    }));
  };

  const calculateTotal = () => {
    return Object.values(amounts).reduce((sum, amount) => {
      return sum + (parseInt(amount) || 0);
    }, 0);
  };

  return (
    <div className="p-4 pb-32">
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

        

        <div className="grid grid-cols-10 sm:grid-cols-10 gap-1 mb-4 text-black text-center justify-center">
          {[...Array(10)].map((_, index) => (
            <button
              key={index}
              className={`p-2 sm:p-4 text-lg sm:text-xl font-bold rounded-md border ${
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

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          {subRanges[selectedNumber.toString()].map((number) => (
            <div
              key={number}
              className="flex border border-black rounded-md overflow-hidden"
            >
              <div className="bg-primary text-white p-2 sm:p-4 text-base sm:text-xl font-bold min-w-[60px] sm:min-w-[100px] flex items-center justify-center">
                {number}
              </div>
              <input
                type="number"
                placeholder="Amount"
                className="flex-1 p-2 sm:p-4 outline-none text-black w-full"
                min={0}
                value={amounts[number] || ""}
                onChange={(e) => handleAmountChange(number, e.target.value)}
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
            <button className="bg-primary text-white font-bold py-3 px-6 rounded-md">
              Submit Bid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePanna;

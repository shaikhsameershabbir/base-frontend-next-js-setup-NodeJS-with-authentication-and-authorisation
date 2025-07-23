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
    "0": [127, 136, 145, 190, 235, 280, 370, 479, 460, 569, 389, 578],
    "1": [128, 137, 146, 236, 245, 290, 380, 470, 489, 560, 678, 579],
    "2": [129, 138, 147, 156, 237, 246, 345, 390, 480, 570, 679, 589],
    "3": [120, 139, 148, 157, 238, 247, 256, 326, 490, 580, 670, 689],
    "4": [130, 149, 158, 167, 239, 248, 257, 347, 356, 590, 680, 789],
    "5": [140, 159, 168, 230, 249, 258, 267, 348, 357, 456, 690, 780],
    "6": [123, 150, 169, 178, 240, 259, 268, 349, 358, 457, 367, 790],
    "7": [124, 160, 179, 250, 269, 278, 340, 359, 368, 458, 467, 890],
    "8": [125, 134, 170, 189, 260, 279, 350, 369, 378, 459, 567, 468],
    "9": [126, 135, 180, 234, 270, 289, 360, 379, 450, 469, 478, 568],
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

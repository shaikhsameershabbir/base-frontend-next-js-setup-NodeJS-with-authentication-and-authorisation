"use client";
import { useState } from "react";

interface SubRangeType {
  [key: string]: string[];
}

interface SinglePannaProps {
  gameId: string;
}

const SinglePanna = ({ gameId }: SinglePannaProps) => {
  const [selectedGameType, setSelectedGameType] = useState<"open" | "close">("open");
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});

  const subRanges: SubRangeType = {
    "0": ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"],
    "1": ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    "2": ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29"],
    "3": ["30", "31", "32", "33", "34", "35", "36", "37", "38", "39"],
    "4": ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49"],
    "5": ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
    "6": ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
    "7": ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"],
    "8": ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89"],
    "9": ["90", "91", "92", "93", "94", "95", "96", "97", "98", "99"],
  };

  const handleAmountChange = (number: string, value: string) => {
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

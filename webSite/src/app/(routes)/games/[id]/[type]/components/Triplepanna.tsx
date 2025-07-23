import React, { useState, useEffect } from 'react';

interface TriplepannaProps {
  gameId: string;
}

const triplePannaNumbers = [
  '000', '111', '222', '333', '444', '555', '666', '777', '888', '999'
];

const Triplepanna: React.FC<TriplepannaProps> = ({ gameId }) => {
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({
    '000': '', '111': '', '222': '', '333': '', '444': '', '555': '', '666': '', '777': '', '888': '', '999': ''
  });
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const sum = Object.values(amounts).reduce((acc, val) => {
      const num = parseInt(val) || 0;
      return acc + num;
    }, 0);
    setTotal(sum);
  }, [amounts]);

  const handleAmountChange = (digit: string, value: string) => {
    setAmounts(prev => ({
      ...prev,
      [digit]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the bid submission
    console.log({
      gameId,
      type: 'triple-panna',
      amounts,
      total
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-black">Select Game Type :</h1>
        <div className="flex gap-4">
          <button className="px-6 md:px-8 py-3 md:py-2 border-2 border-black rounded-full text-black font-semibold text-sm md:text-base">
            OPEN
          </button>
          <button className="px-6 md:px-8 py-3 md:py-2 border-2 border-black rounded-full text-black font-semibold text-sm md:text-base">
            CLOSE
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100 pr-2">
          {triplePannaNumbers.map((digit) => (
            <div
              key={digit}
              className="flex items-center border-2 border-black rounded-lg overflow-hidden h-16 md:h-14 bg-white"
            >
              <div className="w-20 md:w-24 h-full bg-primary flex items-center justify-center">
                <span className="text-2xl md:text-2xl text-white font-bold">{digit}</span>
              </div>
              <input
                type="number"
                value={amounts[digit]}
                onChange={(e) => handleAmountChange(digit, e.target.value)}
                className="flex-1 p-3 md:p-2 text-lg md:text-base text-black bg-transparent outline-none"
                placeholder="Amount"
                min="0"
                style={{ minWidth: 0 }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center border-2 border-black rounded-lg overflow-hidden mt-6">
          <div className="w-32 md:w-32 bg-primary p-4">
            <span className="text-xl md:text-xl text-white font-bold">TOTAL</span>
          </div>
          <div className="flex-1 p-4 text-black text-lg md:text-base font-semibold">
            {total}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-5 md:py-4 bg-primary text-white font-semibold rounded-full text-xl md:text-lg mt-6"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Triplepanna; 
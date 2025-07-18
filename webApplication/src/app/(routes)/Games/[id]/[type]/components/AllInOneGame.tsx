import React, { useState } from 'react';

interface AllInOneGame {
  gameId: string;
}

const AllInOneGame: React.FC<AllInOneGame> = ({ gameId }) => {
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [bidDigits, setBidDigits] = useState<string>('');
  const [points, setPoints] = useState<string>('');
  const [bids, setBids] = useState<Array<{digit: string; points: string; gameType: string}>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameType || !bidDigits || !points) {
      alert('Please fill in all fields');
      return;
    }
    
    // Add the bid to the table
    setBids([...bids, {
      digit: bidDigits,
      points: points,
      gameType: selectedGameType
    }]);

    // Clear the form
    setBidDigits('');
    setPoints('');
    setSelectedGameType('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <button className="md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-black">ALL IN ONE</h1>
        <div className="text-xl font-bold">735</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:gap-4 md:items-end">
        <div className="w-full md:flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Game Type
          </label>
          <select
            value={selectedGameType}
            onChange={(e) => setSelectedGameType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-black"
          >
            <option value="single">OPEN</option>
            <option value="jodi">CLOSE</option>
          </select>
        </div>

        <div className="w-full md:flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Digit
          </label>
          <input
            type="text"
            value={bidDigits}
            onChange={(e) => setBidDigits(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-black"
            placeholder="Enter Bid Digits"
          />
        </div>

        <div className="w-full md:flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Points
          </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            min="1"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
            placeholder="Enter Points"
          />
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          ADD BID
        </button>
      </form>

      {/* Bids Table */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Digit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bids.map((bid, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bid.digit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bid.points}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bid.gameType}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Close button - Only visible on mobile */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 md:hidden">
        <button
          type="button"
          className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};

export default AllInOneGame;
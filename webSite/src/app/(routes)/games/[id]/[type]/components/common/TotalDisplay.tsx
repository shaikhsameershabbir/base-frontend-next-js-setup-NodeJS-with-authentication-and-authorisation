import React from 'react';

interface TotalDisplayProps {
    total: number;
}

const TotalDisplay: React.FC<TotalDisplayProps> = ({ total }) => {
    return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-2 sm:p-4 text-white flex items-center justify-center">
            <div className="text-center">
                <div className="text-xs sm:text-sm opacity-90 mb-0.5 sm:mb-1">Total Amount</div>
                <div className="text-lg sm:text-2xl font-bold">₹{total.toLocaleString()}</div>
            </div>
        </div>
    );
};

export default TotalDisplay;

import React from 'react';

interface AmountSelectionProps {
    selectedAmount: number | null;
    onAmountSelect: (amount: number) => void;
    amountOptions?: number[];
}

const AmountSelection: React.FC<AmountSelectionProps> = ({
    selectedAmount,
    onAmountSelect,
    amountOptions = [5, 10, 50, 100, 200, 500, 1000, 5000]
}) => {
    return (
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-2 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                <h2 className="text-sm sm:text-base font-bold text-gray-800">Select Amount</h2>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                {amountOptions.map((amt) => (
                    <button
                        key={amt}
                        type="button"
                        className={`relative group transition-all duration-200 rounded-xl p-1.5 sm:p-3 text-center font-bold ${selectedAmount === amt
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                        onClick={() => onAmountSelect(amt)}
                    >
                        <div className="text-xs sm:text-base font-bold">{amt}</div>
                        {selectedAmount === amt && (
                            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-1 h-1 sm:w-2 sm:h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AmountSelection;

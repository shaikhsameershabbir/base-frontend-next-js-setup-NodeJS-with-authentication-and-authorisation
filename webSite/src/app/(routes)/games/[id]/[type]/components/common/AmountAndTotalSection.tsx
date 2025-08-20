import React from 'react';
import AmountSelection from './AmountSelection';
import TotalDisplay from './TotalDisplay';

interface AmountAndTotalSectionProps {
    selectedAmount: number | null;
    onAmountSelect: (amount: number) => void;
    total: number;
    amountOptions?: number[];
}

const AmountAndTotalSection: React.FC<AmountAndTotalSectionProps> = ({
    selectedAmount,
    onAmountSelect,
    total,
    amountOptions
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
            <AmountSelection
                selectedAmount={selectedAmount}
                onAmountSelect={onAmountSelect}
                amountOptions={amountOptions}
            />
            <TotalDisplay total={total} />
        </div>
    );
};

export default AmountAndTotalSection;

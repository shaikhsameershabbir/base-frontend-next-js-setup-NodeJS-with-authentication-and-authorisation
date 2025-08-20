import React from 'react';

interface ActionButtonsProps {
    onReset: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    isSubmitDisabled: boolean;
    submitText?: string;
    loadingText?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onReset,
    onSubmit,
    isSubmitting,
    isSubmitDisabled,
    submitText = "Submit",
    loadingText = "Placing Bet..."
}) => {
    return (
        <div className="flex gap-2 sm:gap-3">
            <button
                type="button"
                onClick={onReset}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-200 border border-gray-200 text-xs sm:text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                </div>
            </button>

            <button
                type="submit"
                onClick={onSubmit}
                disabled={isSubmitDisabled || isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-1 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden sm:inline">{loadingText}</span>
                            <span className="sm:hidden">Placing...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            {submitText}
                        </>
                    )}
                </div>
            </button>
        </div>
    );
};

export default ActionButtons;

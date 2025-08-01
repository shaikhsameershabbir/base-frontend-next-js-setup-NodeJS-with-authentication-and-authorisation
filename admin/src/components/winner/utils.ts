import { singlePannaNumbers, doublePannaNumbers, triplePannaNumbers, WINNING_RATES } from './constants';

// Function to calculate digit sum and get last digit
export const getDigitSum = (number: string): number => {
    return number.split('').reduce((sum, digit) => sum + parseInt(digit), 0) % 10;
};

// Function to determine game type and calculate winning amount
export const getGameTypeAndAmount = (number: string, amount: number) => {
    const numLength = number.length;
    const numValue = parseInt(number);

    if (numLength === 1) {
        return { type: 'single', rate: WINNING_RATES.single, amount: amount * WINNING_RATES.single };
    } else if (numLength === 2) {
        return { type: 'double', rate: WINNING_RATES.double, amount: amount * WINNING_RATES.double };
    } else if (numLength === 3) {
        // Handle "000" specially - it's a triple panna but different from 0
        if (number === "000") {
            return { type: 'triplePanna', rate: WINNING_RATES.triplePanna, amount: amount * WINNING_RATES.triplePanna };
        }

        if (triplePannaNumbers.includes(numValue)) {
            return { type: 'triplePanna', rate: WINNING_RATES.triplePanna, amount: amount * WINNING_RATES.triplePanna };
        } else if (singlePannaNumbers.includes(numValue)) {
            return { type: 'singlePanna', rate: WINNING_RATES.singlePanna, amount: amount * WINNING_RATES.singlePanna };
        } else if (doublePannaNumbers.includes(numValue)) {
            return { type: 'doublePanna', rate: WINNING_RATES.doublePanna, amount: amount * WINNING_RATES.doublePanna };
        } else {
            return { type: 'double', rate: WINNING_RATES.double, amount: amount * WINNING_RATES.double };
        }
    }
    return { type: 'unknown', rate: 0, amount: 0 };
};

// Function to organize data by game types
export const organizeDataByGameTypes = (rawData: any) => {
    if (!rawData || !rawData.data) return null;

    // Organize data by result type
    const organizedData: any = {
        singlePanna: {},
        doublePanna: {},
        triplePanna: {},
        halfSangam: {},
        fullSangam: {}
    };

    // Handle the correct data structure where rawData.data is an object with game types
    if (typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
        // Process each game type in the data
        Object.entries(rawData.data).forEach(([gameType, betTypes]: [string, any]) => {
            if (!organizedData[gameType]) {
                organizedData[gameType] = {};
            }

            // Process each bet type (open, close, both)
            Object.entries(betTypes).forEach(([betType, numbers]: [string, any]) => {
                if (typeof numbers === 'object' && numbers !== null) {
                    // Process each number and its amount
                    Object.entries(numbers).forEach(([number, amount]: [string, any]) => {
                        if (!organizedData[gameType][number]) {
                            organizedData[gameType][number] = 0;
                        }
                        organizedData[gameType][number] += amount;
                    });
                }
            });
        });
    } else if (Array.isArray(rawData.data)) {
        // Fallback for array structure (if it exists)
        rawData.data.forEach((result: any) => {
            const { resultType, resultValue, amount } = result;

            if (!organizedData[resultType]) {
                organizedData[resultType] = {};
            }

            if (!organizedData[resultType][resultValue]) {
                organizedData[resultType][resultValue] = 0;
            }

            organizedData[resultType][resultValue] += amount;
        });
    } else {
        console.warn('Unexpected data structure:', rawData.data);
        return organizedData;
    }

    return organizedData;
}; 
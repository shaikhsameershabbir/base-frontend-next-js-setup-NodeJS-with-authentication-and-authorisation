import { Bet } from '../models/Bet';

// Winning rates constants
export const WINNING_RATES = {
    single: 9,
    double: 90,
    singlePanna: 150,
    doublePanna: 300,
    triplePanna: 1000,
    halfSangam: 1000,
    fullSangam: 10000
};

// Panna number arrays
export const singlePannaNumbers = [
    128, 129, 120, 130, 140,
    137, 138, 139, 149, 159,
    146, 147, 148, 158, 168,
    236, 156, 157, 167, 230,
    245, 237, 238, 239, 249,
    290, 246, 247, 248, 258,
    380, 345, 256, 257, 267,
    470, 390, 346, 347, 348,
    489, 480, 490, 356, 357,
    560, 570, 580, 590, 456,
    579, 589, 670, 680, 690,
    678, 679, 689, 789, 780,
    123, 124, 125, 126, 127,
    150, 160, 134, 135, 136,
    169, 179, 170, 180, 145,
    178, 250, 189, 234, 190,
    240, 269, 260, 270, 235,
    259, 278, 279, 289, 280,
    268, 340, 350, 360, 370,
    349, 359, 369, 379, 389,
    358, 368, 378, 450, 460,
    367, 458, 459, 469, 479,
    457, 467, 468, 478, 569,
    790, 890, 567, 568, 578
];

export const doublePannaNumbers = [
    100, 110, 166, 112, 113,
    119, 200, 229, 220, 122,
    155, 228, 300, 266, 177,
    227, 255, 337, 338, 339,
    335, 336, 355, 400, 366,
    344, 499, 445, 446, 447,
    399, 660, 599, 455, 500,
    588, 688, 779, 699, 799,
    669, 778, 788, 770, 889,
    114, 115, 116, 117, 118,
    277, 133, 224, 144, 226,
    330, 188, 233, 199, 244,
    448, 223, 288, 225, 299,
    466, 377, 440, 388, 334,
    556, 449, 477, 559, 488,
    600, 557, 558, 577, 550,
    880, 566, 800, 667, 668,
    899, 700, 990, 900, 677
];

export const triplePannaNumbers = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999'];

// Helper function to determine number type and rate
export const getNumberTypeAndRate = (number: number): { type: string; rate: number } => {
    const numStr = number.toString();

    // Single digit (0-9)
    if (numStr.length === 1) {
        return { type: 'single', rate: WINNING_RATES.single };
    }

    // Double digit (10-99)
    if (numStr.length === 2) {
        return { type: 'double', rate: WINNING_RATES.double };
    }

    // Triple digit (100-999)
    if (numStr.length === 3) {
        // Check for triple panna
        if (triplePannaNumbers.includes(numStr)) {
            return { type: 'triplePanna', rate: WINNING_RATES.triplePanna };
        }

        // Check for double panna
        if (doublePannaNumbers.includes(number)) {
            return { type: 'doublePanna', rate: WINNING_RATES.doublePanna };
        }

        // Check for single panna
        if (singlePannaNumbers.includes(number)) {
            return { type: 'singlePanna', rate: WINNING_RATES.singlePanna };
        }

        // Regular 3-digit number
        return { type: 'single', rate: WINNING_RATES.single };
    }

    return { type: 'single', rate: WINNING_RATES.single };
};

// Helper function to check if a bet number matches the result
export const checkBetMatch = (betNumber: number, resultNumber: number): boolean => {
    return betNumber === resultNumber;
};

// Helper function to calculate digit sum
export const calculateDigitSum = (number: number): number => {
    return number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
};

// Helper function to check if bet is a sangam type
export const isSangamBet = (betKey: string): boolean => {
    return betKey.includes('X');
};

// Helper function to parse sangam bet
export const parseSangamBet = (betKey: string): { parts: string[]; type: 'halfSangam' | 'fullSangam' } => {
    const parts = betKey.split('X');
    return {
        parts,
        type: parts.length === 2 ? 'halfSangam' : 'fullSangam'
    };
};

// Main winning calculation service
export class WinningCalculationService {

    // Calculate winnings for open result declaration
    static async calculateOpenWinnings(marketId: string, targetDate: Date, openResult: string, openMain: number): Promise<void> {
        try {

            // Create date range for the target date
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Get all open bets for this market and date
            const openBets = await Bet.find({
                marketId,
                betType: 'open',
                status: true,
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });


            for (const bet of openBets) {
                let totalWinAmount = 0;

                // Check each selected number in the bet
                for (const [betNumber, betAmount] of Object.entries(bet.selectedNumbers)) {
                    const amount = betAmount as number;

                    // Check for sangam bets first
                    if (isSangamBet(betNumber)) {
                        // For open results, sangam bets are not applicable
                        // They only apply to close results
                        continue;
                    }

                    // Regular number checks (only for non-sangam bets)
                    const number = parseInt(betNumber);
                    const { type, rate } = getNumberTypeAndRate(number);

                    // Check if bet number matches open result
                    if (checkBetMatch(number, parseInt(openResult))) {
                        const winAmount = amount * rate;
                        totalWinAmount += winAmount;
                    }

                    // For jodi bets (double numbers), only check double-digit patterns
                    if (type === 'double') {
                        // Double numbers don't have main patterns in open results
                        // They only win on exact result matches
                    } else {
                        // For single numbers, check single-digit patterns
                        if (checkBetMatch(number, openMain)) {
                            const winAmount = amount * rate;
                            totalWinAmount += winAmount;
                        }
                    }
                }

                // Update bet with win amount or mark as loss
                if (totalWinAmount > 0) {
                    bet.winAmount = totalWinAmount;
                    bet.result = 'won';
                    await bet.save();
                } else {
                    bet.winAmount = 0;
                    bet.result = 'loss';
                    await bet.save();
                }
            }

        } catch (error) {
            console.error('Error calculating open winnings:', error);
            throw error;
        }
    }

    // Calculate winnings for close result declaration
    static async calculateCloseWinnings(marketId: string, targetDate: Date, openResult: string, openMain: number, closeResult: string, closeMain: number): Promise<void> {
        try {

            // Create date range for the target date
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Get all close and both bets for this market and date
            const closeBets = await Bet.find({
                marketId,
                betType: { $in: ['close', 'both'] },
                status: true,
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });


            // Calculate combined main (open main + close main) - ensure max 2 digits
            const combinedMain = parseInt(openMain.toString() + closeMain.toString());
            const finalMain = combinedMain > 99 ? combinedMain % 100 : combinedMain;

            for (const bet of closeBets) {
                let totalWinAmount = 0;

                // Check each selected number in the bet
                for (const [betNumber, betAmount] of Object.entries(bet.selectedNumbers)) {
                    const amount = betAmount as number;

                    // Check for sangam bets first
                    if (isSangamBet(betNumber)) {
                        const sangamResult = this.calculateSangamWinnings(
                            betNumber,
                            amount,
                            openResult,
                            openMain,
                            closeResult,
                            closeMain
                        );
                        totalWinAmount += sangamResult;
                        continue; // Skip regular number checks for sangam bets
                    }

                    // Regular number checks (only for non-sangam bets)
                    const number = parseInt(betNumber);
                    const { type, rate } = getNumberTypeAndRate(number);

                    // Check if bet number matches close result
                    if (checkBetMatch(number, parseInt(closeResult))) {
                        const winAmount = amount * rate;
                        totalWinAmount += winAmount;
                    }

                    // For jodi bets (double numbers), only check double-digit patterns
                    if (type === 'double') {
                        // Check if bet number matches combined main (only for double numbers)
                        if (checkBetMatch(number, finalMain)) {
                            const winAmount = amount * rate;
                            totalWinAmount += winAmount;
                        }
                    } else {
                        // For single numbers, check single-digit patterns
                        if (checkBetMatch(number, closeMain)) {
                            const winAmount = amount * rate;
                            totalWinAmount += winAmount;
                        }
                    }
                }

                // Update bet with win amount or mark as loss
                if (totalWinAmount > 0) {
                    bet.winAmount = totalWinAmount;
                    bet.result = 'won';
                    await bet.save();
                } else {
                    bet.winAmount = 0;
                    bet.result = 'loss';
                    await bet.save();
                }
            }

        } catch (error) {
            console.error('Error calculating close winnings:', error);
            throw error;
        }
    }

    // Calculate sangam winnings
    static calculateSangamWinnings(
        betKey: string,
        betAmount: number,
        openResult: string,
        openMain: number,
        closeResult: string,
        closeMain: number
    ): number {
        const { type } = parseSangamBet(betKey);
        let winAmount = 0;

        if (type === 'halfSangam') {
            // Check for openResult X closeMain pattern
            const openXCloseMain = `${openResult}X${closeMain}`;
            if (betKey === openXCloseMain) {
                winAmount = betAmount * WINNING_RATES.halfSangam;
            }

            // Check for openMain X closeResult pattern
            const openMainXClose = `${openMain}X${closeResult}`;
            if (betKey === openMainXClose) {
                winAmount = betAmount * WINNING_RATES.halfSangam;
            }
        } else if (type === 'fullSangam') {
            // Calculate digit sums for open and close results
            const openDigitSum = calculateDigitSum(parseInt(openResult));
            const closeDigitSum = calculateDigitSum(parseInt(closeResult));
            const combinedDigitSums = `${openDigitSum}${closeDigitSum}`;

            // Check for openResult X combinedDigitSums X closeResult pattern
            const fullSangamPattern = `${openResult}X${combinedDigitSums}X${closeResult}`;
            if (betKey === fullSangamPattern) {
                winAmount = betAmount * WINNING_RATES.fullSangam;
            }
        }

        return winAmount;
    }
}

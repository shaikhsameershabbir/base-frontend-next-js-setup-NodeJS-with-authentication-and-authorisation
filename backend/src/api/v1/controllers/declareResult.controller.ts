import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Result } from '../../../models/result';
import { Market } from '../../../models/Market';
import { WinningCalculationService } from '../../../services/winningCalculation.service';

// Types for the declare result functionality
interface DeclareResultRequest {
    marketId: string;
    resultType: 'open' | 'close';
    resultNumber: number;
    targetDate: string;
}

interface DayResult {
    open: number | null;
    main: number | null;
    close: number | null;
    openDeclationTime: Date | null;
    closeDeclationTime: Date | null;
}

interface WeeklyResultData {
    marketId: string;
    marketName: string; // Include market name for readability
    declaredBy: string;
    weekStartDate: Date;
    weekEndDate: Date;
    weekDays: number;
    results: Record<string, DayResult>;
}

// Helper function to get week start and end dates
const getWeekDates = (weekDays: number): { startDate: Date; endDate: Date } => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate Monday of current week
    const monday = new Date(today);
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Monday is 1
    monday.setDate(today.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    // Calculate end date based on weekDays
    const endDate = new Date(monday);
    endDate.setDate(monday.getDate() + weekDays - 1);
    endDate.setHours(23, 59, 59, 999);

    return { startDate: monday, endDate };
};

// Helper function to get day name from date
const getDayName = (date: Date): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
};

// Declare result for a specific market and day
export const declareResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = (req as AuthenticatedRequest).user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { marketId, resultType, resultNumber, targetDate }: DeclareResultRequest = req.body;

        // Validate required fields
        if (!marketId || !resultType || resultNumber === undefined || resultNumber === null || !targetDate) {
            res.status(400).json({
                success: false,
                message: 'Market ID, result type, result number, and target date are required'
            });
            return;
        }

        // Validate result type
        if (!['open', 'close'].includes(resultType)) {
            res.status(400).json({
                success: false,
                message: 'Result type must be either "open" or "close"'
            });
            return;
        }

        // Validate result number (should be a 3-digit panna number)
        if (resultNumber > 999 || !Number.isInteger(resultNumber)) {
            res.status(400).json({
                success: false,
                message: 'Result number must be a 3-digit number (100-999)'
            });
            return;
        }

        // Convert to string for digit manipulation
        const resultString = resultNumber.toString();

        // Calculate main value (sum of digits, if > 9, take last digit)
        const digitSum = resultString.split('').reduce((sum: number, digit: string) => sum + parseInt(digit), 0);
        const mainValue = digitSum > 9 ? digitSum % 10 : digitSum;


        // Check if market exists
        const market = await Market.findById(marketId);
        if (!market) {
            res.status(404).json({ success: false, message: 'Market not found' });
            return;
        }

        // Parse target date
        const targetDateObj = new Date(targetDate);
        const dayName = getDayName(targetDateObj);

        // Get week dates based on market's week days
        const { startDate, endDate } = getWeekDates(market.weekDays || 7);

        // Check if target date is within the current week
        if (targetDateObj < startDate || targetDateObj > endDate) {
            res.status(400).json({
                success: false,
                message: 'Target date must be within the current week'
            });
            return;
        }

        // Find or create weekly result
        let existingResult = await Result.findOne({
            marketId,
            weekStartDate: startDate,
            weekEndDate: endDate
        });

        if (existingResult) {
            // Update existing weekly result
            if (!existingResult.results) {
                existingResult.results = {};
            }

            if (!existingResult.results[dayName as keyof typeof existingResult.results]) {
                existingResult.results[dayName as keyof typeof existingResult.results] = {
                    open: null,
                    main: null,
                    close: null,
                    openDeclationTime: null,
                    closeDeclationTime: null
                };
            }

            const dayResult = existingResult.results[dayName as keyof typeof existingResult.results];

            if (!dayResult) {
                res.status(500).json({ success: false, message: 'Failed to get day result' });
                return;
            }

            if (resultType === 'open') {
                dayResult.open = resultNumber;
                dayResult.main = mainValue;
                dayResult.openDeclationTime = new Date();

                // Calculate open winnings
                await WinningCalculationService.calculateOpenWinnings(
                    marketId,
                    targetDateObj,
                    resultNumber,
                    mainValue
                );
            } else {
                // For close, check if open is already declared
                if (!dayResult.open || dayResult.open === null) {
                    res.status(400).json({
                        success: false,
                        message: 'Open result must be declared before declaring close result'
                    });
                    return;
                }

                dayResult.close = resultNumber;
                // For close, main becomes the combination of open main and close main
                const openMain = dayResult.main || 0;
                const closeMain = mainValue;
                const combinedMain = parseInt(openMain.toString() + closeMain.toString());
                // Ensure main is never more than 2 digits
                const finalMain = combinedMain > 99 ? combinedMain % 100 : combinedMain;
                dayResult.main = finalMain;
                dayResult.closeDeclationTime = new Date();


                // Calculate close winnings
                await WinningCalculationService.calculateCloseWinnings(
                    marketId,
                    targetDateObj,
                    dayResult.open,
                    openMain,
                    resultNumber,
                    closeMain
                );
            }

            await existingResult.save();
        } else {
            // Create new weekly result
            if (resultType === 'close') {
                res.status(400).json({
                    success: false,
                    message: 'Open result must be declared before declaring close result'
                });
                return;
            }

            const newDayResult: DayResult = {
                open: resultNumber,
                main: mainValue,
                close: null,
                openDeclationTime: new Date(),
                closeDeclationTime: null
            };

            const resultData: WeeklyResultData = {
                marketId,
                marketName: market.marketName, // Include market name for readability
                declaredBy: currentUser.userId,
                weekStartDate: startDate,
                weekEndDate: endDate,
                weekDays: market.weekDays || 7,
                results: {
                    [dayName]: newDayResult
                }
            };

            existingResult = new Result(resultData);
            await existingResult.save();

            // Calculate open winnings for new result
            await WinningCalculationService.calculateOpenWinnings(
                marketId,
                targetDateObj,
                resultNumber,
                mainValue
            );
        }

        res.json({
            success: true,
            message: `${resultType.charAt(0).toUpperCase() + resultType.slice(1)} result declared successfully for ${dayName}`,
            data: {
                marketId,
                dayName,
                resultType,
                resultNumber,
                declaredBy: currentUser.userId,
                declarationTime: resultType === 'open' ?
                    existingResult.results[dayName as keyof typeof existingResult.results]?.openDeclationTime :
                    existingResult.results[dayName as keyof typeof existingResult.results]?.closeDeclationTime
            }
        });
    } catch (error) {
        console.error('Declare result error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

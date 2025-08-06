import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Result } from '../../../models/result';
import { Market } from '../../../models/Market';

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

        const { marketId, resultType, resultNumber, targetDate } = req.body;

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
        if (resultNumber < 100 || resultNumber > 999 || !Number.isInteger(resultNumber)) {
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

        console.log(`Result Number: ${resultNumber}, Digit Sum: ${digitSum}, Main Value: ${mainValue}`);

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
                console.log(`Open Result - Day: ${dayName}, Number: ${resultNumber}, Main: ${mainValue}`);
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
                dayResult.main = combinedMain;
                dayResult.closeDeclationTime = new Date();

                console.log(`Close Result - Day: ${dayName}, Open Main: ${openMain}, Close Main: ${closeMain}, Combined Main: ${combinedMain}`);
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

            const newDayResult = {
                open: resultNumber,
                main: mainValue,
                close: null,
                openDeclationTime: new Date(),
                closeDeclationTime: null
            };

            const resultData = {
                marketId,
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
            console.log(`New Weekly Result Created - Day: ${dayName}, Number: ${resultNumber}, Main: ${mainValue}`);
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

// Get weekly results for a specific market
export const getMarketResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = (req as AuthenticatedRequest).user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { marketId } = req.params;

        if (!marketId) {
            res.status(400).json({ success: false, message: 'Market ID is required' });
            return;
        }

        // Get market to determine week days
        const market = await Market.findById(marketId);
        if (!market) {
            res.status(404).json({ success: false, message: 'Market not found' });
            return;
        }

        const { startDate, endDate } = getWeekDates(market.weekDays || 7);

        const result = await Result.findOne({
            marketId,
            weekStartDate: startDate,
            weekEndDate: endDate
        }).populate('marketId', 'marketName weekDays').populate('declaredBy', 'username');

        if (!result) {
            res.json({
                success: true,
                message: 'No results found for this week',
                data: {
                    marketId: marketId,
                    weekStartDate: startDate,
                    weekEndDate: endDate,
                    weekDays: market.weekDays || 7,
                    results: {}
                }
            });
            return;
        }

        res.json({
            success: true,
            message: 'Weekly results retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Get market results error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all weekly results
export const getAllResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = (req as AuthenticatedRequest).user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const results = await Result.find()
            .populate('marketId', 'marketName weekDays')
            .populate('declaredBy', 'username')
            .sort({ weekStartDate: -1 });

        res.json({
            success: true,
            message: 'All weekly results retrieved successfully',
            data: results
        });
    } catch (error) {
        console.error('Get all results error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all market results for multiple markets
export const getAllMarketResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const { marketIds } = req.body;
        const currentUser = (req as AuthenticatedRequest).user;

        // Validate marketIds
        if (!marketIds || !Array.isArray(marketIds) || marketIds.length === 0) {
            res.status(400).json({ success: false, message: 'Market IDs array is required' });
            return;
        }

        const results: any[] = [];

        // Process each market
        for (const marketId of marketIds) {
            try {
                // Check if market exists
                const market = await Market.findById(marketId);
                if (!market) {
                    results.push({
                        marketId: marketId,
                        success: false,
                        message: 'Market not found'
                    });
                    continue;
                }

                // Get current week dates based on market's weekDays
                const { startDate, endDate } = getWeekDates(market.weekDays || 7);

                // Find result for the current week
                const result = await Result.findOne({
                    marketId: marketId,
                    weekStartDate: startDate,
                    weekEndDate: endDate
                });

                if (result) {
                    results.push({
                        marketId: marketId,
                        success: true,
                        data: result
                    });
                } else {
                    results.push({
                        marketId: marketId,
                        success: true,
                        data: {
                            _id: null,
                            marketId: marketId,
                            weekStartDate: startDate,
                            weekEndDate: endDate,
                            weekDays: market.weekDays || 7,
                            results: {}
                        }
                    });
                }
            } catch (error) {
                console.error(`Error fetching results for market ${marketId}:`, error);
                results.push({
                    marketId: marketId,
                    success: false,
                    message: 'Internal server error'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching all market results:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


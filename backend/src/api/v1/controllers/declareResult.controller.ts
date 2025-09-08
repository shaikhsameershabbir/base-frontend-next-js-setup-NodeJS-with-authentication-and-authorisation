import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Result } from '../../../models/result';
import { Market } from '../../../models/Market';
import { WinningCalculationService } from '../../../services/winningCalculation.service';
import { logger } from '../../../config/logger';

// Types for the declare result functionality
interface DeclareResultRequest {
    marketId: string;
    resultType: 'open' | 'close';
    resultNumber: string;
    targetDate: string;
}

interface DayResult {
    open: string | null;
    main: string | null;
    close: string | null;
    openDeclationTime: Date | null;
    closeDeclationTime: Date | null;
}

interface ResultData {
    marketId: string;
    marketName: string; // Include market name for readability
    declaredBy: string;
    resultDate: Date;
    results: DayResult;
}

// Helper function to normalize date to start of day
const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

// Declare result for a specific market and day
export const declareResult = async (req: Request, res: Response): Promise<void> => {
    try {
        // Request body received
        const currentUser = (req as AuthenticatedRequest).user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { marketId, resultType, resultNumber, targetDate }: DeclareResultRequest = req.body;

        // Debug logs
        logger.info('=== DECLARE RESULT DEBUG ===');
        logger.info(`Request received - MarketId: ${marketId}, ResultType: ${resultType}, ResultNumber: ${resultNumber}, TargetDate: ${targetDate}`);
        logger.info(`Current User: ${currentUser.userId} (${currentUser.role})`);

        // Validate required fields
        if (!marketId || !resultType || !resultNumber || !targetDate) {
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

        // Ensure resultNumber is a string and validate it (should be a 3-digit panna number)
        const resultNumberStr = String(resultNumber);
        // Processing result number string

        if (!/^\d{3}$/.test(resultNumberStr)) {
            res.status(400).json({
                success: false,
                message: 'Result number must be a 3-digit string (000-999)'
            });
            return;
        }

        // Calculate main value (sum of digits, if > 9, take last digit)

        const digitSum = resultNumberStr.split('').reduce((sum: number, digit: string) => sum + parseInt(digit), 0);
        const mainValue = digitSum > 9 ? digitSum % 10 : digitSum;
        const mainValueString = mainValue.toString();


        // Check if market exists
        const market = await Market.findById(marketId);
        logger.info(`Market lookup - Found: ${!!market}, MarketName: ${market?.marketName || 'N/A'}`);

        if (!market) {
            res.status(404).json({ success: false, message: 'Market not found' });
            return;
        }

        // Parse target date and normalize to start of day
        const targetDateObj = normalizeDate(new Date(targetDate));
        logger.info(`Target date normalized: ${targetDateObj.toISOString()}`);

        // Find or create result for the specific date
        let existingResult = await Result.findOne({
            marketId,
            resultDate: targetDateObj
        });

        logger.info(`Existing result lookup - Found: ${!!existingResult}`);
        if (existingResult) {
            logger.info(`Existing result data - Open: ${existingResult.results.open}, Close: ${existingResult.results.close}, Main: ${existingResult.results.main}`);

            // Update existing result
            if (resultType === 'open') {
                logger.info('Updating existing result - OPEN type');
                existingResult.results.open = resultNumberStr;
                existingResult.results.main = mainValueString;
                existingResult.results.openDeclationTime = new Date();

                // Calculate open winnings
                await WinningCalculationService.calculateOpenWinnings(
                    marketId,
                    targetDateObj,
                    resultNumberStr,
                    mainValue
                );
                logger.info(`Open result updated - Result: ${resultNumberStr}, Main: ${mainValueString}`);
            } else {
                logger.info('Updating existing result - CLOSE type');
                // For close, check if open is already declared
                if (!existingResult.results.open || existingResult.results.open === null) {
                    res.status(400).json({
                        success: false,
                        message: 'Open result must be declared before declaring close result'
                    });
                    return;
                }

                existingResult.results.close = resultNumberStr;
                // For close, main becomes the combination of open main and close main
                const openMain = parseInt(existingResult.results.main || '0');
                const closeMain = mainValue;
                const combinedMain = parseInt(openMain.toString() + closeMain.toString());
                // Ensure main is never more than 2 digits
                const finalMain = combinedMain > 99 ? combinedMain % 100 : combinedMain;
                existingResult.results.main = finalMain.toString();
                existingResult.results.closeDeclationTime = new Date();

                // Calculate close winnings
                await WinningCalculationService.calculateCloseWinnings(
                    marketId,
                    targetDateObj,
                    existingResult.results.open,
                    openMain,
                    resultNumberStr,
                    closeMain
                );
                logger.info(`Close result updated - Result: ${resultNumberStr}, Combined Main: ${finalMain}`);
            }

            await existingResult.save();
            logger.info('Result saved successfully to database');
        } else {
            // Create new result
            logger.info('Creating new result document');
            if (resultType === 'close') {
                logger.info('ERROR: Cannot create close result without open result');
                res.status(400).json({
                    success: false,
                    message: 'Open result must be declared before declaring close result'
                });
                return;
            }

            const newDayResult: DayResult = {
                open: resultNumberStr,
                main: mainValueString,
                close: null,
                openDeclationTime: new Date(),
                closeDeclationTime: null
            };

            const resultData: ResultData = {
                marketId,
                marketName: market.marketName, // Include market name for readability
                declaredBy: currentUser.userId,
                resultDate: targetDateObj,
                results: newDayResult
            };

            try {
                existingResult = new Result(resultData);
                await existingResult.save();
            } catch (error: unknown) {
                // Handle duplicate key error (E11000)
                if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
                    // Try to find the existing document
                    existingResult = await Result.findOne({
                        marketId,
                        resultDate: targetDateObj
                    });
                    if (!existingResult) {
                        throw error; // Re-throw if we still can't find it
                    }
                } else {
                    throw error;
                }
            }

            // Calculate open winnings for new result
            await WinningCalculationService.calculateOpenWinnings(
                marketId,
                targetDateObj,
                resultNumberStr,
                mainValue
            );
            logger.info(`New result created - Result: ${resultNumberStr}, Main: ${mainValueString}`);
        }

        logger.info('=== DECLARE RESULT SUCCESS ===');
        // Existing result checked
        res.json({
            success: true,
            message: `${resultType.charAt(0).toUpperCase() + resultType.slice(1)} result declared successfully for ${targetDateObj.toDateString()}`,
            data: {
                marketId,
                resultDate: targetDateObj,
                resultType,
                resultNumberStr,
                declaredBy: currentUser.userId,
                declarationTime: resultType === 'open' ?
                    existingResult.results.openDeclationTime :
                    existingResult.results.closeDeclationTime
            }
        });
    } catch (error) {
        // Error occurred during result declaration
        logger.error('Error declaring result:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

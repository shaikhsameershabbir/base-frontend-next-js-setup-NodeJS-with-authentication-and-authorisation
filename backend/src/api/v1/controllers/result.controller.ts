import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { Result } from '../../../models/result';
import { Market } from '../../../models/Market';

// Declare result for a specific market
export const declareResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = (req as AuthenticatedRequest).user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { marketId, resultType, resultNumber } = req.body;

        // Validate required fields
        if (!marketId || !resultType || resultNumber === undefined || resultNumber === null) {
            res.status(400).json({
                success: false,
                message: 'Market ID, result type, and result number are required'
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

        // Check if result already exists for this market
        let existingResult = await Result.findOne({ marketId });

        if (existingResult) {
            // Update existing result
            if (resultType === 'open') {
                existingResult.open = resultNumber;
                existingResult.main = mainValue;
                existingResult.openDeclationTime = new Date();
                console.log(`Open Result - Number: ${resultNumber}, Main: ${mainValue}`);
            } else {
                // For close, check if open is already declared
                if (!existingResult.open || existingResult.open === null) {
                    res.status(400).json({
                        success: false,
                        message: 'Open result must be declared before declaring close result'
                    });
                    return;
                }

                existingResult.close = resultNumber;
                // For close, main becomes the combination of open main and close main
                const openMain = existingResult.main || 0;
                const closeMain = mainValue;
                const combinedMain = parseInt(openMain.toString() + closeMain.toString());
                existingResult.main = combinedMain;
                existingResult.closeDeclationTime = new Date();

                console.log(`Close Result - Open Main: ${openMain}, Close Main: ${closeMain}, Combined Main: ${combinedMain}`);
            }

            // Update total win calculation
            existingResult.totalWin = (existingResult.open || 0) + (existingResult.close || 0);

            await existingResult.save();
        } else {
            // Create new result - only allow open for new results
            if (resultType === 'close') {
                res.status(400).json({
                    success: false,
                    message: 'Open result must be declared before declaring close result'
                });
                return;
            }

            const resultData = {
                marketId,
                declaredBy: currentUser.userId,
                totalWin: resultNumber,
                open: resultNumber,
                close: null,
                main: mainValue,
                openDeclationTime: new Date(),
                closeDeclationTime: null
            };

            existingResult = new Result(resultData);
            await existingResult.save();
            console.log(`New Result Created - Number: ${resultNumber}, Main: ${mainValue}`);
        }

        res.json({
            success: true,
            message: `${resultType.charAt(0).toUpperCase() + resultType.slice(1)} result declared successfully`,
            data: {
                marketId,
                resultType,
                resultNumber,
                declaredBy: currentUser.userId,
                declarationTime: resultType === 'open' ? existingResult.openDeclationTime : existingResult.closeDeclationTime
            }
        });
    } catch (error) {
        console.error('Declare result error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get results for a specific market
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

        const result = await Result.findOne({ marketId }).populate('marketId', 'marketName').populate('declaredBy', 'username');

        if (!result) {
            res.json({
                success: true,
                message: 'No results found for this market',
                data: null
            });
            return;
        }

        res.json({
            success: true,
            message: 'Market results retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Get market results error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all results
export const getAllResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = (req as AuthenticatedRequest).user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const results = await Result.find()
            .populate('marketId', 'marketName')
            .populate('declaredBy', 'username')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            message: 'All results retrieved successfully',
            data: results
        });
    } catch (error) {
        console.error('Get all results error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


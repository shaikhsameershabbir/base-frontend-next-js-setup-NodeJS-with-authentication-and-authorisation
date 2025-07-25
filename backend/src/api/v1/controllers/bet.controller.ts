import { Response } from 'express';
import { User } from '../../../models/User';
import { Bet } from '../../../models/Bet';
import { Market } from '../../../models/Market';
import { logger } from '../../../config/logger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { isBettingAllowed } from '../../../utils/timeUtils';

export class BetController {
    async placeBet(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { marketId, gameType, betType, numbers, amount } = req.body;

            // Validate required fields
            if (!marketId || !gameType || !betType || !numbers || amount === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: marketId, gameType, betType, numbers, amount'
                });
                return;
            }

            // Validate betType
            if (!['open', 'close'].includes(betType)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid betType. Must be either "open" or "close"'
                });
                return;
            }

            // Get market details to validate times
            const market = await Market.findById(marketId);
            if (!market) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            // Check if betting is allowed based on current time and bet type
            const timeValidation = isBettingAllowed(betType, market.openTime, market.closeTime);
            if (!timeValidation.allowed) {
                res.status(400).json({
                    success: false,
                    message: timeValidation.message,
                    nextBetTime: timeValidation.nextBetTime
                });
                return;
            }

            // Get current user with balance
            const user = await User.findById(req.user.userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Check if user has sufficient balance
            if (user.balance < amount) {
                res.status(400).json({
                    success: false,
                    message: `Insufficient balance. You have ₹${user.balance.toLocaleString()} but need ₹${amount.toLocaleString()}`
                });
                return;
            }

            // Validate that numbers object has at least one non-zero value
            const numbersArray = Object.values(numbers) as number[];
            const hasValidNumbers = numbersArray.some((value: number) => value > 0);
            if (!hasValidNumbers) {
                res.status(400).json({
                    success: false,
                    message: 'At least one number must have a bet amount greater than 0'
                });
                return;
            }

            // Calculate total amount from numbers (should match the provided amount)
            const calculatedAmount = numbersArray.reduce((sum: number, value: number) => sum + value, 0);
            if (calculatedAmount !== amount) {
                res.status(400).json({
                    success: false,
                    message: `Amount mismatch. Calculated: ₹${calculatedAmount.toLocaleString()}, Provided: ₹${amount.toLocaleString()}`
                });
                return;
            }

            // Store user balance before bet
            const userBeforeAmount = user.balance;
            const userAfterAmount = user.balance - amount;

            // Create bet record
            const bet = new Bet({
                marketId,
                userId: req.user.userId,
                type: gameType,
                betType,
                amount,
                userBeforeAmount,
                userAfterAmount,
                status: true
            });

            await bet.save();

            // Update user balance
            user.balance = userAfterAmount;
            await user.save();

            logger.info(`Bet placed successfully: User ${req.user.userId}, Market ${marketId}, Amount ₹${amount}, Game Type ${gameType}, Bet Type ${betType}`);

            res.json({
                success: true,
                message: 'Bet placed successfully',
                data: {
                    betId: bet._id,
                    marketId,
                    gameType,
                    betType,
                    numbers,
                    amount,
                    userBeforeAmount,
                    userAfterAmount,
                    status: bet.status,
                    createdAt: bet.createdAt
                }
            });
        } catch (error) {
            logger.error('Place bet error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 
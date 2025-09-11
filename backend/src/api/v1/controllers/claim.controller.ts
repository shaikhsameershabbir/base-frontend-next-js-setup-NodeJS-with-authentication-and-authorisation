import { Request, Response } from 'express';
import { Bet } from '../../../models/Bet';
import { User } from '../../../models/User';
import { logger } from '../../../config/logger';
import { createClaimTransferLog } from '../../../utils/transferLogger';

// Define proper types for request with user
interface AuthenticatedRequest extends Omit<Request, 'user'> {
    user?: {
        userId: string;
        username: string;
        balance: number;
        role: string;
        parentId?: string;
    };
}

export class ClaimController {
    /**
     * Get all unclaimed tickets for the current user
     */
    static async getUnclaimedTickets(req: AuthenticatedRequest, res: Response) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Get all bets where claimStatus is false and result is not null
            const unclaimedBets = await Bet.find({
                userId: currentUser.userId,
                claimStatus: false,
                result: { $ne: null }
            }).populate('marketId', 'marketName');

            // Filter bets that have winAmount (winning bets)
            const winningBets = unclaimedBets.filter(bet => bet.winAmount && bet.winAmount > 0);
            const pendingBets = unclaimedBets.filter(bet => !bet.winAmount || bet.winAmount === 0);

            return res.json({
                success: true,
                data: {
                    unclaimedTickets: unclaimedBets,
                    winningTickets: winningBets,
                    pendingTickets: pendingBets,
                    totalUnclaimed: unclaimedBets.length,
                    totalWinning: winningBets.length,
                    totalPending: pendingBets.length
                }
            });

        } catch (error) {
            logger.error('Error getting unclaimed tickets:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Claim winning tickets and update user balance
     */
    static async claimTickets(req: AuthenticatedRequest, res: Response) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Get all unclaimed winning bets for the user
            const unclaimedWinningBets = await Bet.find({
                userId: currentUser.userId,
                claimStatus: false,
                result: { $ne: null },
                winAmount: { $gt: 0 }
            });

            if (unclaimedWinningBets.length === 0) {
                return res.json({
                    success: false,
                    message: 'No winning tickets to claim',
                    data: {
                        claimedAmount: 0,
                        claimedTickets: 0
                    }
                });
            }

            // Calculate total winning amount
            const totalWinningAmount = unclaimedWinningBets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0);

            // Get current user balance before update
            const currentUserData = await User.findById(currentUser.userId);
            if (!currentUserData) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const balanceBefore = currentUserData.balance;
            const balanceAfter = balanceBefore + totalWinningAmount;

            // Update user balance
            const updatedUser = await User.findByIdAndUpdate(
                currentUser.userId,
                { $inc: { balance: totalWinningAmount } },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Update claim status for all winning bets
            const betIds = unclaimedWinningBets.map(bet => String(bet._id));
            await Bet.updateMany(
                { _id: { $in: betIds } },
                { claimStatus: true }
            );

            // Create transfer log for claim
            await createClaimTransferLog(
                currentUser.userId,
                totalWinningAmount,
                balanceBefore,
                balanceAfter,
                betIds
            );

            return res.json({
                success: true,
                message: 'Tickets claimed successfully',
                data: {
                    claimedAmount: totalWinningAmount,
                    claimedTickets: unclaimedWinningBets.length,
                    newBalance: updatedUser.balance,
                    tickets: unclaimedWinningBets.map(bet => ({
                        betId: bet._id,
                        winAmount: bet.winAmount,
                        result: bet.result,
                        type: bet.type
                    }))
                }
            });

        } catch (error) {
            logger.error('Error claiming tickets:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get claim summary for the current user
     */
    static async getClaimSummary(req: AuthenticatedRequest, res: Response) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Get all bets for the user
            const allBets = await Bet.find({ userId: currentUser.userId });

            // Calculate summary
            const totalBets = allBets.length;
            const winningBets = allBets.filter(bet => bet.winAmount && bet.winAmount > 0);
            const claimedBets = allBets.filter(bet => bet.claimStatus === true);
            const unclaimedBets = allBets.filter(bet => bet.claimStatus === false && bet.winAmount && bet.winAmount > 0);
            const pendingBets = allBets.filter(bet => bet.claimStatus === false && (!bet.winAmount || bet.winAmount === 0));

            const totalWinningAmount = winningBets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0);
            const claimedAmount = claimedBets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0);
            const unclaimedAmount = unclaimedBets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0);

            return res.json({
                success: true,
                data: {
                    totalBets,
                    winningBets: winningBets.length,
                    claimedBets: claimedBets.length,
                    unclaimedBets: unclaimedBets.length,
                    pendingBets: pendingBets.length,
                    totalWinningAmount,
                    claimedAmount,
                    unclaimedAmount
                }
            });

        } catch (error) {
            logger.error('Error getting claim summary:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}



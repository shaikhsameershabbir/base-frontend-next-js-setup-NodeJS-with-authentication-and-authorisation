import { Request, Response } from 'express';
import { Transfer } from '../../../models/Transfer';
import { User } from '../../../models/User';

import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { UserHierarchy } from '../../../models/UserHierarchy';

// Interface for populated user data
interface PopulatedUser {
    _id: string;
    username: string;
    balance: number;
    role: string;
    isActive: boolean;
}

// Interface for child user data
interface ChildUser {
    id: string;
    username: string;
    balance: number;
    role: string;
    isActive: boolean;
    downlineCount: number;
}

export class TransfersController {
    async getChildUsers(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthenticatedRequest;
        try {
            const userId = authReq.user?.userId;
            const userRole = authReq.user?.role;

            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            let childUsers: ChildUser[] = [];

            // Handle different user roles
            console.log('User role:', userRole, 'User ID:', userId);

            if (userRole === 'superadmin') {
                // Superadmin can see all admins
                const admins = await User.find({
                    role: 'admin',
                    isActive: true
                }).select('username balance role isActive');

                console.log('Found admins for superadmin:', admins.length);

                childUsers = admins.map((admin) => ({
                    id: (admin as unknown as PopulatedUser)._id.toString(),
                    username: admin.username,
                    balance: admin.balance,
                    role: admin.role,
                    isActive: admin.isActive,
                    downlineCount: 0 // We'll calculate this if needed
                }));
            } else {
                // For other roles, get direct children from hierarchy
                const userHierarchy = await UserHierarchy.findOne({ userId });
                if (!userHierarchy) {
                    res.status(404).json({ message: 'User hierarchy not found' });
                    return;
                }

                // Find direct children (users with this user as parent)
                const hierarchyChildren = await UserHierarchy.find({ parentId: userId })
                    .populate({
                        path: 'userId',
                        select: 'username balance role isActive'
                    });

                childUsers = hierarchyChildren
                    .filter(child => child.userId !== null) // Filter out null userId records
                    .map(child => ({
                        id: (child.userId as unknown as PopulatedUser)._id,
                        username: (child.userId as unknown as PopulatedUser).username,
                        balance: (child.userId as unknown as PopulatedUser).balance,
                        role: (child.userId as unknown as PopulatedUser).role,
                        isActive: (child.userId as unknown as PopulatedUser).isActive,
                        downlineCount: child.downlineCount
                    }));
            }

            res.json({
                success: true,
                data: childUsers
            });
        } catch (error) {
            console.error('Error getting child users:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    async processTransfer(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthenticatedRequest;
        try {
            const { toUserId, amount, type, reason, adminNote } = req.body;
            const fromUserId = authReq.user?.userId;

            if (!fromUserId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            // Validate required fields
            if (!toUserId || !amount || !type || !reason) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            if (amount <= 0) {
                res.status(400).json({ message: 'Amount must be greater than 0' });
                return;
            }

            if (!['credit', 'debit'].includes(type)) {
                res.status(400).json({ message: 'Invalid transfer type' });
                return;
            }

            // Check if target user is a child of the current user
            const childHierarchy = await UserHierarchy.findOne({
                userId: toUserId,
                parentId: fromUserId
            });

            if (!childHierarchy) {
                res.status(403).json({ message: 'You can only transfer to your direct children' });
                return;
            }

            // Get both users
            const fromUser = await User.findById(fromUserId);
            const toUser = await User.findById(toUserId);

            if (!fromUser || !toUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            if (!fromUser.isActive || !toUser.isActive) {
                res.status(400).json({ message: 'User account is inactive' });
                return;
            }

            // Store balance before transaction
            const fromUserBalanceBefore = fromUser.balance;
            const toUserBalanceBefore = toUser.balance;

            // Validate balance for credit transfers
            if (type === 'credit') {
                if (fromUser.balance < amount) {
                    res.status(400).json({
                        message: 'Insufficient balance',
                        currentBalance: fromUser.balance,
                        requiredAmount: amount
                    });
                    return;
                }
            }

            // Validate balance for debit transfers
            if (type === 'debit') {
                if (toUser.balance < amount) {
                    res.status(400).json({
                        message: 'Insufficient balance in target user account',
                        targetUserBalance: toUser.balance,
                        requiredAmount: amount
                    });
                    return;
                }
            }

            // Create transfer record with balance information
            const transfer = new Transfer({
                fromUser: fromUserId,
                toUser: toUserId,
                amount,
                type,
                reason,
                adminNote,
                processedBy: fromUserId,
                status: 'pending',
                fromUserBalanceBefore,
                fromUserBalanceAfter: fromUserBalanceBefore, // Will be updated after transaction
                toUserBalanceBefore,
                toUserBalanceAfter: toUserBalanceBefore // Will be updated after transaction
            });

            await transfer.save();

            // Process the transfer
            try {
                let fromUserBalanceAfter, toUserBalanceAfter;

                if (type === 'credit') {
                    // Debit from parent, credit to child
                    fromUser.balance -= amount;
                    toUser.balance += amount;
                    fromUserBalanceAfter = fromUser.balance;
                    toUserBalanceAfter = toUser.balance;
                } else {
                    // Credit to parent, debit from child
                    fromUser.balance += amount;
                    toUser.balance -= amount;
                    fromUserBalanceAfter = fromUser.balance;
                    toUserBalanceAfter = toUser.balance;
                }

                await fromUser.save();
                await toUser.save();

                // Update transfer with final balance information
                transfer.fromUserBalanceAfter = fromUserBalanceAfter;
                transfer.toUserBalanceAfter = toUserBalanceAfter;
                transfer.status = 'completed';
                await transfer.save();

                res.json({
                    success: true,
                    message: 'Transfer completed successfully',
                    data: {
                        transferId: transfer._id,
                        fromUser: {
                            id: fromUser._id,
                            username: fromUser.username,
                            balanceBefore: fromUserBalanceBefore,
                            balanceAfter: fromUserBalanceAfter
                        },
                        toUser: {
                            id: toUser._id,
                            username: toUser.username,
                            balanceBefore: toUserBalanceBefore,
                            balanceAfter: toUserBalanceAfter
                        },
                        amount,
                        type,
                        reason
                    }
                });

            } catch (transferError) {
                // If transfer fails, mark as failed
                transfer.status = 'failed';
                await transfer.save();

                console.error('Transfer processing error:', transferError);
                res.status(500).json({ message: 'Transfer processing failed' });
                return;
            }

        } catch (error) {
            console.error('Error processing transfer:', error);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
    };
    async getTransferHistory(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthenticatedRequest;
        try {
            const userId = authReq.user?.userId;
            const { page = 1, limit = 20, status, type } = req.query;

            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const skip = (Number(page) - 1) * Number(limit);

            // Build filter
            const filter: Record<string, unknown> = {
                $or: [
                    { fromUser: userId },
                    { toUser: userId }
                ]
            };

            if (status && status !== 'all') {
                filter.status = status;
            }

            if (type && type !== 'all') {
                filter.type = type;
            }

            // Get transfers with pagination
            const transfers = await Transfer.find(filter)
                .populate('fromUser', 'username')
                .populate('toUser', 'username')
                .populate('processedBy', 'username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit));

            // Get total count
            const total = await Transfer.countDocuments(filter);

            // Helper function to format date
            const formatDate = (date: Date): string => {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                const hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const seconds = date.getSeconds().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
                return `${day}-${month}-${year} ${displayHours}:${minutes}:${seconds} ${ampm}`;
            };

            const formattedTransfers = transfers.map(transfer => ({
                id: transfer._id,
                fromUser: (transfer.fromUser as unknown as PopulatedUser)?.username || 'Unknown User',
                toUser: (transfer.toUser as unknown as PopulatedUser)?.username || 'Unknown User',
                amount: transfer.amount,
                type: transfer.type,
                status: transfer.status,
                reason: transfer.reason,
                adminNote: transfer.adminNote,
                processedBy: (transfer.processedBy as unknown as PopulatedUser)?.username || 'Unknown User',
                timestamp: formatDate(transfer.createdAt),
                fromUserBalanceBefore: transfer.fromUserBalanceBefore || 0,
                fromUserBalanceAfter: transfer.fromUserBalanceAfter || 0,
                toUserBalanceBefore: transfer.toUserBalanceBefore || 0,
                toUserBalanceAfter: transfer.toUserBalanceAfter || 0,
                isIncoming: (transfer.toUser as unknown as PopulatedUser)?._id?.toString() === userId,
                isOutgoing: (transfer.fromUser as unknown as PopulatedUser)?._id?.toString() === userId
            }));

            res.json({
                success: true,
                data: formattedTransfers,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });

        } catch (error) {
            console.error('Error getting transfer history:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    async getTransferStats(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthenticatedRequest;
        try {
            const userId = authReq.user?.userId;

            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const filter = {
                $or: [
                    { fromUser: userId },
                    { toUser: userId }
                ],
                status: 'completed'
            };

            const [totalTransfers, totalCredits, totalDebits, totalAmount] = await Promise.all([
                Transfer.countDocuments(filter),
                Transfer.countDocuments({ ...filter, type: 'credit' }),
                Transfer.countDocuments({ ...filter, type: 'debit' }),
                Transfer.aggregate([
                    { $match: filter },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ])
            ]);

            res.json({
                success: true,
                data: {
                    totalTransfers,
                    totalCredits,
                    totalDebits,
                    totalAmount: totalAmount[0]?.total || 0
                }
            });

        } catch (error) {
            console.error('Error getting transfer stats:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
} 
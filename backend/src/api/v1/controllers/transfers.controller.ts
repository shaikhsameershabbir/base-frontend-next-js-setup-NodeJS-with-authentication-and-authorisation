import { Request, Response } from 'express';
import { Transfer } from '../../../models/Transfer';
import { User } from '../../../models/User';
import { logger } from '../../../config/logger';

export class TransfersController {
    async getChildUsers(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // TODO: Implement proper hierarchy logic
            // For now, return empty array
            const childUsers: any[] = [];

            res.json({
                success: true,
                message: 'Child users retrieved successfully',
                data: { users: childUsers }
            });
        } catch (error) {
            logger.error('Get child users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async processTransfer(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { toUserId, amount, description } = req.body;

            // Validate amount
            if (amount <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than 0'
                });
                return;
            }

            // Check if user has sufficient balance
            const fromUser = await User.findById(req.user._id);
            if (!fromUser || fromUser.balance < amount) {
                res.status(400).json({
                    success: false,
                    message: 'Insufficient balance'
                });
                return;
            }

            // Check if recipient exists and is active
            const toUser = await User.findById(toUserId);
            if (!toUser || !toUser.isActive) {
                res.status(404).json({
                    success: false,
                    message: 'Recipient not found or inactive'
                });
                return;
            }

            // Create transfer record
            const transfer = new Transfer({
                fromUser: req.user._id,
                toUser: toUserId,
                amount,
                description,
                status: 'pending'
            });

            await transfer.save();

            // Update balances
            fromUser.balance -= amount;
            toUser.balance += amount;

            await Promise.all([fromUser.save(), toUser.save()]);

            // Update transfer status
            transfer.status = 'completed';
            await transfer.save();

            res.json({
                success: true,
                message: 'Transfer completed successfully',
                data: { transfer }
            });
        } catch (error) {
            logger.error('Process transfer error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getTransferHistory(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { page = 1, limit = 10, type = 'all' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            let query: any = {};

            // Filter by transfer type
            switch (type) {
                case 'sent':
                    query.fromUser = req.user._id;
                    break;
                case 'received':
                    query.toUser = req.user._id;
                    break;
                default:
                    query.$or = [
                        { fromUser: req.user._id },
                        { toUser: req.user._id }
                    ];
            }

            const transfers = await Transfer.find(query)
                .populate('fromUser', 'username')
                .populate('toUser', 'username')
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            const total = await Transfer.countDocuments(query);

            res.json({
                success: true,
                message: 'Transfer history retrieved successfully',
                data: transfers,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            logger.error('Get transfer history error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getTransferStats(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // Get transfer statistics
            const totalSent = await Transfer.aggregate([
                { $match: { fromUser: req.user._id, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const totalReceived = await Transfer.aggregate([
                { $match: { toUser: req.user._id, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const totalTransfers = await Transfer.countDocuments({
                $or: [
                    { fromUser: req.user._id },
                    { toUser: req.user._id }
                ],
                status: 'completed'
            });

            const stats = {
                totalSent: totalSent[0]?.total || 0,
                totalReceived: totalReceived[0]?.total || 0,
                totalTransfers,
                netAmount: (totalReceived[0]?.total || 0) - (totalSent[0]?.total || 0)
            };

            res.json({
                success: true,
                message: 'Transfer statistics retrieved successfully',
                data: { stats }
            });
        } catch (error) {
            logger.error('Get transfer stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 
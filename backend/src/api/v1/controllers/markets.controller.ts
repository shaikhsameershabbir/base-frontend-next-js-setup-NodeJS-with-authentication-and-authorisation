import { Request, Response } from 'express';
import { Market } from '../../../models/Market';
import { MarketRank } from '../../../models/MarketRank';
import { UserMarketAssignment } from '../../../models/UserMarketAssignment';
import { User } from '../../../models/User';
import { logger } from '../../../config/logger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { autoResultService } from '../../../services/autoResultService';

export class MarketsController {
    async getAllMarketsWithoutPagination(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.userId;
            const userRole = authReq.user?.role;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const query: { isActive?: boolean; _id?: { $in: string[] } } = {};

            let markets;

            // If user is superadmin, show all markets
            if (userRole === 'superadmin') {
                markets = await Market.find(query).sort({ createdAt: -1 });
            } else {
                // For other roles, get only assigned markets
                const userAssignments = await UserMarketAssignment.find({
                    assignedTo: userId,
                    isActive: true
                }).populate('marketId');

                const assignedMarketIds = userAssignments
                    .map(assignment => assignment.marketId)
                    .filter((marketId): marketId is NonNullable<typeof marketId> => marketId !== null)
                    .map(marketId => marketId._id.toString());

                if (assignedMarketIds.length === 0) {
                    res.json({
                        success: true,
                        message: 'No markets assigned to user',
                        data: []
                    });
                    return;
                }

                // Add assigned market filter to query
                query._id = { $in: assignedMarketIds };

                markets = await Market.find(query).sort({ createdAt: -1 });
            }

            res.json({
                success: true,
                message: 'All markets retrieved successfully',
                data: markets
            });
        } catch (error) {
            logger.error('Get all markets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getAllMarkets(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { page = 1, limit = 10, status, search } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const userId = authReq.user?.userId;
            const userRole = authReq.user?.role;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const query: { isActive?: boolean; _id?: { $in: unknown[] }; marketName?: unknown } = {};
            if (status) {
                if (status === 'active') {
                    query.isActive = true;
                } else if (status === 'inactive') {
                    query.isActive = false;
                }
            }

            // Add search functionality
            if (search && typeof search === 'string' && search.trim() !== '') {
                query.marketName = { $regex: search.trim(), $options: 'i' }; // Case-insensitive search
            }

            let markets;
            let total;

            // If user is superadmin, show all markets
            if (userRole === 'superadmin') {
                markets = await Market.find(query)
                    .skip(skip)
                    .limit(Number(limit))
                    .sort({ createdAt: -1 });

                total = await Market.countDocuments(query);
            } else {
                // For other roles, get only assigned markets
                const userAssignments = await UserMarketAssignment.find({
                    assignedTo: userId,
                    isActive: true
                }).populate('marketId');

                const assignedMarketIds = userAssignments
                    .map(assignment => assignment.marketId)
                    .filter((marketId): marketId is NonNullable<typeof marketId> => marketId !== null)
                    .map(marketId => marketId._id.toString());

                if (assignedMarketIds.length === 0) {
                    // No assigned markets
                    res.json({
                        success: true,
                        message: 'No markets assigned to user',
                        data: [],
                        pagination: {
                            page: Number(page),
                            limit: Number(limit),
                            total: 0,
                            totalPages: 0
                        }
                    });
                    return;
                }

                // Add assigned market filter to query
                query._id = { $in: assignedMarketIds };

                markets = await Market.find(query)
                    .skip(skip)
                    .limit(Number(limit))
                    .sort({ createdAt: -1 });

                total = await Market.countDocuments(query);
            }

            res.json({
                success: true,
                message: 'Markets retrieved successfully',
                data: markets,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            logger.error('Get markets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getMarketById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const market = await Market.findById(id);
            if (!market) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Market retrieved successfully',
                data: { market }
            });
        } catch (error) {
            logger.error('Get market by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async createMarket(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.userId;
            const userRole = authReq.user?.role;

            // Check if user is authenticated
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            // Check if user has permission to create markets (superadmin or admin)
            if (userRole !== 'superadmin' && userRole !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Only superadmin and admin users can create markets'
                });
                return;
            }

            const { marketName, openTime, closeTime, weekDays } = req.body;

            // Check if market already exists
            const existingMarket = await Market.findOne({ marketName });
            if (existingMarket) {
                res.status(409).json({
                    success: false,
                    message: 'Market with this name already exists'
                });
                return;
            }

            // Validate weekDays if provided
            if (weekDays && (typeof weekDays !== 'number' || weekDays < 1 || weekDays > 7)) {
                res.status(400).json({
                    success: false,
                    message: 'WeekDays must be a number between 1 and 7'
                });
                return;
            }

            const newMarket = new Market({
                marketName,
                openTime,
                closeTime,
                weekDays: weekDays || 7, // Default to 7 days if not provided
                isActive: true,
                autoResult: false
            });

            await newMarket.save();

            // If the user is an admin (not superadmin), automatically assign the market to them
            if (userRole === 'admin') {
                try {
                    const marketAssignment = new UserMarketAssignment({
                        assignedBy: userId, // Admin assigns to themselves
                        assignedTo: userId, // Admin assigns to themselves
                        marketId: newMarket._id,
                        assignedAt: new Date(),
                        isActive: true,
                        hierarchyLevel: 'admin'
                    });

                    await marketAssignment.save();

                } catch (assignmentError) {
                    logger.error('Error creating market assignment for admin:', assignmentError);
                    // Don't fail the market creation if assignment fails, just log the error
                }
            }

            res.status(201).json({
                success: true,
                message: 'Market created successfully',
                data: { market: newMarket }
            });
        } catch (error) {
            logger.error('Create market error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateMarket(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedMarket = await Market.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedMarket) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Market updated successfully',
                data: { market: updatedMarket }
            });
        } catch (error) {
            logger.error('Update market error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteMarket(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const deletedMarket = await Market.findByIdAndDelete(id);
            if (!deletedMarket) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Market deleted successfully'
            });
        } catch (error) {
            logger.error('Delete market error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateMarketStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            const updatedMarket = await Market.findByIdAndUpdate(
                id,
                { isActive },
                { new: true, runValidators: true }
            );

            if (!updatedMarket) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Market status updated successfully',
                data: { market: updatedMarket }
            });
        } catch (error) {
            logger.error('Update market status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async toggleGoldenStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { isGolden } = req.body;

            if (typeof isGolden !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'isGolden must be a boolean value'
                });
                return;
            }

            const updatedMarket = await Market.findByIdAndUpdate(
                id,
                { isGolden },
                { new: true, runValidators: true }
            );

            if (!updatedMarket) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }



            res.json({
                success: true,
                message: `Market ${isGolden ? 'marked as golden' : 'unmarked as golden'} successfully`,
                data: { market: updatedMarket }
            });
        } catch (error) {
            logger.error('Toggle golden status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async toggleAutoResult(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { autoResult } = req.body;

            if (typeof autoResult !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'autoResult must be a boolean value'
                });
                return;
            }

            const updatedMarket = await Market.findByIdAndUpdate(
                id,
                { autoResult },
                { new: true, runValidators: true }
            );

            if (!updatedMarket) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            // Integrate with auto result service
            if (autoResult) {
                // Add market to auto result service
                await autoResultService.addMarketToAutoResult(id);
            } else {
                // Remove market from auto result service
                await autoResultService.removeMarketFromAutoResult();
            }

            res.json({
                success: true,
                message: `Market auto result ${autoResult ? 'enabled' : 'disabled'} successfully`,
                data: { market: updatedMarket }
            });
        } catch (error) {
            logger.error('Toggle auto result error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getMarketRanks(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            // Get user's assigned markets
            const assignments = await UserMarketAssignment.find({
                assignedTo: userId,
                isActive: true
            }).populate('marketId');

            const marketIds = assignments
                .filter(assignment => assignment.marketId) // Filter out null marketIds
                .map(assignment => assignment.marketId);

            // Get total count of assigned markets (this is what we want to paginate)
            const totalAssignedMarkets = assignments.filter(assignment => assignment.marketId).length;

            // Get ranks for these markets
            const ranks = await MarketRank.find({
                userId: userId,
                marketId: { $in: marketIds }
            })
                .populate({
                    path: 'marketId',
                    model: 'Market',
                    select: 'marketName openTime closeTime isActive isGolden'
                })
                .sort({ rank: 1 })
                .skip(skip)
                .limit(Number(limit));

            // Check if this is the first time (no ranks exist at all)
            const totalExistingRanks = await MarketRank.countDocuments({
                userId: userId,
                marketId: { $in: marketIds }
            });

            // If ranks already exist for all assigned markets, just return them
            if (totalExistingRanks >= totalAssignedMarkets) {
                res.json({
                    success: true,
                    message: 'Market ranks retrieved successfully',
                    data: ranks,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: totalAssignedMarkets,
                        totalPages: Math.ceil(totalAssignedMarkets / Number(limit))
                    }
                });
                return;
            }

            // For markets without ranks, assign default ranks based on open time
            const marketsWithoutRanks = assignments.filter(assignment => {
                // Skip assignments with null marketId
                if (!assignment.marketId) {
                    logger.warn(`Assignment ${assignment._id} has null marketId`);
                    return false;
                }

                // Check if this market already has a rank
                return !ranks.some(rank => {
                    // Skip ranks with null marketId
                    if (!rank.marketId) {
                        logger.warn(`Rank ${rank._id} has null marketId`);
                        return false;
                    }

                    return rank.marketId.toString() === assignment.marketId.toString();
                });
            });

            if (marketsWithoutRanks.length > 0) {
                // Sort markets by open time for auto-ranking
                const sortedMarkets = marketsWithoutRanks
                    .filter(assignment => assignment.marketId) // Additional safety check
                    .map(assignment => {
                        const marketData = assignment.marketId as { marketName?: string; openTime?: string };
                        if (!assignment.marketId || !marketData.marketName) {
                            logger.warn(`Assignment ${assignment._id} has invalid marketId data`);
                            return null;
                        }
                        return {
                            assignment,
                            marketData,
                            openTime: marketData.openTime || '00:00:00' // Default to midnight if no open time
                        };
                    })
                    .filter(item => item !== null)
                    .sort((a, b) => {
                        // Sort by open time (HH:MM:SS format)
                        return a!.openTime.localeCompare(b!.openTime);
                    });

                // Get all existing ranks to find the next available rank number
                const existingRanks = await MarketRank.find({
                    userId: userId,
                    marketId: { $in: marketIds }
                }).sort({ rank: 1 });

                // Find the next available rank number
                let nextRank = 1;
                if (existingRanks.length > 0) {
                    // Find the highest rank and start from the next number
                    const maxRank = Math.max(...existingRanks.map(r => r.rank));
                    nextRank = maxRank + 1;
                }

                // Use upsert operations with ranks based on open time order
                const upsertPromises = sortedMarkets.map((item, index) => {
                    const newRank = nextRank + index;

                    return MarketRank.findOneAndUpdate(
                        {
                            userId: userId,
                            marketId: item!.assignment.marketId
                        },
                        {
                            marketName: item!.marketData.marketName,
                            marketId: item!.assignment.marketId,
                            rank: newRank,
                            userId: userId
                        },
                        {
                            upsert: true,
                            new: true,
                            setDefaultsOnInsert: true
                        }
                    );
                });

                if (upsertPromises.length > 0) {
                    await Promise.all(upsertPromises);
                }

                // Fetch updated ranks with pagination
                const updatedRanks = await MarketRank.find({
                    userId: userId,
                    marketId: { $in: marketIds }
                })
                    .populate({
                        path: 'marketId',
                        model: 'Market',
                        select: 'marketName openTime closeTime isActive isGolden'
                    })
                    .sort({ rank: 1 })
                    .skip(skip)
                    .limit(Number(limit));

                res.json({
                    success: true,
                    message: 'Market ranks retrieved successfully',
                    data: updatedRanks,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: totalAssignedMarkets,
                        totalPages: Math.ceil(totalAssignedMarkets / Number(limit))
                    }
                });
            } else {
                res.json({
                    success: true,
                    message: 'Market ranks retrieved successfully',
                    data: ranks,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: totalAssignedMarkets,
                        totalPages: Math.ceil(totalAssignedMarkets / Number(limit))
                    }
                });
            }
        } catch (error) {
            logger.error('Get market ranks error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateMarketRank(req: Request, res: Response): Promise<void> {
        try {
            const { userId, marketId } = req.params;
            const { rank } = req.body;

            if (!rank || rank < 1) {
                res.status(400).json({
                    success: false,
                    message: 'Valid rank is required (minimum 1)'
                });
                return;
            }

            // Check if user has access to this market
            const assignment = await UserMarketAssignment.findOne({
                assignedTo: userId,
                marketId: marketId,
                isActive: true
            });

            if (!assignment) {
                res.status(403).json({
                    success: false,
                    message: 'User does not have access to this market'
                });
                return;
            }

            // Get the market details
            const market = await Market.findById(marketId);
            if (!market) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            // Get current rank of this market
            const currentRankDoc = await MarketRank.findOne({
                userId: userId,
                marketId: marketId
            });

            const currentRank = currentRankDoc ? currentRankDoc.rank : null;
            const newRank = rank;

            // If rank is not changing, just update and return
            if (currentRank === newRank) {
                const updatedRank = await MarketRank.findOneAndUpdate(
                    { userId: userId, marketId: marketId },
                    {
                        marketName: market.marketName,
                        rank: newRank,
                        userId: userId,
                        marketId: marketId
                    },
                    { upsert: true, new: true }
                ).populate({
                    path: 'marketId',
                    model: 'Market',
                    select: 'marketName openTime closeTime isActive isGolden'
                });

                res.json({
                    success: true,
                    message: 'Market rank updated successfully',
                    data: updatedRank
                });
                return;
            }

            try {
                // Step 1: Temporarily set the target market to a very high rank to avoid conflicts
                const tempRank = 999999;
                await MarketRank.findOneAndUpdate(
                    { userId: userId, marketId: marketId },
                    {
                        marketName: market.marketName,
                        rank: tempRank,
                        userId: userId,
                        marketId: marketId
                    },
                    { upsert: true }
                );

                // Step 2: Reorder all other markets
                if (currentRank !== null) {
                    if (newRank < currentRank) {
                        // Moving to a lower rank (e.g., 21 to 1)
                        // Shift all markets from newRank to currentRank-1 up by 1
                        await MarketRank.updateMany(
                            {
                                userId: userId,
                                marketId: { $ne: marketId },
                                rank: { $gte: newRank, $lt: currentRank }
                            },
                            { $inc: { rank: 1 } }
                        );
                    } else if (newRank > currentRank) {
                        // Moving to a higher rank (e.g., 1 to 21)
                        // Shift all markets from currentRank+1 to newRank down by 1
                        await MarketRank.updateMany(
                            {
                                userId: userId,
                                marketId: { $ne: marketId },
                                rank: { $gt: currentRank, $lte: newRank }
                            },
                            { $inc: { rank: -1 } }
                        );
                    }
                } else {
                    // This market didn't have a rank before
                    // Shift all markets at or above newRank up by 1
                    await MarketRank.updateMany(
                        {
                            userId: userId,
                            marketId: { $ne: marketId },
                            rank: { $gte: newRank }
                        },
                        { $inc: { rank: 1 } }
                    );
                }

                // Step 3: Set the target market to its final rank
                await MarketRank.findOneAndUpdate(
                    { userId: userId, marketId: marketId },
                    {
                        marketName: market.marketName,
                        rank: newRank,
                        userId: userId,
                        marketId: marketId
                    }
                );

                // Fetch the updated rank
                const updatedRank = await MarketRank.findOne({
                    userId: userId,
                    marketId: marketId
                }).populate({
                    path: 'marketId',
                    model: 'Market',
                    select: 'marketName openTime closeTime isActive isGolden'
                });

                res.json({
                    success: true,
                    message: 'Market rank updated and reordered successfully',
                    data: updatedRank
                });

            } catch (error) {
                logger.error('Rank reordering failed:', error);
                throw error;
            }

        } catch (error) {
            logger.error('Update market rank error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getAdminsWithMarkets(req: Request, res: Response): Promise<void> {
        try {
            // Get all admin users
            const admins = await User.find({
                role: 'admin',
                isActive: true
            }).select('_id username');



            // Get market assignments for each admin
            const adminsWithMarkets = await Promise.all(
                admins.map(async (admin) => {
                    try {
                        const assignments = await UserMarketAssignment.find({
                            assignedTo: admin._id,
                            isActive: true
                        }).populate('marketId');



                        const markets = assignments
                            .filter(assignment => {
                                if (!assignment.marketId) {
                                    logger.warn(`Assignment ${assignment._id} has null marketId for admin ${admin.username}`);
                                    return false;
                                }
                                return true;
                            })
                            .map(assignment => {
                                // Check if marketId is populated (has marketName property)
                                if (typeof assignment.marketId === 'object' && assignment.marketId && 'marketName' in assignment.marketId) {
                                    const marketData = assignment.marketId as Record<string, unknown>;
                                    return {
                                        _id: (marketData._id as string) || marketData.toString(),
                                        marketName: (marketData.marketName as string) || 'Unknown Market',
                                        openTime: (marketData.openTime as string) || 'N/A',
                                        closeTime: (marketData.closeTime as string) || 'N/A',
                                        isActive: (marketData.isActive as boolean) || false
                                    };
                                } else {
                                    // If not populated, return basic info
                                    return {
                                        _id: assignment.marketId.toString(),
                                        marketName: 'Unknown Market',
                                        openTime: 'N/A',
                                        closeTime: 'N/A',
                                        isActive: false
                                    };
                                }
                            });

                        return {
                            _id: admin._id,
                            username: admin.username,
                            markets: markets
                        };
                    } catch (adminError) {
                        logger.error(`Error processing admin ${admin.username}:`, adminError);
                        return {
                            _id: admin._id,
                            username: admin.username,
                            markets: []
                        };
                    }
                })
            );

            res.json({
                success: true,
                message: 'Admins with markets retrieved successfully',
                data: adminsWithMarkets
            });
        } catch (error) {
            logger.error('Get admins with markets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 
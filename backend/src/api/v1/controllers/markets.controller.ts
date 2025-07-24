import { Request, Response } from 'express';
import { Market } from '../../../models/Market';
import { MarketRank } from '../../../models/marketRank';
import { UserMarketAssignment } from '../../../models/UserMarketAssignment';
import { User } from '../../../models/User';
import { logger } from '../../../config/logger';

export class MarketsController {
    async getAllMarkets(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const query: { status?: string } = {};
            if (status) {
                query.status = status as string;
            }

            const markets = await Market.find(query)
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            const total = await Market.countDocuments(query);

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
            const { marketName, openTime, closeTime } = req.body;

            // Check if market already exists
            const existingMarket = await Market.findOne({ marketName });
            if (existingMarket) {
                res.status(409).json({
                    success: false,
                    message: 'Market with this name already exists'
                });
                return;
            }

            const newMarket = new Market({
                marketName,
                openTime,
                closeTime,
                isActive: true
            });

            await newMarket.save();

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
                    select: 'marketName openTime closeTime isActive'
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
                logger.info(`All ${totalAssignedMarkets} assigned markets already have ranks for user ${userId}. Returning existing ranks.`);

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

            // Only create ranks if some markets don't have ranks yet
            if (totalExistingRanks === 0 && totalAssignedMarkets > 0) {
                logger.info(`No ranks exist for user ${userId}. Creating ranks for all ${totalAssignedMarkets} assigned markets starting from 1.`);
            } else if (totalExistingRanks > 0 && totalExistingRanks < totalAssignedMarkets) {
                logger.info(`Some markets don't have ranks for user ${userId}. Creating ranks for ${totalAssignedMarkets - totalExistingRanks} remaining markets.`);
            }

            // For markets without ranks, assign default ranks
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

                logger.info(`Creating ${marketsWithoutRanks.length} new ranks starting from rank ${nextRank}`);

                // Use upsert operations instead of insertMany to avoid duplicates
                const upsertPromises = marketsWithoutRanks
                    .filter(assignment => assignment.marketId) // Additional safety check
                    .map((assignment, index) => {
                        const newRank = nextRank + index;

                        // Ensure assignment.marketId exists and has required properties
                        const marketData = assignment.marketId as { marketName?: string };
                        if (!assignment.marketId || !marketData.marketName) {
                            logger.warn(`Assignment ${assignment._id} has invalid marketId data`);
                            return null;
                        }

                        logger.info(`Assigning rank ${newRank} to market ${marketData.marketName}`);

                        return MarketRank.findOneAndUpdate(
                            {
                                userId: userId,
                                marketId: assignment.marketId
                            },
                            {
                                marketName: marketData.marketName,
                                marketId: assignment.marketId,
                                rank: newRank,
                                userId: userId
                            },
                            {
                                upsert: true,
                                new: true,
                                setDefaultsOnInsert: true
                            }
                        );
                    })
                    .filter(promise => promise !== null); // Filter out null promises

                if (upsertPromises.length > 0) {
                    await Promise.all(upsertPromises);
                    logger.info(`Successfully created ${upsertPromises.length} new market ranks`);
                }

                // Fetch updated ranks with pagination
                const updatedRanks = await MarketRank.find({
                    userId: userId,
                    marketId: { $in: marketIds }
                })
                    .populate({
                        path: 'marketId',
                        model: 'Market',
                        select: 'marketName openTime closeTime isActive'
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

            logger.info(`Updating market ${market.marketName} rank from ${currentRank} to ${newRank} for user ${userId}`);

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
                    select: 'marketName openTime closeTime isActive'
                });

                res.json({
                    success: true,
                    message: 'Market rank updated successfully',
                    data: updatedRank
                });
                return;
            }

            // Get all existing ranks for this user, sorted by current rank
            const allRanks = await MarketRank.find({
                userId: userId
            }).sort({ rank: 1 });

            logger.info(`Found ${allRanks.length} existing ranks for user ${userId}`);

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

                logger.info(`Successfully reordered ranks for user ${userId}. Market ${market.marketName} moved from rank ${currentRank} to rank ${newRank}`);

                // Fetch the updated rank
                const updatedRank = await MarketRank.findOne({
                    userId: userId,
                    marketId: marketId
                }).populate({
                    path: 'marketId',
                    model: 'Market',
                    select: 'marketName openTime closeTime isActive'
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

            logger.info(`Found ${admins.length} admin users`);

            // Get market assignments for each admin
            const adminsWithMarkets = await Promise.all(
                admins.map(async (admin) => {
                    try {
                        const assignments = await UserMarketAssignment.find({
                            assignedTo: admin._id,
                            isActive: true
                        }).populate('marketId');

                        logger.info(`Found ${assignments.length} assignments for admin ${admin.username}`);

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
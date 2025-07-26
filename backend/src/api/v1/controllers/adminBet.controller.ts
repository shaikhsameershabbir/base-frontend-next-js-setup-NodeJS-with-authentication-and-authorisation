import { Response } from 'express';
import { User } from '../../../models/User';
import { Bet } from '../../../models/Bet';
import { UserHierarchy } from '../../../models/UserHierarchy';
import { logger } from '../../../config/logger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Types } from 'mongoose';

interface FilterOptions {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    dateFilter?: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'custom';
    adminId?: string;
    distributorId?: string;
    agentId?: string;
    playerId?: string;
    marketId?: string;
    betType?: 'open' | 'close';
    gameType?: string;
}

interface HierarchyOption {
    _id: string | Types.ObjectId;
    username: string;
}

export class AdminBetController {
    constructor() {
        this.getBets = this.getBets.bind(this);
        this.getBetById = this.getBetById.bind(this);
        this.getHierarchyOptions = this.getHierarchyOptions.bind(this);
        this.buildDateFilter = this.buildDateFilter.bind(this);
        this.buildUserHierarchyFilter = this.buildUserHierarchyFilter.bind(this);
        this.checkBetAccess = this.checkBetAccess.bind(this);
        this.calculateBetSummary = this.calculateBetSummary.bind(this);
    }

    async getBets(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const {
                page = 1,
                limit = 10,
                startDate,
                endDate,
                dateFilter = 'today',
                adminId,
                distributorId,
                agentId,
                playerId,
                marketId,
                betType,
                gameType
            } = req.query as FilterOptions;

            // Build date filter
            const dateFilterQuery = this.buildDateFilter(dateFilter, startDate, endDate);

            // Build user hierarchy filter
            const userFilterQuery = await this.buildUserHierarchyFilter(
                req.user.userId,
                req.user.role,
                { adminId, distributorId, agentId, playerId }
            );

            // Build bet filter
            const betFilterQuery: Record<string, unknown> = {
                ...dateFilterQuery,
                ...userFilterQuery
            };

            if (marketId) {
                betFilterQuery.marketId = marketId;
            }

            if (betType) {
                betFilterQuery.betType = betType;
            }

            if (gameType) {
                betFilterQuery.type = gameType;
            }

            // Calculate pagination
            const skip = (page - 1) * limit;

            // Get bets with populated data
            const bets = await Bet.find(betFilterQuery)
                .populate('marketId', 'marketName openTime closeTime')
                .populate('userId', 'username role balance')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            // Get total count for pagination
            const totalBets = await Bet.countDocuments(betFilterQuery);

            // Calculate pagination info
            const totalPages = Math.ceil(totalBets / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            // Calculate summary statistics
            const summary = await this.calculateBetSummary(betFilterQuery);

            logger.info(`Admin bets retrieved: User ${req.user.userId}, Role ${req.user.role}, Page ${page}, Total ${totalBets}`);

            res.json({
                success: true,
                message: 'Bets retrieved successfully',
                data: {
                    bets,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalBets,
                        hasNextPage,
                        hasPrevPage,
                        limit
                    },
                    summary
                }
            });

        } catch (error) {
            logger.error('Get admin bets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getBetById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { betId } = req.params;

            // Get bet with full details
            const bet = await Bet.findById(betId)
                .populate('marketId', 'marketName openTime closeTime isActive isGolden')
                .populate('userId', 'username role balance isActive')
                .lean();

            if (!bet) {
                res.status(404).json({
                    success: false,
                    message: 'Bet not found'
                });
                return;
            }

            // Check if user has access to this bet based on hierarchy
            const hasAccess = await this.checkBetAccess(req.user.userId, req.user.role, (bet.userId as { _id: string })._id);
            if (!hasAccess) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied to this bet'
                });
                return;
            }

            logger.info(`Bet details retrieved: Bet ${betId}, User ${req.user.userId}`);

            res.json({
                success: true,
                message: 'Bet details retrieved successfully',
                data: bet
            });

        } catch (error) {
            logger.error('Get bet details error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getHierarchyOptions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { level } = req.query;
            const currentUserId = req.user.userId;
            const currentUserRole = req.user.role;

            let adminId: string | undefined;
            let distributorId: string | undefined;
            let agentId: string | undefined;
            let hierarchyOptions: HierarchyOption[] = [];

            switch (currentUserRole) {
                case 'superadmin':
                    if (level === 'admin') {
                        hierarchyOptions = await User.find({ role: 'admin', isActive: true })
                            .select('_id username')
                            .lean() as unknown as HierarchyOption[];
                    } else if (level === 'distributor') {
                        adminId = req.query.adminId as string;
                        if (adminId) {
                            hierarchyOptions = await User.find({
                                role: 'distributor',
                                parentId: adminId,
                                isActive: true
                            })
                                .select('_id username')
                                .lean() as unknown as HierarchyOption[];
                        }
                    } else if (level === 'agent') {
                        distributorId = req.query.distributorId as string;
                        if (distributorId) {
                            hierarchyOptions = await User.find({
                                role: 'agent',
                                parentId: distributorId,
                                isActive: true
                            })
                                .select('_id username')
                                .lean() as unknown as HierarchyOption[];
                        }
                    } else if (level === 'player') {
                        agentId = req.query.agentId as string;
                        if (agentId) {
                            hierarchyOptions = await User.find({
                                role: 'player',
                                parentId: agentId,
                                isActive: true
                            })
                                .select('_id username')
                                .lean() as unknown as HierarchyOption[];
                        }
                    }
                    break;
                case 'admin':
                    if (level === 'distributor') {
                        hierarchyOptions = await User.find({
                            role: 'distributor',
                            parentId: currentUserId,
                            isActive: true
                        })
                            .select('_id username')
                            .lean() as unknown as HierarchyOption[];
                    } else if (level === 'agent') {
                        distributorId = req.query.distributorId as string;
                        if (distributorId) {
                            // Verify distributor belongs to this admin
                            const distributor = await User.findOne({
                                _id: distributorId,
                                parentId: currentUserId
                            });
                            if (distributor) {
                                hierarchyOptions = await User.find({
                                    role: 'agent',
                                    parentId: distributorId,
                                    isActive: true
                                })
                                    .select('_id username')
                                    .lean() as unknown as HierarchyOption[];
                            }
                        }
                    } else if (level === 'player') {
                        agentId = req.query.agentId as string;
                        if (agentId) {
                            // Verify agent belongs to this admin's downline
                            const agent = await User.findOne({ _id: agentId, role: 'agent' });
                            if (agent) {
                                const agentHierarchy = await UserHierarchy.findOne({ userId: agentId });
                                if (agentHierarchy) {
                                    const currentUserObjectId = new Types.ObjectId(currentUserId);
                                    const pathArray: Types.ObjectId[] = agentHierarchy.path as Types.ObjectId[];
                                    if (pathArray.some((id: Types.ObjectId) => id.equals(currentUserObjectId))) {
                                        hierarchyOptions = await User.find({
                                            role: 'player',
                                            parentId: agentId,
                                            isActive: true
                                        })
                                            .select('_id username')
                                            .lean() as unknown as HierarchyOption[];
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'distributor':
                    if (level === 'agent') {
                        hierarchyOptions = await User.find({
                            role: 'agent',
                            parentId: currentUserId,
                            isActive: true
                        })
                            .select('_id username')
                            .lean() as unknown as HierarchyOption[];
                    } else if (level === 'player') {
                        agentId = req.query.agentId as string;
                        if (agentId) {
                            // Verify agent belongs to this distributor
                            const agent = await User.findOne({
                                _id: agentId,
                                parentId: currentUserId
                            });
                            if (agent) {
                                hierarchyOptions = await User.find({
                                    role: 'player',
                                    parentId: agentId,
                                    isActive: true
                                })
                                    .select('_id username')
                                    .lean() as unknown as HierarchyOption[];
                            }
                        }
                    }
                    break;
                case 'agent':
                    if (level === 'player') {
                        hierarchyOptions = await User.find({
                            role: 'player',
                            parentId: currentUserId,
                            isActive: true
                        })
                            .select('_id username')
                            .lean() as unknown as HierarchyOption[];
                    }
                    break;
            }

            res.json({
                success: true,
                message: 'Hierarchy options retrieved successfully',
                data: hierarchyOptions
            });

        } catch (error) {
            logger.error('Get hierarchy options error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    private buildDateFilter(dateFilter: string, startDate?: string, endDate?: string): Record<string, unknown> {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

        switch (dateFilter) {
            case 'today':
                return {
                    createdAt: {
                        $gte: today,
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    }
                };
            case 'yesterday':
                return {
                    createdAt: {
                        $gte: yesterday,
                        $lt: today
                    }
                };
            case 'thisWeek':
                return {
                    createdAt: {
                        $gte: startOfWeek,
                        $lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
                    }
                };
            case 'lastWeek':
                return {
                    createdAt: {
                        $gte: startOfLastWeek,
                        $lt: startOfWeek
                    }
                };
            case 'custom':
                if (startDate && endDate) {
                    return {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate + 'T23:59:59.999Z')
                        }
                    };
                }
                return {};
            default:
                return {
                    createdAt: {
                        $gte: today,
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    }
                };
        }
    }

    private async buildUserHierarchyFilter(
        currentUserId: string,
        currentUserRole: string,
        filters: { adminId?: string; distributorId?: string; agentId?: string; playerId?: string }
    ): Promise<Record<string, unknown>> {
        const { adminId, distributorId, agentId, playerId } = filters;

        // If specific player is selected, filter by that player only
        if (playerId) {
            return { userId: playerId };
        }

        // If specific agent is selected, get all players under that agent
        if (agentId) {
            const players = await User.find({ parentId: agentId, role: 'player' }).select('_id').lean();
            const playerIds = players.map((p: any) => p._id);
            return { userId: { $in: playerIds } };
        }

        // If specific distributor is selected, get all players under that distributor
        if (distributorId) {
            const agents = await User.find({ parentId: distributorId, role: 'agent' }).select('_id').lean();
            const agentIds = agents.map((a: any) => a._id);
            const players = await User.find({ parentId: { $in: agentIds }, role: 'player' }).select('_id').lean();
            const playerIds = players.map((p: any) => p._id);
            return { userId: { $in: playerIds } };
        }

        // If specific admin is selected, get all players under that admin
        if (adminId) {
            const distributors = await User.find({ parentId: adminId, role: 'distributor' }).select('_id').lean();
            const distributorIds = distributors.map((d: any) => d._id);
            const agents = await User.find({ parentId: { $in: distributorIds }, role: 'agent' }).select('_id').lean();
            const agentIds = agents.map((a: any) => a._id);
            const players = await User.find({ parentId: { $in: agentIds }, role: 'player' }).select('_id').lean();
            const playerIds = players.map((p: any) => p._id);
            return { userId: { $in: playerIds } };
        }

        // Default: get all players under current user based on role
        switch (currentUserRole) {
            case 'superadmin': {
                // Get all players in the system
                const allPlayers = await User.find({ role: 'player' }).select('_id').lean();
                const allPlayerIds = allPlayers.map((p: any) => p._id);
                return { userId: { $in: allPlayerIds } };
            }

            case 'admin': {
                // Get all players under this admin
                const adminDistributors = await User.find({ parentId: currentUserId, role: 'distributor' }).select('_id').lean();
                const adminDistributorIds = adminDistributors.map((d: any) => d._id);
                const adminAgents = await User.find({ parentId: { $in: adminDistributorIds }, role: 'agent' }).select('_id').lean();
                const adminAgentIds = adminAgents.map((a: any) => a._id);
                const adminPlayers = await User.find({ parentId: { $in: adminAgentIds }, role: 'player' }).select('_id').lean();
                const adminPlayerIds = adminPlayers.map((p: any) => p._id);
                return { userId: { $in: adminPlayerIds } };
            }

            case 'distributor': {
                // Get all players under this distributor
                const distributorAgents = await User.find({ parentId: currentUserId, role: 'agent' }).select('_id').lean();
                const distributorAgentIds = distributorAgents.map((a: any) => a._id);
                const distributorPlayers = await User.find({ parentId: { $in: distributorAgentIds }, role: 'player' }).select('_id').lean();
                const distributorPlayerIds = distributorPlayers.map((p: any) => p._id);
                return { userId: { $in: distributorPlayerIds } };
            }

            case 'agent': {
                // Get all players under this agent
                const agentPlayers = await User.find({ parentId: currentUserId, role: 'player' }).select('_id').lean();
                const agentPlayerIds = agentPlayers.map((p: any) => p._id);
                return { userId: { $in: agentPlayerIds } };
            }

            default:
                return {};
        }
    }

    private async checkBetAccess(currentUserId: string, currentUserRole: string, betUserId: string): Promise<boolean> {
        // Superadmin can access all bets
        if (currentUserRole === 'superadmin') {
            return true;
        }

        // Check if the bet belongs to a player in the current user's downline
        const betUser = await User.findById(betUserId);
        if (!betUser || betUser.role !== 'player') {
            return false;
        }

        const userHierarchy = await UserHierarchy.findOne({ userId: betUserId });
        if (!userHierarchy) {
            return false;
        }

        // Check if current user is in the path of the bet user
        const currentUserObjectId = new Types.ObjectId(currentUserId);
        const pathArray: Types.ObjectId[] = userHierarchy.path as Types.ObjectId[];
        return pathArray.some((id: Types.ObjectId) => id.equals(currentUserObjectId));
    }

    private async calculateBetSummary(filterQuery: Record<string, unknown>): Promise<Record<string, unknown>> {
        const pipeline = [
            { $match: filterQuery },
            {
                $group: {
                    _id: null,
                    totalBets: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    openBets: {
                        $sum: { $cond: [{ $eq: ['$betType', 'open'] }, 1, 0] }
                    },
                    closeBets: {
                        $sum: { $cond: [{ $eq: ['$betType', 'close'] }, 1, 0] }
                    },
                    openAmount: {
                        $sum: { $cond: [{ $eq: ['$betType', 'open'] }, '$amount', 0] }
                    },
                    closeAmount: {
                        $sum: { $cond: [{ $eq: ['$betType', 'close'] }, '$amount', 0] }
                    }
                }
            }
        ];

        const result = await Bet.aggregate(pipeline);
        const summary = result[0] || {
            totalBets: 0,
            totalAmount: 0,
            openBets: 0,
            closeBets: 0,
            openAmount: 0,
            closeAmount: 0
        };

        return summary;
    }
} 
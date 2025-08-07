import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Result } from '../../../models/result';
import { Market } from '../../../models/Market';

// Types for market results
interface MarketResultItem {
    marketId: string;
    success: boolean;
    message?: string;
    data?: unknown;
}

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

        // Validate marketIds
        if (!marketIds || !Array.isArray(marketIds) || marketIds.length === 0) {
            res.status(400).json({ success: false, message: 'Market IDs array is required' });
            return;
        }

        const results: MarketResultItem[] = [];

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


import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Result } from '../../../models/result';
import { Market } from '../../../models/Market';
import { logger } from '../../../config/logger';

// Types for market results
interface MarketResultItem {
    marketId: string;
    success: boolean;
    message?: string;
    data?: unknown;
}

// Helper function to normalize date to start of day
const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

// Get results for a specific market and date
export const getMarketResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = (req as AuthenticatedRequest).user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { marketId } = req.params;
        const { date } = req.query; // Optional date parameter, defaults to today

        // Debug logs

        if (!marketId) {
            res.status(400).json({ success: false, message: 'Market ID is required' });
            return;
        }

        // Get market
        const market = await Market.findById(marketId);
        if (!market) {
            res.status(404).json({ success: false, message: 'Market not found' });
            return;
        }

        // Use provided date or default to today
        const targetDate = date ? new Date(date as string) : new Date();
        const normalizedDate = normalizeDate(targetDate);
        const result = await Result.findOne({
            marketId,
            resultDate: normalizedDate
        }).populate('marketId', 'marketName weekDays').populate('declaredBy', 'username');

      

        if (!result) {
            res.json({
                success: true,
                message: 'No results found for this date',
                data: {
                    marketId: marketId,
                    resultDate: normalizedDate,
                    results: {
                        open: null,
                        main: null,
                        close: null,
                        openDeclationTime: null,
                        closeDeclationTime: null
                    }
                }
            });
            return;
        }

        res.json({
            success: true,
            message: 'Results retrieved successfully',
            data: result
        });
    } catch (error) {
        logger.error('Error in getMarketResults:', error);
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
            .populate('marketId', 'marketName weekDays')
            .populate('declaredBy', 'username')
            .sort({ resultDate: -1 });

        res.json({
            success: true,
            message: 'All results retrieved successfully',
            data: results
        });
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all market results for multiple markets
export const getAllMarketResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const { marketIds } = req.body;
        const { date } = req.query; // Optional date parameter, defaults to today

        // Validate marketIds
        if (!marketIds || !Array.isArray(marketIds) || marketIds.length === 0) {
            res.status(400).json({ success: false, message: 'No Markets Available!' });
            return;
        }

        const results: MarketResultItem[] = [];
        const targetDate = date ? new Date(date as string) : new Date();
        const normalizedDate = normalizeDate(targetDate);

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

                // Find result for the specific date
                const result = await Result.findOne({
                    marketId: marketId,
                    resultDate: normalizedDate
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
                            resultDate: normalizedDate,
                            results: {
                                open: null,
                                main: null,
                                close: null,
                                openDeclationTime: null,
                                closeDeclationTime: null
                            }
                        }
                    });
                }
            } catch {
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
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


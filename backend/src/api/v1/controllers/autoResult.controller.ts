import { Request, Response } from 'express';
import { autoResultService } from '../../../services/autoResultService';
import { Market } from '../../../models/Market';
import { logger } from '../../../config/logger';

export class AutoResultController {
    /**
     * Get status of auto result service
     */
    async getStatus(req: Request, res: Response): Promise<void> {
        try {
            const status = autoResultService.getStatus();

            // Get additional market information
            const autoMarkets = await Market.find({ autoResult: true, isActive: true })
                .select('_id marketName openTime closeTime weekDays')
                .sort({ marketName: 1 });

            res.json({
                success: true,
                message: 'Auto result service status retrieved successfully',
                data: {
                    ...status,
                    markets: autoMarkets
                }
            });
        } catch (error) {
            logger.error('Get auto result status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Start auto result service
     */
    async startService(req: Request, res: Response): Promise<void> {
        try {
            autoResultService.start();

            res.json({
                success: true,
                message: 'Auto result service started successfully'
            });
        } catch (error) {
            logger.error('Start auto result service error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Stop auto result service
     */
    async stopService(req: Request, res: Response): Promise<void> {
        try {
            autoResultService.stop();

            res.json({
                success: true,
                message: 'Auto result service stopped successfully'
            });
        } catch (error) {
            logger.error('Stop auto result service error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Restart auto result service
     */
    async restartService(req: Request, res: Response): Promise<void> {
        try {
            await autoResultService.restart();

            res.json({
                success: true,
                message: 'Auto result service restarted successfully'
            });
        } catch (error) {
            logger.error('Restart auto result service error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Add market to auto result service
     */
    async addMarket(req: Request, res: Response): Promise<void> {
        try {
            const { marketId } = req.params;

            if (!marketId) {
                res.status(400).json({
                    success: false,
                    message: 'Market ID is required'
                });
                return;
            }

            // Check if market exists and has auto result enabled
            const market = await Market.findById(marketId);
            if (!market) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            if (!market.autoResult) {
                res.status(400).json({
                    success: false,
                    message: 'Market does not have auto result enabled'
                });
                return;
            }

            if (!market.isActive) {
                res.status(400).json({
                    success: false,
                    message: 'Market is not active'
                });
                return;
            }

            await autoResultService.addMarketToAutoResult(marketId);

            res.json({
                success: true,
                message: `Market ${market.marketName} added to auto result service successfully`
            });
        } catch (error) {
            logger.error('Add market to auto result error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Remove market from auto result service
     */
    async removeMarket(req: Request, res: Response): Promise<void> {
        try {
            const { marketId } = req.params;

            if (!marketId) {
                res.status(400).json({
                    success: false,
                    message: 'Market ID is required'
                });
                return;
            }

            await autoResultService.removeMarketFromAutoResult();

            res.json({
                success: true,
                message: 'Market removed from auto result service successfully'
            });
        } catch (error) {
            logger.error('Remove market from auto result error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get auto result logs for a specific market
     */
    async getMarketLogs(req: Request, res: Response): Promise<void> {
        try {
            const { marketId } = req.params;
            const { date } = req.query;

            if (!marketId) {
                res.status(400).json({
                    success: false,
                    message: 'Market ID is required'
                });
                return;
            }

            // Get market details
            const market = await Market.findById(marketId);
            if (!market) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            // Get results for the specified date or today
            const targetDate = date ? new Date(date as string) : new Date();
            const dayName = this.getDayName(targetDate);
            const weekDates = this.getWeekDates(targetDate);

            const result = await this.getTodayResult(marketId, targetDate);

            if (!result) {
                res.json({
                    success: true,
                    message: 'No results found for this date',
                    data: {
                        marketId,
                        marketName: market.marketName,
                        date: targetDate,
                        dayName,
                        result: null
                    }
                });
                return;
            }

            const dayResult = result.results[dayName] || null;

            res.json({
                success: true,
                message: 'Market logs retrieved successfully',
                data: {
                    marketId,
                    marketName: market.marketName,
                    date: targetDate,
                    dayName,
                    result: dayResult,
                    weekStartDate: result.weekStartDate,
                    weekEndDate: result.weekEndDate
                }
            });
        } catch (error) {
            logger.error('Get market logs error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get all auto result logs
     */
    async getAllLogs(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, marketId, date } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const query: Record<string, any> = {};

            if (marketId) {
                query.marketId = marketId;
            }

            if (date) {
                const targetDate = new Date(date as string);
                const weekDates = this.getWeekDates(targetDate);
                query.weekStartDate = { $gte: weekDates.startDate, $lte: weekDates.endDate };
            }

            // Get results with pagination
            const results = await this.getResultsWithPagination(query, skip, Number(limit));
            const total = await this.getResultsCount(query);

            res.json({
                success: true,
                message: 'Auto result logs retrieved successfully',
                data: results,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            logger.error('Get all logs error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Helper method to get day name from date
     */
    private getDayName(date: Date): string {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }

    /**
     * Helper method to get week dates
     */
    private getWeekDates(date: Date): { startDate: Date; endDate: Date } {
        const currentDay = date.getDay();
        const monday = new Date(date);
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
        monday.setDate(date.getDate() - daysToMonday);
        monday.setHours(0, 0, 0, 0);

        const endDate = new Date(monday);
        endDate.setDate(monday.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        return { startDate: monday, endDate };
    }

    /**
     * Helper method to get today's result
     */
    private async getTodayResult(marketId: string, date: Date): Promise<any> {
        const { startDate, endDate } = this.getWeekDates(date);

        return await this.getResultByWeekDates(marketId, startDate, endDate);
    }

    /**
     * Helper method to get result by week dates
     */
    private async getResultByWeekDates(marketId: string, startDate: Date, endDate: Date): Promise<any> {
        // This would need to be implemented based on your Result model
        // For now, returning null as placeholder
        return null;
    }

    /**
     * Helper method to get results with pagination
     */
    private async getResultsWithPagination(query: any, skip: number, limit: number): Promise<any[]> {
        // This would need to be implemented based on your Result model
        // For now, returning empty array as placeholder
        return [];
    }

    /**
     * Helper method to get results count
     */
    private async getResultsCount(query: any): Promise<number> {
        // This would need to be implemented based on your Result model
        // For now, returning 0 as placeholder
        return 0;
    }
}

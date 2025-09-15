import { Request, Response } from 'express';
import { marketSyncService } from '../../../services/marketSyncService';
import { cronService } from '../../../services/cronService';
import { logger } from '../../../config/logger';

export class MarketSyncController {
    /**
     * Manually trigger market sync
     */
    async syncMarkets(req: Request, res: Response): Promise<void> {
        try {
            const result = await marketSyncService.syncMarkets();
            if (result.success) {
                res.json({
                    success: true,
                    message: result.message,
                    data: {
                        created: result.created,
                        updated: result.updated,
                        errors: result.errors,
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: result.message,
                    errors: result.errors
                });
            }
        } catch (error) {
            logger.error('Market sync controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during market sync',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get sync status and statistics
     */
    async getSyncStatus(req: Request, res: Response): Promise<void> {
        try {
            const syncStatus = await marketSyncService.getSyncStatus();
            const cronStatus = cronService.getJobStatus();

            res.json({
                success: true,
                data: {
                    sync: syncStatus,
                    cron: cronStatus,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            logger.error('Get sync status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get sync status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get cron job status
     */
    async getCronStatus(req: Request, res: Response): Promise<void> {
        try {
            const cronStatus = cronService.getJobStatus();

            res.json({
                success: true,
                data: {
                    cron: cronStatus,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            logger.error('Get cron status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get cron status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Restart cron jobs
     */
    async restartCronJobs(req: Request, res: Response): Promise<void> {
        try {
            cronService.restartAllJobs();

            res.json({
                success: true,
                message: 'Cron jobs restarted successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Restart cron jobs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to restart cron jobs',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Stop cron jobs
     */
    async stopCronJobs(req: Request, res: Response): Promise<void> {
        try {
            cronService.stopAllJobs();

            res.json({
                success: true,
                message: 'Cron jobs stopped successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Stop cron jobs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to stop cron jobs',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

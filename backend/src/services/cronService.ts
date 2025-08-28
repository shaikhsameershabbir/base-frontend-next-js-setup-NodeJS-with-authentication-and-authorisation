import * as cron from 'node-cron';
import { marketSyncService } from './marketSyncService';
import { logger } from '../config/logger';

export class CronService {
    private marketSyncJob: cron.ScheduledTask | null = null;

    constructor() {
        this.initializeJobs();
    }

    /**
     * Initialize all cron jobs
     */
    private initializeJobs(): void {
        this.scheduleMarketSync();
        logger.info('Cron jobs initialized');
    }

    /**
     * Schedule market sync job to run at midnight (00:00) every day
     */
    private scheduleMarketSync(): void {
        // Run at midnight every day (00:00)
        // Cron format: 0 0 * * * (minute hour day month day-of-week)
        this.marketSyncJob = cron.schedule('0 0 * * *', async () => {
            logger.info('Starting scheduled market sync job...');

            try {
                const result = await marketSyncService.syncMarkets();

                if (result.success) {
                    logger.info(`Scheduled market sync completed successfully: ${result.message}`);
                } else {
                    logger.error(`Scheduled market sync failed: ${result.message}`);
                }
            } catch (error) {
                logger.error('Scheduled market sync job failed with error:', error);
            }
        }, {
            timezone: 'Asia/Kolkata' // Indian Standard Time
        });

        logger.info('Market sync cron job scheduled for midnight (00:00) IST daily');
    }

    /**
     * Manually trigger market sync
     */
    async triggerMarketSync(): Promise<{
        success: boolean;
        message: string;
        created: number;
        updated: number;
        errors: string[];
    }> {
        logger.info('Manual market sync triggered');
        return await marketSyncService.syncMarkets();
    }

    /**
     * Get cron job status
     */
    getJobStatus(): {
        marketSyncScheduled: boolean;
        nextMarketSync: string | null;
    } {
        return {
            marketSyncScheduled: this.marketSyncJob !== null,
            nextMarketSync: this.marketSyncJob ? this.getNextRunTime() : null
        };
    }

    /**
     * Get next run time for market sync job
     */
    private getNextRunTime(): string {
        if (!this.marketSyncJob) return 'Not scheduled';

        try {
            // Since nextDate() is not available, we'll calculate the next midnight
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            return tomorrow.toISOString();
        } catch {
            return 'Error calculating next run time';
        }
    }

    /**
     * Stop all cron jobs
     */
    stopAllJobs(): void {
        if (this.marketSyncJob) {
            this.marketSyncJob.stop();
            this.marketSyncJob = null;
            logger.info('Market sync cron job stopped');
        }
        logger.info('All cron jobs stopped');
    }

    /**
     * Restart all cron jobs
     */
    restartAllJobs(): void {
        this.stopAllJobs();
        this.initializeJobs();
        logger.info('All cron jobs restarted');
    }
}

export const cronService = new CronService();

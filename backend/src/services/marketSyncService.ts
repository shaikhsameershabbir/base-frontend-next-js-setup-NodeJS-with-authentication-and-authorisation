import { Market } from '../models/Market';
import { hitApiAndLog } from './liveResultService';
import { logger } from '../config/logger';

interface ThirdPartyMarket {
    name: string;
    result: string;
    open_time: string;
    close_time: string;
    days_of_week: string;
    updated_date: string;
    final_ank: string;
}

interface ThirdPartyResponse {
    success: boolean;
    message: string;
    data: {
        live_result: ThirdPartyMarket[];
        all_result: ThirdPartyMarket[];
        count: number;
    };
}

export class MarketSyncService {
    /**
     * Sync markets from third-party API
     * This method fetches all markets from the API and syncs them with the database
     */
    async syncMarkets(): Promise<{
        success: boolean;
        message: string;
        created: number;
        updated: number;
        errors: string[];
    }> {
        try {
            logger.info('Starting market sync process...');

            // Fetch data from third-party API
            const apiResponse = await hitApiAndLog();

            if (typeof apiResponse === 'string') {
                throw new Error(`API Error: ${apiResponse}`);
            }

            const response = apiResponse as ThirdPartyResponse;

            if (!response.success || !response.data) {
                throw new Error('Invalid API response');
            }

            const { all_result } = response.data;

            if (!Array.isArray(all_result)) {
                throw new Error('Invalid all_result data format');
            }

            logger.info(`Found ${all_result.length} markets in API response`);

            let created = 0;
            let updated = 0;
            const errors: string[] = [];

            // Process each market
            for (const marketData of all_result) {
                try {
                    const result = await this.processMarket(marketData);
                    if (result === 'created') {
                        created++;
                    } else if (result === 'updated') {
                        updated++;
                    }
                } catch (error) {
                    const errorMsg = `Failed to process market ${marketData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    logger.error(errorMsg);
                    errors.push(errorMsg);
                }
            }

            logger.info(`Market sync completed. Created: ${created}, Updated: ${updated}, Errors: ${errors.length}`);

            return {
                success: true,
                message: `Successfully synced ${created + updated} markets`,
                created,
                updated,
                errors
            };

        } catch (error) {
            const errorMsg = `Market sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            logger.error(errorMsg);
            return {
                success: false,
                message: errorMsg,
                created: 0,
                updated: 0,
                errors: [errorMsg]
            };
        }
    }

    /**
     * Process individual market data
     */
    private async processMarket(marketData: ThirdPartyMarket): Promise<'created' | 'updated' | 'no-change'> {
        const { name, open_time, close_time, days_of_week } = marketData;

        // Skip invalid market names
        if (!name || name.trim() === '' || name.includes('Ad your game') || name.includes('support@')) {
            return 'no-change';
        }

        // Convert days_of_week to number
        const weekDays = parseInt(days_of_week) || 7;
        if (weekDays < 1 || weekDays > 7) {
            throw new Error(`Invalid weekDays value: ${weekDays}`);
        }

        // Check if market exists
        const existingMarket = await Market.findOne({ marketName: name.trim() });

        if (existingMarket) {
            // Update existing market if times have changed
            if (existingMarket.openTime !== open_time || existingMarket.closeTime !== close_time || existingMarket.weekDays !== weekDays) {
                existingMarket.openTime = open_time;
                existingMarket.closeTime = close_time;
                existingMarket.weekDays = weekDays;
                await existingMarket.save();
                logger.info(`Updated market: ${name}`);
                return 'updated';
            } else {
                return 'no-change';
            }
        } else {
            // Create new market
            const newMarket = new Market({
                marketName: name.trim(),
                openTime: open_time,
                closeTime: close_time,
                weekDays,
                isActive: true,
                isGolden: false,
                autoResult: false
            });

            await newMarket.save();
            logger.info(`Created new market: ${name}`);
            return 'created';
        }
    }

    /**
     * Get sync status and statistics
     */
    async getSyncStatus(): Promise<{
        lastSync: Date | null;
        totalMarkets: number;
        activeMarkets: number;
        inactiveMarkets: number;
        goldenMarkets: number;
        autoResultMarkets: number;
    }> {
        try {
            const totalMarkets = await Market.countDocuments();
            const activeMarkets = await Market.countDocuments({ isActive: true });
            const inactiveMarkets = await Market.countDocuments({ isActive: false });
            const goldenMarkets = await Market.countDocuments({ isGolden: true });
            const autoResultMarkets = await Market.countDocuments({ autoResult: true });

            // Note: In a real implementation, you might want to store last sync time in a separate collection
            // For now, we'll return the current time as a placeholder
            const lastSync = new Date();

            return {
                lastSync,
                totalMarkets,
                activeMarkets,
                inactiveMarkets,
                goldenMarkets,
                autoResultMarkets
            };
        } catch (error) {
            logger.error('Failed to get sync status:', error);
            throw error;
        }
    }
}

export const marketSyncService = new MarketSyncService();

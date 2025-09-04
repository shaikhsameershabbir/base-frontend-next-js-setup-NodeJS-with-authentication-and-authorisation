import { Market } from '../models/Market';
import { Result, IResult } from '../models/result';
import { hitApiAndLog } from './liveResultService';
import { WinningCalculationService } from './winningCalculation.service';
import { logger } from '../config/logger';
import * as cron from 'node-cron';
import mongoose from 'mongoose';
import { User } from '../models/User';

interface DayResultData {
    open: string | null;
    main: string | null;
    close: string | null;
    openDeclationTime: Date | null;
    closeDeclationTime: Date | null;
}

interface LiveResultItem {
    name: string;
    result: string;
    open_time: string;
    close_time: string;
    days_of_week: string;
    updated_date: string;
    final_ank: string;
}

interface LiveResultResponse {
    success: boolean;
    message: string;
    data: {
        live_result: LiveResultItem[];
        all_result: LiveResultItem[];
    };
}




// Type for market objects from database
interface MarketDocument {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    weekDays: number;
    autoResult: boolean;
    isActive: boolean;
}





export class AutoResultService {
    private isRunning = false;
    private checkInterval: NodeJS.Timeout | null = null;
    private cronJobs: Map<string, cron.ScheduledTask> = new Map();
    private isInitialized = false;
    private superAdminId: string | null = null;

    constructor() {
        // Don't auto-initialize - wait for database connection
    }

    /**
     * Analyze result format and determine if it's open or close result
     */
    private analyzeResultFormat(result: string): {
        isCloseResult: boolean;
        number?: string;
        main?: number;
        closeNumber?: string;
        reason: string;
    } {
        const parts = result.split('-');

        if (parts.length === 3) {
            // Full close result format: "880-56-152" (number-main-close)
            const number = parseInt(parts[0]);
            const main = parseInt(parts[1]);
            const closeNumber = parts[2];

            // Validate all parts
            if (number < 100 || number > 999 || main < 0 || main > 99 || parseInt(closeNumber) < 100 || parseInt(closeNumber) > 999) {
                return {
                    isCloseResult: false,
                    reason: `Invalid number ranges in 3-part format: ${result}`
                };
            }

            return {
                isCloseResult: true,
                number: parts[0],
                main,
                closeNumber,
                reason: `Valid 3-part close result format: ${parts[0]}-${main}-${closeNumber}`
            };
        } else if (parts.length === 2) {
            // Open result format: "880-6" (number-main)
            const number = parseInt(parts[0]);
            const main = parseInt(parts[1]);

            // Validate parts
            if (number < 100 || number > 999 || main < 0 || main > 99) {
                return {
                    isCloseResult: false,
                    reason: `Invalid number ranges in 2-part format: ${result}`
                };
            }

            return {
                isCloseResult: false,
                number: parts[0],
                main,
                reason: `Valid 2-part open result format: ${parts[0]}-${main}`
            };
        } else {
            return {
                isCloseResult: false,
                reason: `Invalid format: expected 2 or 3 parts, got ${parts.length}`
            };
        }
    }

    /**
     * Get or fetch superAdmin ID
     */
    private async getSuperAdminId(): Promise<string | null> {
        if (this.superAdminId) {
            return this.superAdminId;
        }

        try {
            const superAdmin = await User.findOne({ role: 'superadmin' }).exec();
            if (superAdmin && superAdmin._id) {
                this.superAdminId = superAdmin._id.toString();
                return this.superAdminId;
            }
        } catch {
            // Error finding superAdmin
        }

        return null;
    }

    /**
     * Initialize auto result markets and set up cron jobs
     * This should be called after database connection is established
     */
    public async initializeAutoResultMarkets(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            // Wait for database connection to be ready
            if (mongoose.connection.readyState !== 1) {
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Database connection timeout'));
                    }, 15000); // 15 second timeout

                    const checkConnection = () => {
                        if (mongoose.connection.readyState === 1) {
                            clearTimeout(timeout);
                            resolve();
                        } else {
                            setTimeout(checkConnection, 100);
                        }
                    };
                    checkConnection();
                });
            }

            await Market.find({ autoResult: true, isActive: true });

            // Clear existing cron jobs
            this.clearAllCronJobs();

            // Set up global cron job for batch processing instead of individual market cron jobs
            this.setupGlobalCronJob();

            this.isInitialized = true;

        } catch (error) {
            logger.error('Failed to initialize auto result markets:', error);
            throw error; // Re-throw to handle in the calling code
        }
    }



    /**
     * Set up global cron job for batch processing
     */
    private setupGlobalCronJob(): void {
        // Clear existing global cron job
        if (this.cronJobs.has('global')) {
            this.cronJobs.get('global')?.stop();
            this.cronJobs.delete('global');
        }

        // Create cron expression for every minute
        const cronExpression = '* * * * *'; // Every minute

        const cronJob = cron.schedule(cronExpression, async () => {
            await this.batchProcessMissedResults();
        });

        this.cronJobs.set('global' as string, cronJob);
        cronJob.start();


    }

    /**
     * Check and declare result for a specific market
     */
    private async checkAndDeclareResult(market: MarketDocument): Promise<void> {
        try {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });

            // Check if result already exists for today
            const today = new Date();
            const dayName = this.getDayName(today);

            const existingResult = await this.getTodayResult(market._id, today);

            // Always check for missed results first, regardless of current market hours
            await this.checkForMissedResults(market, today, dayName, existingResult);
            await this.checkForCompletelyMissedResults(market, today, dayName, existingResult);

            // Then check if current time is within market hours for active processing
            if (!this.isWithinMarketHours(market, currentTime)) {
                return;
            }

            if (existingResult) {
                const dayResult = existingResult.results[dayName];

                // If both open and close are declared, skip
                if (dayResult?.open && dayResult?.close) {
                    return;
                }

                // If only open is declared, check for close
                if (dayResult?.open && !dayResult?.close) {
                    if (this.isCloseTime(market, currentTime)) {
                        await this.declareCloseResult(market, today, dayName, existingResult);
                    }
                    return;
                }
            }

            // Check for open result
            if (this.isOpenTime(market, currentTime)) {
                await this.declareOpenResult(market, today, dayName);
            }

            // Check for close result
            if (this.isCloseTime(market, currentTime)) {
                if (existingResult) {
                    await this.declareCloseResult(market, today, dayName, existingResult);
                } else {
                    // If no existing result, create one and declare close
                    await this.declareCloseResult(market, today, dayName, null);
                }
            }

        } catch (error) {
            logger.error(`Error checking result for market ${market.marketName}:`, error);
        }
    }

    /**
     * Check if current time is within market hours
     */
    private isWithinMarketHours(market: MarketDocument, currentTime: string): boolean {
        const openTime = market.openTime;
        const closeTime = market.closeTime;

        // Convert times to comparable format
        const current = this.timeToMinutes(currentTime);
        const open = this.timeToMinutes(openTime);
        const close = this.timeToMinutes(closeTime);

        // Handle overnight markets (e.g., 22:00 to 06:00)
        if (close < open) {
            const isWithin = current >= open || current <= close;
            return isWithin;
        }

        const isWithin = current >= open && current <= close;
        return isWithin;
    }

    /**
     * Check if it's open time for the market
     */
    private isOpenTime(market: MarketDocument, currentTime: string): boolean {
        const openTime = market.openTime;
        const current = this.timeToMinutes(currentTime);
        const open = this.timeToMinutes(openTime);

        const timeDiff = Math.abs(current - open);
        const isOpenTime = timeDiff <= 5;

        // console.log(`🔓 Open time check for ${market.marketName}:`);
        // console.log(`   Current: ${currentTime} (${current} minutes)`);
        // console.log(`   Open: ${openTime} (${open} minutes)`);
        // console.log(`   Time difference: ${timeDiff} minutes`);
        // console.log(`   Is open time: ${isOpenTime ? '✅ YES' : '❌ NO'}`);

        // Check if current time is within 5 minutes of open time
        return isOpenTime;
    }

    /**
     * Check if it's close time for the market
     */
    private isCloseTime(market: MarketDocument, currentTime: string): boolean {
        const closeTime = market.closeTime;
        const current = this.timeToMinutes(currentTime);
        const close = this.timeToMinutes(closeTime);

        const timeDiff = Math.abs(current - close);
        const isCloseTime = timeDiff <= 5;

        // console.log(`🔒 Close time check for ${market.marketName}:`);
        // console.log(`   Current: ${currentTime} (${current} minutes)`);
        // console.log(`   Close: ${closeTime} (${close} minutes)`);
        // console.log(`   Time difference: ${timeDiff} minutes`);
        // console.log(`   Is close time: ${isCloseTime ? '✅ YES' : '❌ NO'}`);

        // Check if current time is within 5 minutes of close time
        return isCloseTime;
    }

    /**
     * Convert time string to minutes for comparison
     */
    private timeToMinutes(timeString: string): number {
        const [hours, minutes] = timeString.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;

        // console.log(`⏰ Converting time "${timeString}" to minutes: ${hours}h ${minutes}m = ${totalMinutes} minutes`);

        return totalMinutes;
    }

    /**
     * Get day name from date
     */
    private getDayName(date: Date): string {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[date.getDay()];
        // console.log(`📅 Date ${date.toDateString()} corresponds to: ${dayName}`);
        return dayName;
    }

    /**
     * Get today's result for a market
     */
    private async getTodayResult(marketId: string, date: Date): Promise<IResult | null> {
        const { startDate, endDate } = this.getWeekDates(date);

        const result = await Result.findOne({
            marketId,
            weekStartDate: startDate,
            weekEndDate: endDate
        });

        return result;
    }

    /**
     * Create or find result document with duplicate key error handling
     */
    private async createOrFindResult(resultData: any): Promise<IResult> {
        try {
            const newResult = new Result(resultData);
            await newResult.save();
            return newResult;
        } catch (error: any) {
            // Handle duplicate key error (E11000)
            if (error.code === 11000) {
                // Try to find the existing document
                const existingResult = await Result.findOne({
                    marketId: resultData.marketId,
                    weekStartDate: resultData.weekStartDate,
                    weekEndDate: resultData.weekEndDate
                });
                if (existingResult) {
                    return existingResult;
                }
            }
            throw error;
        }
    }

    /**
     * Get week start and end dates
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
     * Declare open result for a market
     */
    private async declareOpenResult(market: MarketDocument, date: Date, dayName: string): Promise<void> {
        try {
            // Fetch live results
            const liveResults = await this.fetchLiveResults();
            if (!liveResults) {
                return;
            }

            // Find result for this market
            const marketResult = liveResults.find(item =>
                item.name.toUpperCase() === market.marketName.toUpperCase()
            );

            if (!marketResult) {

                return;
            }

            // Parse open result (format: "336-2")
            const openResultParts = marketResult.result.split('-');
            if (openResultParts.length < 2) {

                return;
            }

            const openNumber = openResultParts[0];
            const openMain = parseInt(openResultParts[1]);

            // Validate result number
            if (parseInt(openNumber) < 100 || parseInt(openNumber) > 999) {

                return;
            }

            // Check if result is for today
            const resultDate = this.parseResultDate(marketResult.updated_date);
            if (!this.isSameDay(resultDate, date)) {

                return;
            }

            // Declare the result
            await this.saveOpenResult(market._id, dayName, openNumber, openMain, date, null);



        } catch (error) {
            logger.error(`Error declaring open result for ${market.marketName}:`, error);
        }
    }

    /**
     * Declare close result for a market
     */
    private async declareCloseResult(market: MarketDocument, date: Date, dayName: string, existingResult: IResult | null): Promise<void> {
        try {
            // Fetch live results
            const liveResults = await this.fetchLiveResults();
            if (!liveResults) {
                return;
            }

            // Find result for this market
            const marketResult = liveResults.find(item =>
                item.name.toUpperCase() === market.marketName.toUpperCase()
            );

            if (!marketResult) {

                return;
            }

            // Use smart result format analysis
            const formatAnalysis = this.analyzeResultFormat(marketResult.result);

            if (!formatAnalysis.isCloseResult) {
                return;
            }

            // Extract close result data
            const closeNumber = formatAnalysis.closeNumber!;
            const closeMain = formatAnalysis.main!;

            // Validate result number
            if (parseInt(closeNumber) < 100 || parseInt(closeNumber) > 999) {

                return;
            }

            // Check if result is for today
            const resultDate = this.parseResultDate(marketResult.updated_date);
            if (!this.isSameDay(resultDate, date)) {

                return;
            }

            // Update the existing result with close
            if (existingResult) {
                if (existingResult) {
                    await this.saveCloseResult(existingResult, dayName, closeNumber, closeMain, date);
                }
            }



        } catch (error) {
            logger.error(`Error declaring close result for ${market.marketName}:`, error);
        }
    }

    /**
     * Fetch live results from the API
     */
    private async fetchLiveResults(): Promise<LiveResultItem[]> {
        try {
            const response = await hitApiAndLog();

            if (typeof response === 'string') {

                return [];
            }

            const apiResponse = response as LiveResultResponse;

            if (!apiResponse.success || !apiResponse.data) {

                return [];
            }

            // Only use all_result, ignore live_result (which contains "Loading..." data)
            const allResults = apiResponse.data.all_result || [];

            return allResults;

        } catch (error) {
            logger.error('Error fetching live results:', error);
            return [];
        }
    }

    /**
     * Parse result date from format "27-08-2025"
     */
    private parseResultDate(dateString: string): Date {
        const [day, month, year] = dateString.split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day); // month is 0-indexed

        return parsedDate;
    }

    /**
     * Check if two dates are the same day
     */
    private isSameDay(date1: Date, date2: Date): boolean {
        const isSame = date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();

        return isSame;
    }

    /**
     * Save open result to database
     */
    private async saveOpenResult(marketId: string, dayName: string, openNumber: string, openMain: number, date: Date, existingResult?: IResult | null): Promise<void> {
        const { startDate, endDate } = this.getWeekDates(date);

        let resultRecord = existingResult;

        if (!resultRecord) {
            resultRecord = await Result.findOne({
                marketId,
                weekStartDate: startDate,
                weekEndDate: endDate
            });
        }

        if (resultRecord) {
            // Update existing result
            if (!(resultRecord.results as Record<string, DayResultData>)[dayName]) {
                (resultRecord.results as Record<string, DayResultData>)[dayName] = {
                    open: null,
                    main: null,
                    close: null,
                    openDeclationTime: null,
                    closeDeclationTime: null
                };
            }

            (resultRecord.results as Record<string, DayResultData>)[dayName].open = openNumber;
            (resultRecord.results as Record<string, DayResultData>)[dayName].main = openMain.toString().padStart(2, '0');
            (resultRecord.results as Record<string, DayResultData>)[dayName].openDeclationTime = new Date();

            await resultRecord.save();

            // Calculate open winnings
            await WinningCalculationService.calculateOpenWinnings(
                marketId,
                date,
                openNumber,
                openMain
            );
        } else {
            // Create new result
            const newDayResult = {
                open: openNumber,
                main: openMain.toString().padStart(2, '0'),
                close: null,
                openDeclationTime: new Date(),
                closeDeclationTime: null
            };

            // Get market name for the result record
            const market = await Market.findById(marketId);
            const marketName = market?.marketName || 'Unknown Market';

            // Get superAdmin ID for declaredBy field
            const superAdminId = await this.getSuperAdminId();

            const resultData = {
                marketId,
                marketName, // Include market name for readability
                declaredBy: superAdminId, // Use superAdmin ID for auto-generated results
                weekStartDate: startDate,
                weekEndDate: endDate,
                weekDays: 7,
                results: {
                    [dayName]: newDayResult
                }
            };

            resultRecord = await this.createOrFindResult(resultData);

            // Calculate open winnings
            await WinningCalculationService.calculateOpenWinnings(
                marketId,
                date,
                openNumber,
                openMain
            );
        }
    }

    /**
     * Save close result to database
     */
    private async saveCloseResult(existingResult: IResult, dayName: string, closeNumber: string, closeMain: number, date: Date): Promise<void> {
        const dayResult = (existingResult.results as Record<string, DayResultData>)[dayName];

        if (!dayResult || !dayResult.open) {

            return;
        }

        dayResult.close = closeNumber;

        // Combine main values: open main + close main
        const openMain = parseInt(dayResult.main || '00');
        const combinedMain = parseInt(openMain.toString() + closeMain.toString());
        const finalMain = combinedMain > 99 ? combinedMain % 100 : combinedMain;

        dayResult.main = finalMain.toString().padStart(2, '0');
        dayResult.closeDeclationTime = new Date();

        await existingResult.save();

        // Calculate close winnings
        await WinningCalculationService.calculateCloseWinnings(
            existingResult.marketId.toString(),
            date,
            dayResult.open,
            openMain,
            closeNumber,
            closeMain
        );
    }

    /**
     * Clear all cron jobs
     */
    private clearAllCronJobs(): void {
        for (const [, cronJob] of this.cronJobs) {
            cronJob.stop();
        }

        this.cronJobs.clear();
    }

    /**
     * Add a new market to auto result service
     */
    public async addMarketToAutoResult(marketId: string): Promise<void> {
        try {
            const market = await Market.findById(marketId);
            if (market && market.autoResult && market.isActive) {
                // With global batch processing, no need to set up individual cron jobs

            }
        } catch (error) {
            logger.error(`Error adding market to auto result service:`, error);
        }
    }

    /**
     * Remove a market from auto result service
     */
    public async removeMarketFromAutoResult(): Promise<void> {
        try {
            // With global batch processing, individual market removal is handled automatically
            // The global cron job will skip inactive markets

        } catch (error) {
            logger.error(`Error removing market from auto result service:`, error);
        }
    }

    /**
     * Get status of auto result service
     */
    public getStatus(): { isRunning: boolean; activeMarkets: number } {
        const status = {
            isRunning: this.isRunning,
            activeMarkets: this.cronJobs.size
        };

        return status;
    }

    /**
     * Start the auto result service
     */
    public start(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

    }

    /**
     * Stop the auto result service
     */
    public stop(): void {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        this.clearAllCronJobs();

    }

    /**
     * Restart the auto result service
     */
    public async restart(): Promise<void> {
        this.stop();
        await this.initializeAutoResultMarkets();
        this.start();

    }

    /**
     * Check for missed results when market times have passed
     */
    private async checkForMissedResults(market: MarketDocument, today: Date, dayName: string, existingResult: IResult | null): Promise<void> {
        try {

            // Check if open time has passed (with 10 minute buffer)
            const openTimePassed = this.hasTimePassed(market.openTime, 10);
            // Check if close time has passed (with 10 minute buffer)
            const closeTimePassed = this.hasTimePassed(market.closeTime, 10);



            if (openTimePassed && (!existingResult || !existingResult.results[dayName]?.open)) {

                await this.declareMissedOpenResult(market, today, dayName);
            }

            if (closeTimePassed && (!existingResult || !existingResult.results[dayName]?.close)) {

                await this.declareMissedCloseResult(market, today, dayName, existingResult);
            }

        } catch (error) {
            logger.error(`Error checking for missed results for ${market.marketName}:`, error);
        }
    }

    /**
     * Check if both open and close times have passed and no results exist
     */
    private async checkForCompletelyMissedResults(market: MarketDocument, today: Date, dayName: string, existingResult: IResult | null): Promise<void> {
        try {

            // Check if both open and close times have passed (with 10 minute buffer)
            const openTimePassed = this.hasTimePassed(market.openTime, 10);
            const closeTimePassed = this.hasTimePassed(market.closeTime, 10);

            // Only proceed if both times have passed
            if (!openTimePassed || !closeTimePassed) {
                return;
            }

            // Check if no results exist at all for this day
            if (existingResult && existingResult.results[dayName]) {
                const dayResult = existingResult.results[dayName];
                if (dayResult.open && dayResult.close) {
                    return;
                }
            }

            await this.declareCompletelyMissedResults(market, today, dayName, existingResult);

        } catch (error) {
            logger.error(`Error checking for completely missed results for ${market.marketName}:`, error);
        }
    }

    /**
     * Check if a specific time has passed (with buffer minutes)
     */
    private hasTimePassed(targetTime: string, bufferMinutes: number = 5): boolean {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });

        const current = this.timeToMinutes(currentTime);
        const target = this.timeToMinutes(targetTime);

        // Handle overnight markets (e.g., 22:00 to 06:00)
        if (target > current) {
            // Target time is later today, so it hasn't passed
            return false;
        }

        const timeDiff = current - target;
        const hasPassed = timeDiff > bufferMinutes;

        // Check if enough time has passed (current time - target time > buffer)
        return hasPassed;
    }

    /**
     * Declare missed open result
     */
    private async declareMissedOpenResult(market: MarketDocument, date: Date, dayName: string): Promise<void> {
        try {
            // Fetch live results
            const liveResults = await this.fetchLiveResults();
            if (!liveResults) {
                return;
            }

            // Find result for this market
            const marketResult = liveResults.find(item =>
                item.name.toUpperCase() === market.marketName.toUpperCase()
            );

            if (!marketResult) {

                return;
            }

            // Parse open result (format: "336-2" or "336-20-569")
            const openResultParts = marketResult.result.split('-');
            if (openResultParts.length < 2) {

                return;
            }

            const openNumber = openResultParts[0];
            const openMain = parseInt(openResultParts[1]);

            // Validate result number
            if (parseInt(openNumber) < 100 || parseInt(openNumber) > 999) {

                return;
            }

            // Check if result is for today
            const resultDate = this.parseResultDate(marketResult.updated_date);
            if (!this.isSameDay(resultDate, date)) {

                return;
            }

            // Declare the missed open result
            await this.saveOpenResult(market._id, dayName, openNumber, openMain, date, null);



        } catch (error) {
            logger.error(`Error declaring missed open result for ${market.marketName}:`, error);
        }
    }

    /**
     * Declare missed close result
     */
    private async declareMissedCloseResult(market: MarketDocument, date: Date, dayName: string, existingResult: IResult | null): Promise<void> {
        try {
            // Fetch live results
            const liveResults = await this.fetchLiveResults();
            if (!liveResults) {
                return;
            }

            // Find result for this market
            const marketResult = liveResults.find(item =>
                item.name.toUpperCase() === market.marketName.toUpperCase()
            );

            if (!marketResult) {

                return;
            }

            // Use smart result format analysis for missed close result
            const formatAnalysis = this.analyzeResultFormat(marketResult.result);

            if (!formatAnalysis.isCloseResult) {
                return;
            }

            // Extract close result data
            const closeNumber = formatAnalysis.closeNumber!;
            const closeMain = formatAnalysis.main!;

            // Validate result number
            if (parseInt(closeNumber) < 100 || parseInt(closeNumber) > 999) {

                return;
            }

            // Check if result is for today
            const resultDate = this.parseResultDate(marketResult.updated_date);
            if (!this.isSameDay(resultDate, date)) {

                return;
            }

            // If no existing result, create one first
            if (!existingResult) {
                const { startDate, endDate } = this.getWeekDates(date);
                const newDayResult = {
                    open: null,
                    main: null,
                    close: null,
                    openDeclationTime: null,
                    closeDeclationTime: null
                };

                // Get superAdmin ID for declaredBy field
                const superAdminId = await this.getSuperAdminId();

                const resultData = {
                    marketId: market._id,
                    marketName: market.marketName, // Include market name for readability
                    declaredBy: superAdminId, // Use superAdmin ID for auto-generated results
                    weekStartDate: startDate,
                    weekEndDate: endDate,
                    weekDays: 7,
                    results: {
                        [dayName]: newDayResult
                    }
                };

                existingResult = await this.createOrFindResult(resultData);
            }

            // Update the existing result with close
            if (existingResult) {
                await this.saveCloseResult(existingResult, dayName, closeNumber, closeMain, date);
            }



        } catch (error) {
            logger.error(`Error declaring missed close result for ${market.marketName}:`, error);
        }
    }

    /**
     * Declare completely missed results (both open and close) when both times have passed
     * 
     * This handles cases like:
     * - MOHINI: open_time "11:00", close_time "12:30" have both passed
     * - API returns: "356-47-160" (3-part format)
     * - Service will: declare open result "356" first, then close result "160"
     * - Winning calculations will be triggered for both results separately
     */
    private async declareCompletelyMissedResults(market: MarketDocument, date: Date, dayName: string, existingResult: IResult | null): Promise<void> {
        try {
            // Fetch live results
            const liveResults = await this.fetchLiveResults();
            if (!liveResults) {
                return;
            }

            // Find result for this market
            const marketResult = liveResults.find(item =>
                item.name.toUpperCase() === market.marketName.toUpperCase()
            );

            if (!marketResult) {

                return;
            }

            // Use smart result format analysis
            const formatAnalysis = this.analyzeResultFormat(marketResult.result);

            if (!formatAnalysis.isCloseResult) {
                return;
            }

            // Extract result data
            const openNumber = formatAnalysis.number!;
            const openMain = formatAnalysis.main!;
            const closeNumber = formatAnalysis.closeNumber!;

            // Check if result is for today
            const resultDate = this.parseResultDate(marketResult.updated_date);
            if (!this.isSameDay(resultDate, date)) {

                return;
            }

            // Create or get existing result record
            let resultRecord = existingResult;
            if (!resultRecord) {
                const { startDate, endDate } = this.getWeekDates(date);
                const newDayResult = {
                    open: null,
                    main: null,
                    close: null,
                    openDeclationTime: null,
                    closeDeclationTime: null
                };

                // Get superAdmin ID for declaredBy field
                const superAdminId = await this.getSuperAdminId();

                const resultData = {
                    marketId: market._id,
                    marketName: market.marketName, // Include market name for readability
                    declaredBy: superAdminId, // Use superAdmin ID for auto-generated results
                    weekStartDate: startDate,
                    weekEndDate: endDate,
                    weekDays: 7,
                    results: {
                        [dayName]: newDayResult
                    }
                };

                resultRecord = await this.createOrFindResult(resultData);
            }

            // First declare open result
            await this.saveOpenResult(market._id, dayName, openNumber, openMain, date, resultRecord);

            // Then declare close result
            if (resultRecord) {
                await this.saveCloseResult(resultRecord, dayName, closeNumber, openMain, date);
            }



        } catch (error) {
            logger.error(`Error declaring completely missed results for ${market.marketName}:`, error);
        }
    }

    /**
     * Batch process all markets for missed results with a single API call
     */
    private async batchProcessMissedResults(): Promise<void> {
        try {
            // Fetch live results once for all markets
            const liveResults = await this.fetchLiveResults();
            if (!liveResults || liveResults.length === 0) {

                return;
            }

            const today = new Date();
            const dayName = this.getDayName(today);

            // Get all auto markets
            const autoMarkets = await Market.find({ autoResult: true, isActive: true });

            for (const market of autoMarkets) {
                try {
                    const marketId = (market._id as mongoose.Types.ObjectId).toString();
                    const existingResult = await this.getTodayResult(marketId, today);

                    // Convert market to MarketDocument type
                    const marketDoc: MarketDocument = {
                        _id: marketId,
                        marketName: market.marketName,
                        openTime: market.openTime,
                        closeTime: market.closeTime,
                        weekDays: market.weekDays,
                        autoResult: market.autoResult,
                        isActive: market.isActive
                    };

                    // Check for missed results using the already fetched live results
                    await this.checkForMissedResultsWithData(marketDoc, today, dayName, existingResult, liveResults);
                    await this.checkForCompletelyMissedResultsWithData(marketDoc, today, dayName, existingResult, liveResults);
                } catch (error) {
                    logger.error(`Error processing missed results for market ${market.marketName}:`, error);
                }
            }

        } catch (error) {
            logger.error('Error in batch processing missed results:', error);
        }
    }

    /**
     * Check for missed results using pre-fetched live results data
     */
    private async checkForMissedResultsWithData(market: MarketDocument, today: Date, dayName: string, existingResult: IResult | null, liveResults: LiveResultItem[]): Promise<void> {
        try {
            // Check if open time has passed (with 10 minute buffer)
            const openTimePassed = this.hasTimePassed(market.openTime, 10);
            // Check if close time has passed (with 10 minute buffer)
            const closeTimePassed = this.hasTimePassed(market.closeTime, 10);

            if (openTimePassed && (!existingResult || !existingResult.results[dayName]?.open)) {

                await this.declareMissedOpenResultWithData(market, today, dayName, liveResults);
            }

            if (closeTimePassed && (!existingResult || !existingResult.results[dayName]?.close)) {

                await this.declareMissedCloseResultWithData(market, today, dayName, existingResult, liveResults);
            }

        } catch (error) {
            logger.error(`Error checking for missed results for ${market.marketName}:`, error);
        }
    }

    /**
     * Check for completely missed results using pre-fetched live results data
     */
    private async checkForCompletelyMissedResultsWithData(market: MarketDocument, today: Date, dayName: string, existingResult: IResult | null, liveResults: LiveResultItem[]): Promise<void> {
        try {
            // Check if both open and close times have passed (with 10 minute buffer)
            const openTimePassed = this.hasTimePassed(market.openTime, 10);
            const closeTimePassed = this.hasTimePassed(market.closeTime, 10);

            // Only proceed if both times have passed
            if (!openTimePassed || !closeTimePassed) {
                return;
            }

            // Check if no results exist at all for this day
            if (existingResult && existingResult.results[dayName]) {
                const dayResult = existingResult.results[dayName];
                if (dayResult.open && dayResult.close) {
                    return;
                }
            }

            await this.declareCompletelyMissedResultsWithData(market, today, dayName, existingResult, liveResults);

        } catch (error) {
            logger.error(`Error checking for completely missed results for ${market.marketName}:`, error);
        }
    }

    /**
     * Declare missed open result using pre-fetched live results data
     */
    private async declareMissedOpenResultWithData(market: MarketDocument, date: Date, dayName: string, liveResults: LiveResultItem[]): Promise<void> {
        try {
            // Find result for this market
            const marketResult = liveResults.find(item =>
                item.name.toUpperCase() === market.marketName.toUpperCase()
            );

            if (!marketResult) {

                return;
            }

            // Parse open result (format: "336-2" or "336-20-569")
            const openResultParts = marketResult.result.split('-');
            if (openResultParts.length < 2) {

                return;
            }

            const openNumber = openResultParts[0];
            const openMain = parseInt(openResultParts[1]);

            // Validate result number
            if (parseInt(openNumber) < 100 || parseInt(openNumber) > 999) {

                return;
            }

            // Check if result is for today
            const resultDate = this.parseResultDate(marketResult.updated_date);
            if (!this.isSameDay(resultDate, date)) {

                return;
            }

            // Declare the missed open result
            await this.saveOpenResult(market._id, dayName, openNumber, openMain, date, null);



        } catch (error) {
            logger.error(`Error declaring missed open result for ${market.marketName}:`, error);
        }
    }

    /**
     * Declare missed close result using pre-fetched live results data
     */
    private async declareMissedCloseResultWithData(market: MarketDocument, date: Date, dayName: string, existingResult: IResult | null, liveResults: LiveResultItem[]): Promise<void> {
        try {
            // Find result for this market
            const marketResult = liveResults.find(item =>
                item.name.toUpperCase() === market.marketName.toUpperCase()
            );

            if (!marketResult) {

                return;
            }

            // Use smart result format analysis for missed close result
            const formatAnalysis = this.analyzeResultFormat(marketResult.result);

            if (!formatAnalysis.isCloseResult) {
                return;
            }

            // Extract close result data
            const closeNumber = formatAnalysis.closeNumber!;
            const closeMain = formatAnalysis.main!;

            // Validate result number
            if (parseInt(closeNumber) < 100 || parseInt(closeNumber) > 999) {

                return;
            }

            // Check if result is for today
            const resultDate = this.parseResultDate(marketResult.updated_date);
            if (!this.isSameDay(resultDate, date)) {

                return;
            }

            // If no existing result, create one first
            if (!existingResult) {
                const { startDate, endDate } = this.getWeekDates(date);
                const newDayResult = {
                    open: null,
                    main: null,
                    close: null,
                    openDeclationTime: null,
                    closeDeclationTime: null
                };

                // Get superAdmin ID for declaredBy field
                const superAdminId = await this.getSuperAdminId();

                const resultData = {
                    marketId: market._id,
                    marketName: market.marketName, // Include market name for readability
                    declaredBy: superAdminId, // Use superAdmin ID for auto-generated results
                    weekStartDate: startDate,
                    weekEndDate: endDate,
                    weekDays: 7,
                    results: {
                        [dayName]: newDayResult
                    }
                };

                existingResult = await this.createOrFindResult(resultData);
            }

            // Update the existing result with close
            if (existingResult) {
                await this.saveCloseResult(existingResult, dayName, closeNumber, closeMain, date);
            }



        } catch (error) {
            logger.error(`Error declaring missed close result for ${market.marketName}:`, error);
        }
    }

    /**
     * Declare completely missed results using pre-fetched live results data
     */
    private async declareCompletelyMissedResultsWithData(market: MarketDocument, date: Date, dayName: string, existingResult: IResult | null, liveResults: LiveResultItem[]): Promise<void> {
        try {
            // Find result for this market
            const marketResult = liveResults.find(item =>
                item.name.toUpperCase() === market.marketName.toUpperCase()
            );

            if (!marketResult) {

                return;
            }

            // Use smart result format analysis
            const formatAnalysis = this.analyzeResultFormat(marketResult.result);

            if (!formatAnalysis.isCloseResult) {
                return;
            }

            // Extract result data
            const openNumber = formatAnalysis.number!;
            const openMain = formatAnalysis.main!;
            const closeNumber = formatAnalysis.closeNumber!;

            // Check if result is for today
            const resultDate = this.parseResultDate(marketResult.updated_date);
            if (!this.isSameDay(resultDate, date)) {

                return;
            }

            // Create or get existing result record
            let resultRecord = existingResult;
            if (!resultRecord) {
                const { startDate, endDate } = this.getWeekDates(date);
                const newDayResult = {
                    open: null,
                    main: null,
                    close: null,
                    openDeclationTime: null,
                    closeDeclationTime: null
                };

                // Get superAdmin ID for declaredBy field
                const superAdminId = await this.getSuperAdminId();

                const resultData = {
                    marketId: market._id,
                    marketName: market.marketName, // Include market name for readability
                    declaredBy: superAdminId, // Use superAdmin ID for auto-generated results
                    weekStartDate: startDate,
                    weekEndDate: endDate,
                    weekDays: 7,
                    results: {
                        [dayName]: newDayResult
                    }
                };

                resultRecord = await this.createOrFindResult(resultData);
            }

            // First declare open result
            await this.saveOpenResult(market._id, dayName, openNumber, openMain, date, resultRecord);

            // Then declare close result
            if (resultRecord) {
                await this.saveCloseResult(resultRecord, dayName, closeNumber, openMain, date);
            }



        } catch (error) {
            logger.error(`Error declaring completely missed results for ${market.marketName}:`, error);
        }
    }
}

export const autoResultService = new AutoResultService();

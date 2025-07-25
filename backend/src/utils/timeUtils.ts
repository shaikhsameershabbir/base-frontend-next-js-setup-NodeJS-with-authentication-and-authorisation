import moment from 'moment-timezone';

// Indian timezone
const INDIAN_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current time in Indian timezone
 */
export const getCurrentIndianTime = (): moment.Moment => {
    return moment().tz(INDIAN_TIMEZONE);
};

/**
 * Get current time in Indian timezone as Date object
 */
export const getCurrentIndianTimeAsDate = (): Date => {
    return getCurrentIndianTime().toDate();
};

/**
 * Convert a time string to Indian timezone moment object
 * @param timeString - Time string in format "HH:mm" (e.g., "09:30")
 * @param date - Optional date, defaults to today
 */
export const parseTimeToIndianMoment = (timeString: string, date?: Date): moment.Moment => {
    const baseDate = date || getCurrentIndianTimeAsDate();
    const [hours, minutes] = timeString.split(':').map(Number);

    return moment(baseDate)
        .tz(INDIAN_TIMEZONE)
        .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
};

/**
 * Check if betting is allowed for a specific bet type and market times
 * @param betType - 'open' or 'close'
 * @param openTime - Market open time string (HH:mm)
 * @param closeTime - Market close time string (HH:mm)
 * @param bufferMinutes - Minutes before the time when betting is allowed (default: 15)
 */
export const isBettingAllowed = (
    betType: 'open' | 'close',
    openTime: string,
    closeTime: string,
    bufferMinutes: number = 15
): { allowed: boolean; message?: string; nextBetTime?: Date } => {
    const now = getCurrentIndianTime();
    const today = now.format('YYYY-MM-DD');

    let targetTime: moment.Moment;
    let timeLabel: string;

    if (betType === 'open') {
        targetTime = parseTimeToIndianMoment(openTime);
        timeLabel = 'open';
    } else {
        targetTime = parseTimeToIndianMoment(closeTime);
        timeLabel = 'close';
    }

    // Calculate the betting window start time (15 minutes before target time)
    const bettingWindowStart = targetTime.clone().subtract(bufferMinutes, 'minutes');

    // Check if current time is within the betting window
    if (now.isBefore(bettingWindowStart)) {
        return {
            allowed: false,
            message: `Betting for ${timeLabel} will be available from ${bettingWindowStart.format('HH:mm')}`,
            nextBetTime: bettingWindowStart.toDate()
        };
    }

    // Check if current time is after the target time
    if (now.isAfter(targetTime)) {
        return {
            allowed: false,
            message: `Betting for ${timeLabel} has ended at ${targetTime.format('HH:mm')}`
        };
    }

    return {
        allowed: true
    };
};

/**
 * Get market status based on current time and market times
 * @param openTime - Market open time string (HH:mm)
 * @param closeTime - Market close time string (HH:mm)
 */
export const getMarketStatus = (openTime: string, closeTime: string): {
    status: 'open_betting' | 'open_closed' | 'close_betting' | 'close_closed' | 'closed';
    message: string;
    nextEvent?: { type: string; time: Date };
} => {
    const now = getCurrentIndianTime();
    const openMoment = parseTimeToIndianMoment(openTime);
    const closeMoment = parseTimeToIndianMoment(closeTime);

    const openBettingStart = openMoment.clone().subtract(15, 'minutes');
    const closeBettingStart = closeMoment.clone().subtract(15, 'minutes');

    // Open betting window
    if (now.isBetween(openBettingStart, openMoment)) {
        return {
            status: 'open_betting',
            message: `Open betting is active until ${openMoment.format('HH:mm')}`,
            nextEvent: { type: 'open_close', time: openMoment.toDate() }
        };
    }

    // Between open and close betting
    if (now.isBetween(openMoment, closeBettingStart)) {
        return {
            status: 'open_closed',
            message: `Open betting closed. Close betting starts at ${closeBettingStart.format('HH:mm')}`,
            nextEvent: { type: 'close_betting_start', time: closeBettingStart.toDate() }
        };
    }

    // Close betting window
    if (now.isBetween(closeBettingStart, closeMoment)) {
        return {
            status: 'close_betting',
            message: `Close betting is active until ${closeMoment.format('HH:mm')}`,
            nextEvent: { type: 'close_close', time: closeMoment.toDate() }
        };
    }

    // After close time
    return {
        status: 'closed',
        message: 'Market is closed for today'
    };
};

/**
 * Format time for display
 * @param time - Date or moment object
 */
export const formatTimeForDisplay = (time: Date | moment.Moment): string => {
    return moment(time).tz(INDIAN_TIMEZONE).format('HH:mm');
};

/**
 * Get time until next betting window
 * @param betType - 'open' or 'close'
 * @param openTime - Market open time string (HH:mm)
 * @param closeTime - Market close time string (HH:mm)
 */
export const getTimeUntilNextBetting = (
    betType: 'open' | 'close',
    openTime: string,
    closeTime: string
): { hours: number; minutes: number; seconds: number } | null => {
    const now = getCurrentIndianTime();

    let targetTime: moment.Moment;
    if (betType === 'open') {
        targetTime = parseTimeToIndianMoment(openTime);
    } else {
        targetTime = parseTimeToIndianMoment(closeTime);
    }

    const bettingStart = targetTime.clone().subtract(15, 'minutes');

    if (now.isBefore(bettingStart)) {
        const diff = bettingStart.diff(now);
        const duration = moment.duration(diff);

        return {
            hours: Math.floor(duration.asHours()),
            minutes: duration.minutes(),
            seconds: duration.seconds()
        };
    }

    return null;
}; 
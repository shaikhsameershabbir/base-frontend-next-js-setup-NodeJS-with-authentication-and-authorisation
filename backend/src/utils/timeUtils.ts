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
 * @param timeString - Time string in format "HH:mm" or ISO format (e.g., "09:30" or "2025-07-25T07:00:00.000Z")
 * @param date - Optional date, defaults to today
 */
export const parseTimeToIndianMoment = (timeString: string, date?: Date): moment.Moment => {
    // Check if it's an ISO format string
    if (timeString.includes('T') && timeString.includes('Z')) {
        // Parse ISO string and convert to Indian timezone
        const parsedMoment = moment(timeString).tz(INDIAN_TIMEZONE);

        // If the date is from a different day, update it to today
        const today = getCurrentIndianTime();
        if (parsedMoment.date() !== today.date() || parsedMoment.month() !== today.month() || parsedMoment.year() !== today.year()) {
            return parsedMoment.set({
                year: today.year(),
                month: today.month(),
                date: today.date()
            });
        }

        return parsedMoment;
    } else {
        // Parse HH:mm format
        const baseDate = date || getCurrentIndianTimeAsDate();
        const [hours, minutes] = timeString.split(':').map(Number);

        const result = moment(baseDate)
            .tz(INDIAN_TIMEZONE)
            .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });

        return result;
    }
};

/**
 * Check if betting is allowed for a specific bet type and market times
 * @param betType - 'open', 'close', or 'both'
 * @param openTime - Market open time string (HH:mm or ISO format)
 * @param closeTime - Market close time string (HH:mm or ISO format)
 * @param bufferMinutes - Minutes before the time when betting is not allowed (default: 15)
 */
export const isBettingAllowed = (
    betType: 'open' | 'close' | 'both',
    openTime: string,
    closeTime: string,
    bufferMinutes: number = 15
): { allowed: boolean; message?: string; nextBetTime?: Date } => {
    const now = getCurrentIndianTime();

    // Parse the times
    const openMoment = parseTimeToIndianMoment(openTime);
    const closeMoment = parseTimeToIndianMoment(closeTime);

    // Calculate loading periods
    const openLoadingStart = openMoment.clone().subtract(bufferMinutes, 'minutes');
    const closeLoadingStart = closeMoment.clone().subtract(bufferMinutes, 'minutes');

    // Market day starts at midnight
    const midnight = now.clone().startOf('day'); // 00:00 AM

    // Before midnight: No betting allowed
    if (now.isBefore(midnight)) {
        return {
            allowed: false,
            message: `Market opens at midnight (00:00). Betting will be available until ${closeLoadingStart.format('HH:mm')}`
        };
    }

    // During open betting period: All bet types allowed (midnight to open loading start)
    if (now.isBetween(midnight, openLoadingStart)) {
        return {
            allowed: true
        };
    }

    // During open loading period: No betting allowed
    if (now.isBetween(openLoadingStart, openMoment)) {
        return {
            allowed: false,
            message: `Loading period. Market opens at ${openMoment.format('HH:mm')}`
        };
    }

    // During close betting period: Only close betting allowed (open time to close loading start)
    if (now.isBetween(openMoment, closeLoadingStart)) {
        if (betType === 'close' || betType === 'both') {
            return {
                allowed: true
            };
        } else {
            return {
                allowed: false,
                message: `Only close betting is allowed. Market closes at ${closeMoment.format('HH:mm')}`
            };
        }
    }

    // During close loading period: No betting allowed
    if (now.isBetween(closeLoadingStart, closeMoment)) {
        return {
            allowed: false,
            message: `Loading period. Market closes at ${closeMoment.format('HH:mm')}`
        };
    }

    // After close time: No betting allowed until next midnight
    return {
        allowed: false,
        message: 'Market is closed for today. Next market opens at midnight (00:00)'
    };
};

/**
 * Get market status based on current time and market times
 * @param openTime - Market open time string (HH:mm or ISO format)
 * @param closeTime - Market close time string (HH:mm or ISO format)
 */
export const getMarketStatus = (openTime: string, closeTime: string): {
    status: 'open_betting' | 'close_betting' | 'open_loading' | 'close_loading' | 'closed';
    message: string;
    nextEvent?: { type: string; time: Date };
} => {
    const now = getCurrentIndianTime();

    // Parse the times
    const openMoment = parseTimeToIndianMoment(openTime);
    const closeMoment = parseTimeToIndianMoment(closeTime);

    // Calculate loading periods
    const openLoadingStart = openMoment.clone().subtract(15, 'minutes');
    const closeLoadingStart = closeMoment.clone().subtract(15, 'minutes');

    // Market day starts at midnight
    const midnight = now.clone().startOf('day'); // 00:00 AM

    // Before midnight: Market closed
    if (now.isBefore(midnight)) {
        return {
            status: 'closed',
            message: `Market opens at midnight (00:00). Open betting will be available until ${openLoadingStart.format('HH:mm')}`,
            nextEvent: { type: 'market_open', time: midnight.toDate() }
        };
    }

    // Open betting: From midnight to open loading start
    if (now.isBetween(midnight, openLoadingStart)) {
        return {
            status: 'open_betting',
            message: `Open betting is active until ${openLoadingStart.format('HH:mm')}`,
            nextEvent: { type: 'open_loading', time: openLoadingStart.toDate() }
        };
    }

    // Open loading: 15 minutes before open time to open time
    if (now.isBetween(openLoadingStart, openMoment)) {
        return {
            status: 'open_loading',
            message: `Loading period. Market opens at ${openMoment.format('HH:mm')}`,
            nextEvent: { type: 'market_open', time: openMoment.toDate() }
        };
    }

    // Close betting: From open time to close loading start
    if (now.isBetween(openMoment, closeLoadingStart)) {
        return {
            status: 'close_betting',
            message: `Close betting is active until ${closeLoadingStart.format('HH:mm')}`,
            nextEvent: { type: 'close_loading', time: closeLoadingStart.toDate() }
        };
    }

    // Close loading: 15 minutes before close time to close time
    if (now.isBetween(closeLoadingStart, closeMoment)) {
        return {
            status: 'close_loading',
            message: `Loading period. Market closes at ${closeMoment.format('HH:mm')}`,
            nextEvent: { type: 'market_close', time: closeMoment.toDate() }
        };
    }

    // After close time: Market closed until next midnight
    return {
        status: 'closed',
        message: 'Market is closed for today. Next market opens at midnight (00:00)'
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
    betType: 'open' | 'close' | 'both',
    openTime: string,
    closeTime: string
): { hours: number; minutes: number; seconds: number } | null => {
    const now = getCurrentIndianTime();

    // Parse the times
    const openMoment = parseTimeToIndianMoment(openTime);
    const closeMoment = parseTimeToIndianMoment(closeTime);

    // Calculate loading periods
    const openLoadingStart = openMoment.clone().subtract(15, 'minutes');
    const closeLoadingStart = closeMoment.clone().subtract(15, 'minutes');

    let targetTime: moment.Moment;

    if (betType === 'open' || betType === 'both') {
        // For open betting, target is open loading start
        targetTime = openLoadingStart;
    } else {
        // For close betting, target is close loading start
        targetTime = closeLoadingStart;
    }

    if (now.isBefore(targetTime)) {
        const diff = targetTime.diff(now);
        const duration = moment.duration(diff);

        return {
            hours: Math.floor(duration.asHours()),
            minutes: duration.minutes(),
            seconds: duration.seconds()
        };
    }

    return null;
}; 
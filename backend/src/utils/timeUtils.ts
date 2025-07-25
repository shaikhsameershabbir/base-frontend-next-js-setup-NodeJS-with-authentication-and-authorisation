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
        return moment(timeString).tz(INDIAN_TIMEZONE);
    } else {
        // Parse HH:mm format
        const baseDate = date || getCurrentIndianTimeAsDate();
        const [hours, minutes] = timeString.split(':').map(Number);

        return moment(baseDate)
            .tz(INDIAN_TIMEZONE)
            .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
    }
};

/**
 * Check if betting is allowed for a specific bet type and market times
 * @param betType - 'open' or 'close'
 * @param openTime - Market open time string (HH:mm or ISO format)
 * @param closeTime - Market close time string (HH:mm or ISO format)
 * @param bufferMinutes - Minutes before the time when betting is not allowed (default: 15)
 */
export const isBettingAllowed = (
    betType: 'open' | 'close',
    openTime: string,
    closeTime: string,
    bufferMinutes: number = 15
): { allowed: boolean; message?: string; nextBetTime?: Date } => {
    const now = getCurrentIndianTime();
    const openMoment = parseTimeToIndianMoment(openTime);
    const closeMoment = parseTimeToIndianMoment(closeTime);

    // Calculate the no-betting windows
    const openNoBettingStart = openMoment.clone().subtract(bufferMinutes, 'minutes'); // 12:15 PM
    const closeNoBettingStart = closeMoment.clone().subtract(bufferMinutes, 'minutes'); // 3:45 PM

    if (betType === 'open') {
        // Open betting: 12:00 AM to 12:15 PM
        if (now.isBefore(openNoBettingStart)) {
            return {
                allowed: true
            };
        } else {
            return {
                allowed: false,
                message: `Open betting has ended at ${openNoBettingStart.format('HH:mm')}. Close betting is available from ${openMoment.format('HH:mm')} to ${closeNoBettingStart.format('HH:mm')}`
            };
        }
    } else {
        // Close betting: 12:30 PM to 3:45 PM
        if (now.isBetween(openMoment, closeNoBettingStart)) {
            return {
                allowed: true
            };
        } else if (now.isBefore(openMoment)) {
            return {
                allowed: false,
                message: `Close betting will be available from ${openMoment.format('HH:mm')} to ${closeNoBettingStart.format('HH:mm')}`
            };
        } else {
            return {
                allowed: false,
                message: `Close betting has ended at ${closeNoBettingStart.format('HH:mm')}. Market will be closed at ${closeMoment.format('HH:mm')}`
            };
        }
    }
};

/**
 * Get market status based on current time and market times
 * @param openTime - Market open time string (HH:mm or ISO format)
 * @param closeTime - Market close time string (HH:mm or ISO format)
 */
export const getMarketStatus = (openTime: string, closeTime: string): {
    status: 'open_betting' | 'no_betting' | 'close_betting' | 'closing_soon' | 'closed';
    message: string;
    nextEvent?: { type: string; time: Date };
} => {
    const now = getCurrentIndianTime();
    const openMoment = parseTimeToIndianMoment(openTime);
    const closeMoment = parseTimeToIndianMoment(closeTime);

    // Calculate the no-betting windows
    const openNoBettingStart = openMoment.clone().subtract(15, 'minutes'); // 12:15 PM
    const closeNoBettingStart = closeMoment.clone().subtract(15, 'minutes'); // 3:45 PM

    // Open betting: 12:00 AM to 12:15 PM
    if (now.isBefore(openNoBettingStart)) {
        return {
            status: 'open_betting',
            message: `Open betting is active until ${openNoBettingStart.format('HH:mm')}`,
            nextEvent: { type: 'open_end', time: openNoBettingStart.toDate() }
        };
    }

    // No betting: 12:15 PM to 12:30 PM
    if (now.isBetween(openNoBettingStart, openMoment)) {
        return {
            status: 'no_betting',
            message: `No betting allowed. Close betting starts at ${openMoment.format('HH:mm')}`,
            nextEvent: { type: 'close_start', time: openMoment.toDate() }
        };
    }

    // Close betting: 12:30 PM to 3:45 PM
    if (now.isBetween(openMoment, closeNoBettingStart)) {
        return {
            status: 'close_betting',
            message: `Close betting is active until ${closeNoBettingStart.format('HH:mm')}`,
            nextEvent: { type: 'close_end', time: closeNoBettingStart.toDate() }
        };
    }

    // Closing soon: 3:45 PM to 4:00 PM
    if (now.isBetween(closeNoBettingStart, closeMoment)) {
        return {
            status: 'closing_soon',
            message: `Market closing soon. No betting allowed until ${closeMoment.format('HH:mm')}`,
            nextEvent: { type: 'market_close', time: closeMoment.toDate() }
        };
    }

    // After close time: Market closed
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
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
 * @param timeString - Time string in format "HH:mm" or ISO format
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
 * Check if market is open today based on weekDays
 * @param weekDays - Number of days market operates (5 = Mon-Fri, 6 = Mon-Sat, 7 = Mon-Sun)
 */
export const isMarketOpenToday = (weekDays: number): boolean => {
    const now = getCurrentIndianTime();
    const currentDay = now.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Convert to market days (Monday = 1, Tuesday = 2, ..., Sunday = 7)
    const marketDay = currentDay === 0 ? 7 : currentDay;

    return marketDay <= weekDays;
};

/**
 * Get market status with detailed information
 * @param openTime - Market open time string (HH:mm or ISO format)
 * @param closeTime - Market close time string (HH:mm or ISO format)
 * @param weekDays - Number of days market operates
 */
export const getMarketStatus = (
    openTime: string,
    closeTime: string,
    weekDays: number
): {
    status: 'open_betting' | 'close_betting' | 'open_loading' | 'close_loading' | 'closed' | 'closed_today';
    message: string;
    isOpen: boolean;
    canPlayOpen: boolean;
    canPlayClose: boolean;
    canPlayBoth: boolean;
    nextEvent?: { type: string; time: Date; message: string };
    timeUntilOpen?: number;
    timeUntilClose?: number;
} => {
    const now = getCurrentIndianTime();

    // Check if market is open today
    if (!isMarketOpenToday(weekDays)) {
        return {
            status: 'closed_today',
            message: 'Market closed today',
            isOpen: false,
            canPlayOpen: false,
            canPlayClose: false,
            canPlayBoth: false
        };
    }

    // Parse the times
    const openMoment = parseTimeToIndianMoment(openTime);
    const closeMoment = parseTimeToIndianMoment(closeTime);

    // Calculate loading periods (15 minutes before each time)
    const openLoadingStart = openMoment.clone().subtract(15, 'minutes');
    const closeLoadingStart = closeMoment.clone().subtract(15, 'minutes');

    // Market day starts at midnight
    const midnight = now.clone().startOf('day'); // 00:00 AM

    // Before midnight: Market closed
    if (now.isBefore(midnight)) {
        const timeUntilOpen = midnight.diff(now);
        return {
            status: 'closed',
            message: 'Market opens at midnight',
            isOpen: false,
            canPlayOpen: false,
            canPlayClose: false,
            canPlayBoth: false,
            nextEvent: {
                type: 'market_open',
                time: midnight.toDate(),
                message: 'Market opens at midnight'
            },
            timeUntilOpen
        };
    }

    // Open betting: From midnight to open loading start
    if (now.isBetween(midnight, openLoadingStart)) {
        const timeUntilOpenLoading = openLoadingStart.diff(now);
        return {
            status: 'open_betting',
            message: 'Open betting active',
            isOpen: true,
            canPlayOpen: true,
            canPlayClose: true,
            canPlayBoth: true,
            nextEvent: {
                type: 'open_loading',
                time: openLoadingStart.toDate(),
                message: `Loading period starts at ${openLoadingStart.format('HH:mm')}`
            },
            timeUntilClose: closeLoadingStart.diff(now)
        };
    }

    // Open loading: 15 minutes before open time to open time
    if (now.isBetween(openLoadingStart, openMoment)) {
        const timeUntilOpen = openMoment.diff(now);
        return {
            status: 'open_loading',
            message: 'Loading period',
            isOpen: false,
            canPlayOpen: false,
            canPlayClose: false,
            canPlayBoth: false,
            nextEvent: {
                type: 'market_open',
                time: openMoment.toDate(),
                message: `Market opens at ${openMoment.format('HH:mm')}`
            },
            timeUntilOpen
        };
    }

    // Close betting: From open time to close loading start
    if (now.isBetween(openMoment, closeLoadingStart)) {
        const timeUntilCloseLoading = closeLoadingStart.diff(now);
        return {
            status: 'close_betting',
            message: 'Close betting only',
            isOpen: true,
            canPlayOpen: false, // Open result should be declared by now
            canPlayClose: true,
            canPlayBoth: false,
            nextEvent: {
                type: 'close_loading',
                time: closeLoadingStart.toDate(),
                message: `Loading period starts at ${closeLoadingStart.format('HH:mm')}`
            },
            timeUntilClose: timeUntilCloseLoading
        };
    }

    // Close loading: 15 minutes before close time to close time
    if (now.isBetween(closeLoadingStart, closeMoment)) {
        const timeUntilClose = closeMoment.diff(now);
        return {
            status: 'close_loading',
            message: 'Loading period',
            isOpen: false,
            canPlayOpen: false,
            canPlayClose: false,
            canPlayBoth: false,
            nextEvent: {
                type: 'market_close',
                time: closeMoment.toDate(),
                message: `Market closes at ${closeMoment.format('HH:mm')}`
            },
            timeUntilClose
        };
    }

    // After close time: Market closed until next midnight
    const nextMidnight = midnight.clone().add(1, 'day');
    const timeUntilNextMidnight = nextMidnight.diff(now);

    return {
        status: 'closed',
        message: 'Market closed',
        isOpen: false,
        canPlayOpen: false,
        canPlayClose: false,
        canPlayBoth: false,
        nextEvent: {
            type: 'next_market',
            time: nextMidnight.toDate(),
            message: 'Next market opens at midnight'
        },
        timeUntilOpen: timeUntilNextMidnight
    };
};

/**
 * Check if betting is allowed for a specific bet type and market times
 * @param betType - 'open', 'close', or 'both'
 * @param openTime - Market open time string (HH:mm or ISO format)
 * @param closeTime - Market close time string (HH:mm or ISO format)
 * @param weekDays - Number of days market operates
 * @param bufferMinutes - Minutes before the time when betting is not allowed (default: 15)
 */
export const isBettingAllowed = (
    betType: 'open' | 'close' | 'both',
    openTime: string,
    closeTime: string,
    weekDays: number,
    bufferMinutes: number = 15
): { allowed: boolean; message?: string; nextBetTime?: Date } => {
    const marketStatus = getMarketStatus(openTime, closeTime, weekDays);

    if (marketStatus.status === 'closed_today') {
        return {
            allowed: false,
            message: marketStatus.message
        };
    }

    if (!marketStatus.isOpen) {
        return {
            allowed: false,
            message: marketStatus.message,
            nextBetTime: marketStatus.nextEvent?.time
        };
    }

    // Check bet type restrictions
    if (betType === 'open' && !marketStatus.canPlayOpen) {
        return {
            allowed: false,
            message: 'Open betting is not available at this time. Only close betting is allowed.',
            nextBetTime: marketStatus.nextEvent?.time
        };
    }

    if (betType === 'close' && !marketStatus.canPlayClose) {
        return {
            allowed: false,
            message: 'Close betting is not available at this time.',
            nextBetTime: marketStatus.nextEvent?.time
        };
    }

    if (betType === 'both' && !marketStatus.canPlayBoth) {
        return {
            allowed: false,
            message: 'Both betting types are not available at this time.',
            nextBetTime: marketStatus.nextEvent?.time
        };
    }

    return {
        allowed: true
    };
};

/**
 * Get time until next betting window
 * @param betType - 'open' or 'close'
 * @param openTime - Market open time string (HH:mm)
 * @param closeTime - Market close time string (HH:mm)
 * @param weekDays - Number of days market operates
 */
export const getTimeUntilNextBetting = (
    betType: 'open' | 'close' | 'both',
    openTime: string,
    closeTime: string,
    weekDays: number
): { hours: number; minutes: number; seconds: number } | null => {
    const marketStatus = getMarketStatus(openTime, closeTime, weekDays);

    if (marketStatus.status === 'closed_today') {
        // Calculate time until next market day
        const now = getCurrentIndianTime();
        const nextMarketDay = now.clone().add(1, 'day').startOf('day');
        const diff = nextMarketDay.diff(now);
        const duration = moment.duration(diff);

        return {
            hours: Math.floor(duration.asHours()),
            minutes: duration.minutes(),
            seconds: duration.seconds()
        };
    }

    if (marketStatus.nextEvent) {
        const now = getCurrentIndianTime();
        const diff = moment(marketStatus.nextEvent.time).diff(now);
        const duration = moment.duration(diff);

        return {
            hours: Math.floor(duration.asHours()),
            minutes: duration.minutes(),
            seconds: duration.seconds()
        };
    }

    return null;
};

/**
 * Format time for display
 * @param time - Date or moment object
 */
export const formatTimeForDisplay = (time: Date | moment.Moment): string => {
    return moment(time).tz(INDIAN_TIMEZONE).format('HH:mm');
};

/**
 * Get readable time difference
 * @param milliseconds - Time difference in milliseconds
 */
export const getReadableTimeDifference = (milliseconds: number): string => {
    const duration = moment.duration(milliseconds);
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}; 
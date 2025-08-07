/**
 * Check if a specific bet type is allowed based on market status
 * @param betType - 'open', 'close', or 'both'
 * @param marketStatus - The current market status from the API
 */
export const isBetTypeAllowed = (betType: 'open' | 'close' | 'both', marketStatus: any): boolean => {
    if (!marketStatus) return false;

    if (betType === 'open') {
        // Open betting is only allowed during open_betting period
        return marketStatus.status === 'open_betting';
    } else if (betType === 'close') {
        // Close betting is allowed during both open_betting and close_betting periods
        return marketStatus.status === 'open_betting' || marketStatus.status === 'close_betting';
    } else if (betType === 'both') {
        // Both betting is allowed during open_betting period only
        return marketStatus.status === 'open_betting';
    }

    return false;
};

/**
 * Get the current bet type based on market status
 * @param marketStatus - The current market status from the API
 */
export const getCurrentBetType = (marketStatus: any): 'open' | 'close' | null => {
    if (!marketStatus) return null;

    if (marketStatus.status === 'open_betting') {
        return 'open';
    } else if (marketStatus.status === 'close_betting') {
        return 'close';
    }

    return null;
};

/**
 * Check if betting is currently allowed
 * @param marketStatus - The current market status from the API
 */
export const isBettingAllowed = (marketStatus: any): boolean => {
    return isBetTypeAllowed('open', marketStatus) || isBetTypeAllowed('close', marketStatus);
};

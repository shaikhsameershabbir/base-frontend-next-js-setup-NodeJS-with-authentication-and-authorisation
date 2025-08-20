import { useState, useEffect } from 'react';

interface MarketStatus {
    status: 'open_betting' | 'close_betting' | 'open_loading' | 'close_loading' | 'closed' | 'closed_today';
    message: string;
    isOpen: boolean;
    canPlayOpen: boolean;
    canPlayClose: boolean;
    canPlayBoth: boolean;
    nextEvent?: { type: string; time: Date; message: string };
    timeUntilOpen?: number;
    timeUntilClose?: number;
}

interface Market {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
    isGolden?: boolean;
    rank?: number;
    weekDays?: number;
}

export const useMarketStatus = (market: Market) => {
    const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Calculate market status based on current time
    useEffect(() => {
        if (!market) return;

        const calculateStatus = (): MarketStatus => {
            const now = new Date();
            const weekDays = market.weekDays || 7;

            // Check if market is open today based on weekDays
            const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const marketDay = currentDay === 0 ? 7 : currentDay;
            const isOpenToday = marketDay <= weekDays;

            if (!isOpenToday) {
                return {
                    status: 'closed_today',
                    message: `Market closed today`,
                    isOpen: false,
                    canPlayOpen: false,
                    canPlayClose: false,
                    canPlayBoth: false
                };
            }

            // Parse times
            let openTimeParsed, closeTimeParsed;

            try {
                if (market.openTime.includes('T')) {
                    const openDate = new Date(market.openTime);
                    openTimeParsed = { hours: openDate.getHours(), minutes: openDate.getMinutes() };
                } else {
                    const [hours, minutes] = market.openTime.split(':').map(Number);
                    openTimeParsed = { hours, minutes };
                }

                if (market.closeTime.includes('T')) {
                    const closeDate = new Date(market.closeTime);
                    closeTimeParsed = { hours: closeDate.getHours(), minutes: closeDate.getMinutes() };
                } else {
                    const [hours, minutes] = market.closeTime.split(':').map(Number);
                    closeTimeParsed = { hours, minutes };
                }
            } catch (error) {
                console.error('Error parsing market times:', error);
                return {
                    status: 'closed',
                    message: 'Invalid market times',
                    isOpen: false,
                    canPlayOpen: false,
                    canPlayClose: false,
                    canPlayBoth: false
                };
            }

            // Create Date objects for today with the market times
            const today = new Date();
            const todayOpenTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), openTimeParsed.hours, openTimeParsed.minutes);
            const todayCloseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), closeTimeParsed.hours, closeTimeParsed.minutes);

            // Calculate loading periods (15 minutes before each time)
            const openLoadingStart = new Date(todayOpenTime.getTime() - 15 * 60 * 1000);
            const closeLoadingStart = new Date(todayCloseTime.getTime() - 15 * 60 * 1000);

            // Market day starts at midnight
            const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

            // Before midnight: Market closed
            if (now < midnight) {
                const timeUntilOpen = midnight.getTime() - now.getTime();
                return {
                    status: 'closed',
                    message: 'Market opens at midnight',
                    isOpen: false,
                    canPlayOpen: false,
                    canPlayClose: false,
                    canPlayBoth: false,
                    nextEvent: {
                        type: 'market_open',
                        time: midnight,
                        message: 'Market opens at midnight'
                    },
                    timeUntilOpen
                };
            }

            // Open betting: From midnight to open loading start
            if (now >= midnight && now < openLoadingStart) {
                const timeUntilOpenLoading = openLoadingStart.getTime() - now.getTime();
                return {
                    status: 'open_betting',
                    message: `Open betting active`,
                    isOpen: true,
                    canPlayOpen: true,
                    canPlayClose: true,
                    canPlayBoth: true,
                    nextEvent: {
                        type: 'open_loading',
                        time: openLoadingStart,
                        message: `Loading period starts at ${openLoadingStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                    },
                    timeUntilClose: closeLoadingStart.getTime() - now.getTime()
                };
            }

            // Open loading: 15 minutes before open time to open time
            if (now >= openLoadingStart && now < todayOpenTime) {
                const timeUntilOpen = todayOpenTime.getTime() - now.getTime();
                return {
                    status: 'open_loading',
                    message: `Loading period`,
                    isOpen: false,
                    canPlayOpen: false,
                    canPlayClose: false,
                    canPlayBoth: false,
                    nextEvent: {
                        type: 'market_open',
                        time: todayOpenTime,
                        message: `Market opens at ${todayOpenTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                    },
                    timeUntilOpen
                };
            }

            // Close betting: From open time to close loading start
            if (now >= todayOpenTime && now < closeLoadingStart) {
                const timeUntilCloseLoading = closeLoadingStart.getTime() - now.getTime();
                return {
                    status: 'close_betting',
                    message: `Close betting only`,
                    isOpen: true,
                    canPlayOpen: false, // Open result should be declared by now
                    canPlayClose: true,
                    canPlayBoth: false,
                    nextEvent: {
                        type: 'close_loading',
                        time: closeLoadingStart,
                        message: `Loading period starts at ${closeLoadingStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                    },
                    timeUntilClose: timeUntilCloseLoading
                };
            }

            // Close loading: 15 minutes before close time to close time
            if (now >= closeLoadingStart && now < todayCloseTime) {
                const timeUntilClose = todayCloseTime.getTime() - now.getTime();
                return {
                    status: 'close_loading',
                    message: `Loading period`,
                    isOpen: false,
                    canPlayOpen: false,
                    canPlayClose: false,
                    canPlayBoth: false,
                    nextEvent: {
                        type: 'market_close',
                        time: todayCloseTime,
                        message: `Market closes at ${todayCloseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                    },
                    timeUntilClose
                };
            }

            // After close time: Market closed until next midnight
            const nextMidnight = new Date(midnight.getTime() + 24 * 60 * 60 * 1000);
            const timeUntilNextMidnight = nextMidnight.getTime() - now.getTime();

            return {
                status: 'closed',
                message: 'Market closed',
                isOpen: false,
                canPlayOpen: false,
                canPlayClose: false,
                canPlayBoth: false,
                nextEvent: {
                    type: 'next_market',
                    time: nextMidnight,
                    message: 'Next market opens at midnight'
                },
                timeUntilOpen: timeUntilNextMidnight
            };
        };

        setMarketStatus(calculateStatus());
    }, [market, currentTime]);

    return marketStatus;
};

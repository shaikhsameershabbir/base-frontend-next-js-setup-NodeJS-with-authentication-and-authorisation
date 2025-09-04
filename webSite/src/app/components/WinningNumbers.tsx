'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Trophy, Clock, Calendar, AlertCircle } from 'lucide-react';

interface WinningNumbersProps {
    marketId: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    weekDays: number;
    marketResult?: any;
}

interface MarketResult {
    _id: string;
    marketId: string;
    weekStartDate: string;
    weekEndDate: string;
    weekDays: number;
    results: {
        [key: string]: {
            open: string | null;
            main: string | null;
            close: string | null;
            openDeclationTime: string | null;
            closeDeclationTime: string | null;
        };
    };
}

const WinningNumbers: React.FC<WinningNumbersProps> = React.memo(({
    marketId,
    marketName,
    openTime,
    closeTime,
    weekDays,
    marketResult
}) => {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Use passed result or null
    const result = marketResult || null;

    // Helper functions
    const getDayName = (date: Date): string => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    };

    // Check if market is open today based on weekDays
    const isMarketOpenToday = (): boolean => {
        const currentDay = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        // Convert to market days (Monday = 1, Tuesday = 2, ..., Sunday = 7)
        const marketDay = currentDay === 0 ? 7 : currentDay;

        return marketDay <= weekDays;
    };

    // Check if current time is in loading window (15 minutes before open/close times)
    const isInLoadingWindow = (): boolean => {
        try {
            // Parse times
            let openTimeParsed, closeTimeParsed;

            if (openTime.includes('T')) {
                const openDate = new Date(openTime);
                openTimeParsed = { hours: openDate.getHours(), minutes: openDate.getMinutes() };
            } else {
                const [hours, minutes] = openTime.split(':').map(Number);
                openTimeParsed = { hours, minutes };
            }

            if (closeTime.includes('T')) {
                const closeDate = new Date(closeTime);
                closeTimeParsed = { hours: closeDate.getHours(), minutes: closeDate.getMinutes() };
            } else {
                const [hours, minutes] = closeTime.split(':').map(Number);
                closeTimeParsed = { hours, minutes };
            }

            // Create Date objects for today with the market times
            const today = new Date();
            const todayOpenTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), openTimeParsed.hours, openTimeParsed.minutes);
            const todayCloseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), closeTimeParsed.hours, closeTimeParsed.minutes);

            // Create 15-minute windows BEFORE the times only (not after)
            const openWindowStart = new Date(todayOpenTime.getTime() - 15 * 60 * 1000);
            const closeWindowStart = new Date(todayCloseTime.getTime() - 15 * 60 * 1000);

            // Only show loading if we're in the 15-minute window BEFORE the time
            return (currentTime >= openWindowStart && currentTime < todayOpenTime) ||
                (currentTime >= closeWindowStart && currentTime < todayCloseTime);
        } catch (error) {
            console.error('Error checking loading window:', error);
            return false;
        }
    };

    // Check if open time has passed
    const hasOpenTimePassed = (): boolean => {
        try {
            let openTimeParsed;

            if (openTime.includes('T')) {
                const openDate = new Date(openTime);
                openTimeParsed = { hours: openDate.getHours(), minutes: openDate.getMinutes() };
            } else {
                const [hours, minutes] = openTime.split(':').map(Number);
                openTimeParsed = { hours, minutes };
            }

            const today = new Date();
            const todayOpenTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), openTimeParsed.hours, openTimeParsed.minutes);

            return currentTime > todayOpenTime;
        } catch (error) {
            console.error('Error checking if open time passed:', error);
            return false;
        }
    };

    const getTodayResult = (): { open: string | null; main: string | null; close: string | null } | null => {
        if (!result) return null;

        const today = getDayName(currentTime);
        return result.results[today] || null;
    };

    const getPreviousDayResult = (): { open: string | null; main: string | null; close: string | null } | null => {
        if (!result) return null;

        // Get yesterday's result
        const yesterday = new Date(currentTime);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayName = getDayName(yesterday);

        return result.results[yesterdayName] || null;
    };

    const formatResult = (result: { open: string | null; main: string | null; close: string | null }): string => {
        if (!result.open && !result.close) return '*** ** ***';

        let formatted = '';
        if (result.open) {
            formatted += result.open.toString();
            if (result.main) {
                formatted += `-${result.main}`;
            }
        }

        if (result.close) {
            if (formatted) formatted += '-';
            formatted += result.close.toString();
        }

        return formatted;
    };

    // Determine what to display - memoized for performance
    const displayContent = useMemo(() => {
        const isClosedToday = !isMarketOpenToday();
        const inLoadingWindow = isInLoadingWindow();
        const openTimePassed = hasOpenTimePassed();

        // Check if market is closed today - show ***-**-*** instead of previous result
        if (isClosedToday) {
            return {
                type: 'closed',
                content: '*** ** ***',
                icon: <Calendar className="w-4 h-4" />
            };
        }

        // Check if in loading window (15 minutes BEFORE open/close times)
        if (inLoadingWindow) {
            return {
                type: 'loading',
                content: 'Loading...',
                icon: <Clock className="w-4 h-4 animate-spin" />
            };
        }

        // After open time has passed - check for today's result
        if (openTimePassed) {
            const todayResult = getTodayResult();
            if (todayResult && (todayResult.open || todayResult.close)) {
                return {
                    type: 'result',
                    content: formatResult(todayResult),
                    icon: <Trophy className="w-4 h-4" />
                };
            } else {
                return {
                    type: 'no-result',
                    content: "*** ** ***",
                    icon: <AlertCircle className="w-4 h-4" />
                };
            }
        }

        // Before open time - show ***-**-*** instead of previous day result
        return {
            type: 'previous',
            content: '*** ** ***',
            icon: <Calendar className="w-4 h-4" />
        };
    }, [currentTime, result, openTime, closeTime, weekDays]);

    return (
        <div>
            {!result ? (
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span className="text-green-700 text-sm">Loading results...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="text-green-700 font-bold text-lg">
                        {displayContent.content}
                    </span>
                </div>
            )}

            {/* Only show "Market closed today" message */}
            {displayContent.type === 'closed' && (
                <div className="text-xs text-gray-600 mt-1">
                    Market closed today
                </div>
            )}
        </div>
    );
});

WinningNumbers.displayName = 'WinningNumbers';

export default WinningNumbers;

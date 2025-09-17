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
    resultDate: string;
    results: {
        open: string | null;
        main: string | null;
        close: string | null;
        openDeclationTime: string | null;
        closeDeclationTime: string | null;
    };
}

// Parse time once and cache the result
const parseTimeString = (timeStr: string): { hours: number; minutes: number } | null => {
    try {
        if (timeStr.includes('T')) {
            const date = new Date(timeStr);
            return { hours: date.getHours(), minutes: date.getMinutes() };
        } else {
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return null;
            return { hours, minutes };
        }
    } catch {
        return null;
    }
};

const WinningNumbers: React.FC<WinningNumbersProps> = React.memo(({
    marketId,
    marketName,
    openTime,
    closeTime,
    weekDays,
    marketResult
}) => {
    const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Memoize parsed times to avoid recalculation
    const parsedTimes = useMemo(() => {
        const open = parseTimeString(openTime);
        const close = parseTimeString(closeTime);
        return { open, close };
    }, [openTime, closeTime]);

    // Use passed result or null
    const result = marketResult || null;

    // Helper functions
    const getDayName = (date: Date): string => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    };

    // Memoized helper functions using parsed times
    const marketStatus = useMemo(() => {
        const currentDay = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const marketDay = currentDay === 0 ? 7 : currentDay;
        const isOpenToday = marketDay <= weekDays;

        if (!parsedTimes.open || !parsedTimes.close) {
            return { isOpenToday, inLoadingWindow: false, openTimePassed: false };
        }

        const today = new Date();
        const todayOpenTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parsedTimes.open.hours, parsedTimes.open.minutes);
        const todayCloseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parsedTimes.close.hours, parsedTimes.close.minutes);

        const openWindowStart = new Date(todayOpenTime.getTime() - 15 * 60 * 1000);
        const closeWindowStart = new Date(todayCloseTime.getTime() - 15 * 60 * 1000);

        const inLoadingWindow = (currentTime >= openWindowStart && currentTime < todayOpenTime) ||
            (currentTime >= closeWindowStart && currentTime < todayCloseTime);

        const openTimePassed = currentTime > todayOpenTime;

        return { isOpenToday, inLoadingWindow, openTimePassed };
    }, [currentTime, weekDays, parsedTimes]);

    const getTodayResult = (): { open: string | null; main: string | null; close: string | null } | null => {
        if (!result) return null;

        // Check if the result is for today
        const resultDate = new Date(result.resultDate);
        const today = new Date();

        // Normalize both dates to start of day for comparison
        const normalizedResultDate = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate());
        const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (normalizedResultDate.getTime() === normalizedToday.getTime()) {
            return result.results;
        }

        return null;
    };

    const getPreviousDayResult = (): { open: string | null; main: string | null; close: string | null } | null => {
        if (!result) return null;

        // Check if the result is for yesterday
        const resultDate = new Date(result.resultDate);
        const yesterday = new Date(currentTime);
        yesterday.setDate(yesterday.getDate() - 1);

        // Normalize both dates to start of day for comparison
        const normalizedResultDate = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate());
        const normalizedYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (normalizedResultDate.getTime() === normalizedYesterday.getTime()) {
            return result.results;
        }

        return null;
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
        const { isOpenToday, inLoadingWindow, openTimePassed } = marketStatus;

        // Check if market is closed today - show ***-**-*** instead of previous result
        if (!isOpenToday) {
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
    }, [marketStatus, result]);

    return (
        <div>
            {!result ? (
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span className="text-green-700 text-lg">Loading results...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <p
                        className="text-4xl sm:text-5xl italic font-black text-[#000] mb-1 tracking-wider"
                        style={{ textShadow: "1px 1px 6px #fff" }}
                    >
                        {displayContent.content}
                    </p>
                </div>
            )}

            {/* Only show "Market closed today" message */}
            {displayContent.type === 'closed' && (
                <div className="text-base text-gray-600 mt-1">
                    Market closed today
                </div>
            )}
        </div>
    );
});

WinningNumbers.displayName = 'WinningNumbers';

export default WinningNumbers;

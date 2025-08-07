'use client';

import React, { useState, useEffect } from 'react';
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
            open: number | null;
            main: number | null;
            close: number | null;
            openDeclationTime: string | null;
            closeDeclationTime: string | null;
        };
    };
}

const WinningNumbers: React.FC<WinningNumbersProps> = ({
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

    // Parse time string helper function
    const parseTimeString = (timeStr: string) => {
        console.log(`Parsing time string: ${timeStr}`);

        // Handle ISO date string format
        if (timeStr.includes('T')) {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) {
                console.error('Invalid ISO date:', timeStr);
                return { hours: 0, minutes: 0 };
            }
            // Convert to local time
            const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
            const result = { hours: localDate.getHours(), minutes: localDate.getMinutes() };
            console.log(`ISO date parsed: ${timeStr} -> ${JSON.stringify(result)}`);
            return result;
        }

        // Handle simple time format (HH:MM)
        const [hours, minutes] = timeStr.split(':').map(Number);
        const result = { hours, minutes };
        console.log(`Simple time parsed: ${timeStr} -> ${JSON.stringify(result)}`);
        return result;
    };

    const isMarketOpen = (): boolean => {
        const now = currentTime;
        const openTimeParsed = parseTimeString(openTime);
        const closeTimeParsed = parseTimeString(closeTime);

        // Create Date objects for today with the market times
        const today = new Date();
        const todayOpenTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), openTimeParsed.hours, openTimeParsed.minutes);
        const todayCloseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), closeTimeParsed.hours, closeTimeParsed.minutes);

        console.log(`WinningNumbers - ${marketName}:`, {
            now: now.toLocaleTimeString(),
            openTime: openTime,
            openTimeParsed,
            todayOpenTime: todayOpenTime.toLocaleTimeString(),
            closeTime: closeTime,
            closeTimeParsed,
            todayCloseTime: todayCloseTime.toLocaleTimeString(),
            isOpen: now >= todayOpenTime && now <= todayCloseTime
        });

        return now >= todayOpenTime && now <= todayCloseTime;
    };

    const isInLoadingWindow = (): boolean => {
        const now = currentTime;
        const openTimeParsed = parseTimeString(openTime);
        const closeTimeParsed = parseTimeString(closeTime);

        // Create Date objects for today with the market times
        const today = new Date();
        const todayOpenTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), openTimeParsed.hours, openTimeParsed.minutes);
        const todayCloseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), closeTimeParsed.hours, closeTimeParsed.minutes);

        // Create 15-minute windows
        const openWindowStart = new Date(todayOpenTime.getTime() - 15 * 60 * 1000);
        const openWindowEnd = new Date(todayOpenTime.getTime() + 15 * 60 * 1000);
        const closeWindowStart = new Date(todayCloseTime.getTime() - 15 * 60 * 1000);
        const closeWindowEnd = new Date(todayCloseTime.getTime() + 15 * 60 * 1000);

        const inLoadingWindow = (now >= openWindowStart && now <= openWindowEnd) ||
            (now >= closeWindowStart && now <= closeWindowEnd);

        console.log(`WinningNumbers - ${marketName} Loading Window:`, {
            now: now.toLocaleTimeString(),
            openWindowStart: openWindowStart.toLocaleTimeString(),
            openWindowEnd: openWindowEnd.toLocaleTimeString(),
            closeWindowStart: closeWindowStart.toLocaleTimeString(),
            closeWindowEnd: closeWindowEnd.toLocaleTimeString(),
            inLoadingWindow
        });

        return inLoadingWindow;
    };

    const isMarketClosedToday = (): boolean => {
        const today = currentTime.getDay();
        return today >= weekDays; // 0 = Sunday, so if weekDays = 5, Saturday (6) and Sunday (0) are closed
    };

    const getTodayResult = (): { open: number | null; main: number | null; close: number | null } | null => {
        if (!result) return null;

        const today = getDayName(currentTime);
        return result.results[today] || null;
    };

    const getPreviousDayResult = (): { open: number | null; main: number | null; close: number | null } | null => {
        if (!result) return null;

        // Get yesterday's result
        const yesterday = new Date(currentTime);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayName = getDayName(yesterday);

        return result.results[yesterdayName] || null;
    };

    const formatResult = (result: { open: number | null; main: number | null; close: number | null }): string => {
        if (!result.open && !result.close) return 'No result declared';

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

    // Determine what to display
    const getDisplayContent = () => {
        const isClosedToday = isMarketClosedToday();
        const inLoadingWindow = isInLoadingWindow();
        const isOpen = isMarketOpen();

        console.log(`WinningNumbers - ${marketName} Display Logic:`, {
            isClosedToday,
            inLoadingWindow,
            isOpen,
            currentTime: currentTime.toLocaleTimeString(),
            openTime,
            closeTime,
            weekDays
        });

        // Check if market is closed today
        if (isClosedToday) {
            const previousResult = getPreviousDayResult();
            return {
                type: 'closed',
                content: previousResult ? formatResult(previousResult) : 'No previous result',
                icon: <Calendar className="w-4 h-4" />
            };
        }

        // Check if in loading window
        if (inLoadingWindow) {
            return {
                type: 'loading',
                content: 'Loading...',
                icon: <Clock className="w-4 h-4 animate-spin" />
            };
        }

        // Check if market is open
        if (isOpen) {
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
                    content: "**-**-**",
                    icon: <AlertCircle className="w-4 h-4" />
                };
            }
        }

        // Market is closed, show today's result if available
        const todayResult = getTodayResult();
        if (todayResult && (todayResult.open || todayResult.close)) {
            return {
                type: 'result',
                content: formatResult(todayResult),
                icon: <Trophy className="w-4 h-4" />
            };
        }

        // No result for today, show previous day
        const previousResult = getPreviousDayResult();
        return {
            type: 'previous',
            content: previousResult ? formatResult(previousResult) : 'No previous result',
            icon: <Calendar className="w-4 h-4" />
        };
    };

    const display = getDisplayContent();

    return (
        <div >

            {!result ? (
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span className="text-green-700 text-sm">Loading results...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="text-green-700 font-bold text-lg">
                        {display.content}
                    </span>
                </div>
            )}

            {display.type === 'closed' && (
                <div className="text-xs text-gray-600 mt-1">
                    Market closed today • Showing previous result
                </div>
            )}

            {display.type === 'loading' && (
                <div className="text-xs text-gray-600 mt-1">
                    Result declaration in progress
                </div>
            )}

            {display.type === 'previous' && (
                <div className="text-xs text-gray-600 mt-1">
                    Previous Day Result
                </div>
            )}
        </div>
    );
};

export default WinningNumbers;

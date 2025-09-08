"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Market {
    _id: string;
    marketName: string;
}

interface DayResult {
    open: string | null; // Changed to string to match backend
    main: string | null; // Changed to string to match backend
    close: string | null; // Changed to string to match backend
    openDeclationTime: Date | null;
    closeDeclationTime: Date | null;
}

interface WeeklyResult {
    monday?: DayResult;
    tuesday?: DayResult;
    wednesday?: DayResult;
    thursday?: DayResult;
    friday?: DayResult;
    saturday?: DayResult;
    sunday?: DayResult;
}

interface Result {
    _id: string;
    marketId: Market;
    resultDate: Date; // Backend returns single date, not weekly structure
    results: DayResult; // Backend returns single day result, not weekly
}

interface TodayResultsProps {
    marketResults: Result | null;
    selectedMarket: string;
    assignedMarkets: Market[];
    getDayName: (date: Date) => string;
    formatDate: (date: Date | null) => string;
}

export function TodayResults({
    marketResults,
    selectedMarket,
    assignedMarkets,
    getDayName,
    formatDate
}: TodayResultsProps) {
    if (!marketResults || selectedMarket === 'all') return null;

    // Backend returns single day result, not weekly structure
    const dayResult = marketResults.results;

    if (!dayResult || (!dayResult.open && !dayResult.close)) {
        return null;
    }

    const today = new Date(); // Add back the today variable

    return (
        <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
                <CardTitle className="text-white">📅 Today's Results</CardTitle>
                <div className="text-sm text-gray-400">
                    {assignedMarkets.find(m => m._id === selectedMarket)?.marketName} - {today.toLocaleDateString('en-IN')}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-300">Open Result</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${dayResult.open ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'
                                }`}>
                                {dayResult.open ? 'DECLARED' : 'NOT DECLARED'}
                            </span>
                        </div>
                        {dayResult.open ? (
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">{dayResult.open}</div>
                                <div className="text-xs text-gray-400">
                                    {dayResult.openDeclationTime ? formatDate(dayResult.openDeclationTime) : ''}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 text-lg">-</div>
                        )}
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-300">Close Result</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${dayResult.close ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'
                                }`}>
                                {dayResult.close ? 'DECLARED' : 'NOT DECLARED'}
                            </span>
                        </div>
                        {dayResult.close ? (
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-400">{dayResult.close}</div>
                                <div className="text-xs text-gray-400">
                                    {dayResult.closeDeclationTime ? formatDate(dayResult.closeDeclationTime) : ''}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 text-lg">-</div>
                        )}
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-300">Main Result</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${dayResult.main ? 'bg-yellow-900 text-yellow-400' : 'bg-gray-700 text-gray-400'
                                }`}>
                                {dayResult.main ? 'CALCULATED' : 'NOT CALCULATED'}
                            </span>
                        </div>
                        {dayResult.main ? (
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-400">{dayResult.main}</div>
                                <div className="text-xs text-gray-400">Combined Result</div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 text-lg">-</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 
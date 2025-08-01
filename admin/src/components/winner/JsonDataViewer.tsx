import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface JsonDataViewerProps {
    data: any;
}

export const JsonDataViewer = ({ data }: JsonDataViewerProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!data) return null;

    return (
        <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span>📊 Complete JSON Data Structure</span>
                    <Button
                        onClick={() => setIsExpanded(!isExpanded)}
                        variant="outline"
                        size="sm"
                    >
                        {isExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-white font-semibold mb-2">Data Summary:</h3>
                        <div className="text-sm text-gray-300 space-y-1">
                            <div>• Has data: {data ? 'Yes' : 'No'}</div>
                            <div>• Has data.data: {data?.data ? 'Yes' : 'No'}</div>
                            {data?.data && (
                                <>
                                    <div>• Available keys: {Object.keys(data.data).join(', ')}</div>
                                    <div>• Total bet types: {Object.keys(data.data).length}</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Complete JSON */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-white font-semibold mb-2">Complete JSON Data:</h3>
                        <div className="bg-black p-4 rounded border border-gray-600">
                            <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Structured Breakdown */}
                    {data?.data && (
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-white font-semibold mb-2">Structured Breakdown:</h3>
                            <div className="text-sm text-gray-300 space-y-4">
                                {Object.entries(data.data).map(([key, value]) => (
                                    <div key={key} className="border border-gray-600 p-3 rounded">
                                        <div className="font-semibold text-blue-400 mb-2">
                                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                                        </div>
                                        <div className="bg-black p-2 rounded border border-gray-700">
                                            <pre className="text-xs text-yellow-400 overflow-x-auto">
                                                {JSON.stringify(value, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Data Analysis */}
                    {data?.data && (
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-white font-semibold mb-2">Data Analysis:</h3>
                            <div className="text-sm text-gray-300 space-y-2">
                                {Object.entries(data.data).map(([key, value]) => {
                                    let totalAmount = 0;
                                    let entryCount = 0;

                                    if (value && typeof value === 'object') {
                                        if (value.open || value.close) {
                                            // Structure: { open: {...}, close: {...} }
                                            const openData = value.open || {};
                                            const closeData = value.close || {};

                                            Object.values(openData).forEach(amount => {
                                                totalAmount += amount as number;
                                                entryCount++;
                                            });
                                            Object.values(closeData).forEach(amount => {
                                                totalAmount += amount as number;
                                                entryCount++;
                                            });
                                        } else if (value.both) {
                                            // Structure: { both: {...} }
                                            Object.values(value.both).forEach(amount => {
                                                totalAmount += amount as number;
                                                entryCount++;
                                            });
                                        } else {
                                            // Direct structure
                                            Object.values(value).forEach(amount => {
                                                totalAmount += amount as number;
                                                entryCount++;
                                            });
                                        }
                                    }

                                    return (
                                        <div key={key} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                                            <span className="text-blue-400">
                                                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </span>
                                            <div className="text-right">
                                                <div className="text-green-400">₹{totalAmount.toLocaleString()}</div>
                                                <div className="text-xs text-gray-400">{entryCount} entries</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 
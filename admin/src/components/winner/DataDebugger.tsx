import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DataDebuggerProps {
    data: any;
}

export const DataDebugger = ({ data }: DataDebuggerProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!data) return null;

    return (
        <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span>🔍 Data Structure Debugger</span>
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
                                    <div>• Single data: {data.data.single ? 'Yes' : 'No'}</div>
                                    <div>• Single Panna data: {data.data.singlePanna ? 'Yes' : 'No'}</div>
                                    <div>• Double Panna data: {data.data.doublePanna ? 'Yes' : 'No'}</div>
                                    <div>• Triple Panna data: {data.data.triplePanna ? 'Yes' : 'No'}</div>
                                    <div>• Half Sangam data: {data.data.halfSangam ? 'Yes' : 'No'}</div>
                                    <div>• Full Sangam data: {data.data.fullSangam ? 'Yes' : 'No'}</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Raw JSON */}
                    {isExpanded && (
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-white font-semibold mb-2">Complete JSON Data:</h3>
                            <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Structured Data View */}
                    {data?.data && (
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-white font-semibold mb-2">Structured Data View:</h3>
                            <div className="text-sm text-gray-300 space-y-2">
                                {Object.entries(data.data).map(([key, value]) => (
                                    <div key={key} className="border border-gray-600 p-2 rounded">
                                        <div className="font-semibold text-blue-400">{key}:</div>
                                        <pre className="text-xs mt-1 overflow-x-auto">
                                            {JSON.stringify(value, null, 2)}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 
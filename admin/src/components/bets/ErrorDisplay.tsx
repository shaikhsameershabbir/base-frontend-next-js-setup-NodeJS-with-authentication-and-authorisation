import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
    error: string | null;
    onClearError: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClearError }) => {
    if (!error) return null;

    return (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button onClick={onClearError} variant="outline" size="sm" className="mt-2">
                    Dismiss
                </Button>
            </CardContent>
        </Card>
    );
};

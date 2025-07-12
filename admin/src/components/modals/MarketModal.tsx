import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MarketModal({ open, onClose, onSubmit, loading, market }) {
    const [marketName, setMarketName] = useState('');
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');

    useEffect(() => {
        if (market) {
            setMarketName(market.marketName);
            setOpenTime(market.openTime.slice(11, 16));
            setCloseTime(market.closeTime.slice(11, 16));
        } else {
            setMarketName('');
            setOpenTime('');
            setCloseTime('');
        }
    }, [market]);

    if (!open) return null;

    // Always send full ISO date string for today with selected time
    const today = new Date().toISOString().slice(0, 10); // e.g., "2024-07-12"
    const openTimeISO = openTime ? new Date(`${today}T${openTime}:00.000Z`).toISOString() : '';
    const closeTimeISO = closeTime ? new Date(`${today}T${closeTime}:00.000Z`).toISOString() : '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-card rounded-lg p-6 w-full max-w-sm shadow-lg">
                <h2 className="text-lg font-bold mb-4">{market ? 'Edit Market' : 'Create Market'}</h2>
                <Input
                    placeholder="Market Name"
                    value={marketName}
                    onChange={e => setMarketName(e.target.value)}
                    className="mb-2"
                />
                <Input
                    type="time"
                    placeholder="Open Time"
                    value={openTime}
                    onChange={e => setOpenTime(e.target.value)}
                    className="mb-2"
                />
                <Input
                    type="time"
                    placeholder="Close Time"
                    value={closeTime}
                    onChange={e => setCloseTime(e.target.value)}
                    className="mb-4"
                />
                <div className="flex gap-2 justify-end">
                    <Button onClick={onClose} variant="outline" disabled={loading}>Cancel</Button>
                    <Button
                        onClick={() => onSubmit({ marketName, openTime: openTimeISO, closeTime: closeTimeISO })}
                        loading={loading}
                    >
                        {market ? 'Update' : 'Create'}
                    </Button>
                </div>
            </div>
        </div>
    );
} 
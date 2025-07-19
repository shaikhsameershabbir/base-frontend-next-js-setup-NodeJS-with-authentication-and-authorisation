import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function MarketModal({ open, onClose, onSubmit, loading, market }: { open: boolean, onClose: () => void, onSubmit: (data: any) => void, loading: boolean, market: any }) {
    const [marketName, setMarketName] = useState('');
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');

    useEffect(() => {
        if (market) {
            setMarketName(market.marketName);
            // Convert existing time to HH:MM format for time input
            const openDate = new Date(market.openTime);
            const closeDate = new Date(market.closeTime);
            setOpenTime(openDate.toTimeString().slice(0, 5));
            setCloseTime(closeDate.toTimeString().slice(0, 5));
        } else {
            setMarketName('');
            setOpenTime('');
            setCloseTime('');
        }
    }, [market]);

    const handleSubmit = () => {
        if (!marketName || !openTime || !closeTime) {
            alert('Please fill in all fields');
            return;
        }

        // Create proper ISO date strings for today with the selected times
        const today = new Date();
        const [openHour, openMinute] = openTime.split(':').map(Number);
        const [closeHour, closeMinute] = closeTime.split(':').map(Number);

        const openDateTime = new Date(today);
        openDateTime.setHours(openHour, openMinute, 0, 0);

        const closeDateTime = new Date(today);
        closeDateTime.setHours(closeHour, closeMinute, 0, 0);

        onSubmit({
            marketName,
            openTime: openDateTime.toISOString(),
            closeTime: closeDateTime.toISOString()
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-primary">
                        {market ? 'Edit Market' : 'Create Market'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="marketName" className="text-sm font-medium text-primary">
                            Market Name
                        </Label>
                        <Input
                            id="marketName"
                            placeholder="Enter market name"
                            value={marketName}
                            onChange={e => setMarketName(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="openTime" className="text-sm font-medium text-primary">
                            Open Time
                        </Label>
                        <Input
                            id="openTime"
                            type="time"
                            value={openTime}
                            onChange={e => setOpenTime(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="closeTime" className="text-sm font-medium text-primary">
                            Close Time
                        </Label>
                        <Input
                            id="closeTime"
                            type="time"
                            value={closeTime}
                            onChange={e => setCloseTime(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                    <Button onClick={onClose} variant="outline" disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !marketName || !openTime || !closeTime}>
                        {loading ? 'Saving...' : (market ? 'Update' : 'Create')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 
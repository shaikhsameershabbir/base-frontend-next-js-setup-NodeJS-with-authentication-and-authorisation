import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function EditPasswordModal({ open, onClose, onSubmit, loading }: {
    open: boolean,
    onClose: () => void,
    onSubmit: (password: string) => void,
    loading: boolean
}) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setError(null);
        onSubmit(password);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-card rounded-lg p-6 w-full max-w-sm shadow-lg">
                <h2 className="text-lg font-bold mb-4">Update Password</h2>
                <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="New password"
                    disabled={loading}
                />
                {error && <div className="text-destructive text-sm mt-2">{error}</div>}
                <div className="flex gap-2 mt-6 justify-end">
                    <Button onClick={onClose} variant="outline" disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={loading}>Update</Button>
                </div>
            </div>
        </div>
    );
} 
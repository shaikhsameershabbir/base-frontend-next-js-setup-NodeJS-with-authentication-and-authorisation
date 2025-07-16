'use client';

import { useEffect, useState } from 'react';
import { marketAPI, Market } from '@/lib/api-market';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader2, Store } from 'lucide-react';
import { MarketModal } from '@/components/modals/MarketModal';
import { AdminLayout } from '@/components/layout/admin-layout';

export default function MarketPage() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editMarket, setEditMarket] = useState<Market | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const fetchMarkets = async (page = 1) => {
        setLoading(true);
        const res = await marketAPI.getMarkets(page, pagination.limit, search, status);
        setMarkets(res.data.markets);
        setPagination(res.data.pagination);
        setLoading(false);
    };

    useEffect(() => { fetchMarkets(1); }, [search, status]);

    const handleCreateOrUpdate = async (data: Partial<Market>) => {
        setLoading(true);
        if (editMarket) {
            await marketAPI.updateMarket(editMarket._id, data);
        } else {
            await marketAPI.createMarket(data);
        }
        setModalOpen(false);
        setEditMarket(null);
        fetchMarkets(pagination.page);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        setActionLoadingId(id);
        await marketAPI.deleteMarket(id);
        fetchMarkets(pagination.page);
        setActionLoadingId(null);
    };

    const handleToggleActive = async (id: string) => {
        setActionLoadingId(id);
        await marketAPI.toggleMarketActive(id);
        fetchMarkets(pagination.page);
        setActionLoadingId(null);
    };

    return (
        <AdminLayout>
            <div className="min-h-screen w-full bg-muted/50 dark:bg-background px-4 py-6">
                {/* Header */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-primary">Markets</h1>
                        <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                            <Store className="h-4 w-4 text-yellow-500 dark:text-yellow-300" />
                        </div>
                    </div>
                    <p className="text-lg text-muted-foreground">Manage market timings and status</p>
                </div>

                {/* Filters and Search */}
                <div className="mb-6">
                    <div className="rounded-xl shadow-sm bg-white dark:bg-zinc-900 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-1 gap-4 items-center">
                            <Input
                                placeholder="Search markets by name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="max-w-md border border-border bg-background dark:bg-zinc-800"
                            />
                            <Button
                                variant={status === '' ? 'default' : 'outline'}
                                onClick={() => setStatus('')}
                                className={`rounded-lg px-4 py-2 font-medium ${status === '' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-none' : 'border border-border'}`}
                            >
                                All
                            </Button>
                            <Button
                                variant={status === 'active' ? 'default' : 'outline'}
                                onClick={() => setStatus('active')}
                                className={`rounded-lg px-4 py-2 font-medium ${status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-none' : 'border border-border'}`}
                            >
                                Active
                            </Button>
                            <Button
                                variant={status === 'inactive' ? 'default' : 'outline'}
                                onClick={() => setStatus('inactive')}
                                className={`rounded-lg px-4 py-2 font-medium ${status === 'inactive' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-none' : 'border border-border'}`}
                            >
                                Inactive
                            </Button>
                        </div>
                        <Button onClick={() => { setEditMarket(null); setModalOpen(true); }} className="rounded-lg px-4 py-2 font-semibold bg-primary text-white hover:bg-primary/90 flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Create Market
                        </Button>
                    </div>
                </div>

                {/* Markets Table */}
                <div className="rounded-xl shadow-sm bg-white dark:bg-zinc-900 p-0">
                    <div className="p-6 pb-0">
                        <div className="flex items-center gap-3 mb-4">
                            <Store className="h-6 w-6 text-yellow-500 dark:text-yellow-300" />
                            <span className="text-xl font-bold text-primary">Markets ({pagination.total} total)</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 text-primary">Loading markets...</span>
                            </div>
                        ) : markets.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Store className="h-12 w-12 text-muted mx-auto mb-4" />
                                    <p className="text-muted-foreground font-medium">
                                        {search ? `No markets found matching "${search}"` : `No markets found`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-4 px-4 font-semibold text-primary">Market Name</th>
                                        <th className="text-left py-4 px-4 font-semibold text-primary">Open Time</th>
                                        <th className="text-left py-4 px-4 font-semibold text-primary">Close Time</th>
                                        <th className="text-left py-4 px-4 font-semibold text-primary">Created By</th>
                                        <th className="text-left py-4 px-4 font-semibold text-primary">Status</th>
                                        <th className="text-left py-4 px-4 font-semibold text-primary">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {markets.map(market => (
                                        <tr key={market._id} className="border-b border-border/50 hover:bg-muted/30 dark:hover:bg-zinc-800 transition-colors">
                                            <td className="py-4 px-4 font-medium text-primary">{market.marketName}</td>
                                            <td className="py-4 px-4 text-secondary">{new Date(market.openTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="py-4 px-4 text-secondary">{new Date(market.closeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="py-4 px-4 text-secondary">{market.createdBy}</td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${market.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                                                    {market.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                    {market.isActive ? 'Active' : 'Inactive'}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-2 p-1 h-6 w-6"
                                                        onClick={() => handleToggleActive(market._id)}
                                                        disabled={actionLoadingId === market._id}
                                                        title={market.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {actionLoadingId === market._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-muted" />
                                                        ) : market.isActive ? (
                                                            <XCircle className="h-4 w-4 text-destructive" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        )}
                                                    </Button>
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="hover:bg-muted/40 text-primary" onClick={() => { setEditMarket(market); setModalOpen(true); }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive text-primary" onClick={() => handleDelete(market._id)} loading={actionLoadingId === market._id}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {/* Pagination */}
                    <div className="p-6 pt-0">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={fetchMarkets}
                        />
                    </div>
                </div>
                {modalOpen && (
                    <MarketModal
                        open={modalOpen}
                        onClose={() => { setModalOpen(false); setEditMarket(null); }}
                        onSubmit={handleCreateOrUpdate}
                        loading={loading}
                        market={editMarket}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
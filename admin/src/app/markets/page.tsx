'use client';

import { useEffect, useState } from 'react';
import { marketAPI, Market } from '@/lib/api-market';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { MarketModal } from '@/components/modals/MarketModal';

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
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Markets</h1>
                <Button onClick={() => { setEditMarket(null); setModalOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Create Market
                </Button>
            </div>
            <div className="flex gap-2 mb-4">
                <Input placeholder="Search markets..." value={search} onChange={e => setSearch(e.target.value)} />
                <Button variant={status === '' ? 'default' : 'outline'} onClick={() => setStatus('')}>All</Button>
                <Button variant={status === 'active' ? 'default' : 'outline'} onClick={() => setStatus('active')}>Active</Button>
                <Button variant={status === 'inactive' ? 'default' : 'outline'} onClick={() => setStatus('inactive')}>Inactive</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th>Market Name</th>
                            <th>Open Time</th>
                            <th>Close Time</th>
                            <th>Created By</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {markets.map(market => (
                            <tr key={market._id}>
                                <td>{market.marketName}</td>
                                <td>{new Date(market.openTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td>{new Date(market.closeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td>{market.createdBy}</td>
                                <td>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggleActive(market._id)}
                                        title={market.isActive ? 'Deactivate' : 'Activate'}
                                        loading={actionLoadingId === market._id}
                                    >
                                        {market.isActive ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-destructive" />
                                        )}
                                    </Button>
                                </td>
                                <td>
                                    <Button variant="ghost" size="sm" onClick={() => { setEditMarket(market); setModalOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(market._id)} loading={actionLoadingId === market._id}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={fetchMarkets}
            />
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
    );
}
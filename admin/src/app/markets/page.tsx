'use client';

import { useEffect, useState } from 'react';
import { marketsAPI, Market } from '@/lib/api-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader2, Store, Clock, User, Search } from 'lucide-react';
import { MarketModal } from '@/components/modals/MarketModal';
import { AdminLayout } from '@/components/layout/admin-layout';

export default function MarketPage() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editMarket, setEditMarket] = useState<Market | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const fetchMarkets = async (page = 1) => {
        setLoading(true);
        try {
            const res = await marketsAPI.getMarkets(page, pagination.limit, '');
            if (res.success && res.data) {
                // The API returns data directly as an array
                const marketsData = Array.isArray(res.data) ? res.data : [];
                setMarkets(marketsData);

                // Set default pagination since it's not in the response
                setPagination({
                    page: page,
                    limit: pagination.limit,
                    total: marketsData.length,
                    totalPages: 1
                });
            }
        } catch (error) {
            console.error('Error fetching markets:', error);
            setMarkets([]);
            setPagination({
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMarkets(1); }, []);

    const handleCreateOrUpdate = async (data: Partial<Market>) => {
        setLoading(true);
        try {
            if (editMarket) {
                await marketsAPI.updateMarket(editMarket._id, data);
            } else {
                await marketsAPI.createMarket(data as { marketName: string; openTime: string; closeTime: string });
            }
            setModalOpen(false);
            setEditMarket(null);
            fetchMarkets(pagination.page);
        } catch (error) {
            console.error('Error creating/updating market:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setActionLoadingId(id);
        try {
            await marketsAPI.deleteMarket(id);
            fetchMarkets(pagination.page);
            setDeleteConfirmId(null);
        } catch (error) {
            console.error('Error deleting market:', error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleToggleActive = async (id: string) => {
        setActionLoadingId(id);
        try {
            // Find the current market to get its current isActive status
            const currentMarket = markets.find(m => m._id === id);
            if (currentMarket) {
                await marketsAPI.updateMarketStatus(id, !currentMarket.isActive);
                fetchMarkets(pagination.page);
            }
        } catch (error) {
            console.error('Error toggling market status:', error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const formatTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return 'Invalid time';
        }
    };

    // Client-side filtering for search and status
    const filteredMarkets = markets.filter(market => {
        const matchesSearch = market.marketName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && market.isActive) ||
            (statusFilter === 'inactive' && !market.isActive);
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="min-h-screen w-full bg-muted/50 dark:bg-background px-2 sm:px-4 py-4 sm:py-6">
                {/* Header */}
                <div className="space-y-2 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">Markets</h1>
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                            <Store className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 dark:text-yellow-300" />
                        </div>
                    </div>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Manage market timings and status</p>
                </div>

                {/* Filters and Search */}
                <div className="mb-4 sm:mb-6">
                    <div className="rounded-xl shadow-sm bg-white dark:bg-zinc-900 p-3 sm:p-4 space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search markets by name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 border border-border bg-background dark:bg-zinc-800"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('all')}
                                size="sm"
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${statusFilter === 'all'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-none'
                                        : 'border border-border'
                                    }`}
                            >
                                All ({markets.length})
                            </Button>
                            <Button
                                variant={statusFilter === 'active' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('active')}
                                size="sm"
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${statusFilter === 'active'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-none'
                                        : 'border border-border'
                                    }`}
                            >
                                Active ({markets.filter(m => m.isActive).length})
                            </Button>
                            <Button
                                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('inactive')}
                                size="sm"
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${statusFilter === 'inactive'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-none'
                                        : 'border border-border'
                                    }`}
                            >
                                Inactive ({markets.filter(m => !m.isActive).length})
                            </Button>
                        </div>

                        {/* Create Button */}
                        <div className="flex justify-end">
                            <Button
                                onClick={() => { setEditMarket(null); setModalOpen(true); }}
                                variant="outline"
                                size="sm"
                                className="border-border hover:bg-card/20 dark:hover:bg-card/30 whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Create Market
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Markets Table */}
                <div className="rounded-xl shadow-sm bg-white dark:bg-zinc-900 p-0">
                    <div className="p-4 sm:p-6 pb-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4">
                            <Store className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 dark:text-yellow-300" />
                            <span className="text-lg sm:text-xl font-bold text-primary">
                                Markets ({filteredMarkets.length} of {markets.length} total)
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 text-primary">Loading markets...</span>
                            </div>
                        ) : filteredMarkets.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Store className="h-12 w-12 text-muted mx-auto mb-4" />
                                    <p className="text-muted-foreground font-medium">
                                        {search || statusFilter !== 'all'
                                            ? `No markets found matching your filters`
                                            : `No markets found`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Market Name</th>
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Open Time</th>
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Close Time</th>
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base hidden md:table-cell">Created By</th>
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Status</th>
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMarkets.map(market => (
                                            <tr key={market._id} className="border-b border-border/50 hover:bg-muted/30 dark:hover:bg-zinc-800 transition-colors">
                                                <td className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <div className="font-medium text-primary text-sm sm:text-base">{market.marketName}</div>
                                                </td>
                                                <td className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <div className="flex items-center gap-1 sm:gap-2 text-secondary text-sm">
                                                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        {formatTime(market.openTime)}
                                                    </div>
                                                </td>
                                                <td className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <div className="flex items-center gap-1 sm:gap-2 text-secondary text-sm">
                                                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        {formatTime(market.closeTime)}
                                                    </div>
                                                </td>
                                                <td className="py-3 sm:py-4 px-2 sm:px-4 hidden md:table-cell">
                                                    <div className="flex items-center gap-1 sm:gap-2 text-secondary text-sm">
                                                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        <span className="truncate max-w-[100px]">{market.createdBy}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${market.isActive
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                        }`}>
                                                        {market.isActive ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
                                                        <span className="hidden sm:inline">{market.isActive ? 'Active' : 'Inactive'}</span>
                                                        <span className="sm:hidden">{market.isActive ? 'On' : 'Off'}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="ml-1 sm:ml-2 p-1 h-5 w-5 sm:h-6 sm:w-6"
                                                            onClick={() => handleToggleActive(market._id)}
                                                            disabled={actionLoadingId === market._id}
                                                            title={market.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {actionLoadingId === market._id ? (
                                                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-muted" />
                                                            ) : market.isActive ? (
                                                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                                                            ) : (
                                                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                                            )}
                                                        </Button>
                                                    </span>
                                                </td>
                                                <td className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-muted/40 text-primary h-8 w-8 sm:h-9 sm:w-9"
                                                            onClick={() => { setEditMarket(market); setModalOpen(true); }}
                                                            title="Edit Market"
                                                        >
                                                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-destructive/10 hover:text-destructive text-primary h-8 w-8 sm:h-9 sm:w-9"
                                                            onClick={() => setDeleteConfirmId(market._id)}
                                                            title="Delete Market"
                                                        >
                                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 sm:p-6 pt-0">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={fetchMarkets}
                        />
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 sm:p-6 w-full max-w-md shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-primary">Delete Market</h2>
                            </div>
                            <p className="text-secondary mb-6 text-sm sm:text-base">
                                Are you sure you want to delete this market? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteConfirmId(null)}
                                    disabled={actionLoadingId === deleteConfirmId}
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(deleteConfirmId)}
                                    disabled={actionLoadingId === deleteConfirmId}
                                    size="sm"
                                >
                                    {actionLoadingId === deleteConfirmId ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Market Modal */}
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
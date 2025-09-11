'use client';

import { useEffect, useState } from 'react';
import { marketsAPI, Market } from '@/lib/api-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';

import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader2, Store, Clock, User, Search, Star, RefreshCw } from 'lucide-react';
import { MarketModal } from '@/components/modals/MarketModal';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useAuth } from '@/hooks/useAuth';

export default function MarketPage() {
    const { user } = useAuth();
    const currentUserRole = user?.role || 'player';
    const isSuperadmin = currentUserRole === 'superadmin';
    const isAdmin = currentUserRole === 'admin';

    const [markets, setMarkets] = useState<Market[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editMarket, setEditMarket] = useState<Market | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [syncLoading, setSyncLoading] = useState(false);


    // Client-side search and filtering (no debouncing needed)

    const fetchMarkets = async () => {
        setLoading(true);
        try {
            // Fetch all markets at once (no pagination needed)
            const res = await marketsAPI.getAllMarkets();
            if (res.success && res.data) {
                const allMarkets = Array.isArray(res.data) ? res.data : [];
                setMarkets(allMarkets);

                // Calculate pagination based on filtered results
                updatePagination(allMarkets);
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

    // Update pagination based on filtered results
    const updatePagination = (allMarkets: Market[]) => {
        const filteredResults = filterMarkets(allMarkets);
        const total = filteredResults.length;
        const totalPages = Math.ceil(total / pagination.limit);

        setPagination(prev => ({
            ...prev,
            total,
            totalPages,
            page: Math.min(prev.page, totalPages || 1) // Ensure page doesn't exceed total pages
        }));
    };

    // Client-side filtering and search
    const filterMarkets = (allMarkets: Market[]) => {
        return allMarkets.filter(market => {
            const matchesSearch = !search ||
                market.marketName.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && market.isActive) ||
                (statusFilter === 'inactive' && !market.isActive);

            return matchesSearch && matchesStatus;
        });
    };

    // Get current page markets
    const getCurrentPageMarkets = () => {
        const filteredResults = filterMarkets(markets);
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        return filteredResults.slice(startIndex, endIndex);
    };

    useEffect(() => { fetchMarkets(); }, []);

    // Auto-update pagination when search or status filter changes
    useEffect(() => {
        updatePagination(markets);
    }, [search, statusFilter, markets]);



    const handleCreateOrUpdate = async (data: Partial<Market>) => {
        setLoading(true);
        try {
            if (editMarket) {
                await marketsAPI.updateMarket(editMarket._id, data);
            } else {
                await marketsAPI.createMarket(data as { marketName: string; openTime: string; closeTime: string; weekDays: number });
            }
            setModalOpen(false);
            setEditMarket(null);
            await fetchMarkets();
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
            await fetchMarkets();
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
                await fetchMarkets();
            }
        } catch (error) {
            console.error('Error toggling market status:', error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleToggleGolden = async (id: string) => {
        setActionLoadingId(id);
        try {
            // Find the current market to get its current isGolden status
            const currentMarket = markets.find(m => m._id === id);
            if (currentMarket) {
                await marketsAPI.toggleGoldenStatus(id, !currentMarket.isGolden);
                await fetchMarkets();
            }
        } catch (error) {
            console.error('Error toggling golden status:', error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleToggleAutoResult = async (id: string) => {
        setActionLoadingId(id);
        try {
            // Find the current market to get its current autoResult status
            const currentMarket = markets.find(m => m._id === id);
            if (currentMarket) {
                await marketsAPI.toggleAutoResult(id, !currentMarket.autoResult);
                await fetchMarkets();
            }
        } catch (error) {
            console.error('Error toggling auto result status:', error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleSyncMarkets = async () => {
        setSyncLoading(true);
        try {
            const result = await marketsAPI.syncMarkets();
            if (result.success) {
                // Refresh markets list after sync
                await fetchMarkets(); // Refresh all markets
                // You could add a toast notification here
                console.log('Markets synced successfully:', result.data);
            } else {
                console.error('Market sync failed:', result.message);
            }
        } catch (error) {
            console.error('Error syncing markets:', error);
        } finally {
            setSyncLoading(false);
        }
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return 'N/A';

        // If it's already in HH:MM format, convert to AM/PM
        if (typeof timeString === 'string' && timeString.includes(':')) {
            // Validate time format (HH:MM)
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (timeRegex.test(timeString)) {
                // Convert HH:MM to AM/PM format
                const [hours, minutes] = timeString.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                return `${displayHour}:${minutes} ${ampm}`;
            }
        }

        // If it's a date string, try to extract time
        try {
            const time = new Date(timeString);
            if (!isNaN(time.getTime())) {
                return time.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }
        } catch (error) {
            // Ignore parsing errors
        }

        return 'N/A';
    };

    const formatWeekDays = (weekDays: number) => {
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return dayNames.slice(0, weekDays).join(', ');
    };

    // Get filtered and paginated markets for display
    const filteredMarkets = getCurrentPageMarkets();

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
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                        {isSuperadmin
                            ? 'Manage all market timings and status'
                            : 'View your assigned markets and manage their timings'
                        }
                    </p>
                    {!isSuperadmin && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                            📋 Showing only markets assigned to your account
                        </div>
                    )}
                </div>

                {/* Filters and Search */}
                <div className="mb-4 sm:mb-6">
                    <div className="rounded-xl shadow-sm bg-white dark:bg-zinc-900 p-3 sm:p-4 space-y-4">
                        {/* Search Bar */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search markets by name..."
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value);
                                        // Reset to first page when searching
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            updatePagination(markets);
                                        }
                                    }}
                                    className="w-full pl-10 border border-border bg-background dark:bg-zinc-800"
                                />
                            </div>
                            {search && (
                                <Button
                                    onClick={() => {
                                        setSearch('');
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                        updatePagination(markets);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 px-3"
                                    title="Clear search"
                                >
                                    ✕
                                </Button>
                            )}
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => {
                                    setStatusFilter('all');
                                    // Reset to first page when changing filters
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                    updatePagination(markets);
                                }}
                                size="sm"
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${statusFilter === 'all'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-none'
                                    : 'border border-border'
                                    }`}
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === 'active' ? 'default' : 'outline'}
                                onClick={() => {
                                    setStatusFilter('active');
                                    // Reset to first page when changing filters
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                    updatePagination(markets);
                                }}
                                size="sm"
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${statusFilter === 'active'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-none'
                                    : 'border border-border'
                                    }`}
                            >
                                Active
                            </Button>
                            <Button
                                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                                onClick={() => {
                                    setStatusFilter('inactive');
                                    // Reset to first page when changing filters
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                    updatePagination(markets);
                                }}
                                size="sm"
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${statusFilter === 'inactive'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-none'
                                    : 'border border-border'
                                    }`}
                            >
                                Inactive
                            </Button>
                        </div>

                        {/* Page Size Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Show:</span>
                            <select
                                value={pagination.limit}
                                onChange={(e) => {
                                    const newLimit = parseInt(e.target.value);
                                    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                                    // Update pagination with new limit
                                    updatePagination(markets);
                                }}
                                className="px-2 py-1 text-sm border border-border rounded-md bg-background dark:bg-zinc-800"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm text-muted-foreground">per page</span>
                        </div>

                        {/* Action Buttons - Only show for superadmin */}
                        <div className="flex justify-end gap-2">
                            {isSuperadmin && (
                                <Button
                                    onClick={handleSyncMarkets}
                                    variant="outline"
                                    size="sm"
                                    disabled={syncLoading}
                                    className="border-border hover:bg-card/20 dark:hover:bg-card/30 whitespace-nowrap"
                                >
                                    {syncLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Sync Markets
                                </Button>

                            )}
                            {(isSuperadmin || isAdmin) && (

                                <Button
                                    onClick={() => { setEditMarket(null); setModalOpen(true); }}
                                    variant="outline"
                                    size="sm"
                                    className="border-border hover:bg-card/20 dark:hover:bg-card/30 whitespace-nowrap"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Create Market
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Markets Table */}
                <div className="rounded-xl shadow-sm bg-white dark:bg-zinc-900 p-0">
                    <div className="p-4 sm:p-6 pb-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4">
                            <Store className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 dark:text-yellow-300" />
                            <span className="text-lg sm:text-xl font-bold text-primary">
                                Markets ({filteredMarkets.length} of {pagination.total} total)
                            </span>
                            {pagination.totalPages > 1 && (
                                <span className="text-sm text-muted-foreground">
                                    (Page {pagination.page} of {pagination.totalPages})
                                </span>
                            )}
                            {search && (
                                <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                                    🔍 Searching for: "{search}" • Found {pagination.total} results
                                </span>
                            )}
                            {statusFilter !== 'all' && (
                                <span className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                    📊 Filter: {statusFilter === 'active' ? 'Active' : 'Inactive'} markets
                                </span>
                            )}
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
                                        {search
                                            ? `No markets found matching "${search}"`
                                            : statusFilter !== 'all'
                                                ? `No markets found matching your filters`
                                                : isSuperadmin
                                                    ? `No markets found`
                                                    : `No markets assigned to your account yet`
                                        }
                                    </p>
                                    {search && (
                                        <div className="mt-2">
                                            <p className="text-xs text-muted-foreground mb-2">
                                                Try adjusting your search terms or clearing the search.
                                            </p>
                                            <Button
                                                onClick={() => {
                                                    setSearch('');
                                                    setPagination(prev => ({ ...prev, page: 1 }));
                                                    updatePagination(markets);
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                Clear Search
                                            </Button>
                                        </div>
                                    )}
                                    {!isSuperadmin && !search && statusFilter === 'all' && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Contact your administrator to get markets assigned to your account.
                                        </p>
                                    )}
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
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base hidden lg:table-cell">Week Days</th>
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Status</th>
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Golden</th>
                                            <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Auto Result</th>
                                            {isSuperadmin && (
                                                <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Actions</th>
                                            )}
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
                                                <td className="py-3 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                                    <div className="text-secondary text-sm">
                                                        {formatWeekDays(market.weekDays || 7)}
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
                                                        {isSuperadmin ? (
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
                                                        ) : (
                                                            <span className="ml-1 sm:ml-2 text-xs text-muted-foreground">
                                                                {market.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${market.isGolden
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                                                        }`}>
                                                        {market.isGolden ? <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" /> : <Star className="h-3 w-3 sm:h-4 sm:w-4" />}
                                                        <span className="hidden sm:inline">{market.isGolden ? 'Golden' : 'Regular'}</span>
                                                        <span className="sm:hidden">{market.isGolden ? 'Gold' : 'Reg'}</span>
                                                        {isSuperadmin ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="ml-1 sm:ml-2 p-1 h-5 w-5 sm:h-6 sm:w-6"
                                                                onClick={() => handleToggleGolden(market._id)}
                                                                disabled={actionLoadingId === market._id}
                                                                title={market.isGolden ? 'Remove Golden' : 'Make Golden'}
                                                            >
                                                                {actionLoadingId === market._id ? (
                                                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-muted" />
                                                                ) : market.isGolden ? (
                                                                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                                                                ) : (
                                                                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                                                                )}
                                                            </Button>
                                                        ) : (
                                                            <span className="ml-1 sm:ml-2 text-xs text-muted-foreground">
                                                                {market.isGolden ? 'Golden' : 'Regular'}
                                                            </span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${market.autoResult
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                                                        }`}>
                                                        {market.autoResult ? <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" /> : <Clock className="h-3 w-3 sm:h-4 sm:w-4" />}
                                                        <span className="hidden sm:inline">{market.autoResult ? 'Auto' : 'Manual'}</span>
                                                        <span className="sm:hidden">{market.autoResult ? 'Auto' : 'Man'}</span>
                                                        {isSuperadmin ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="ml-1 sm:ml-2 p-1 h-5 w-5 sm:h-6 sm:w-6"
                                                                onClick={() => handleToggleAutoResult(market._id)}
                                                                disabled={actionLoadingId === market._id}
                                                                title={market.autoResult ? 'Disable Auto Result' : 'Enable Auto Result'}
                                                            >
                                                                {actionLoadingId === market._id ? (
                                                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-muted" />
                                                                ) : market.autoResult ? (
                                                                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                                                                ) : (
                                                                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                                                                )}
                                                            </Button>
                                                        ) : (
                                                            <span className="ml-1 sm:ml-2 text-xs text-muted-foreground">
                                                                {market.autoResult ? 'Auto' : 'Manual'}
                                                            </span>
                                                        )}
                                                    </span>
                                                </td>
                                                {isSuperadmin && (
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
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 sm:p-6 pt-0">
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} markets
                                </div>
                            </div>
                        )}
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={(page) => {
                                setPagination(prev => ({ ...prev, page }));
                            }}
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
'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { marketsAPI, MarketRank, AdminWithMarkets } from '@/lib/api-service';
import {
  Award,
  Users,
  Store,
  ArrowUpDown,
  ArrowDownUp,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Save,
  X,
  Star
} from 'lucide-react';

export default function MarketRankPage() {
  const [admins, setAdmins] = useState<AdminWithMarkets[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [marketRanks, setMarketRanks] = useState<MarketRank[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [editingRank, setEditingRank] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [updatingRank, setUpdatingRank] = useState<string | null>(null);
  const [updatingGolden, setUpdatingGolden] = useState<string | null>(null);

  // Fetch admins with their assigned markets
  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      const response = await marketsAPI.getAdminsWithMarkets();
      if (response.success) {
        setAdmins(response.data);
      } else {
        console.error('Failed to fetch admins:', response.message);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setAdminsLoading(false);
    }
  };

  // Fetch market ranks for selected admin
  const fetchMarketRanks = async (page = 1) => {
    if (!selectedAdmin) return;

    setLoading(true);
    try {
      console.log('Fetching market ranks for page:', page, 'limit:', pagination.limit);
      const response = await marketsAPI.getMarketRanks(selectedAdmin, page, pagination.limit);
      if (response.success) {
        console.log('Market ranks response:', response);
        setMarketRanks(response.data);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
        console.log('Updated pagination:', {
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
      }
    } catch (error) {
      console.error('Error fetching market ranks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update market rank
  const handleUpdateRank = async (marketRankId: string, newRank: number) => {
    if (!selectedAdmin) return;

    // Find the market rank to get the actual market ID
    const marketRank = marketRanks.find(rank => rank._id === marketRankId);
    if (!marketRank) return;

    const marketId = typeof marketRank.marketId === 'string' ? marketRank.marketId : (marketRank.marketId as any)._id;

    setUpdatingRank(marketRankId);
    try {
      const response = await marketsAPI.updateMarketRank(selectedAdmin, marketId, newRank);
      if (response.success) {
        // Refresh the ranks
        fetchMarketRanks(pagination.page);
        setEditingRank(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Error updating market rank:', error);
    } finally {
      setUpdatingRank(null);
    }
  };

  // Update market golden status
  const handleUpdateGoldenStatus = async (marketRankId: string, isGolden: boolean) => {
    if (!selectedAdmin) return;

    // Find the market rank to get the actual market ID
    const marketRank = marketRanks.find(rank => rank._id === marketRankId);
    if (!marketRank) return;

    const marketId = typeof marketRank.marketId === 'string' ? marketRank.marketId : (marketRank.marketId as any)._id;

    setUpdatingGolden(marketRankId);
    try {
      const response = await marketsAPI.updateMarketGoldenStatus(selectedAdmin, marketId, isGolden);
      if (response.success) {
        // Refresh the ranks
        fetchMarketRanks(pagination.page);
      }
    } catch (error) {
      console.error('Error updating market golden status:', error);
    } finally {
      setUpdatingGolden(null);
    }
  };

  // Start editing rank
  const startEditing = (rank: MarketRank) => {
    setEditingRank(rank._id);
    setEditValue(rank.rank.toString());
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingRank(null);
    setEditValue('');
  };

  // Save rank changes
  const saveRank = () => {
    if (!editingRank || !editValue) return;

    const newRank = parseInt(editValue);
    if (isNaN(newRank) || newRank < 1) {
      alert('Please enter a valid rank number (minimum 1)');
      return;
    }

    handleUpdateRank(editingRank, newRank);
  };

  // Handle admin selection
  const handleAdminChange = (adminId: string) => {
    setSelectedAdmin(adminId);
    setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
    setMarketRanks([]);
    setEditingRank(null);
    setEditValue('');
  };

  // Format time
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

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (selectedAdmin) {
      fetchMarketRanks(1);
    }
  }, [selectedAdmin]);

  const selectedAdminData = admins.find(admin => admin._id === selectedAdmin);

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-muted/50 dark:bg-background px-2 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="space-y-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">Market Rankings</h1>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 dark:text-yellow-300" />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Manage market rankings for admin users</p>
        </div>

        {/* Admin Selection */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Select Admin</h3>
              </div>

              {adminsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-primary">Loading admins...</span>
                </div>
              ) : (
                <Select value={selectedAdmin} onValueChange={handleAdminChange}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Choose an admin to manage market rankings" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin._id} value={admin._id}>
                        <div className="flex items-center gap-2">
                          <span>{admin.username}</span>
                          <Badge variant="secondary" className="text-xs">
                            {admin.markets.length} markets
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedAdminData && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">{selectedAdminData.username}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Assigned markets: {selectedAdminData.markets.length}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Market Rankings */}
        {selectedAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Award className="h-6 w-6 text-yellow-500" />
                <span className="text-primary">Market Rankings</span>
                {selectedAdminData && (
                  <span className="text-muted-foreground font-normal">
                    for {selectedAdminData.username}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-primary">Loading market rankings...</span>
                </div>
              ) : marketRanks.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Store className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      No markets assigned to this admin
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Rank</th>
                          <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Market Name</th>
                          <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Open Time</th>
                          <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Close Time</th>
                          <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Status</th>
                          <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Golden</th>
                          <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-primary text-sm sm:text-base">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketRanks.map((marketRank) => (
                          <tr key={marketRank._id} className="border-b border-border/50 hover:bg-muted/30 dark:hover:bg-zinc-800 transition-colors">
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              {editingRank === marketRank._id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-16 h-8 text-sm"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveRank();
                                      if (e.key === 'Escape') cancelEditing();
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={saveRank}
                                    disabled={updatingRank === marketRank._id}
                                    className="h-6 w-6 p-0"
                                  >
                                    {updatingRank === marketRank._id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Save className="h-3 w-3 text-green-500" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelEditing}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              ) : (
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                  #{marketRank.rank}
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              <div className="font-medium text-primary text-sm sm:text-base">{marketRank.marketName}</div>
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              <div className="flex items-center gap-1 sm:gap-2 text-secondary text-sm">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                {marketRank.marketId && typeof marketRank.marketId === 'object' && 'openTime' in marketRank.marketId
                                  ? formatTime((marketRank.marketId as any).openTime)
                                  : 'N/A'
                                }
                              </div>
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              <div className="flex items-center gap-1 sm:gap-2 text-secondary text-sm">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                {marketRank.marketId && typeof marketRank.marketId === 'object' && 'closeTime' in marketRank.marketId
                                  ? formatTime((marketRank.marketId as any).closeTime)
                                  : 'N/A'
                                }
                              </div>
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              <Badge className={`text-xs ${marketRank.marketId && typeof marketRank.marketId === 'object' && 'isActive' in marketRank.marketId && (marketRank.marketId as any).isActive
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                {marketRank.marketId && typeof marketRank.marketId === 'object' && 'isActive' in marketRank.marketId && (marketRank.marketId as any).isActive ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`hover:bg-muted/40 h-8 w-8 sm:h-9 sm:w-9 ${marketRank.isGolden
                                  ? 'text-yellow-500 hover:text-yellow-600'
                                  : 'text-gray-400 hover:text-gray-600'
                                  }`}
                                onClick={() => handleUpdateGoldenStatus(marketRank._id, !marketRank.isGolden)}
                                disabled={updatingGolden === marketRank._id}
                                title={marketRank.isGolden ? 'Remove Golden Status' : 'Make Golden'}
                              >
                                {updatingGolden === marketRank._id ? (
                                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                ) : (
                                  <Star className={`h-3 w-3 sm:h-4 sm:w-4 ${marketRank.isGolden ? 'fill-current' : ''}`} />
                                )}
                              </Button>
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-muted/40 text-primary h-8 w-8 sm:h-9 sm:w-9"
                                onClick={() => startEditing(marketRank)}
                                title="Edit Rank"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={(page) => {
                          setPagination(prev => ({ ...prev, page }));
                          fetchMarketRanks(page);
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { Eye, Calendar, Filter, RefreshCw } from "lucide-react";
import { betAPI, BetHistoryResponse } from "@/lib/api/bet";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Loading } from "@/components/ui/loading";
import BetDetailModal from "@/components/BetDetailModal";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";

interface BetData {
  _id: string;
  marketId: {
    _id: string;
    marketName: string;
  };
  type: string;
  betType: string;
  selectedNumbers: { [key: number]: number };
  amount: number;
  userBeforeAmount: number;
  userAfterAmount: number;
  status: boolean;
  result?: string;
  createdAt: string;
  claimStatus?: boolean;
  winAmount?: number;
  marketResult?: string;
  winnerBet?: string;
  winningMode?: string;
}

function Page() {
  const [bets, setBets] = useState<BetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBet, setSelectedBet] = useState<BetData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;
  const isMountedRef = useRef(false);
  const pendingRequestRef = useRef<Promise<void> | null>(null);

  const fetchBets = useCallback(async (page: number = 1) => {
    // Prevent multiple simultaneous requests
    if (pendingRequestRef.current !== null) {
      return;
    }

    // Prevent API calls if component is unmounted
    if (!isMountedRef.current) {
      return;
    }

    // Create a new request promise
    const requestPromise = (async () => {
      try {
        setLoading(true);
        const response: BetHistoryResponse = await betAPI.getBetHistory(
          page,
          itemsPerPage,
          startDate || undefined,
          endDate || undefined
        );

        if (!isMountedRef.current) {
          return;
        }

        if (response.success && response.data) {
          setBets(response.data.bets);
          setTotalItems(response.data.total);
          setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        }
      } catch (error) {
        // Error fetching bets
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        // Clean up the pending request
        pendingRequestRef.current = null;
      }
    })();

    // Store the request promise
    pendingRequestRef.current = requestPromise;

    // Wait for the request to complete
    await requestPromise;
  }, [startDate, endDate, itemsPerPage]);

  // Set mounted ref after first render
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Debounce the initial fetch to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        fetchBets(currentPage);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchBets, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilter = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  }, []);

  const handleViewDetails = (bet: BetData) => {
    setSelectedBet(bet);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: boolean, result?: string) => {
    if (!status) return <Badge variant="destructive">Cancelled</Badge>;
    if (result === "won") return <Badge variant="success">Win</Badge>;
    if (result === "lost" || result === "loss") return <Badge variant="destructive">Loss</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  };

  const getClaimStatusBadge = (claimStatus?: boolean, result?: string) => {
    // Don't show claim status for lost bets
    if (result === "loss" || result === "lost") return null;
    if (claimStatus === undefined) return <Badge variant="secondary">N/A</Badge>;
    return claimStatus ? (
      <Badge variant="success">Claimed</Badge>
    ) : (
      <Badge variant="warning" className="bg-red-500 text-white">Unclaimed</Badge>
    );
  };

  const formatSelectedNumbers = (numbers: { [key: number]: number }) => {
    const entries = Object.entries(numbers);
    if (entries.length === 0) return "N/A";

    return entries
      .slice(0, 2)
      .map(([number, amount]) => `${number}: ₹${amount}`)
      .join(", ") + (entries.length > 2 ? ` +${entries.length - 2} more` : "");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h1 className="text-lg font-bold text-gray-800">Bet History</h1>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
                  <span>•</span>
                  <span>{totalItems} total bets</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchBets(currentPage)}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 rounded-xl"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={handleFilter}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="rounded-xl"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loading size="lg" />
                </div>
              ) : bets.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bets found</h3>
                  <p className="text-gray-500">No bet history available for the selected filters.</p>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {bets.map((bet) => (
                    <div key={bet._id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      {/* Header with Market Name and Status Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 text-base">{bet.marketId.marketName}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(bet.status, bet.result)}
                        {getClaimStatusBadge(bet.claimStatus, bet.result)}
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(bet)}
                            className="flex items-center gap-2 p0 rounded-xl border-gray-300 hover:bg-gray-50"
                          >
                            <Eye className="" />
                            View
                          </Button>
                        </div>
                      </div>

                      {/* Game Information Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-gray-600 font-medium text-sm">Game Type:</span>
                          <div className="font-semibold capitalize text-gray-900 text-sm mt-1">{bet.type}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium text-sm">Bet Type:</span>
                          <div className="font-semibold capitalize text-gray-900 text-sm mt-1">{bet.betType}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium text-sm">Amount:</span>
                          <div className="font-bold text-black text-sm mt-1">₹{bet.amount}</div>
                        </div>
                        {bet.winAmount && bet.winAmount > 0 && (
                          <div>
                            <span className="text-gray-600 font-medium text-sm">Win Amount:</span>
                            <div className="font-bold text-green-600 text-sm mt-1">₹{bet.winAmount}</div>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600 font-medium text-sm">Date:</span>
                          <div className="text-gray-800 text-sm mt-1">{formatDate(bet.createdAt)}</div>
                        </div>
                      </div>

                      {/* View Details Button */}

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loading size="lg" />
                </div>
              ) : bets.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bets found</h3>
                  <p className="text-gray-500">No bet history available for the selected filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">Market</TableHead>
                        <TableHead className="font-semibold text-gray-700">Game Type</TableHead>
                        <TableHead className="font-semibold text-gray-700">Bet Type</TableHead>
                        <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Win Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700">Claim Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bets.map((bet) => (
                        <TableRow key={bet._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">
                            {bet.marketId.marketName}
                          </TableCell>
                          <TableCell className="capitalize text-gray-800 font-medium">{bet.type}</TableCell>
                          <TableCell className="capitalize text-gray-800 font-medium">{bet.betType}</TableCell>
                          <TableCell className="font-semibold text-green-600">₹{bet.amount}</TableCell>
                          <TableCell>{getStatusBadge(bet.status, bet.result)}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {bet.winAmount && bet.winAmount > 0 ? (
                              <span className="text-green-600 font-bold">₹{bet.winAmount}</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getClaimStatusBadge(bet.claimStatus, bet.result)}</TableCell>
                          <TableCell className="text-sm text-gray-800">
                            {formatDate(bet.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(bet)}
                              className="flex items-center gap-1 rounded-xl"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && bets.length > 0 && (
              <div className="border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bet Detail Modal */}
      <BetDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bet={selectedBet}
      />

      <div className="block ">
        <BottomNav />
      </div>
    </main>
  );
}

export default Page;

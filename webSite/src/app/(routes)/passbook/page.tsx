"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Eye, Calendar, Filter, RefreshCw, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { transferAPI, TransferHistoryResponse, TransferData } from "@/lib/api/transfer";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Loading } from "@/components/ui/loading";
import TransferDetailModal from "@/components/TransferDetailModal";
import Header from "@/app/components/Header";
import BottomNav from "@/app/components/BottomNav";

function Page() {
    const [transfers, setTransfers] = useState<TransferData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const itemsPerPage = 10;

    const fetchTransfers = async (page: number = 1) => {
        try {
            setLoading(true);
            const response: TransferHistoryResponse = await transferAPI.getTransferHistory(
                page,
                itemsPerPage,
                statusFilter || undefined,
                typeFilter || undefined
            );

            if (response.success && response.data) {
                setTransfers(response.data);
                setTotalItems(response.pagination.total);
                setTotalPages(response.pagination.pages);
            }
        } catch (error) {
            console.error("Failed to fetch transfers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers(currentPage);
    }, [currentPage, statusFilter, typeFilter]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchTransfers(1);
    };

    const handleClearFilters = () => {
        setStatusFilter("");
        setTypeFilter("");
        setCurrentPage(1);
        fetchTransfers(1);
    };

    const handleViewDetails = (transfer: TransferData) => {
        setSelectedTransfer(transfer);
        setIsModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        try {
            // The backend returns date in format "DD-MM-YYYY HH:MM:SS AM/PM"
            const [datePart, timePart] = dateString.split(' ');
            const [day, month, year] = datePart.split('-');
            const [time, ampm] = timePart.split(' ');
            const [hours, minutes, seconds] = time.split(':');

            let hour = parseInt(hours);
            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;

            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes), parseInt(seconds));
            return format(date, "dd MMM yyyy, hh:mm a");
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge variant="success">Completed</Badge>;
            case "pending":
                return <Badge variant="warning">Pending</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "credit":
                return <Badge variant="success">Credit</Badge>;
            case "debit":
                return <Badge variant="destructive">Debit</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const getDirectionIcon = (isIncoming: boolean, isOutgoing: boolean) => {
        if (isIncoming) return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
        if (isOutgoing) return <ArrowUpRight className="h-4 w-4 text-red-600" />;
        return null;
    };

    const getAmountColor = (isIncoming: boolean, isOutgoing: boolean) => {
        if (isIncoming) return "text-green-600";
        if (isOutgoing) return "text-red-600";
        return "text-gray-900";
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
                                <h1 className="text-lg font-bold text-gray-800">Transaction History</h1>
                                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
                                    <span>•</span>
                                    <span>{totalItems} total transactions</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchTransfers(currentPage)}
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
                                    >
                                        <option value="">All Status</option>
                                        <option value="completed">Completed</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
                                    >
                                        <option value="">All Types</option>
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                    </select>
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
                            ) : transfers.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                                    <p className="text-gray-500">No transaction history available for the selected filters.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 p-4">
                                    {transfers.map((transfer) => (
                                        <div key={transfer.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {getDirectionIcon(transfer.isIncoming, transfer.isOutgoing)}
                                                    <h3 className="font-semibold text-gray-900">
                                                        {transfer.isIncoming ? "Incoming" : "Outgoing"}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(transfer.status)}
                                                    {getTypeBadge(transfer.type)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                                <div>
                                                    <span className="text-gray-600 font-medium">From:</span>
                                                    <span className="ml-1 font-semibold text-gray-900">{transfer.fromUser}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 font-medium">To:</span>
                                                    <span className="ml-1 font-semibold text-gray-900">{transfer.toUser}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 font-medium">Amount:</span>
                                                    <span className={`ml-1 font-bold ${getAmountColor(transfer.isIncoming, transfer.isOutgoing)}`}>
                                                        ₹{transfer.amount}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 font-medium">Date:</span>
                                                    <span className="ml-1 text-gray-800">{formatDate(transfer.timestamp)}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(transfer)}
                                                    className="flex items-center gap-1 rounded-xl"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </div>
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
                            ) : transfers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                                    <p className="text-gray-500">No transaction history available for the selected filters.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="font-semibold text-gray-700">Direction</TableHead>
                                                <TableHead className="font-semibold text-gray-700">From User</TableHead>
                                                <TableHead className="font-semibold text-gray-700">To User</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Type</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transfers.map((transfer) => (
                                                <TableRow key={transfer.id} className="hover:bg-gray-50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getDirectionIcon(transfer.isIncoming, transfer.isOutgoing)}
                                                            <span className="font-medium text-gray-900">
                                                                {transfer.isIncoming ? "Incoming" : "Outgoing"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-900">{transfer.fromUser}</TableCell>
                                                    <TableCell className="font-medium text-gray-900">{transfer.toUser}</TableCell>
                                                    <TableCell className={`font-semibold ${getAmountColor(transfer.isIncoming, transfer.isOutgoing)}`}>
                                                        ₹{transfer.amount}
                                                    </TableCell>
                                                    <TableCell>{getTypeBadge(transfer.type)}</TableCell>
                                                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                                                    <TableCell className="text-sm text-gray-800">
                                                        {formatDate(transfer.timestamp)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(transfer)}
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
                        {!loading && transfers.length > 0 && (
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

            {/* Transfer Detail Modal */}
            <TransferDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                transfer={selectedTransfer}
            />

            <div className="block ">
                <BottomNav />
            </div>
        </main>
    );
}

export default Page; 
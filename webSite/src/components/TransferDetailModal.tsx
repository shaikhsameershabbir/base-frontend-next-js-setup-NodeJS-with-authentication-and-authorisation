import React from "react";
import { Dialog } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { TransferData } from "@/lib/api/transfer";

interface TransferDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transfer: TransferData | null;
}

const TransferDetailModal: React.FC<TransferDetailModalProps> = ({ isOpen, onClose, transfer }) => {
    if (!transfer) return null;

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

    const getDirectionBadge = (isIncoming: boolean, isOutgoing: boolean) => {
        if (isIncoming) return <Badge variant="success">Incoming</Badge>;
        if (isOutgoing) return <Badge variant="destructive">Outgoing</Badge>;
        return <Badge variant="secondary">Unknown</Badge>;
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Transfer Details">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Transfer #{transfer.id.slice(-8)}</h3>
                            <p className="text-sm opacity-90 capitalize">{transfer.type} • {transfer.status}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">₹{transfer.amount}</div>
                            <div className="text-sm opacity-90">Transfer Amount</div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                    {/* Status Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Transfer Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 font-medium">Status:</span>
                                <div>{getStatusBadge(transfer.status)}</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 font-medium">Type:</span>
                                <div>{getTypeBadge(transfer.type)}</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 font-medium">Direction:</span>
                                <div>{getDirectionBadge(transfer.isIncoming, transfer.isOutgoing)}</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 font-medium">Processed By:</span>
                                <div className="font-semibold text-gray-900">{transfer.processedBy}</div>
                            </div>
                        </div>
                    </div>

                    {/* Transfer Details Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Transfer Details</h4>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-sm text-gray-700 font-medium">From User:</span>
                                    <div className="font-semibold text-gray-900">{transfer.fromUser}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-700 font-medium">To User:</span>
                                    <div className="font-semibold text-gray-900">{transfer.toUser}</div>
                                </div>
                            </div>

                            <div>
                                <span className="text-sm text-gray-700 font-medium">Reason:</span>
                                <div className="font-medium text-sm mt-1 bg-white rounded-lg p-2 border text-gray-800">
                                    {transfer.reason}
                                </div>
                            </div>

                            {transfer.adminNote && (
                                <div>
                                    <span className="text-sm text-gray-700 font-medium">Admin Note:</span>
                                    <div className="font-medium text-sm mt-1 bg-white rounded-lg p-2 border text-gray-800">
                                        {transfer.adminNote}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Balance Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Balance Information</h4>
                        <div className="space-y-4">
                           

                            <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">To User Balance</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-sm text-gray-600">Before:</span>
                                        <div className="font-semibold text-gray-900">₹{transfer.toUserBalanceBefore}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">After:</span>
                                        <div className="font-semibold text-gray-900">₹{transfer.toUserBalanceAfter}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Additional Information</h4>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-700 font-medium">Date & Time:</span>
                                <div className="font-semibold text-gray-900">{formatDate(transfer.timestamp)}</div>
                            </div>

                            <div>
                                <span className="text-sm text-gray-700 font-medium">Transfer ID:</span>
                                <div className="font-medium text-sm text-gray-600">{transfer.id}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-gray-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default TransferDetailModal; 
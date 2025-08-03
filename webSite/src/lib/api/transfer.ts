import apiClient from '../api-client';

export interface TransferData {
    id: string;
    fromUser: string;
    toUser: string;
    amount: number;
    type: 'credit' | 'debit';
    status: 'pending' | 'completed' | 'failed';
    reason: string;
    adminNote?: string;
    processedBy: string;
    timestamp: string;
    fromUserBalanceBefore: number;
    fromUserBalanceAfter: number;
    toUserBalanceBefore: number;
    toUserBalanceAfter: number;
    isIncoming: boolean;
    isOutgoing: boolean;
}

export interface TransferHistoryResponse {
    success: boolean;
    data: TransferData[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface TransferStatsResponse {
    success: boolean;
    data: {
        totalTransfers: number;
        totalCredits: number;
        totalDebits: number;
        totalAmount: number;
    };
}

export const transferAPI = {
    /**
     * Get transfer history for the current user
     */
    getTransferHistory: async (
        page: number = 1,
        limit: number = 10,
        status?: string,
        type?: string
    ): Promise<TransferHistoryResponse> => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (status) params.append('status', status);
            if (type) params.append('type', type);

            const response = await apiClient.get(`/player/transfer-history?${params}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get transfer history');
        }
    },

    /**
     * Get transfer statistics for the current user
     */
    getTransferStats: async (): Promise<TransferStatsResponse> => {
        try {
            const response = await apiClient.get('/player/transfer-stats');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get transfer stats');
        }
    }
}; 
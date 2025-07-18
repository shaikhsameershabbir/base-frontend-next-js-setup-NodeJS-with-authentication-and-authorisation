import apiClient from "../api-client";


export interface ChildUser {
    id: string;
    username: string;
    balance: number;
    role: string;
    isActive: boolean;
    downlineCount: number;
}

export interface TransferRequest {
    toUserId: string;
    amount: number;
    type: 'credit' | 'debit';
    reason: string;
    adminNote?: string;
}

export interface TransferResponse {
    success: boolean;
    message: string;
    data: {
        transferId: string;
        fromUser: {
            id: string;
            username: string;
            balanceBefore: number;
            balanceAfter: number;
        };
        toUser: {
            id: string;
            username: string;
            balanceBefore: number;
            balanceAfter: number;
        };
        amount: number;
        type: string;
        reason: string;
    };
}

export interface TransferHistoryItem {
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
    data: TransferHistoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface TransferStats {
    totalTransfers: number;
    totalCredits: number;
    totalDebits: number;
    totalAmount: number;
}

export interface TransferStatsResponse {
    success: boolean;
    data: TransferStats;
}

// Get child users under current user
export const getChildUsers = async (): Promise<ChildUser[]> => {
    try {
        const response = await apiClient.get('/transfers/children');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching child users:', error);
        throw error;
    }
};

// Process a transfer
export const processTransfer = async (transferData: TransferRequest): Promise<TransferResponse> => {
    try {
        const response = await apiClient.post('/transfers/process', transferData);
        return response.data;
    } catch (error) {
        console.error('Error processing transfer:', error);
        throw error;
    }
};

// Get transfer history
export const getTransferHistory = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
}): Promise<TransferHistoryResponse> => {
    try {
        const response = await apiClient.get('/transfers/history', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching transfer history:', error);
        throw error;
    }
};

// Get transfer statistics
export const getTransferStats = async (): Promise<TransferStatsResponse> => {
    try {
        const response = await apiClient.get('/transfers/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching transfer stats:', error);
        throw error;
    }
}; 
import apiClient from './api-client';

// Types for loadv2 data
export interface LoadV2Bet {
    _id: string;
    userId: string;
    marketId: string;
    type: string;
    betType: string;
    selectedNumbers: string | number[] | Record<string, number>;
    amount: number;
    createdAt: string;
    updatedAt: string;
}

export interface LoadV2Filters {
    date: string;
    userId: string;
    marketId: string;
    dateRange: {
        start: string;
        end: string;
    };
}

export interface LoadV2Summary {
    totalBets: number;
    totalAmount: number;
    uniqueUsers: number;
    uniqueMarkets: number;
}

export interface LoadV2Data {
    bets: LoadV2Bet[];
    filters: LoadV2Filters;
    summary: LoadV2Summary;
}

export interface LoadV2Response {
    success: boolean;
    message: string;
    data: LoadV2Data;
}

export interface HierarchicalUser {
    _id: string;
    username: string;
    role: string;
    isActive: boolean;
    parentId?: string;
}

export interface HierarchicalUsersResponse {
    success: boolean;
    message: string;
    data: Record<string, HierarchicalUser[]>;
}

export interface Market {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
}

export interface AssignedMarketsResponse {
    success: boolean;
    message: string;
    data: Market[];
}

// API functions
export const loadApiV2 = {
    // Get all loads for a specific date with optional filters
    getAllLoads: async (date?: string, userId?: string, marketId?: string): Promise<LoadV2Response> => {
        const params: Record<string, string> = {};
        if (date) params.date = date;
        if (userId) params.userId = userId;
        if (marketId) params.marketId = marketId;

        const response = await apiClient.get('/load/getAllLoadsV2', { params });
        return response.data;
    },

    // Get loads for today
    getTodayLoads: async (): Promise<LoadV2Response> => {
        const today = new Date().toISOString().split('T')[0];
        return loadApiV2.getAllLoads(today);
    },

    // Get hierarchical users for the current user
    getHierarchicalUsers: async (role?: string): Promise<HierarchicalUsersResponse> => {
        const params = role ? { role } : {};
        const response = await apiClient.get('/load/hierarchical-users', { params });
        return response.data;
    },

    // Get assigned markets for the current user
    getAssignedMarkets: async (): Promise<AssignedMarketsResponse> => {
        const response = await apiClient.get('/load/assigned-markets');
        return response.data;
    }
}; 
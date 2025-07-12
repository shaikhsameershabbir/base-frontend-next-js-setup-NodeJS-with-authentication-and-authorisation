import apiClient from './api-client';

export interface Market {
    _id: string;
    marketName: string;
    openTime: string;
    closeTime: string;
    createdBy: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MarketResponse {
    markets: Market[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const marketAPI = {
    getMarkets: async (page = 1, limit = 10, search = '', status = '') => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(status && { status }),
        });
        const response = await apiClient.get(`/api/markets?${params}`);
        return response.data;
    },
    createMarket: async (data: Partial<Market>) => {
        const response = await apiClient.post('/api/markets', data);
        return response.data;
    },
    updateMarket: async (marketId: string, data: Partial<Market>) => {
        const response = await apiClient.put(`/api/markets/${marketId}`, data);
        return response.data;
    },
    deleteMarket: async (marketId: string) => {
        const response = await apiClient.delete(`/api/markets/${marketId}`);
        return response.data;
    },
    toggleMarketActive: async (marketId: string) => {
        const response = await apiClient.put(`/api/markets/${marketId}/active`);
        return response.data;
    },
}; 
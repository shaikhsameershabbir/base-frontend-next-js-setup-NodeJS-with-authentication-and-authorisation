// This file is deprecated. Market API functionality has been moved to api-service.ts
// Please use marketsAPI from api-service.ts instead

import { marketsAPI } from './api-service';

// Re-export for backward compatibility
export const marketAPI = marketsAPI;

// Legacy interfaces for backward compatibility
export interface Market {
    _id: string;
    name: string;
    status: 'open' | 'closed' | 'suspended';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MarketResponse {
    data: Market[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

// Legacy functions for backward compatibility
export const legacyMarketAPI = {
    getMarkets: async (page = 1, limit = 10, search = '', status = '') => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(status && { status }),
        });
        return marketsAPI.getMarkets(page, limit, status);
    },
    createMarket: async (data: Partial<Market>) => {
        return marketsAPI.createMarket(data as { name: string; status: string });
    },
    updateMarket: async (marketId: string, data: Partial<Market>) => {
        return marketsAPI.updateMarket(marketId, data);
    },
    deleteMarket: async (marketId: string) => {
        return marketsAPI.deleteMarket(marketId);
    },
    toggleMarketActive: async (marketId: string) => {
        return marketsAPI.updateMarketStatus(marketId, 'active');
    },
}; 
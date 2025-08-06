import apiClient from '../api-client';

export interface BetRequest {
    marketId: string;
    gameType: string;
    betType: 'open' | 'close' | 'both';
    numbers: { [key: number]: number }; // For single game: { 0: 100, 1: 50, ... }
    amount: number;
}

export interface BetResponse {
    success: boolean;
    message: string;
    data?: {
        betId: string;
        marketId: string;
        gameType: string;
        betType: 'open' | 'close' | 'both';
        numbers: { [key: number]: number };
        selectedNumbers: { [key: number]: number };
        amount: number;
        userBeforeAmount: number;
        userAfterAmount: number;
        status: boolean;
        createdAt: string;
    };
}

export interface BetHistoryResponse {
    success: boolean;
    message: string;
    data?: {
        bets: Array<{
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
        }>;
        total: number;
        page: number;
        limit: number;
    };
}

export const betAPI = {
    /**
 * Place a new bet
 */
    placeBet: async (betData: BetRequest): Promise<BetResponse> => {
        try {
            const response = await apiClient.post('/bets/place-bet', betData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to place bet');
        }
    },

    /**
 * Get bet history for the current user
 */
    getBetHistory: async (page: number = 1, limit: number = 10, startDate?: string, endDate?: string): Promise<BetHistoryResponse> => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await apiClient.get(`/player/bet-history?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get bet history');
        }
    },

    /**
     * Get a specific bet by ID
     */
    getBetById: async (betId: string): Promise<BetResponse> => {
        try {
            const response = await apiClient.get(`/player/bet/${betId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get bet details');
        }
    },

    /**
     * Cancel a bet
     */
    cancelBet: async (betId: string): Promise<BetResponse> => {
        try {
            const response = await apiClient.post(`/player/bet/${betId}/cancel`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to cancel bet');
        }
    },

    /**
 * Get bet statistics for the current user
 */
    getBetStats: async (): Promise<any> => {
        try {
            const response = await apiClient.get('/player/bet-stats');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get bet statistics');
        }
    },

    /**
     * Get current Indian time
     */
    getCurrentTime: async (): Promise<any> => {
        try {
            const response = await apiClient.get('/player/current-time');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get current time');
        }
    },

    /**
     * Get market status
     */
    getMarketStatus: async (marketId: string): Promise<any> => {
        try {
            const response = await apiClient.get(`/player/market/${marketId}/status`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get market status');
        }
    },

    /**
     * Get market results
     */
    getMarketResults: async (marketId: string): Promise<any> => {
        try {
            const response = await apiClient.get(`/result/player/market/${marketId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get market results');
        }
    }
};

import apiClient from '../api-client';

export interface BetRequest {
    marketId: string;
    gameType: string;
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
        numbers: { [key: number]: number };
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
            const response = await apiClient.post('/player/place-bet', betData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to place bet');
        }
    },

    /**
     * Get bet history for the current user
     */
    getBetHistory: async (page: number = 1, limit: number = 10): Promise<BetHistoryResponse> => {
        try {
            const response = await apiClient.get(`/player/bet-history?page=${page}&limit=${limit}`);
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
    }
};

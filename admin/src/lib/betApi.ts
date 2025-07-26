import apiClient from './api-client';

export interface Bet {
    _id: string;
    marketId: {
        _id: string;
        marketName: string;
        openTime: string;
        closeTime: string;
    };
    userId: {
        _id: string;
        username: string;
        role: string;
        balance: number;
    };
    type: string;
    betType: string;
    amount: number;
    userBeforeAmount: number;
    userAfterAmount: number;
    status: boolean;
    result?: string;
    selectedNumbers: { [key: number]: number };
    createdAt: Date;
    updatedAt: Date;
}

export interface BetFilters {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    dateFilter?: 'today' | 'yesterday' | 'thisWeek' | 'custom';
    adminId?: string;
    distributorId?: string;
    agentId?: string;
    playerId?: string;
    marketId?: string;
    betType?: 'open' | 'close';
    gameType?: string;
}

export interface BetSummary {
    totalBets: number;
    totalAmount: number;
    openBets: number;
    closeBets: number;
    openAmount: number;
    closeAmount: number;
}

export interface BetResponse {
    success: boolean;
    message: string;
    data: {
        bets: Bet[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalBets: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            limit: number;
        };
        summary: BetSummary;
    };
}

export interface HierarchyOption {
    _id: string;
    username: string;
}

export interface HierarchyOptionsResponse {
    success: boolean;
    message: string;
    data: HierarchyOption[];
}

export interface BetDetailResponse {
    success: boolean;
    message: string;
    data: Bet;
}

class BetAPI {
    // Get bets with filtering and pagination
    async getBets(filters: BetFilters = {}): Promise<BetResponse> {
        const params = new URLSearchParams();

        // Add filters to query parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/admin/bets?${params.toString()}`);
        return response.data;
    }

    // Get specific bet details
    async getBetById(betId: string): Promise<BetDetailResponse> {
        const response = await apiClient.get(`/admin/bets/${betId}`);
        return response.data;
    }

    // Get hierarchy options for filtering
    async getHierarchyOptions(level: string, parentId?: string): Promise<HierarchyOptionsResponse> {
        const params = new URLSearchParams({ level });
        if (parentId) {
            params.append('parentId', parentId);
        }

        const response = await apiClient.get(`/admin/bets/hierarchy/options?${params.toString()}`);
        return response.data;
    }

    // Get admin hierarchy options (for superadmin)
    async getAdminHierarchyOptions(level: string, filters: { adminId?: string; distributorId?: string; agentId?: string } = {}): Promise<HierarchyOptionsResponse> {
        const params = new URLSearchParams({ level });

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.append(key, value);
            }
        });

        const response = await apiClient.get(`/admin/bets/hierarchy/options?${params.toString()}`);
        return response.data;
    }
}

export const betAPI = new BetAPI();

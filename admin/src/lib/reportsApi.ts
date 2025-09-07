import apiClient from './api-client';

export interface HierarchicalReport {
    userId: string;
    username: string;
    role: string;
    percentage: number;
    totalBet: number;
    totalWin: number;
    claimedAmount: number;
    unclaimedAmount: number;
    totalBets: number;
    winningBets: number;
    commission: number;
    hasChildren: boolean;
}

export interface ReportsResponse {
    reports: HierarchicalReport[];
    summary: {
        totalBet: number;
        totalWin: number;
        claimedAmount: number;
        unclaimedAmount: number;
        totalBets: number;
        winningBets: number;
        totalUsers: number;
        totalCommission: number;
    };
    filters: {
        startDate: string | null;
        endDate: string | null;
    };
    currentLevel: {
        role: string;
        parentId?: string;
        parentName?: string;
    };
}

export interface BetStats {
    todayBets: number;
    todayBetAmount: number;
    todayWinningBets: number;
    todayWinAmount: number;
    totalUsers: number;
}

export class ReportsApi {
    /**
     * Get hierarchical reports with drill-down capability
     */
    static async getHierarchicalReports(params?: {
        startDate?: string;
        endDate?: string;
        parentId?: string;
    }): Promise<ReportsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        if (params?.parentId) queryParams.append('parentId', params.parentId);

        const url = `/reports/hierarchical-reports?${queryParams.toString()}`;

        const response = await apiClient.get(url);
        return response.data.data;
    }

    /**
     * Get real-time bet statistics
     */
    static async getBetStats(): Promise<BetStats> {
        const response = await apiClient.get('/reports/bet-stats');
        return response.data.data;
    }
}
import apiClient from './api-client';

export interface BetReport {
    userId: string;
    username: string;
    role: string;
    totalBet: number;
    totalWin: number;
    claimedAmount: number;
    unclaimedAmount: number;
    totalBets: number;
    winningBets: number;
    claimStatus: {
        claimed: number;
        unclaimed: number;
    };
}

export interface AdminReport {
    adminId: string;
    adminUsername: string;
    adminRole: string;
    totalBet: number;
    totalWin: number;
    claimedAmount: number;
    unclaimedAmount: number;
    totalBets: number;
    winningBets: number;
    claimStatus: {
        claimed: number;
        unclaimed: number;
    };
    downlineUsers: BetReport[];
}

export interface ReportsResponse {
    reports: AdminReport[];
    summary: {
        totalBet: number;
        totalWin: number;
        claimedAmount: number;
        unclaimedAmount: number;
        totalBets: number;
        winningBets: number;
        totalAdmins: number;
    };
    filters: {
        startDate: string | null;
        endDate: string | null;
        adminId: string | null;
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
     * Get comprehensive bet reports
     */
    static async getBetReports(params?: {
        startDate?: string;
        endDate?: string;
        adminId?: string;
    }): Promise<ReportsResponse> {
        console.log('ReportsApi.getBetReports called with params:', params);
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        if (params?.adminId) queryParams.append('adminId', params.adminId);

        const url = `/reports/bet-reports?${queryParams.toString()}`;
        console.log('Making request to:', url);

        const response = await apiClient.get(url);
        console.log('ReportsApi response:', response);
        return response.data.data;
    }

    /**
     * Get real-time bet statistics
     */
    static async getBetStats(): Promise<BetStats> {
        console.log('ReportsApi.getBetStats called');
        const response = await apiClient.get('/reports/bet-stats');
        console.log('StatsApi response:', response);
        return response.data.data;
    }
}

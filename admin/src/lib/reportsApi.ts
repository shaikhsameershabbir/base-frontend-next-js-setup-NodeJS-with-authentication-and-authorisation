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
    }): Promise<ReportsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const url = `/reports/bet-reports?${queryParams.toString()}`;

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

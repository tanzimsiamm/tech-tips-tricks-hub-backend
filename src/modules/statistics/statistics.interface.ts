export interface IMonthlyRevenue {
    month: string;
    year: number;
    amount: number;
}

export interface IOverallStatsResponse {
    totalUsers: number;
    totalAdmins: number;
    totalPosts: number;
    totalPremiumPosts: number;
    totalUpvotes: number;
    totalDownvotes: number;
    totalViews: number;
    totalComments: number;
    totalRevenue: number;
    monthlyRevenue: IMonthlyRevenue[];
}
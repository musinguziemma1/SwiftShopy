import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useAdminDashboardData = () => {
  // Get admin summary
  const adminSummary = useQuery(api.analytics.getAdminSummary);

  return {
    adminSummary: adminSummary ?? {
      totalSellers: 0,
      totalStores: 0,
      totalOrders: 0,
      totalRevenue: 0,
      successfulTransactions: 0,
      // Tokenization metrics
      totalTokensCreated: 0,
      activeTokens: 0,
      expiredTokens: 0,
      tokenValidations: 0,
    },
    isLoading: false,
  };
};
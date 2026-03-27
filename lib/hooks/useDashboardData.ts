import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useDashboardData = (storeId: string | null | undefined) => {
  // Only query if we have a valid storeId
  const hasValidId = storeId && !storeId.includes("store");

  // Get store summary
  const storeSummary = useQuery(
    api.analytics.getStoreSummary,
    hasValidId ? { storeId: storeId as any } : "skip"
  );

  // Get top selling products
  const topProducts = useQuery(
    api.analytics.getTopSellingProducts,
    hasValidId ? { storeId: storeId as any } : "skip"
  );

  // Get sales by category
  const categorySales = useQuery(
    api.analytics.getSalesByCategory,
    hasValidId ? { storeId: storeId as any } : "skip"
  );

  // Get daily sales
  const dailySales = useQuery(
    api.analytics.getDailySales,
    hasValidId ? { storeId: storeId as any, days: 30 } : "skip"
  );

  return {
    storeSummary: storeSummary ?? {
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      pendingOrders: 0,
      paidOrders: 0,
    },
    topProducts: topProducts ?? [],
    categorySales: categorySales ?? [],
    dailySales: dailySales ?? [],
    isLoading: false,
  };
};;
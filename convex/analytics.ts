import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStoreSummary = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    const [orders, products] = await Promise.all([
      ctx.db.query("orders").withIndex("by_store", q => q.eq("storeId", storeId)).collect(),
      ctx.db.query("products").withIndex("by_store", q => q.eq("storeId", storeId)).collect(),
    ]);
    const paid = orders.filter(o => o.status === "paid");
    return {
      totalOrders: orders.length,
      totalRevenue: paid.reduce((s, o) => s + o.total, 0),
      totalProducts: products.length,
      pendingOrders: orders.filter(o => o.status === "pending").length,
      paidOrders: paid.length,
    };
  },
});

export const getAdminSummary = query({
  args: {},
  handler: async (ctx) => {
    const [users, stores, orders, transactions] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("stores").collect(),
      ctx.db.query("orders").collect(),
      ctx.db.query("transactions").collect(),
    ]);
    const paid = orders.filter(o => o.status === "paid");
    return {
      totalSellers: users.filter(u => u.role === "seller").length,
      totalStores: stores.length,
      totalOrders: orders.length,
      totalRevenue: paid.reduce((s, o) => s + o.total, 0),
      successfulTransactions: transactions.filter(t => t.status === "successful").length,
    };
  },
});

export const getDailySales = query({
  args: { storeId: v.id("stores"), days: v.optional(v.number()) },
  handler: async (ctx, { storeId, days = 7 }) => {
    const orders = await ctx.db.query("orders").withIndex("by_store", q => q.eq("storeId", storeId)).collect();
    const now = Date.now();
    const cutoff = now - days * 86400000;
    const map: Record<string, { orders: number; revenue: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(now - i * 86400000).toISOString().split("T")[0];
      map[d] = { orders: 0, revenue: 0 };
    }
    orders.filter(o => o._creationTime >= cutoff).forEach(o => {
      const d = new Date(o._creationTime).toISOString().split("T")[0];
      if (map[d]) {
        map[d].orders += 1;
        if (o.status === "paid") map[d].revenue += o.total;
      }
    });
    return Object.entries(map).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date));
  },
});

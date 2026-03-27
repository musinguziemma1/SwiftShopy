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

export const getTopSellingProducts = query({
  args: { storeId: v.id("stores"), limit: v.optional(v.number()) },
  handler: async (ctx, { storeId, limit = 5 }) => {
    const products = await ctx.db.query("products")
      .withIndex("by_store", q => q.eq("storeId", storeId))
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
    
    return products
      .sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0))
      .slice(0, limit)
      .map(p => ({
        id: p._id,
        name: p.name,
        sales: p.sales ?? 0,
        revenue: (p.sales ?? 0) * p.price,
        image: p.image,
        price: p.price
      }));
  },
});

export const getSalesByCategory = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    const products = await ctx.db.query("products")
      .withIndex("by_store", q => q.eq("storeId", storeId))
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
    
    const categoryMap: Record<string, { sales: number; revenue: number }> = {};
    
    for (const product of products) {
      const category = product.category || "Uncategorized";
      if (!categoryMap[category]) {
        categoryMap[category] = { sales: 0, revenue: 0 };
      }
      categoryMap[category].sales += product.sales ?? 0;
      categoryMap[category].revenue += (product.sales ?? 0) * product.price;
    }
    
    return Object.entries(categoryMap).map(([category, data]) => ({
      category,
      sales: data.sales,
      revenue: data.revenue,
      percentage: data.sales > 0 ? (data.sales / products.reduce((sum, p) => sum + (p.sales ?? 0), 0)) * 100 : 0
    }));
  },
});

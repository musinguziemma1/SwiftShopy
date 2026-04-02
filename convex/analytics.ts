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
    const [users, stores, orders, transactions, paymentTokens, tokenAuditLogs] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("stores").collect(),
      ctx.db.query("orders").collect(),
      ctx.db.query("transactions").collect(),
      ctx.db.query("payment_tokens").collect(),
      ctx.db.query("token_audit_log").collect(),
    ]);
    const paid = orders.filter(o => o.status === "paid");
    const now = Date.now();
    
    // Count active (non-expired) tokens
    const activeTokens = paymentTokens.filter(token => 
      !token.expiresAt || token.expiresAt > now
    ).length;
    
    // Count expired tokens
    const expiredTokens = paymentTokens.filter(token => 
      token.expiresAt && token.expiresAt <= now
    ).length;
    
    // Count token validations from audit log
    const tokenValidations = tokenAuditLogs.filter(log => 
      log.action === "validate"
    ).length;
    
    return {
      totalSellers: users.filter(u => u.role === "seller").length,
      totalStores: stores.length,
      totalOrders: orders.length,
      totalRevenue: paid.reduce((s, o) => s + o.total, 0),
      successfulTransactions: transactions.filter(t => t.status === "successful").length,
      // Tokenization metrics
      totalTokensCreated: paymentTokens.length,
      activeTokens: activeTokens,
      expiredTokens: expiredTokens,
      tokenValidations: tokenValidations,
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

export const getBillingAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const [subscriptions, payments, users] = await Promise.all([
      ctx.db.query("subscriptions").collect(),
      ctx.db.query("subscription_payments").collect(),
      ctx.db.query("users").collect(),
    ]);

    const activeSubscriptions = subscriptions.filter(s => s.status === "active");
    const successfulPayments = payments.filter(p => p.status === "success");
    const sellers = users.filter(u => u.role === "seller");

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

    const last30DaysPayments = successfulPayments.filter(p => p.createdAt >= thirtyDaysAgo);
    const last60DaysPayments = successfulPayments.filter(p => p.createdAt >= sixtyDaysAgo);

    const mrr = last30DaysPayments.reduce((sum, p) => sum + p.amount, 0);

    const freeUsers = activeSubscriptions.filter(s => s.plan === "free").length;
    const proUsers = activeSubscriptions.filter(s => s.plan === "pro").length;
    const businessUsers = activeSubscriptions.filter(s => s.plan === "business").length;
    const enterpriseUsers = activeSubscriptions.filter(s => s.plan === "enterprise").length;

    const previousMonthPayments = last60DaysPayments.filter(p => p.createdAt < thirtyDaysAgo);
    const previousMonthMrr = previousMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const mrrGrowth = previousMonthMrr > 0 ? ((mrr - previousMonthMrr) / previousMonthMrr) * 100 : 0;

    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const paidUsers = proUsers + businessUsers + enterpriseUsers;
    const arpu = paidUsers > 0 ? mrr / paidUsers : 0;

    const conversionRate = sellers.length > 0 ? (paidUsers / sellers.length) * 100 : 0;

    const expiredLastMonth = subscriptions.filter(s => 
      s.status === "expired" && 
      s.updatedAt >= thirtyDaysAgo && 
      s.updatedAt < sixtyDaysAgo
    ).length;
    const churnRate = activeSubscriptions.length > 0 ? (expiredLastMonth / (activeSubscriptions.length + expiredLastMonth)) * 100 : 0;

    return {
      mrr,
      mrrGrowth: Math.round(mrrGrowth * 100) / 100,
      totalRevenue,
      activeSubscribers: activeSubscriptions.length,
      freeUsers,
      proUsers,
      businessUsers,
      enterpriseUsers,
      paidUsers,
      arpu: Math.round(arpu),
      conversionRate: Math.round(conversionRate * 100) / 100,
      churnRate: Math.round(churnRate * 100) / 100,
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
    };
  },
});

export const getRevenueByPlan = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query("subscription_payments")
      .filter(q => q.eq(q.field("status"), "success"))
      .collect();

    const planRevenue: Record<string, number> = {
      free: 0,
      pro: 0,
      business: 0,
      enterprise: 0,
    };

    for (const payment of payments) {
      planRevenue[payment.plan] = (planRevenue[payment.plan] || 0) + payment.amount;
    }

    return [
      { plan: "free", revenue: planRevenue.free, label: "Free Plan" },
      { plan: "pro", revenue: planRevenue.pro, label: "Pro Plan" },
      { plan: "business", revenue: planRevenue.business, label: "Business Plan" },
      { plan: "enterprise", revenue: planRevenue.enterprise, label: "Enterprise Plan" },
    ];
  },
});

export const getRevenueByMonth = query({
  args: { months: v.optional(v.number()) },
  handler: async (ctx, { months = 12 }) => {
    const payments = await ctx.db.query("subscription_payments")
      .filter(q => q.eq(q.field("status"), "success"))
      .collect();

    const now = new Date();
    const result: Array<{ month: string; year: number; revenue: number }> = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = date.getTime();
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime();

      const monthPayments = payments.filter(p => 
        p.createdAt >= monthStart && p.createdAt <= monthEnd
      );

      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      result.push({
        month: date.toLocaleString("en-US", { month: "short" }).toLowerCase(),
        year: date.getFullYear(),
        revenue,
      });
    }

    return result;
  },
});

export const getTransactionVolumeAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const [transactions, users] = await Promise.all([
      ctx.db.query("transactions").collect(),
      ctx.db.query("users").collect(),
    ]);

    const successfulTransactions = transactions.filter(t => t.status === "successful");
    const totalVolume = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
    const sellers = users.filter(u => u.role === "seller");

    const totalVolumePerUser = sellers.length > 0 ? totalVolume / sellers.length : 0;

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const last30DaysTransactions = successfulTransactions.filter(t => t._creationTime >= thirtyDaysAgo);
    const monthlyVolume = last30DaysTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalVolume,
      monthlyVolume,
      transactionCount: successfulTransactions.length,
      averageTransactionValue: successfulTransactions.length > 0 ? totalVolume / successfulTransactions.length : 0,
      totalVolumePerUser: Math.round(totalVolumePerUser),
    };
  },
});

export const getReferralPerformance = query({
  args: {},
  handler: async (ctx) => {
    const [referrals, billingSettings] = await Promise.all([
      ctx.db.query("referrals").collect(),
      ctx.db.query("billing_settings").collect(),
    ]);

    const completed = referrals.filter(r => r.status === "completed");
    const pending = referrals.filter(r => r.status === "pending");
    const rewardsGranted = referrals.filter(r => r.rewardGranted);

    const totalReferralCode = billingSettings.length;
    const activeReferrers = new Set(referrals.map(r => r.referrerUserId)).size;

    return {
      totalReferrals: referrals.length,
      completedReferrals: completed.length,
      pendingReferrals: pending.length,
      rewardsGranted: rewardsGranted.length,
      totalReferralCodes: totalReferralCode,
      activeReferrers,
    };
  },
});

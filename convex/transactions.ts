import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    orderId: v.id("orders"),
    storeId: v.id("stores"),
    amount: v.number(),
    currency: v.string(),
    provider: v.union(v.literal("mtn_momo"), v.literal("airtel_money")),
    providerRef: v.string(),
    externalRef: v.string(),
    status: v.optional(v.union(v.literal("pending"), v.literal("successful"), v.literal("failed"))),
    customerPhone: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // ── KYC VERIFICATION CHECK ──
    // Block transactions if seller is not KYC verified
    const store = await ctx.db.get(args.storeId);
    if (store) {
      const seller = await ctx.db.get(store.userId);
      if (seller && seller.role === "seller" && seller.kycStatus !== "verified") {
        throw new Error("KYC verification required before processing transactions. Please complete identity verification first.");
      }
    }

    const status = args.status ?? "pending";
    const transactionId = await ctx.db.insert("transactions", { ...args, status });
    
    // Get store and seller info
    const sellerId = store?.userId;
    const providerName = args.provider === "mtn_momo" ? "MTN MoMo" : "Airtel Money";

    // Notify admin about new transaction
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "transaction_new",
      title: "New Transaction",
      message: `${providerName} transaction of ${args.currency} ${args.amount.toLocaleString()} - ${status}`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { transactionId, storeId: args.storeId, amount: args.amount, provider: args.provider, status },
      createdAt: now,
    });

    // Notify seller about transaction
    if (sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: args.storeId,
        type: "transaction_new",
        title: "Payment Transaction",
        message: `${providerName} payment of ${args.currency} ${args.amount.toLocaleString()} is ${status}.`,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { transactionId, amount: args.amount, provider: args.provider, status },
        createdAt: now,
      });
    }

    return transactionId;
  },
});

export const getByExternalRef = query({
  args: { externalRef: v.string() },
  handler: async (ctx, { externalRef }) => {
    return await ctx.db.query("transactions").withIndex("by_externalRef", q => q.eq("externalRef", externalRef)).first();
  },
});

export const getByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db.query("transactions").withIndex("by_store", q => q.eq("storeId", storeId)).order("desc").take(50);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").take(100);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("transactions").collect(),
});

export const updateStatus = mutation({
  args: {
    id: v.id("transactions"),
    status: v.union(v.literal("pending"), v.literal("successful"), v.literal("failed")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { id, status, metadata }) => {
    const transaction = await ctx.db.get(id);
    if (!transaction) throw new Error("Transaction not found");
    
    await ctx.db.patch(id, { status, ...(metadata && { metadata }) });
    
    const now = Date.now();
    const store = await ctx.db.get(transaction.storeId);
    const sellerId = store?.userId;
    const providerName = transaction.provider === "mtn_momo" ? "MTN MoMo" : "Airtel Money";

    // Notify admin about status update
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: status === "successful" ? "payment_success" : status === "failed" ? "payment_failed" : "payment_pending",
      title: `Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `${providerName} transaction of ${transaction.currency} ${transaction.amount.toLocaleString()} is now ${status}.`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { transactionId: id, amount: transaction.amount, status, provider: transaction.provider },
      createdAt: now,
    });

    // Notify seller about status update
    if (sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: transaction.storeId,
        type: status === "successful" ? "payment_success" : status === "failed" ? "payment_failed" : "payment_pending",
        title: `Payment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: status === "successful" 
          ? `Payment of ${transaction.currency} ${transaction.amount.toLocaleString()} received successfully!`
          : status === "failed"
          ? `Payment of ${transaction.currency} ${transaction.amount.toLocaleString()} failed. Please retry.`
          : `Payment of ${transaction.currency} ${transaction.amount.toLocaleString()} is processing.`,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { transactionId: id, amount: transaction.amount, status },
        createdAt: now,
      });
    }
  },
});

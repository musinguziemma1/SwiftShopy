import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateBatchId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "BATCH-";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function generateExternalRef(): string {
  return `PAYOUT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// ─── Calculate Seller Payouts ──────────────────────────────────────────
export const calculateSellerPayouts = query({
  args: {
    plan: v.optional(v.union(v.literal("all"), v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise"))),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const dateFrom = args.dateFrom ?? (now - 30 * 24 * 60 * 60 * 1000);
    const dateTo = args.dateTo ?? now;

    // Get all active sellers
    const users = await ctx.db.query("users")
      .filter(q => q.eq(q.field("role"), "seller"))
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();

    const payouts: any[] = [];

    for (const user of users) {
      // Get subscription
      const subscription = await ctx.db.query("subscriptions")
        .withIndex("by_user", q => q.eq("userId", user._id))
        .filter(q => q.eq(q.field("status"), "active"))
        .first();

      const plan = subscription?.plan ?? "free";

      // Filter by plan if specified
      if (args.plan && args.plan !== "all" && plan !== args.plan) continue;

      // Get store
      const store = await ctx.db.query("stores")
        .filter(q => q.eq(q.field("userId"), user._id))
        .first();

      // Get completed orders in date range
      const orders = await ctx.db.query("orders")
        .withIndex("by_store", q => q.eq("storeId", store?._id ?? "" as any))
        .filter(q => q.eq(q.field("status"), "paid"))
        .collect();

      const filteredOrders = orders.filter(o => 
        o.createdAt && o.createdAt >= dateFrom && o.createdAt <= dateTo
      );

      const grossRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);

      // Calculate fees based on plan
      const feeRates: Record<string, number> = {
        free: 0.04,
        pro: 0.025,
        business: 0.015,
        enterprise: 0.01,
      };
      const feeRate = feeRates[plan] ?? 0.04;
      const platformFee = Math.round(grossRevenue * feeRate);
      const netPayout = grossRevenue - platformFee;

      if (netPayout > 0) {
        payouts.push({
          userId: user._id,
          sellerName: user.name,
          sellerEmail: user.email,
          sellerPhone: user.phone ?? "",
          storeId: store?._id,
          storeName: store?.name ?? "No Store",
          plan: plan as "free" | "pro" | "business" | "enterprise",
          grossRevenue,
          platformFee,
          feeRate: feeRate * 100,
          netPayout,
          orderCount: filteredOrders.length,
          dateFrom,
          dateTo,
        });
      }
    }

    return {
      payouts,
      totalGross: payouts.reduce((sum: number, p: any) => sum + p.grossRevenue, 0),
      totalFees: payouts.reduce((sum: number, p: any) => sum + p.platformFee, 0),
      totalNet: payouts.reduce((sum: number, p: any) => sum + p.netPayout, 0),
      sellerCount: payouts.length,
    };
  },
});

// ─── Create Disbursement Batch ─────────────────────────────────────────
export const createBatch = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    plan: v.union(v.literal("all"), v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
    provider: v.union(v.literal("mtn_momo"), v.literal("airtel_money")),
    payouts: v.array(v.object({
      userId: v.string(),
      sellerName: v.string(),
      sellerEmail: v.string(),
      sellerPhone: v.string(),
      storeId: v.optional(v.string()),
      storeName: v.optional(v.string()),
      amount: v.number(),
      plan: v.string(),
    })),
    initiatedBy: v.string(),
    initiatedByName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const batchId = generateBatchId();

    // Create batch record
    await ctx.db.insert("disbursement_batches", {
      batchId,
      name: args.name,
      description: args.description,
      plan: args.plan,
      provider: args.provider,
      totalAmount: args.payouts.reduce((sum, p) => sum + p.amount, 0),
      totalSellers: args.payouts.length,
      status: "pending_approval",
      successCount: 0,
      failedCount: 0,
      initiatedBy: args.initiatedBy,
      initiatedByName: args.initiatedByName,
      createdAt: now,
    });

    // Create individual disbursement records
    for (const payout of args.payouts) {
      await ctx.db.insert("disbursements", {
        batchId,
        userId: payout.userId as any,
        sellerName: payout.sellerName,
        sellerEmail: payout.sellerEmail,
        sellerPhone: payout.sellerPhone,
        storeId: payout.storeId as any,
        storeName: payout.storeName,
        amount: payout.amount,
        currency: "UGX",
        plan: payout.plan as any,
        provider: args.provider,
        externalRef: generateExternalRef(),
        status: "pending",
        initiatedBy: args.initiatedBy,
        initiatedByName: args.initiatedByName,
        createdAt: now,
      });
    }

    // Notify admin
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "payout_requested",
      title: "Disbursement Batch Created",
      message: `Batch ${batchId} created for ${args.payouts.length} sellers totaling UGX ${args.payouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
      isRead: false,
      actionUrl: "/admin?tab=transactions",
      metadata: { batchId, sellerCount: args.payouts.length },
      createdAt: now,
    });

    return { success: true, batchId };
  },
});

// ─── Approve Batch ─────────────────────────────────────────────────────
export const approveBatch = mutation({
  args: {
    batchId: v.string(),
    approvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const batch = await ctx.db.query("disbursement_batches")
      .withIndex("by_batch", q => q.eq("batchId", args.batchId))
      .first();

    if (!batch) throw new Error("Batch not found");
    if (batch.status !== "pending_approval") throw new Error("Batch is not pending approval");

    await ctx.db.patch(batch._id, {
      status: "approved",
      approvedBy: args.approvedBy,
      approvedAt: now,
    });

    return { success: true };
  },
});

// ─── Process Batch Disbursements ───────────────────────────────────────
export const processBatch = mutation({
  args: {
    batchId: v.string(),
    processedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const batch = await ctx.db.query("disbursement_batches")
      .withIndex("by_batch", q => q.eq("batchId", args.batchId))
      .first();

    if (!batch) throw new Error("Batch not found");
    if (batch.status !== "approved") throw new Error("Batch must be approved first");

    // Update batch status
    await ctx.db.patch(batch._id, { status: "processing" });

    // Get all disbursements in batch
    const disbursements = await ctx.db.query("disbursements")
      .withIndex("by_batch", q => q.eq("batchId", args.batchId))
      .filter(q => q.eq(q.field("status"), "pending"))
      .collect();

    return {
      success: true,
      batchId: args.batchId,
      disbursements: disbursements.map(d => ({
        id: d._id,
        externalRef: d.externalRef,
        amount: d.amount,
        phone: d.sellerPhone,
        provider: d.provider,
      })),
    };
  },
});

// ─── Update Disbursement Status ────────────────────────────────────────
export const updateDisbursementStatus = mutation({
  args: {
    id: v.id("disbursements"),
    status: v.union(v.literal("processing"), v.literal("success"), v.literal("failed"), v.literal("cancelled")),
    providerRef: v.optional(v.string()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const disbursement = await ctx.db.get(args.id);

    if (!disbursement) throw new Error("Disbursement not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      providerRef: args.providerRef,
      failureReason: args.failureReason,
      processedAt: now,
    });

    // Update batch counts
    const batch = await ctx.db.query("disbursement_batches")
      .withIndex("by_batch", q => q.eq("batchId", disbursement.batchId))
      .first();

    if (batch) {
      const allDisbursements = await ctx.db.query("disbursements")
        .withIndex("by_batch", q => q.eq("batchId", disbursement.batchId))
        .collect();

      const successCount = allDisbursements.filter(d => d.status === "success").length;
      const failedCount = allDisbursements.filter(d => d.status === "failed").length;
      const allDone = allDisbursements.every(d => d.status === "success" || d.status === "failed");

      await ctx.db.patch(batch._id, {
        successCount,
        failedCount,
        status: allDone ? "completed" : "processing",
        completedAt: allDone ? now : undefined,
      });
    }

    // Create transaction record
    if (args.status === "success") {
      await ctx.db.insert("transactions", {
        orderId: disbursement.userId as any,
        storeId: disbursement.storeId as any,
        amount: disbursement.amount,
        currency: disbursement.currency,
        provider: disbursement.provider,
        providerRef: args.providerRef ?? "",
        externalRef: disbursement.externalRef,
        status: "successful",
        customerPhone: disbursement.sellerPhone,
        metadata: { type: "disbursement", batchId: disbursement.batchId },
      });
    }

    // Notify seller
    if (args.status === "success") {
      await ctx.db.insert("notifications", {
        userId: disbursement.userId,
        storeId: disbursement.storeId,
        type: "payout_completed",
        title: "Payout Received",
        message: `Your payout of UGX ${disbursement.amount.toLocaleString()} has been sent to ${disbursement.sellerPhone}`,
        isRead: false,
        metadata: { amount: disbursement.amount, provider: disbursement.provider },
        createdAt: now,
      });
    }

    return { success: true };
  },
});

// ─── Get All Batches ───────────────────────────────────────────────────
export const getAllBatches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("disbursement_batches")
      .order("desc")
      .collect();
  },
});

// ─── Get Batch Disbursements ───────────────────────────────────────────
export const getBatchDisbursements = query({
  args: { batchId: v.string() },
  handler: async (ctx, { batchId }) => {
    return await ctx.db.query("disbursements")
      .withIndex("by_batch", q => q.eq("batchId", batchId))
      .collect();
  },
});

// ─── Get Disbursement Stats ────────────────────────────────────────────
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const disbursements = await ctx.db.query("disbursements").collect();
    const batches = await ctx.db.query("disbursement_batches").collect();

    return {
      totalDisbursed: disbursements.filter(d => d.status === "success").reduce((sum, d) => sum + d.amount, 0),
      pendingAmount: disbursements.filter(d => d.status === "pending").reduce((sum, d) => sum + d.amount, 0),
      failedAmount: disbursements.filter(d => d.status === "failed").reduce((sum, d) => sum + d.amount, 0),
      totalBatches: batches.length,
      completedBatches: batches.filter(b => b.status === "completed").length,
      pendingBatches: batches.filter(b => b.status === "pending_approval").length,
    };
  },
});

// ─── Cancel Batch ──────────────────────────────────────────────────────
export const cancelBatch = mutation({
  args: { batchId: v.string() },
  handler: async (ctx, { batchId }) => {
    const now = Date.now();

    const batch = await ctx.db.query("disbursement_batches")
      .withIndex("by_batch", q => q.eq("batchId", batchId))
      .first();

    if (!batch) throw new Error("Batch not found");
    if (batch.status === "completed") throw new Error("Cannot cancel completed batch");

    await ctx.db.patch(batch._id, { status: "cancelled" });

    // Cancel all pending disbursements
    const disbursements = await ctx.db.query("disbursements")
      .withIndex("by_batch", q => q.eq("batchId", batchId))
      .filter(q => q.eq(q.field("status"), "pending"))
      .collect();

    for (const d of disbursements) {
      await ctx.db.patch(d._id, { status: "cancelled" });
    }

    return { success: true };
  },
});

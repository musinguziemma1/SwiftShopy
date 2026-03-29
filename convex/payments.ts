import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_PRICES } from "./subscriptions";

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";
export type PaymentProvider = "mtn_momo" | "airtel_money";

export const createPayment = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    phone: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
    provider: v.union(v.literal("mtn_momo"), v.literal("airtel_money")),
    externalRef: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const paymentId = await ctx.db.insert("subscription_payments", {
      userId: args.userId,
      subscriptionId: undefined,
      amount: args.amount,
      currency: args.currency,
      phone: args.phone,
      plan: args.plan,
      status: "pending",
      provider: args.provider,
      providerRef: undefined,
      externalRef: args.externalRef,
      failureReason: undefined,
      createdAt: now,
      processedAt: undefined,
    });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "payment_pending",
      title: "Payment Pending",
      message: `Your payment of UGX ${args.amount.toLocaleString()} for ${args.plan} plan is being processed via ${args.provider === "mtn_momo" ? "MTN MoMo" : "Airtel Money"}.`,
      isRead: false,
      createdAt: Date.now(),
    });

    return paymentId;
  },
});

export const getPaymentByExternalRef = query({
  args: { externalRef: v.string() },
  handler: async (ctx, { externalRef }) => {
    return await ctx.db.query("subscription_payments")
      .withIndex("by_externalRef", q => q.eq("externalRef", externalRef))
      .first();
  },
});

export const getPaymentById = query({
  args: { id: v.id("subscription_payments") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getUserPayments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query("subscription_payments")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const updatePaymentStatus = mutation({
  args: {
    id: v.id("subscription_payments"),
    status: v.union(v.literal("pending"), v.literal("success"), v.literal("failed"), v.literal("cancelled")),
    providerRef: v.optional(v.string()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, providerRef, failureReason }) => {
    const now = Date.now();
    const updates: Record<string, any> = { status };
    if (status === "success" || status === "failed") {
      updates.processedAt = now;
    }
    if (providerRef) updates.providerRef = providerRef;
    if (failureReason) updates.failureReason = failureReason;
    await ctx.db.patch(id, updates);

    const payment = await ctx.db.get(id);
    if (!payment) return;

    const user = await ctx.db.get(payment.userId);
    const providerName = payment.provider === "mtn_momo" ? "MTN MoMo" : "Airtel Money";

    if (status === "success") {
      await ctx.db.insert("notifications", {
        userId: payment.userId,
        storeId: payment.subscriptionId ? undefined : undefined,
        type: "payment_success",
        title: "Payment Successful",
        message: `Your payment of UGX ${payment.amount.toLocaleString()} for ${payment.plan} plan has been confirmed.`,
        isRead: false,
        createdAt: now,
      });
      await ctx.db.insert("notifications", {
        userId: undefined,
        storeId: undefined,
        type: "payment_success",
        title: `Payment Success - ${user?.email || "Unknown"}`,
        message: `Payment of UGX ${payment.amount.toLocaleString()} for ${payment.plan} confirmed via ${providerName}`,
        isRead: false,
        createdAt: now,
      });
    } else if (status === "failed") {
      await ctx.db.insert("notifications", {
        userId: payment.userId,
        storeId: undefined,
        type: "payment_failed",
        title: "Payment Failed",
        message: `Your payment of UGX ${payment.amount.toLocaleString()} failed. ${failureReason || "Please try again."}`,
        isRead: false,
        createdAt: now,
      });
      await ctx.db.insert("notifications", {
        userId: undefined,
        storeId: undefined,
        type: "payment_failed",
        title: `Payment Failed - ${user?.email || "Unknown"}`,
        message: `Payment of UGX ${payment.amount.toLocaleString()} for ${payment.plan} failed. ${failureReason || ""}`,
        isRead: false,
        createdAt: now,
      });
    }
  },
});

export const processSuccessfulPayment = mutation({
  args: {
    paymentId: v.id("subscription_payments"),
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, { paymentId, subscriptionId }) => {
    const now = Date.now();
    await ctx.db.patch(paymentId, {
      status: "success",
      subscriptionId,
      processedAt: now,
    });

    const payment = await ctx.db.get(paymentId);
    if (!payment) return;

    const user = await ctx.db.get(payment.userId);
    const providerName = payment.provider === "mtn_momo" ? "MTN MoMo" : "Airtel Money";

    await ctx.db.insert("notifications", {
      userId: payment.userId,
      storeId: undefined,
      type: "payment_success",
      title: "Payment Successful",
      message: `Your payment of UGX ${payment.amount.toLocaleString()} for ${payment.plan} plan has been confirmed.`,
      isRead: false,
      createdAt: now,
    });
    await ctx.db.insert("notifications", {
      userId: undefined,
      storeId: undefined,
      type: "payment_success",
      title: `Payment Success - ${user?.email || "Unknown"}`,
      message: `Payment of UGX ${payment.amount.toLocaleString()} for ${payment.plan} confirmed via ${providerName}`,
      isRead: false,
      createdAt: now,
    });
  },
});

export const getAllPayments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscription_payments")
      .order("desc")
      .collect();
  },
});

export const getPendingPayments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscription_payments")
      .withIndex("by_status", q => q.eq("status", "pending"))
      .collect();
  },
});

export const getSuccessfulPaymentsByMonth = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, { year, month }) => {
    const payments = await ctx.db.query("subscription_payments")
      .withIndex("by_status", q => q.eq("status", "success"))
      .collect();

    const startOfMonth = new Date(year, month - 1, 1).getTime();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59).getTime();

    return payments.filter(p => 
      p.createdAt >= startOfMonth && p.createdAt <= endOfMonth
    );
  },
});

export const calculateExpectedAmount = query({
  args: { plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")) },
  handler: async (_, { plan }) => {
    return PLAN_PRICES[plan];
  },
});

export const applyDiscountToPlan = query({
  args: {
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
    discountPercentage: v.number(),
  },
  handler: async (_, { plan, discountPercentage }) => {
    const basePrice = PLAN_PRICES[plan];
    const discount = basePrice * (discountPercentage / 100);
    return Math.max(0, basePrice - discount);
  },
});

export const checkDuplicatePayment = query({
  args: { externalRef: v.string() },
  handler: async (ctx, { externalRef }) => {
    const existing = await ctx.db.query("subscription_payments")
      .withIndex("by_externalRef", q => q.eq("externalRef", externalRef))
      .first();
    return !!existing;
  },
});

export const getPaymentsSummary = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, { userId }) => {
    let payments;
    if (userId) {
      payments = await ctx.db.query("subscription_payments")
        .withIndex("by_user", q => q.eq("userId", userId))
        .collect();
    } else {
      payments = await ctx.db.query("subscription_payments").collect();
    }

    const success = payments.filter(p => p.status === "success");
    const failed = payments.filter(p => p.status === "failed");
    const pending = payments.filter(p => p.status === "pending");

    return {
      total: payments.length,
      success: success.length,
      failed: failed.length,
      pending: pending.length,
      totalRevenue: success.reduce((sum, p) => sum + p.amount, 0),
    };
  },
});

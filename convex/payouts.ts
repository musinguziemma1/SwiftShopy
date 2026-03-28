import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    amount: v.number(),
    currency: v.string(),
    method: v.union(v.literal("mtn_momo"), v.literal("bank_transfer")),
    accountNumber: v.string(),
    accountName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payouts", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.query("payouts")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .order("desc")
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("payouts").order("desc").take(100);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("payouts"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    reference: v.optional(v.string()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const approve = mutation({
  args: { id: v.id("payouts"), adminId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "processing",
      approvedBy: args.adminId,
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getAvailableBalance = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .filter(q => q.eq(q.field("status"), "paid"))
      .collect();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const payouts = await ctx.db.query("payouts")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .filter(q => q.or(
        q.eq(q.field("status"), "completed"),
        q.eq(q.field("status"), "processing")
      ))
      .collect();
    const totalPaidOut = payouts.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, totalRevenue - totalPaidOut);
  },
});

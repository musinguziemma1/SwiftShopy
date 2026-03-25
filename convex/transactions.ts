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
    customerPhone: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => ctx.db.insert("transactions", { ...args, status: "pending" }),
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

export const updateStatus = mutation({
  args: {
    id: v.id("transactions"),
    status: v.union(v.literal("pending"), v.literal("successful"), v.literal("failed")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { id, status, metadata }) => {
    await ctx.db.patch(id, { status, ...(metadata && { metadata }) });
  },
});

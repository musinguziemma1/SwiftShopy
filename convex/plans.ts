import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPlan = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    currency: v.string(),
    interval: v.union(v.literal("monthly"), v.literal("yearly"), v.literal("lifetime")),
    features: v.array(v.string()),
    productLimit: v.optional(v.number()),
    transactionFee: v.optional(v.number()),
    isPopular: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const planId = await ctx.db.insert("subscription_plans", {
      ...args,
      isActive: true,
    });
    return planId;
  },
});

export const updatePlan = mutation({
  args: {
    id: v.id("subscription_plans"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    interval: v.optional(v.union(v.literal("monthly"), v.literal("yearly"), v.literal("lifetime"))),
    features: v.optional(v.array(v.string())),
    productLimit: v.optional(v.number()),
    transactionFee: v.optional(v.number()),
    isPopular: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }
    await ctx.db.patch(id, filteredUpdates);
    return { success: true };
  },
});

export const deletePlan = mutation({
  args: { id: v.id("subscription_plans") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const getPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscription_plans").collect();
  },
});

export const getActivePlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscription_plans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getPlanById = query({
  args: { id: v.id("subscription_plans") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
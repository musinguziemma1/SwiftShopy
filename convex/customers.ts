import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("customers")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .filter(q => q.eq(q.field("phone"), args.phone))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("customers", {
      ...args,
      totalOrders: 0,
      totalSpent: 0,
      tier: "regular",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getByStore = query({
  args: { storeId: v.id("stores"), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let customers = await ctx.db.query("customers")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    if (args.search) {
      const q = args.search.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q)
      );
    }
    return customers.sort((a, b) => b.totalSpent - a.totalSpent);
  },
});

export const getById = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    tier: v.optional(v.union(v.literal("regular"), v.literal("vip"), v.literal("premium"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const incrementStats = mutation({
  args: { id: v.id("customers"), orderTotal: v.number() },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.id);
    if (customer) {
      const newTotal = customer.totalSpent + args.orderTotal;
      const newOrders = customer.totalOrders + 1;
      let tier = customer.tier;
      if (newTotal > 5000000) tier = "premium";
      else if (newTotal > 1000000) tier = "vip";
      await ctx.db.patch(args.id, {
        totalSpent: newTotal,
        totalOrders: newOrders,
        tier,
        updatedAt: Date.now(),
      });
    }
  },
});

export const delete_ = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

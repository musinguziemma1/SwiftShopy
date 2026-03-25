import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db.query("stores").withIndex("by_slug", q => q.eq("slug", slug)).first();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query("stores").withIndex("by_user", q => q.eq("userId", userId)).first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    return await Promise.all(stores.map(async (s) => {
      const owner = await ctx.db.get(s.userId);
      const products = await ctx.db.query("products").withIndex("by_store", q => q.eq("storeId", s._id)).collect();
      const orders = await ctx.db.query("orders").withIndex("by_store", q => q.eq("storeId", s._id)).collect();
      const revenue = orders.filter(o => o.status === "paid").reduce((sum, o) => sum + o.total, 0);
      return { ...s, owner, productCount: products.length, orderCount: orders.length, revenue };
    }));
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    phone: v.string(),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("stores").withIndex("by_slug", q => q.eq("slug", args.slug)).first();
    if (existing) throw new Error("Store slug already taken");
    const userStore = await ctx.db.query("stores").withIndex("by_user", q => q.eq("userId", args.userId)).first();
    if (userStore) throw new Error("You already have a store");
    return await ctx.db.insert("stores", { ...args, isActive: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("stores"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    logo: v.optional(v.string()),
    banner: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => ctx.db.patch(id, updates),
});

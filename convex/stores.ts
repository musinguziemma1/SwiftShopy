import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db.query("stores").withIndex("by_slug", q => q.eq("slug", slug)).first();
  },
});

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const stores = await ctx.db.query("stores").collect();
    return stores.find(s => s.userId === userId) ?? null;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const users = await ctx.db.query("users").collect();
    const user = users.find(u => u.email === email);
    if (!user) return null;
    const stores = await ctx.db.query("stores").collect();
    return stores.find(s => s.userId === user._id) ?? null;
  },
});

export const getById = query({
  args: { id: v.id("stores") },
  handler: async (ctx, { id }) => ctx.db.get(id),
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

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("stores").collect(),
});

export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    phone: v.string(),
    logo: v.optional(v.string()),
    banner: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("stores").withIndex("by_slug", q => q.eq("slug", args.slug)).first();
    if (existing) throw new Error("Store slug already taken");
    return await ctx.db.insert("stores", { ...args, userId: args.userId as any, isActive: true });
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
    slug: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    if (updates.slug) {
      const existing = await ctx.db.query("stores").withIndex("by_slug", q => q.eq("slug", updates.slug!)).first();
      if (existing && existing._id !== id) throw new Error("Store slug already taken");
    }
    return ctx.db.patch(id, updates);
  },
});

export const updateStatus = mutation({
  args: { id: v.id("stores"), isActive: v.boolean() },
  handler: async (ctx, { id, isActive }) => ctx.db.patch(id, { isActive }),
});

export const deleteStore = mutation({
  args: { id: v.id("stores") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});

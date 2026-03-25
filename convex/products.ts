import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByStore = query({
  args: { storeId: v.id("stores"), activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, { storeId, activeOnly }) => {
    const products = await ctx.db.query("products").withIndex("by_store", q => q.eq("storeId", storeId)).collect();
    return activeOnly ? products.filter(p => p.isActive) : products;
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    image: v.optional(v.string()),
    stock: v.number(),
  },
  handler: async (ctx, args) => ctx.db.insert("products", { ...args, isActive: true }),
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    image: v.optional(v.string()),
    stock: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => ctx.db.patch(id, updates),
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});

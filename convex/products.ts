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
    sales: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("products", { ...args, isActive: true, sales: args.sales ?? 0, category: args.category ?? "" }),
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    image: v.optional(v.string()),
    stock: v.optional(v.number()),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => ctx.db.patch(id, updates),
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});

export const toggleActive = mutation({
  args: { id: v.id("products"), isActive: v.boolean() },
  handler: async (ctx, { id, isActive }) => ctx.db.patch(id, { isActive }),
});

export const updateStock = mutation({
  args: { id: v.id("products"), stock: v.number() },
  handler: async (ctx, { id, stock }) => ctx.db.patch(id, { stock }),
});

export const incrementSales = mutation({
  args: { id: v.id("products"), quantity: v.number() },
  handler: async (ctx, { id, quantity }) => {
    const product = await ctx.db.get(id);
    if (product) {
      await ctx.db.patch(id, { sales: (product.sales || 0) + quantity, stock: Math.max(0, product.stock - quantity) });
    }
  },
});

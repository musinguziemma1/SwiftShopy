import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByStore = query({
  args: { storeId: v.id("stores"), limit: v.optional(v.number()) },
  handler: async (ctx, { storeId, limit = 50 }) => {
    return await ctx.db.query("orders").withIndex("by_store", q => q.eq("storeId", storeId)).order("desc").take(limit);
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) => {
    return await ctx.db.query("orders").withIndex("by_orderNumber", q => q.eq("orderNumber", orderNumber)).first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").order("desc").take(100);
    return await Promise.all(orders.map(async (o) => {
      const store = await ctx.db.get(o.storeId);
      return { ...o, store };
    }));
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("orders").collect(),
});

export const getByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { startDate, endDate, limit = 50 }) => {
    let query = ctx.db.query("orders");
    if (startDate) {
      query = query.filter(q => q.gte(q.field("createdAt"), startDate));
    }
    if (endDate) {
      query = query.filter(q => q.lte(q.field("createdAt"), endDate));
    }
    return await query.order("desc").take(limit || 50);
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    orderNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    items: v.array(v.object({
      productId: v.string(),
      productName: v.string(),
      price: v.number(),
      quantity: v.number(),
      total: v.number(),
    })),
    subtotal: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("orders", { ...args, status: "pending", createdAt: Date.now() }),
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("cancelled")),
  },
  handler: async (ctx, { id, status }) => ctx.db.patch(id, { status }),
});

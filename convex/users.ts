import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db.query("users").withIndex("by_email", q => q.eq("email", email)).first();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("seller"), v.literal("admin")),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
    if (existing) throw new Error("Email already registered");
    return await ctx.db.insert("users", { ...args, isActive: true, joinDate: Date.now() });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("users").collect(),
});

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("users").collect(),
});

export const listSellers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const sellers = users.filter(u => u.role === "seller");
    return await Promise.all(sellers.map(async (user) => {
      const store = await ctx.db.query("stores")
        .withIndex("by_user", q => q.eq("userId", user._id))
        .first();
      let products: any[] = [];
      let orders: any[] = [];
      let revenue = 0;
      if (store) {
        products = await ctx.db.query("products")
          .withIndex("by_store", q => q.eq("storeId", store._id))
          .collect();
        orders = await ctx.db.query("orders")
          .withIndex("by_store", q => q.eq("storeId", store._id))
          .collect();
        revenue = orders.filter(o => o.status === "paid").reduce((sum, o) => sum + o.total, 0);
      }
      return {
        ...user,
        storeName: store?.name ?? "No Store",
        storeSlug: store?.slug ?? "",
        productCount: products.length,
        orderCount: orders.length,
        revenue,
      };
    }));
  },
});

export const toggleActive = mutation({
  args: { id: v.id("users"), isActive: v.boolean() },
  handler: async (ctx, { id, isActive }) => ctx.db.patch(id, { isActive }),
});

export const updateRole = mutation({
  args: {
    id: v.id("users"),
    role: v.union(v.literal("seller"), v.literal("admin")),
  },
  handler: async (ctx, { id, role }) => ctx.db.patch(id, { role }),
});

export const delete_ = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => ctx.db.delete(id),
});

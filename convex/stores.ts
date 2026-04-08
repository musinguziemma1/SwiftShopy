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
    
    const now = Date.now();
    const storeId = await ctx.db.insert("stores", { ...args, userId: args.userId as any, isActive: true });
    
    // Get user info for notification
    const user = await ctx.db.get(args.userId as any);
    const userName = user && "name" in user ? user.name : "Unknown";

    // Notify admin about new store
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "store_created",
      title: "New Store Created",
      message: `${args.name} by ${userName} has been created.`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { storeId, storeName: args.name, userId: args.userId },
      createdAt: now,
    });

    // Notify seller about store creation
    await ctx.db.insert("notifications", {
      userId: args.userId,
      storeId,
      type: "store_created",
      title: "Store Created!",
      message: `Your store "${args.name}" has been created successfully. Start adding products!`,
      isRead: false,
      actionUrl: "/dashboard",
      metadata: { storeId, storeName: args.name },
      createdAt: now,
    });

    return storeId;
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
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
    paymentSettings: v.optional(v.object({
      mtnMomo: v.boolean(),
      airtelMoney: v.boolean(),
      cashOnDelivery: v.boolean(),
      bankTransfer: v.boolean(),
    })),
    payoutFrequency: v.optional(v.string()),
    securitySettings: v.optional(v.object({
      twoFactorEnabled: v.boolean(),
      paymentPinEnabled: v.boolean(),
    })),
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

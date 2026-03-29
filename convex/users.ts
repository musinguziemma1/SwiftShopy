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
    const userId = await ctx.db.insert("users", { ...args, isActive: true, joinDate: Date.now() });
    
    const now = Date.now();
    
    // Create free subscription
    await ctx.db.insert("subscriptions", {
      userId,
      storeId: undefined,
      plan: "free",
      status: "active",
      startDate: now,
      endDate: now + 365 * 24 * 60 * 60 * 1000,
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create billing settings with referral code
    const referralCode = "SS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    await ctx.db.insert("billing_settings", {
      userId,
      walletBalance: 0,
      discountEligible: false,
      referralCode,
      referralCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Notify admin about new user registration
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "user_registered",
      title: "New User Registered",
      message: `${args.name} (${args.email}) just signed up as a ${args.role}.`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { userId, email: args.email, role: args.role },
      createdAt: now,
    });

    return userId;
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
  handler: async (ctx, { id, isActive }) => {
    const user = await ctx.db.get(id);
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(id, { isActive });
    
    const now = Date.now();
    const notificationType = isActive ? "user_activated" : "user_suspended";
    
    // Notify admin
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: notificationType,
      title: isActive ? "User Activated" : "User Suspended",
      message: `${user.name} (${user.email}) has been ${isActive ? "activated" : "suspended"}.`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { userId: id, email: user.email },
      createdAt: now,
    });

    // Notify the user
    await ctx.db.insert("notifications", {
      userId: id,
      type: notificationType,
      title: isActive ? "Account Activated" : "Account Suspended",
      message: isActive 
        ? "Your account has been reactivated. You can now access all features." 
        : "Your account has been suspended. Please contact support for assistance.",
      isRead: false,
      metadata: { reason: "Admin action" },
      createdAt: now,
    });
  },
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

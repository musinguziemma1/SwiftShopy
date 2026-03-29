import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export type SubscriptionPlan = "free" | "pro" | "business" | "enterprise";
export type SubscriptionStatus = "active" | "expired" | "cancelled";

export const PLAN_LIMITS: Record<SubscriptionPlan, { productLimit: number; monthlyFee: number; transactionFee: number }> = {
  free: { productLimit: 10, monthlyFee: 0, transactionFee: 4 },
  pro: { productLimit: 25, monthlyFee: 15000, transactionFee: 2.5 },
  business: { productLimit: 38, monthlyFee: 35000, transactionFee: 1.5 },
  enterprise: { productLimit: Infinity, monthlyFee: 60000, transactionFee: 1 },
};

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  free: 0,
  pro: 15000,
  business: 35000,
  enterprise: 60000,
};

export const getPlanLimits = query({
  args: { plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")) },
  handler: async (_, { plan }) => PLAN_LIMITS[plan],
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();
    return subscription;
  },
});

export const getById = query({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_store", q => q.eq("storeId", storeId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();
    return subscription;
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const endDate = args.plan === "free" ? now + 365 * 24 * 60 * 60 * 1000 : now + thirtyDays;

    const existing = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { status: "cancelled", updatedAt: now });
    }

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      storeId: args.storeId,
      plan: args.plan,
      status: "active",
      startDate: now,
      endDate,
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    });

    const user = await ctx.db.get(args.userId);
    await ctx.db.insert("notifications", {
      userId: args.userId,
      storeId: args.storeId,
      type: "subscription_created",
      title: "Subscription Activated",
      message: `Your ${args.plan} subscription has been activated. Welcome to SwiftShopy!`,
      isRead: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: undefined,
      storeId: undefined,
      type: "subscription_created",
      title: `New Subscription - ${user?.email || "Unknown"}`,
      message: `New ${args.plan} subscription created`,
      isRead: false,
      createdAt: Date.now(),
    });

    return subscriptionId;
  },
});

export const upgradePlan = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const endDate = args.plan === "free" ? now + 365 * 24 * 60 * 60 * 1000 : now + thirtyDays;

    const existing = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const notificationType = existing ? "subscription_upgraded" : "subscription_created";

    if (existing) {
      const newEndDate = existing.endDate > now ? existing.endDate + thirtyDays : endDate;
      await ctx.db.patch(existing._id, {
        plan: args.plan,
        status: "active",
        endDate: newEndDate,
        updatedAt: now,
      });

      await ctx.db.insert("notifications", {
        userId: args.userId,
        storeId: args.storeId,
        type: "subscription_upgraded",
        title: "Plan Upgraded",
        message: `Congratulations! You've upgraded to the ${args.plan} plan.`,
        isRead: false,
        createdAt: Date.now(),
      });
      return existing._id;
    }

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      storeId: args.storeId,
      plan: args.plan,
      status: "active",
      startDate: now,
      endDate,
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      storeId: args.storeId,
      type: "subscription_created",
      title: "Subscription Activated",
      message: `Your ${args.plan} subscription has been activated.`,
      isRead: false,
      createdAt: Date.now(),
    });

    return subscriptionId;
  },
});

export const renewSubscription = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
  },
  handler: async (ctx, { userId, plan }) => {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const endDate = plan === "free" ? now + 365 * 24 * 60 * 60 * 1000 : now + thirtyDays;

    const existing = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (existing) {
      const newEndDate = existing.endDate > now ? existing.endDate + thirtyDays : endDate;
      await ctx.db.patch(existing._id, {
        endDate: newEndDate,
        updatedAt: now,
      });

      await ctx.db.insert("notifications", {
        userId,
        type: "subscription_renewed",
        title: "Subscription Renewed",
        message: `Your ${plan} subscription has been renewed successfully.`,
        isRead: false,
        createdAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      userId,
      plan,
      status: "active",
      startDate: now,
      endDate,
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const cancelSubscription = mutation({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, { id }) => {
    const now = Date.now();
    const subscription = await ctx.db.get(id);
    if (subscription) {
      await ctx.db.patch(id, { status: "cancelled", updatedAt: now });
      await ctx.db.insert("notifications", {
        userId: subscription.userId,
        storeId: subscription.storeId,
        type: "subscription_expired",
        title: "Subscription Cancelled",
        message: `Your ${subscription.plan} subscription has been cancelled.`,
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const expireSubscription = mutation({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, { id }) => {
    const now = Date.now();
    const subscription = await ctx.db.get(id);
    if (subscription) {
      await ctx.db.patch(id, { status: "expired", updatedAt: now });
      await ctx.db.insert("notifications", {
        userId: subscription.userId,
        storeId: subscription.storeId,
        type: "subscription_expired",
        title: "Subscription Expired",
        message: `Your ${subscription.plan} subscription has expired. Upgrade to continue enjoying premium features.`,
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const checkAndExpireSubscriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db.query("subscriptions")
      .withIndex("by_status", q => q.eq("status", "active"))
      .collect();

    let expiredCount = 0;
    for (const sub of expired) {
      if (sub.endDate < now) {
        await ctx.db.patch(sub._id, { status: "expired", updatedAt: now });
        expiredCount++;

        await ctx.db.insert("notifications", {
          userId: sub.userId,
          storeId: sub.storeId,
          type: "subscription_expired",
          title: "Subscription Expired",
          message: `Your ${sub.plan} subscription has expired. Upgrade to continue enjoying premium features.`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }
    return { expiredCount };
  },
});

export const getExpiringSubscriptions = query({
  args: { daysAhead: v.optional(v.number()) },
  handler: async (ctx, { daysAhead = 7 }) => {
    const now = Date.now();
    const futureDate = now + daysAhead * 24 * 60 * 60 * 1000;
    
    const subscriptions = await ctx.db.query("subscriptions")
      .withIndex("by_status", q => q.eq("status", "active"))
      .collect();

    return subscriptions.filter(sub => sub.endDate <= futureDate && sub.endDate > now);
  },
});

export const getAllSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscriptions").collect();
  },
});

export const getSubscriptionHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const activateSubscription = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { status: "cancelled", updatedAt: now });
    }

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      storeId: args.storeId,
      plan: args.plan,
      status: "active",
      startDate: args.startDate,
      endDate: args.endDate,
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

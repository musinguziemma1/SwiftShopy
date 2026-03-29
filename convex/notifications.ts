import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
    type: v.union(
      v.literal("order_new"),
      v.literal("order_paid"),
      v.literal("order_failed"),
      v.literal("payment_received"),
      v.literal("product_low_stock"),
      v.literal("product_out_of_stock"),
      v.literal("whatsapp_message"),
      v.literal("whatsapp_connected"),
      v.literal("system_alert"),
      v.literal("sla_breach"),
      v.literal("subscription_created"),
      v.literal("subscription_renewed"),
      v.literal("subscription_expired"),
      v.literal("subscription_upgraded"),
      v.literal("subscription_downgraded"),
      v.literal("payment_pending"),
      v.literal("payment_success"),
      v.literal("payment_failed"),
      v.literal("product_limit_reached"),
      v.literal("referral_bonus"),
      v.literal("usage_discount_applied")
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const getByUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db.query("notifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 20);
    return notifications;
  },
});

export const getByStore = query({
  args: { storeId: v.id("stores"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db.query("notifications")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .order("desc")
      .take(args.limit ?? 20);
    return notifications;
  },
});

export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db.query("notifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("isRead"), false))
      .collect();
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db.query("notifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("isRead"), false))
      .collect();
    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

export const delete_ = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

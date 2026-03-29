import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Create Notification ───────────────────────────────────────────────
export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
    type: v.union(
      v.literal("order_new"),
      v.literal("order_paid"),
      v.literal("order_failed"),
      v.literal("order_updated"),
      v.literal("payment_received"),
      v.literal("product_low_stock"),
      v.literal("product_out_of_stock"),
      v.literal("product_created"),
      v.literal("product_updated"),
      v.literal("whatsapp_message"),
      v.literal("whatsapp_connected"),
      v.literal("system_alert"),
      v.literal("sla_breach"),
      v.literal("user_registered"),
      v.literal("user_suspended"),
      v.literal("user_activated"),
      v.literal("store_created"),
      v.literal("transaction_new"),
      v.literal("customer_inquiry"),
      v.literal("customer_chat"),
      v.literal("payout_requested"),
      v.literal("payout_completed"),
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

// ─── Notify Admin ──────────────────────────────────────────────────────
export const notifyAdmin = mutation({
  args: {
    type: v.union(
      v.literal("order_new"),
      v.literal("order_paid"),
      v.literal("order_failed"),
      v.literal("order_updated"),
      v.literal("payment_received"),
      v.literal("product_low_stock"),
      v.literal("product_out_of_stock"),
      v.literal("product_created"),
      v.literal("product_updated"),
      v.literal("whatsapp_message"),
      v.literal("whatsapp_connected"),
      v.literal("system_alert"),
      v.literal("sla_breach"),
      v.literal("user_registered"),
      v.literal("user_suspended"),
      v.literal("user_activated"),
      v.literal("store_created"),
      v.literal("transaction_new"),
      v.literal("customer_inquiry"),
      v.literal("customer_chat"),
      v.literal("payout_requested"),
      v.literal("payout_completed"),
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
    const now = Date.now();
    
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: args.type,
      title: args.title,
      message: args.message,
      isRead: false,
      actionUrl: args.actionUrl,
      metadata: args.metadata,
      createdAt: now,
    });

    return { success: true };
  },
});

// ─── Notify Seller ─────────────────────────────────────────────────────
export const notifySeller = mutation({
  args: {
    userId: v.string(),
    storeId: v.optional(v.id("stores")),
    type: v.union(
      v.literal("order_new"),
      v.literal("order_paid"),
      v.literal("order_failed"),
      v.literal("order_updated"),
      v.literal("payment_received"),
      v.literal("product_low_stock"),
      v.literal("product_out_of_stock"),
      v.literal("product_created"),
      v.literal("product_updated"),
      v.literal("whatsapp_message"),
      v.literal("whatsapp_connected"),
      v.literal("system_alert"),
      v.literal("sla_breach"),
      v.literal("user_registered"),
      v.literal("user_suspended"),
      v.literal("user_activated"),
      v.literal("store_created"),
      v.literal("transaction_new"),
      v.literal("customer_inquiry"),
      v.literal("customer_chat"),
      v.literal("payout_requested"),
      v.literal("payout_completed"),
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
    const now = Date.now();
    
    await ctx.db.insert("notifications", {
      userId: args.userId,
      storeId: args.storeId,
      type: args.type,
      title: args.title,
      message: args.message,
      isRead: false,
      actionUrl: args.actionUrl,
      metadata: args.metadata,
      createdAt: now,
    });

    return { success: true };
  },
});

// ─── Notify Both Admin and Seller ──────────────────────────────────────
export const notifyBoth = mutation({
  args: {
    sellerId: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
    type: v.union(
      v.literal("order_new"),
      v.literal("order_paid"),
      v.literal("order_failed"),
      v.literal("order_updated"),
      v.literal("payment_received"),
      v.literal("product_low_stock"),
      v.literal("product_out_of_stock"),
      v.literal("product_created"),
      v.literal("product_updated"),
      v.literal("whatsapp_message"),
      v.literal("whatsapp_connected"),
      v.literal("system_alert"),
      v.literal("sla_breach"),
      v.literal("user_registered"),
      v.literal("user_suspended"),
      v.literal("user_activated"),
      v.literal("store_created"),
      v.literal("transaction_new"),
      v.literal("customer_inquiry"),
      v.literal("customer_chat"),
      v.literal("payout_requested"),
      v.literal("payout_completed"),
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
    adminTitle: v.string(),
    adminMessage: v.string(),
    sellerTitle: v.string(),
    sellerMessage: v.string(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("notifications", {
      userId: "admin",
      type: args.type,
      title: args.adminTitle,
      message: args.adminMessage,
      isRead: false,
      actionUrl: args.actionUrl,
      metadata: args.metadata,
      createdAt: now,
    });

    if (args.sellerId) {
      await ctx.db.insert("notifications", {
        userId: args.sellerId,
        storeId: args.storeId,
        type: args.type,
        title: args.sellerTitle,
        message: args.sellerMessage,
        isRead: false,
        actionUrl: args.actionUrl,
        metadata: args.metadata,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

// ─── Query Functions ───────────────────────────────────────────────────
export const getByUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db.query("notifications")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 50);
    return notifications;
  },
});

export const getByStore = query({
  args: { storeId: v.id("stores"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db.query("notifications")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .order("desc")
      .take(args.limit ?? 50);
    return notifications;
  },
});

export const getAllAdmin = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db.query("notifications")
      .withIndex("by_user", q => q.eq("userId", "admin"))
      .order("desc")
      .take(args.limit ?? 100);
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

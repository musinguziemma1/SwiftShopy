import { mutation } from "./_generated/server";
import { v } from "convex/values";

type BillingNotificationType = 
  | "subscription_created"
  | "subscription_renewed"
  | "subscription_expired"
  | "subscription_upgraded"
  | "subscription_downgraded"
  | "payment_pending"
  | "payment_success"
  | "payment_failed"
  | "product_limit_reached"
  | "referral_bonus"
  | "usage_discount_applied";

export const sendSubscriptionNotification = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    type: v.union(
      v.literal("subscription_created"),
      v.literal("subscription_renewed"),
      v.literal("subscription_expired"),
      v.literal("subscription_upgraded"),
      v.literal("subscription_downgraded")
    ),
    plan: v.string(),
    amount: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, storeId, type, plan, amount, endDate } = args;

    const user = await ctx.db.get(userId);
    if (!user) return;

    let title = "";
    let message = "";

    switch (type) {
      case "subscription_created":
        title = "Subscription Activated";
        message = `Your ${plan} subscription has been activated. Welcome to SwiftShopy!`;
        break;
      case "subscription_renewed":
        title = "Subscription Renewed";
        message = `Your ${plan} subscription has been renewed successfully.`;
        break;
      case "subscription_expired":
        title = "Subscription Expired";
        message = `Your ${plan} subscription has expired. Upgrade to continue enjoying premium features.`;
        break;
      case "subscription_upgraded":
        title = "Plan Upgraded";
        message = `Congratulations! You've upgraded to the ${plan} plan.`;
        break;
      case "subscription_downgraded":
        title = "Plan Downgraded";
        message = `Your plan has been downgraded to ${plan}.`;
        break;
    }

    await ctx.db.insert("notifications", {
      userId: userId,
      storeId,
      type,
      title,
      message,
      isRead: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: undefined,
      storeId: undefined,
      type,
      title: `${title} - ${user.name || user.email}`,
      message: `${user.email}: ${message}${amount ? ` Amount: UGX ${amount.toLocaleString()}` : ""}`,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const sendPaymentNotification = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    type: v.union(
      v.literal("payment_pending"),
      v.literal("payment_success"),
      v.literal("payment_failed")
    ),
    amount: v.number(),
    plan: v.string(),
    provider: v.string(),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, storeId, type, amount, plan, provider, failureReason } = args;

    const user = await ctx.db.get(userId);
    if (!user) return;

    let title = "";
    let message = "";

    switch (type) {
      case "payment_pending":
        title = "Payment Pending";
        message = `Your payment of UGX ${amount.toLocaleString()} for ${plan} plan is being processed via ${provider}.`;
        break;
      case "payment_success":
        title = "Payment Successful";
        message = `Your payment of UGX ${amount.toLocaleString()} for ${plan} plan has been confirmed.`;
        break;
      case "payment_failed":
        title = "Payment Failed";
        message = `Your payment of UGX ${amount.toLocaleString()} failed. ${failureReason || "Please try again."}`;
        break;
    }

    await ctx.db.insert("notifications", {
      userId: userId,
      storeId,
      type,
      title,
      message,
      isRead: false,
      createdAt: Date.now(),
    });

    if (type === "payment_failed") {
      await ctx.db.insert("notifications", {
        userId: undefined,
        storeId: undefined,
        type: "payment_failed",
        title: `Payment Failed - ${user.email}`,
        message: `Payment of UGX ${amount.toLocaleString()} for ${plan} failed. ${failureReason || ""}`,
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const sendProductLimitNotification = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    currentCount: v.number(),
    limit: v.number(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, storeId, currentCount, limit, plan } = args;

    const user = await ctx.db.get(userId);
    if (!user) return;

    await ctx.db.insert("notifications", {
      userId,
      storeId,
      type: "product_limit_reached",
      title: "Product Limit Reached",
      message: `You've reached your ${plan} plan limit of ${limit} products. Upgrade to add more products.`,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const sendReferralBonusNotification = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    bonusType: v.string(),
    bonusValue: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, storeId, bonusType, bonusValue } = args;

    const user = await ctx.db.get(userId);
    if (!user) return;

    let message = "";
    if (bonusType === "free_month") {
      message = `You've earned 1 month free subscription!`;
    } else if (bonusType === "discount") {
      message = `You've earned ${bonusValue}% discount on your next subscription!`;
    } else {
      message = `You've earned UGX ${bonusValue.toLocaleString()} as referral reward!`;
    }

    await ctx.db.insert("notifications", {
      userId,
      storeId,
      type: "referral_bonus",
      title: "Referral Bonus Earned!",
      message,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const sendUsageDiscountNotification = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    discountPercentage: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, storeId, discountPercentage, reason } = args;

    const user = await ctx.db.get(userId);
    if (!user) return;

    await ctx.db.insert("notifications", {
      userId,
      storeId,
      type: "usage_discount_applied",
      title: "Usage Discount Applied!",
      message: `You've qualified for a ${discountPercentage}% discount: ${reason}`,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

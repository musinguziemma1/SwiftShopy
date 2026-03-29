import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_LIMITS, PLAN_PRICES, type SubscriptionPlan } from "./subscriptions";

// ─── Feature Access Map ────────────────────────────────────────────────
const FEATURE_ACCESS: Record<string, { plans: SubscriptionPlan[]; description: string }> = {
  // Store & Products
  customStoreLink: { plans: ["pro", "business", "enterprise"], description: "Custom branded store URL" },
  bulkProductUpload: { plans: ["business", "enterprise"], description: "Upload products in bulk" },
  inventoryManagement: { plans: ["business", "enterprise"], description: "Track stock levels and alerts" },
  whiteLabel: { plans: ["enterprise"], description: "Remove all SwiftShopy branding" },

  // Payments
  autoPaymentConfirmation: { plans: ["pro", "business", "enterprise"], description: "Auto-confirm payments" },
  priorityPaymentProcessing: { plans: ["enterprise"], description: "Faster payment processing" },

  // Analytics
  basicDashboard: { plans: ["free", "pro", "business", "enterprise"], description: "Basic sales & orders" },
  dailyWeeklyAnalytics: { plans: ["pro", "business", "enterprise"], description: "Daily & weekly reports" },
  monthlyTrendsAnalytics: { plans: ["business", "enterprise"], description: "Monthly trend reports" },
  customerInsights: { plans: ["pro", "business", "enterprise"], description: "Customer behavior analytics" },
  exportReports: { plans: ["business", "enterprise"], description: "Export PDF/CSV reports" },

  // Marketing
  promotionalTools: { plans: ["pro", "business", "enterprise"], description: "Run promotions" },
  discountCoupons: { plans: ["business", "enterprise"], description: "Create discount codes" },
  customerTagging: { plans: ["business", "enterprise"], description: "Tag customers (VIP, repeat)" },

  // Support
  prioritySupport: { plans: ["business", "enterprise"], description: "Priority customer support" },
  dedicatedAccountManager: { plans: ["enterprise"], description: "Dedicated support manager" },
  apiAccess: { plans: ["enterprise"], description: "Full API access" },
  multiUserAccounts: { plans: ["enterprise"], description: "Team member accounts" },
  multiStoreManagement: { plans: ["enterprise"], description: "Manage multiple stores" },
};

export const getUserSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();
    return subscription;
  },
});

export const getUserPlan = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();
    return subscription?.plan ?? "free";
  },
});

export const checkProductLimit = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan ?? "free";
    const limit = PLAN_LIMITS[plan].productLimit;

    const stores = await ctx.db.query("stores").collect();
    const store = stores.find(s => s.userId === userId);
    
    if (!store) {
      return { canCreate: true, currentCount: 0, limit, plan };
    }

    const products = await ctx.db.query("products")
      .withIndex("by_store", q => q.eq("storeId", store._id))
      .collect();

    const currentCount = products.length;
    const canCreate = limit === Infinity || currentCount < limit;

    return { canCreate, currentCount, limit, plan };
  },
});

export const enforceProductLimit = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan ?? "free";
    const limit = PLAN_LIMITS[plan].productLimit;

    const stores = await ctx.db.query("stores").collect();
    const store = stores.find(s => s.userId === userId);
    
    if (!store) return { allowed: true, reason: undefined };

    const products = await ctx.db.query("products")
      .withIndex("by_store", q => q.eq("storeId", store._id))
      .collect();

    const currentCount = products.length;

    if (limit !== Infinity && currentCount >= limit) {
      return {
        allowed: false,
        reason: `Product limit reached. Your ${plan} plan allows ${limit} products. Upgrade to add more.`,
        currentCount,
        limit,
        plan,
      };
    }

    return { allowed: true, reason: undefined, currentCount, limit, plan };
  },
});

export const checkAndNotifyProductLimit = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan ?? "free";
    const limit = PLAN_LIMITS[plan].productLimit;

    const stores = await ctx.db.query("stores").collect();
    const store = stores.find(s => s.userId === userId);
    
    if (!store) return { notified: false };

    const products = await ctx.db.query("products")
      .withIndex("by_store", q => q.eq("storeId", store._id))
      .collect();

    const currentCount = products.length;

    if (limit !== Infinity && currentCount >= limit) {
      const existingNotification = await ctx.db.query("notifications")
        .withIndex("by_user", q => q.eq("userId", userId))
        .filter(q => q.eq(q.field("type"), "product_limit_reached"))
        .order("desc")
        .first();

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (!existingNotification || existingNotification.createdAt < oneDayAgo) {
        await ctx.db.insert("notifications", {
          userId,
          storeId: store._id,
          type: "product_limit_reached",
          title: "Product Limit Reached",
          message: `You've reached your ${plan} plan limit of ${limit} products. Upgrade to add more products.`,
          isRead: false,
          createdAt: Date.now(),
        });
        return { notified: true, currentCount, limit, plan };
      }
    }

    return { notified: false, currentCount, limit, plan };
  },
});

export const getTransactionFee = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan ?? "free";
    return PLAN_LIMITS[plan].transactionFee;
  },
});

export const calculateTransactionFee = query({
  args: { userId: v.id("users"), amount: v.number() },
  handler: async (ctx, { userId, amount }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan ?? "free";
    const feePercentage = PLAN_LIMITS[plan].transactionFee;
    const fee = amount * (feePercentage / 100);
    const netAmount = amount - fee;

    return {
      grossAmount: amount,
      feePercentage,
      fee,
      netAmount,
      plan,
    };
  },
});

export const canAccessPremiumFeature = query({
  args: { userId: v.id("users"), feature: v.string() },
  handler: async (ctx, { userId, feature }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan ?? "free";

    const premiumFeatures: Record<string, SubscriptionPlan[]> = {
      unlimitedProducts: ["enterprise"],
      analytics: ["pro", "business", "enterprise"],
      whatsappIntegration: ["pro", "business", "enterprise"],
      prioritySupport: ["business", "enterprise"],
      customDomain: ["business", "enterprise"],
      apiAccess: ["enterprise"],
      bulkImport: ["business", "enterprise"],
      advancedReporting: ["business", "enterprise"],
    };

    const requiredPlans = premiumFeatures[feature] || [];
    if (requiredPlans.length === 0) return { allowed: true, reason: undefined };

    const planHierarchy: SubscriptionPlan[] = ["free", "pro", "business", "enterprise"];
    const userPlanIndex = planHierarchy.indexOf(plan);
    const allowed = requiredPlans.some(required => 
      planHierarchy.indexOf(required) <= userPlanIndex
    );

    return {
      allowed,
      reason: allowed ? undefined : `This feature requires ${requiredPlans.join(" or ")} plan`,
      currentPlan: plan,
    };
  },
});

export const getUserBillingInfo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan ?? "free";
    const limits = PLAN_LIMITS[plan];

    const stores = await ctx.db.query("stores").collect();
    const store = stores.find(s => s.userId === userId);
    
    let productCount = 0;
    if (store) {
      const products = await ctx.db.query("products")
        .withIndex("by_store", q => q.eq("storeId", store._id))
        .collect();
      productCount = products.length;
    }

    const payments = await ctx.db.query("subscription_payments")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "success"))
      .collect();

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      plan,
      status: subscription?.status ?? "expired",
      startDate: subscription?.startDate,
      endDate: subscription?.endDate,
      productLimit: limits.productLimit,
      productCount,
      transactionFee: limits.transactionFee,
      monthlyFee: limits.monthlyFee,
      totalPaid,
      daysRemaining: subscription?.endDate 
        ? Math.max(0, Math.ceil((subscription.endDate - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0,
    };
  },
});

export const trackUsage = mutation({
  args: {
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    transactionAmount: v.number(),
  },
  handler: async (ctx, { userId, storeId, transactionAmount }) => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" }).toLowerCase();
    const year = now.getFullYear();

    const existing = await ctx.db.query("usage_tracking")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("month"), month))
      .filter(q => q.eq(q.field("year"), year))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalTransactionAmount: existing.totalTransactionAmount + transactionAmount,
        transactionCount: existing.transactionCount + 1,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("usage_tracking", {
        userId,
        storeId,
        month,
        year,
        totalTransactionAmount: transactionAmount,
        transactionCount: 1,
        platformFee: 0,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const getUsageStats = query({
  args: { userId: v.id("users"), month: v.optional(v.string()), year: v.optional(v.number()) },
  handler: async (ctx, { userId, month, year }) => {
    const now = new Date();
    const targetMonth = month ?? now.toLocaleString("en-US", { month: "short" }).toLowerCase();
    const targetYear = year ?? now.getFullYear();

    const usage = await ctx.db.query("usage_tracking")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("month"), targetMonth))
      .filter(q => q.eq(q.field("year"), targetYear))
      .first();

    return usage ?? {
      totalTransactionAmount: 0,
      transactionCount: 0,
      month: targetMonth,
      year: targetYear,
    };
  },
});

export const checkUsageDiscountEligibility = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" }).toLowerCase();
    const year = now.getFullYear();

    const usage = await ctx.db.query("usage_tracking")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("month"), month))
      .filter(q => q.eq(q.field("year"), year))
      .first();

    const isEligible = (usage?.totalTransactionAmount ?? 0) > 2000000;

    return {
      eligible: isEligible,
      currentAmount: usage?.totalTransactionAmount ?? 0,
      threshold: 2000000,
      discountPercentage: isEligible ? 10 : 0,
    };
  },
});

export const applyUsageDiscount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" }).toLowerCase();
    const year = now.getFullYear();

    const usage = await ctx.db.query("usage_tracking")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("month"), month))
      .filter(q => q.eq(q.field("year"), year))
      .first();

    const isEligible = (usage?.totalTransactionAmount ?? 0) > 2000000;

    if (!isEligible) {
      return { applied: false, reason: "Not eligible for usage discount" };
    }

    const billingSettings = await ctx.db.query("billing_settings")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (!billingSettings) {
      return { applied: false, reason: "No billing settings found" };
    }

    const lastDiscountApplied = billingSettings.lastDiscountApplied || 0;
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (lastDiscountApplied > oneMonthAgo) {
      return { applied: false, reason: "Discount already applied this month" };
    }

    await ctx.db.patch(billingSettings._id, {
      discountEligible: true,
      discountPercentage: 10,
      discountReason: "High monthly transaction volume",
      lastDiscountApplied: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId,
      storeId: undefined,
      type: "usage_discount_applied",
      title: "Usage Discount Applied!",
      message: `You've qualified for a 10% discount on your next subscription: High monthly transaction volume`,
      isRead: false,
      createdAt: Date.now(),
    });

    return { applied: true, discountPercentage: 10 };
  },
});

export const initFreeSubscription = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (!existing) {
      await ctx.db.insert("subscriptions", {
        userId,
        storeId: undefined,
        plan: "free",
        status: "active",
        startDate: Date.now(),
        endDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
        autoRenew: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const downgradeToFree = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = Date.now();

    const existing = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (existing && existing.plan !== "free") {
      await ctx.db.patch(existing._id, { 
        status: "expired",
        updatedAt: now 
      });

      await ctx.db.insert("subscriptions", {
        userId,
        storeId: existing.storeId,
        plan: "free",
        status: "active",
        startDate: now,
        endDate: now + 365 * 24 * 60 * 60 * 1000,
        autoRenew: false,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("notifications", {
        userId,
        storeId: existing.storeId,
        type: "subscription_downgraded",
        title: "Plan Downgraded",
        message: "Your plan has been downgraded to Free. Upgrade anytime to regain premium features.",
        isRead: false,
        createdAt: now,
      });
    }
  },
});

// ─── Enhanced Feature Access Check ─────────────────────────────────────
export const checkFeatureAccess = query({
  args: { userId: v.id("users"), featureKey: v.string() },
  handler: async (ctx, { userId, featureKey }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan ?? "free";
    const feature = FEATURE_ACCESS[featureKey];

    if (!feature) {
      return { allowed: true, plan, reason: undefined, upgradeRequired: undefined };
    }

    const allowed = feature.plans.includes(plan);
    const requiredPlans = feature.plans;

    return {
      allowed,
      plan,
      reason: allowed ? undefined : `This feature requires ${requiredPlans[0]} plan or higher`,
      upgradeRequired: allowed ? undefined : requiredPlans[0],
      featureDescription: feature.description,
    };
  },
});

export const getAvailableFeatures = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan ?? "free";

    const features = Object.entries(FEATURE_ACCESS).map(([key, feature]) => ({
      key,
      name: feature.description,
      allowed: feature.plans.includes(plan),
      requiredPlan: feature.plans.includes(plan) ? null : feature.plans[0],
    }));

    return { plan, features };
  },
});

// ─── Subscription Initiation (for payment flow) ────────────────────────
export const initiateSubscription = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("pro"), v.literal("business"), v.literal("enterprise")),
    phone: v.string(),
    provider: v.union(v.literal("mtn_momo"), v.literal("airtel_money")),
  },
  handler: async (ctx, { userId, plan, phone, provider }) => {
    const now = Date.now();

    // Check for existing pending payment
    const pendingPayment = await ctx.db.query("subscription_payments")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "pending"))
      .first();

    if (pendingPayment) {
      return {
        success: false,
        error: "You have a pending payment. Please complete or wait for it to expire.",
        paymentId: pendingPayment._id,
      };
    }

    // Get plan price
    const amount = PLAN_PRICES[plan];

    // Generate unique external reference
    const externalRef = `SS-${plan.toUpperCase()}-${now}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create payment record
    const paymentId = await ctx.db.insert("subscription_payments", {
      userId,
      subscriptionId: undefined,
      amount,
      currency: "UGX",
      phone,
      plan,
      status: "pending",
      provider,
      providerRef: undefined,
      externalRef,
      failureReason: undefined,
      createdAt: now,
      processedAt: undefined,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      type: "payment_pending",
      title: "Payment Initiated",
      message: `Your ${plan} plan payment of UGX ${amount.toLocaleString()} is being processed. Check your phone to confirm.`,
      isRead: false,
      createdAt: now,
    });

    return {
      success: true,
      paymentId,
      externalRef,
      amount,
      plan,
      provider,
      phone,
    };
  },
});

// ─── Confirm Subscription (called after payment success) ───────────────
export const confirmSubscription = mutation({
  args: {
    paymentId: v.id("subscription_payments"),
    providerRef: v.string(),
  },
  handler: async (ctx, { paymentId, providerRef }) => {
    const now = Date.now();

    const payment = await ctx.db.get(paymentId);
    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    if (payment.status !== "pending") {
      return { success: false, error: `Payment already ${payment.status}` };
    }

    // Update payment status
    await ctx.db.patch(paymentId, {
      status: "success",
      providerRef,
      processedAt: now,
    });

    // Get or create subscription
    const existingSub = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", payment.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const endDate = payment.plan === "free" ? now + 365 * 24 * 60 * 60 * 1000 : now + thirtyDays;

    if (existingSub) {
      // Upgrade existing subscription
      const oldPlan = existingSub.plan;
      await ctx.db.patch(existingSub._id, {
        plan: payment.plan,
        endDate: existingSub.endDate > now ? existingSub.endDate + thirtyDays : endDate,
        updatedAt: now,
      });

      await ctx.db.patch(paymentId, { subscriptionId: existingSub._id });

      // Send upgrade notification
      await ctx.db.insert("notifications", {
        userId: payment.userId,
        storeId: existingSub.storeId,
        type: "subscription_upgraded",
        title: "Plan Upgraded!",
        message: `Your plan has been upgraded from ${oldPlan} to ${payment.plan}. Enjoy your new features!`,
        isRead: false,
        createdAt: now,
      });
    } else {
      // Create new subscription
      const subscriptionId = await ctx.db.insert("subscriptions", {
        userId: payment.userId,
        storeId: undefined,
        plan: payment.plan,
        status: "active",
        startDate: now,
        endDate,
        autoRenew: false,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.patch(paymentId, { subscriptionId });

      await ctx.db.insert("notifications", {
        userId: payment.userId,
        type: "subscription_created",
        title: "Subscription Activated!",
        message: `Your ${payment.plan} subscription is now active. Welcome to SwiftShopy!`,
        isRead: false,
        createdAt: now,
      });
    }

    return { success: true, plan: payment.plan };
  },
});

// ─── Renew Subscription ────────────────────────────────────────────────
export const renewSubscription = mutation({
  args: {
    userId: v.id("users"),
    phone: v.string(),
    provider: v.union(v.literal("mtn_momo"), v.literal("airtel_money")),
  },
  handler: async (ctx, { userId, phone, provider }) => {
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (!subscription) {
      return { success: false, error: "No active subscription found" };
    }

    if (subscription.plan === "free") {
      return { success: false, error: "Free plan does not require renewal" };
    }

    const amount = PLAN_PRICES[subscription.plan];
    const now = Date.now();
    const externalRef = `SS-RENEW-${now}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const paymentId = await ctx.db.insert("subscription_payments", {
      userId,
      subscriptionId: subscription._id,
      amount,
      currency: "UGX",
      phone,
      plan: subscription.plan,
      status: "pending",
      provider,
      providerRef: undefined,
      externalRef,
      failureReason: undefined,
      createdAt: now,
      processedAt: undefined,
    });

    await ctx.db.insert("notifications", {
      userId,
      type: "payment_pending",
      title: "Renewal Payment Initiated",
      message: `Your ${subscription.plan} plan renewal of UGX ${amount.toLocaleString()} is being processed.`,
      isRead: false,
      createdAt: now,
    });

    return { success: true, paymentId, externalRef, amount, plan: subscription.plan };
  },
});

// ─── Process Subscription Payment Success (called by webhook) ──────────
export const processSubscriptionWebhook = mutation({
  args: {
    externalRef: v.string(),
    providerRef: v.string(),
    status: v.union(v.literal("success"), v.literal("failed")),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, { externalRef, providerRef, status, failureReason }) => {
    const payment = await ctx.db.query("subscription_payments")
      .withIndex("by_externalRef", q => q.eq("externalRef", externalRef))
      .first();

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    if (payment.status !== "pending") {
      return { success: false, error: `Payment already ${payment.status}` };
    }

    if (status === "success") {
      return await confirmSubscriptionHandler(ctx, payment._id, providerRef);
    } else {
      await ctx.db.patch(payment._id, {
        status: "failed",
        failureReason: failureReason || "Payment failed",
        processedAt: Date.now(),
      });

      await ctx.db.insert("notifications", {
        userId: payment.userId,
        type: "payment_failed",
        title: "Payment Failed",
        message: `Your payment of UGX ${payment.amount.toLocaleString()} failed. ${failureReason || "Please try again."}`,
        isRead: false,
        createdAt: Date.now(),
      });

      return { success: false, error: "Payment failed" };
    }
  },
});

// Helper function for subscription confirmation
async function confirmSubscriptionHandler(ctx: any, paymentId: string, providerRef: string) {
  const now = Date.now();
  const payment = await ctx.db.get(paymentId);

  await ctx.db.patch(paymentId, {
    status: "success",
    providerRef,
    processedAt: now,
  });

  const existingSub = await ctx.db.query("subscriptions")
    .withIndex("by_user", q => q.eq("userId", payment.userId))
    .filter(q => q.eq(q.field("status"), "active"))
    .first();

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const endDate = now + thirtyDays;

  if (existingSub) {
    await ctx.db.patch(existingSub._id, {
      plan: payment.plan,
      endDate: existingSub.endDate > now ? existingSub.endDate + thirtyDays : endDate,
      updatedAt: now,
    });
    await ctx.db.patch(paymentId, { subscriptionId: existingSub._id });
  } else {
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: payment.userId,
      storeId: undefined,
      plan: payment.plan,
      status: "active",
      startDate: now,
      endDate,
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(paymentId, { subscriptionId });
  }

  await ctx.db.insert("notifications", {
    userId: payment.userId,
    type: "subscription_created",
    title: "Payment Confirmed!",
    message: `Your ${payment.plan} subscription is now active.`,
    isRead: false,
    createdAt: now,
  });

  return { success: true, plan: payment.plan };
}

// ─── Get Plan Limits ──────────────────────────────────────────────────
export const getAllPlanLimits = query({
  args: {},
  handler: () => {
    return Object.entries(PLAN_LIMITS).map(([plan, limits]) => ({
      plan,
      ...limits,
      monthlyFee: limits.monthlyFee === 0 ? "Free" : `UGX ${limits.monthlyFee.toLocaleString()}`,
    }));
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Get All Promotions ────────────────────────────────────────────────
export const getAllPromotions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("promotions")
      .order("desc")
      .collect();
  },
});

// ─── Get Active Promotions ─────────────────────────────────────────────
export const getActivePromotions = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const promotions = await ctx.db.query("promotions")
      .withIndex("by_active", q => q.eq("isActive", true))
      .collect();
    
    return promotions.filter(p => {
      if (p.endDate && p.endDate < now) return false;
      if (p.maxRedemptions && p.currentRedemptions >= p.maxRedemptions) return false;
      return true;
    });
  },
});

// ─── Get Promotion by ID ───────────────────────────────────────────────
export const getPromotionById = query({
  args: { id: v.id("promotions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ─── Get Promotions by Type ────────────────────────────────────────────
export const getPromotionsByType = query({
  args: { type: v.union(
    v.literal("referral"),
    v.literal("performance"),
    v.literal("loyalty"),
    v.literal("annual"),
    v.literal("custom")
  )},
  handler: async (ctx, { type }) => {
    return await ctx.db.query("promotions")
      .withIndex("by_type", q => q.eq("type", type))
      .order("desc")
      .collect();
  },
});

// ─── Create Promotion ──────────────────────────────────────────────────
export const createPromotion = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("referral"),
      v.literal("performance"),
      v.literal("loyalty"),
      v.literal("annual"),
      v.literal("custom")
    ),
    rewardType: v.union(
      v.literal("free_month"),
      v.literal("discount_percentage"),
      v.literal("discount_fixed"),
      v.literal("cash_reward")
    ),
    rewardValue: v.number(),
    triggerCondition: v.object({
      type: v.union(
        v.literal("referral_count"),
        v.literal("transaction_volume"),
        v.literal("subscription_months"),
        v.literal("manual")
      ),
      threshold: v.number(),
      period: v.optional(v.union(v.literal("monthly"), v.literal("yearly"), v.literal("total"))),
    }),
    isActive: v.boolean(),
    maxRedemptions: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const promotionId = await ctx.db.insert("promotions", {
      ...args,
      currentRedemptions: 0,
      createdAt: now,
      updatedAt: now,
    });

    return promotionId;
  },
});

// ─── Update Promotion ──────────────────────────────────────────────────
export const updatePromotion = mutation({
  args: {
    id: v.id("promotions"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("referral"),
      v.literal("performance"),
      v.literal("loyalty"),
      v.literal("annual"),
      v.literal("custom")
    )),
    rewardType: v.optional(v.union(
      v.literal("free_month"),
      v.literal("discount_percentage"),
      v.literal("discount_fixed"),
      v.literal("cash_reward")
    )),
    rewardValue: v.optional(v.number()),
    triggerCondition: v.optional(v.object({
      type: v.union(
        v.literal("referral_count"),
        v.literal("transaction_volume"),
        v.literal("subscription_months"),
        v.literal("manual")
      ),
      threshold: v.number(),
      period: v.optional(v.union(v.literal("monthly"), v.literal("yearly"), v.literal("total"))),
    })),
    isActive: v.optional(v.boolean()),
    maxRedemptions: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const promotion = await ctx.db.get(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ─── Delete Promotion ──────────────────────────────────────────────────
export const deletePromotion = mutation({
  args: { id: v.id("promotions") },
  handler: async (ctx, { id }) => {
    const promotion = await ctx.db.get(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }

    await ctx.db.delete(id);
    return { success: true };
  },
});

// ─── Toggle Promotion Status ───────────────────────────────────────────
export const togglePromotionStatus = mutation({
  args: { id: v.id("promotions") },
  handler: async (ctx, { id }) => {
    const promotion = await ctx.db.get(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }

    await ctx.db.patch(id, {
      isActive: !promotion.isActive,
      updatedAt: Date.now(),
    });

    return { success: true, isActive: !promotion.isActive };
  },
});

// ─── Redeem Promotion ──────────────────────────────────────────────────
export const redeemPromotion = mutation({
  args: {
    promotionId: v.id("promotions"),
    userId: v.id("users"),
  },
  handler: async (ctx, { promotionId, userId }) => {
    const promotion = await ctx.db.get(promotionId);
    if (!promotion) {
      return { success: false, error: "Promotion not found" };
    }

    if (!promotion.isActive) {
      return { success: false, error: "Promotion is not active" };
    }

    const now = Date.now();
    if (promotion.endDate && promotion.endDate < now) {
      return { success: false, error: "Promotion has expired" };
    }

    if (promotion.maxRedemptions && promotion.currentRedemptions >= promotion.maxRedemptions) {
      return { success: false, error: "Promotion redemption limit reached" };
    }

    await ctx.db.patch(promotionId, {
      currentRedemptions: promotion.currentRedemptions + 1,
      updatedAt: now,
    });

    if (promotion.rewardType === "free_month") {
      const subscription = await ctx.db.query("subscriptions")
        .withIndex("by_user", q => q.eq("userId", userId))
        .filter(q => q.eq(q.field("status"), "active"))
        .first();

      if (subscription) {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        await ctx.db.patch(subscription._id, {
          endDate: subscription.endDate + thirtyDays,
          updatedAt: now,
        });
      }
    } else if (promotion.rewardType === "discount_percentage") {
      const billingSettings = await ctx.db.query("billing_settings")
        .withIndex("by_user", q => q.eq("userId", userId))
        .first();

      if (billingSettings) {
        await ctx.db.patch(billingSettings._id, {
          discountEligible: true,
          discountPercentage: promotion.rewardValue,
          discountReason: promotion.name,
          lastDiscountApplied: now,
          updatedAt: now,
        });
      }
    }

    await ctx.db.insert("notifications", {
      userId,
      type: "referral_bonus",
      title: "Promotion Reward!",
      message: `You've earned a reward from "${promotion.name}": ${
        promotion.rewardType === "free_month" ? "1 month free subscription" :
        promotion.rewardType === "discount_percentage" ? `${promotion.rewardValue}% discount` :
        promotion.rewardType === "discount_fixed" ? `UGX ${promotion.rewardValue.toLocaleString()} discount` :
        `UGX ${promotion.rewardValue.toLocaleString()} cash reward`
      }`,
      isRead: false,
      createdAt: now,
    });

    return { success: true, rewardType: promotion.rewardType, rewardValue: promotion.rewardValue };
  },
});

// ─── Check User Eligibility for Promotions ─────────────────────────────
export const checkUserPromotionEligibility = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const activePromotions = await ctx.db.query("promotions")
      .withIndex("by_active", q => q.eq("isActive", true))
      .collect();

    const now = Date.now();
    const eligiblePromotions = [];

    for (const promo of activePromotions) {
      if (promo.endDate && promo.endDate < now) continue;
      if (promo.maxRedemptions && promo.currentRedemptions >= promo.maxRedemptions) continue;

      let eligible = false;
      let currentValue = 0;

      if (promo.triggerCondition.type === "referral_count") {
        const settings = await ctx.db.query("billing_settings")
          .withIndex("by_user", q => q.eq("userId", userId))
          .first();
        currentValue = settings?.referralCount || 0;
        eligible = currentValue >= promo.triggerCondition.threshold;
      } else if (promo.triggerCondition.type === "transaction_volume") {
        const month = new Date().toLocaleString("en-US", { month: "short" }).toLowerCase();
        const year = new Date().getFullYear();
        const usage = await ctx.db.query("usage_tracking")
          .withIndex("by_user", q => q.eq("userId", userId))
          .filter(q => q.eq(q.field("month"), month))
          .filter(q => q.eq(q.field("year"), year))
          .first();
        currentValue = usage?.totalTransactionAmount || 0;
        eligible = currentValue >= promo.triggerCondition.threshold;
      } else if (promo.triggerCondition.type === "subscription_months") {
        const subscription = await ctx.db.query("subscriptions")
          .withIndex("by_user", q => q.eq("userId", userId))
          .filter(q => q.eq(q.field("status"), "active"))
          .first();
        if (subscription) {
          const monthsActive = Math.floor((now - subscription.createdAt) / (30 * 24 * 60 * 60 * 1000));
          currentValue = monthsActive;
          eligible = monthsActive >= promo.triggerCondition.threshold;
        }
      }

      eligiblePromotions.push({
        ...promo,
        eligible,
        currentValue,
        threshold: promo.triggerCondition.threshold,
      });
    }

    return eligiblePromotions;
  },
});

// ─── Get Promotion Stats ───────────────────────────────────────────────
export const getPromotionStats = query({
  args: {},
  handler: async (ctx) => {
    const promotions = await ctx.db.query("promotions").collect();
    const active = promotions.filter(p => p.isActive);
    const totalRedemptions = promotions.reduce((sum, p) => sum + p.currentRedemptions, 0);

    return {
      total: promotions.length,
      active: active.length,
      totalRedemptions,
      byType: {
        referral: promotions.filter(p => p.type === "referral").length,
        performance: promotions.filter(p => p.type === "performance").length,
        loyalty: promotions.filter(p => p.type === "loyalty").length,
        annual: promotions.filter(p => p.type === "annual").length,
        custom: promotions.filter(p => p.type === "custom").length,
      },
    };
  },
});

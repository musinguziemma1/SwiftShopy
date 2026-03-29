import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "SS-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const createReferralCode = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db.query("billing_settings")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (existing) {
      return existing.referralCode;
    }

    let code = generateReferralCode();
    let unique = false;
    while (!unique) {
      const existingCode = await ctx.db.query("billing_settings")
        .withIndex("by_referral_code", q => q.eq("referralCode", code))
        .first();
      if (!existingCode) {
        unique = true;
      } else {
        code = generateReferralCode();
      }
    }

    const now = Date.now();
    await ctx.db.insert("billing_settings", {
      userId,
      walletBalance: 0,
      discountEligible: false,
      referralCode: code,
      referralCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return code;
  },
});

export const getReferralCode = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const settings = await ctx.db.query("billing_settings")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (!settings) {
      return null;
    }

    return settings.referralCode;
  },
});

export const getReferralCodeByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db.query("billing_settings")
      .withIndex("by_referral_code", q => q.eq("referralCode", code))
      .first();
  },
});

export const createReferral = mutation({
  args: {
    referrerUserId: v.id("users"),
    referrerCode: v.string(),
    referredUserEmail: v.string(),
  },
  handler: async (ctx, { referrerUserId, referrerCode, referredUserEmail }) => {
    const referrer = await ctx.db.query("billing_settings")
      .withIndex("by_user", q => q.eq("userId", referrerUserId))
      .first();

    if (!referrer || referrer.referralCode !== referrerCode) {
      throw new Error("Invalid referral code");
    }

    const existingReferral = await ctx.db.query("referrals")
      .withIndex("by_referrer", q => q.eq("referrerUserId", referrerUserId))
      .filter(q => q.eq(q.field("referredUserEmail"), referredUserEmail))
      .first();

    if (existingReferral) {
      throw new Error("Email already referred");
    }

    return await ctx.db.insert("referrals", {
      referrerUserId,
      referrerUserCode: referrerCode,
      referredUserId: undefined,
      referredUserEmail,
      status: "pending",
      rewardGranted: false,
      createdAt: Date.now(),
    });
  },
});

export const completeReferral = mutation({
  args: {
    referralId: v.id("referrals"),
    referredUserId: v.id("users"),
  },
  handler: async (ctx, { referralId, referredUserId }) => {
    const referral = await ctx.db.get(referralId);
    if (!referral || referral.status !== "pending") {
      throw new Error("Invalid referral");
    }

    await ctx.db.patch(referralId, {
      referredUserId,
      status: "completed",
      completedAt: Date.now(),
    });

    const billingSettings = await ctx.db.query("billing_settings")
      .withIndex("by_user", q => q.eq("userId", referral.referrerUserId))
      .first();
    
    if (billingSettings) {
      await ctx.db.patch(billingSettings._id, {
        referralCount: (billingSettings.referralCount || 0) + 1,
      });
    }
  },
});

export const grantReferralReward = mutation({
  args: { referralId: v.id("referrals"), rewardType: v.union(v.literal("free_month"), v.literal("discount"), v.literal("cash")), rewardAmount: v.optional(v.number()) },
  handler: async (ctx, { referralId, rewardType, rewardAmount }) => {
    const referral = await ctx.db.get(referralId);
    if (!referral || referral.status !== "completed") {
      throw new Error("Invalid referral");
    }

    await ctx.db.patch(referralId, {
      rewardGranted: true,
      rewardType,
      rewardAmount,
    });

    if (rewardType === "free_month") {
      const referrerSubscription = await ctx.db.query("subscriptions")
        .withIndex("by_user", q => q.eq("userId", referral.referrerUserId))
        .filter(q => q.eq(q.field("status"), "active"))
        .first();

      if (referrerSubscription) {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        await ctx.db.patch(referrerSubscription._id, {
          endDate: referrerSubscription.endDate + thirtyDays,
          updatedAt: Date.now(),
        });
      }
    }

    let message = "";
    if (rewardType === "free_month") {
      message = "You've earned 1 month free subscription!";
    } else if (rewardType === "discount") {
      message = `You've earned ${rewardAmount || 0}% discount on your next subscription!`;
    } else {
      message = `You've earned UGX ${(rewardAmount || 0).toLocaleString()} as referral reward!`;
    }

    await ctx.db.insert("notifications", {
      userId: referral.referrerUserId,
      storeId: undefined,
      type: "referral_bonus",
      title: "Referral Bonus Earned!",
      message,
      isRead: false,
      createdAt: Date.now(),
    });

    return { granted: true };
  },
});

export const checkAndGrantReferralBonus = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const settings = await ctx.db.query("billing_settings")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (!settings) return { bonusGranted: false, reason: "No billing settings" };

    const referralCount = settings.referralCount || 0;
    if (referralCount < 3) return { bonusGranted: false, reason: "Not enough referrals" };

    const completedReferrals = await ctx.db.query("referrals")
      .withIndex("by_referrer", q => q.eq("referrerUserId", userId))
      .filter(q => q.eq(q.field("status"), "completed"))
      .filter(q => q.eq(q.field("rewardGranted"), false))
      .collect();

    const bonusEligibleReferrals = referralCount - 2;
    let grantedCount = 0;
    for (const referral of completedReferrals.slice(0, bonusEligibleReferrals)) {
      await ctx.db.patch(referral._id, {
        rewardGranted: true,
        rewardType: "free_month",
      });

      const subscription = await ctx.db.query("subscriptions")
        .withIndex("by_user", q => q.eq("userId", userId))
        .filter(q => q.eq(q.field("status"), "active"))
        .first();

      if (subscription) {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        await ctx.db.patch(subscription._id, {
          endDate: subscription.endDate + thirtyDays,
          updatedAt: Date.now(),
        });
      }

      grantedCount++;
    }

    if (grantedCount > 0) {
      await ctx.db.insert("notifications", {
        userId,
        storeId: undefined,
        type: "referral_bonus",
        title: "Referral Bonus Earned!",
        message: `You've earned ${grantedCount} month(s) free subscription as referral bonus!`,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { bonusGranted: grantedCount > 0, count: grantedCount };
  },
});

export const processAllReferralBonuses = mutation({
  args: {},
  handler: async (ctx) => {
    const allSettings = await ctx.db.query("billing_settings").collect();
    let totalGranted = 0;
    const usersWithBonuses: string[] = [];

    for (const settings of allSettings) {
      const referralCount = settings.referralCount || 0;
      if (referralCount < 3) continue;

      const completedReferrals = await ctx.db.query("referrals")
        .withIndex("by_referrer", q => q.eq("referrerUserId", settings.userId))
        .filter(q => q.eq(q.field("status"), "completed"))
        .filter(q => q.eq(q.field("rewardGranted"), false))
        .collect();

      const bonusEligibleReferrals = referralCount - 2;
      let userGrantedCount = 0;
      for (const referral of completedReferrals.slice(0, bonusEligibleReferrals)) {
        await ctx.db.patch(referral._id, {
          rewardGranted: true,
          rewardType: "free_month",
        });

        const subscription = await ctx.db.query("subscriptions")
          .withIndex("by_user", q => q.eq("userId", settings.userId))
          .filter(q => q.eq(q.field("status"), "active"))
          .first();

        if (subscription) {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          await ctx.db.patch(subscription._id, {
            endDate: subscription.endDate + thirtyDays,
            updatedAt: Date.now(),
          });
        }

        totalGranted++;
        userGrantedCount++;
      }

      if (userGrantedCount > 0) {
        usersWithBonuses.push(settings.userId);
        await ctx.db.insert("notifications", {
          userId: settings.userId,
          storeId: undefined,
          type: "referral_bonus",
          title: "Referral Bonus Earned!",
          message: `You've earned ${userGrantedCount} month(s) free subscription as referral bonus!`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return { totalGranted, usersWithBonusesCount: usersWithBonuses.length };
  },
});

export const getUserReferrals = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query("referrals")
      .withIndex("by_referrer", q => q.eq("referrerUserId", userId))
      .order("desc")
      .collect();
  },
});

export const getReferralStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const settings = await ctx.db.query("billing_settings")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    const referrals = await ctx.db.query("referrals")
      .withIndex("by_referrer", q => q.eq("referrerUserId", userId))
      .collect();

    const completed = referrals.filter(r => r.status === "completed");
    const pending = referrals.filter(r => r.status === "pending");
    const rewardsGranted = referrals.filter(r => r.rewardGranted);

    return {
      totalReferrals: referrals.length,
      completedReferrals: completed.length,
      pendingReferrals: pending.length,
      rewardsGranted: rewardsGranted.length,
      eligibleForBonus: (settings?.referralCount ?? 0) >= 3,
      referralCode: settings?.referralCode,
    };
  },
});

export const getGlobalReferralStats = query({
  args: {},
  handler: async (ctx) => {
    const [referrals, billingSettings] = await Promise.all([
      ctx.db.query("referrals").collect(),
      ctx.db.query("billing_settings").collect(),
    ]);

    const completed = referrals.filter(r => r.status === "completed");
    const pending = referrals.filter(r => r.status === "pending");
    const rewardsGranted = referrals.filter(r => r.rewardGranted);

    const totalReferralCount = billingSettings.reduce((sum, s) => sum + (s.referralCount ?? 0), 0);
    const usersWithBonus = billingSettings.filter(s => (s.referralCount ?? 0) >= 3).length;

    return {
      totalReferrals: referrals.length,
      completedReferrals: completed.length,
      pendingReferrals: pending.length,
      rewardsGranted: rewardsGranted.length,
      totalReferralCount,
      usersWithBonus,
    };
  },
});

export const getBillingSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query("billing_settings")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();
  },
});

export const updateBillingSettings = mutation({
  args: {
    userId: v.id("users"),
    walletBalance: v.optional(v.number()),
    discountEligible: v.optional(v.boolean()),
    discountPercentage: v.optional(v.number()),
    discountReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("billing_settings")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      throw new Error("Billing settings not found");
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.walletBalance !== undefined) updates.walletBalance = args.walletBalance;
    if (args.discountEligible !== undefined) updates.discountEligible = args.discountEligible;
    if (args.discountPercentage !== undefined) updates.discountPercentage = args.discountPercentage;
    if (args.discountReason !== undefined) updates.discountReason = args.discountReason;
    if (args.discountEligible) updates.lastDiscountApplied = Date.now();

    await ctx.db.patch(existing._id, updates);
  },
});

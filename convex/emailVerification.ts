import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Generate Verification Code ────────────────────────────────────────
export const generateCode = mutation({
  args: {
    email: v.string(),
    type: v.union(v.literal("registration"), v.literal("password_reset"), v.literal("email_change")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Invalidate any existing codes for this email
    const existingCodes = await ctx.db.query("email_verifications")
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => q.eq(q.field("isUsed"), false))
      .collect();
    
    for (const code of existingCodes) {
      await ctx.db.patch(code._id, { isUsed: true });
    }

    const code = generateOTP();
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes

    await ctx.db.insert("email_verifications", {
      email: args.email,
      code,
      type: args.type,
      userId: args.userId,
      isUsed: false,
      expiresAt,
      createdAt: now,
    });

    return { success: true, code, expiresAt };
  },
});

// ─── Verify Code ───────────────────────────────────────────────────────
export const verifyCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    type: v.union(v.literal("registration"), v.literal("password_reset"), v.literal("email_change")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const verification = await ctx.db.query("email_verifications")
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => q.eq(q.field("code"), args.code))
      .filter(q => q.eq(q.field("type"), args.type))
      .filter(q => q.eq(q.field("isUsed"), false))
      .order("desc")
      .first();

    if (!verification) {
      return { success: false, error: "Invalid verification code" };
    }

    if (verification.expiresAt < now) {
      return { success: false, error: "Verification code has expired" };
    }

    // Mark as used
    await ctx.db.patch(verification._id, { isUsed: true });

    return { success: true, userId: verification.userId };
  },
});

// ─── Check Verification Status ─────────────────────────────────────────
export const checkStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const latest = await ctx.db.query("email_verifications")
      .withIndex("by_email", q => q.eq("email", args.email))
      .order("desc")
      .first();

    if (!latest) {
      return { verified: false, hasCode: false };
    }

    const now = Date.now();
    const isValid = !latest.isUsed && latest.expiresAt > now;

    return {
      verified: latest.isUsed,
      hasCode: isValid,
      expiresAt: latest.expiresAt,
      type: latest.type,
    };
  },
});

// ─── Resend Verification Code ──────────────────────────────────────────
export const resendCode = mutation({
  args: {
    email: v.string(),
    type: v.union(v.literal("registration"), v.literal("password_reset"), v.literal("email_change")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check rate limiting (max 3 codes per hour)
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentCodes = await ctx.db.query("email_verifications")
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => q.gte(q.field("createdAt"), oneHourAgo))
      .collect();

    if (recentCodes.length >= 3) {
      return { success: false, error: "Too many verification attempts. Please try again later." };
    }

    // Generate new code
    const code = generateOTP();
    const expiresAt = now + 15 * 60 * 1000;

    await ctx.db.insert("email_verifications", {
      email: args.email,
      code,
      type: args.type,
      isUsed: false,
      expiresAt,
      createdAt: now,
    });

    return { success: true, code, expiresAt };
  },
});

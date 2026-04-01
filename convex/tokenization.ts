import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";
import { sha256 } from "js-sha256";

/**
 * Tokenization Service for Sensitive Payment Data
 * Replaces sensitive payment information with secure tokens
 */

// Configuration
const TOKEN_EXPIRY_MINUTES = 30; // Tokens expire after 30 minutes

/**
 * Create a payment token for sensitive data
 * @param paymentData - The sensitive payment data to tokenize
 * @param expiresInMinutes - Optional custom expiration time
 * @returns Object containing the token and expiration info
 */
export const createPaymentToken = mutation({
  args: {
    paymentData: v.any(),
    expiresInMinutes: v.optional(v.number()),
  },
  returns: v.object({
    token: v.string(),
    expiresAt: v.optional(v.string()),
    createdAt: v.number(),
  }),
  handler: async (ctx, { paymentData, expiresInMinutes }) => {
    // Generate secure random token
    const token = uuidv4();
    
    // Create hash of the payment data for validation
    const paymentDataString = typeof paymentData === "string" 
      ? paymentData 
      : JSON.stringify(paymentData);
    const hashedData = sha256(paymentDataString);
    
    // Calculate expiration time
    const now = Date.now();
    const expiryMinutes = expiresInMinutes ?? TOKEN_EXPIRY_MINUTES;
    const expiresAt = now + (expiryMinutes * 60 * 1000);
    
    // Store token mapping
    await ctx.db.insert("payment_tokens", {
      token,
      hashedData,
      createdAt: now,
      expiresAt,
    });
    
    return {
      token,
      expiresAt: new Date(expiresAt).toISOString(),
      createdAt: now,
    };
  },
});

/**
 * Validate a payment token against original data
 * @param token - The token to validate
 * @param paymentData - The original payment data to check against
 * @returns Boolean indicating if token is valid and matches data
 */
export const validatePaymentToken = query({
  args: {
    token: v.string(),
    paymentData: v.union(v.string(), v.object({})),
  },
  returns: v.boolean(),
  handler: async (ctx, { token, paymentData }) => {
    // Get token record
    const tokenRecord = await ctx.db
      .query("payment_tokens")
      .filter((q) => q.eq(q.field("token"), token))
      .first();
    
    if (!tokenRecord) {
      return false;
    }
    
    // Check if token has expired
    const now = Date.now();
    if (tokenRecord.expiresAt && now > tokenRecord.expiresAt) {
      // Token is expired, return false
      return false;
    }
    
    // Validate payment data matches hash
    const paymentDataString = typeof paymentData === "string" 
      ? paymentData 
      : JSON.stringify(paymentData);
    const hashedData = sha256(paymentDataString);
    
    return tokenRecord.hashedData === hashedData;
  },
});

/**
 * Get token information (without exposing sensitive data)
 * @param token - The token to lookup
 * @returns Token metadata or null if not found/expired
 */
export const getPaymentTokenInfo = query({
  args: {
    token: v.string(),
  },
  returns: v.optional(v.object({
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    isExpired: v.boolean(),
  })),
  handler: async (ctx, { token }) => {
    const tokenRecord = await ctx.db
      .query("payment_tokens")
      .filter((q) => q.eq(q.field("token"), token))
      .first();
    
    if (!tokenRecord) {
      return null;
    }
    
    const now = Date.now();
    const isExpired = tokenRecord.expiresAt && now > tokenRecord.expiresAt;
    
    return {
      token: tokenRecord.token,
      createdAt: tokenRecord.createdAt,
      expiresAt: tokenRecord.expiresAt,
      isExpired,
    };
  },
});

/**
 * Clean up expired tokens (called by cron job)
 * @returns Number of tokens cleaned up
 */
export const cleanupExpiredTokens = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find expired tokens
    const expiredTokens = await ctx.db
      .query("payment_tokens")
      .filter((q) => 
        q.and([
          q.lt(q.field("expiresAt"), now),
          q.not(q.isNull(q.field("expiresAt")))
        ])
      )
      .collect();
    
    // Delete expired tokens
    for (const token of expiredTokens) {
      await ctx.db.delete(token._id);
    }
    
    return expiredTokens.length;
  },
});

/**
 * Audit token usage for compliance tracking
 * @param tokenId - ID of the token record
 * @param action - Action performed (create, validate, expire)
 * @param userId - Optional user ID who performed the action
 * @param metadata - Additional metadata for audit
 */
export const logTokenUsage = mutation({
  args: {
    tokenId: v.id("payment_tokens"),
    action: v.union(v.literal("create"), v.literal("validate"), v.literal("expire")),
    userId: v.optional(v.id("users")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("token_audit_log"),
  handler: async (ctx, { tokenId, action, userId, ipAddress, userAgent, metadata }) => {
    return await ctx.db.insert("token_audit_log", {
      tokenId,
      action,
      userId,
      ipAddress,
      userAgent,
      metadata: metadata ?? {},
      createdAt: Date.now(),
    });
  },
});

/**
 * Get token usage audit logs
 * @param tokenId - Optional token ID to filter by
 * @param limit - Maximum number of records to return
 * @returns Array of token audit log entries
 */
export const getTokenAuditLogs = query({
  args: {
    tokenId: v.optional(v.id("payment_tokens")),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("token_audit_log"),
    tokenId: v.id("payment_tokens"),
    action: v.union(v.literal("create"), v.literal("validate"), v.literal("expire")),
    userId: v.optional(v.id("users")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.any(),
    createdAt: v.number(),
  })),
  handler: async (ctx, { tokenId, limit }) => {
    let query = ctx.db.query("token_audit_log");
    
    if (tokenId) {
      query = query.filter((q) => q.eq(q.field("tokenId"), tokenId));
    }
    
    query = query
      .order("desc")
      .limit(limit ?? 50);
    
    return await query.collect();
  },
});
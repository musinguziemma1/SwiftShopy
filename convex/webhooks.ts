import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Retry configuration
const RETRY_DELAYS = [60000, 300000, 900000, 1800000, 3600000]; // 1min, 5min, 15min, 30min, 1hr
const MAX_RETRIES = 5;

export const scheduleWebhookRetry = mutation({
  args: {
    webhookType: v.string(),
    referenceId: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if already scheduled
    const existing = await ctx.db.query("webhook_retries")
      .withIndex("by_reference", q => q.eq("referenceId", args.referenceId))
      .filter(q => q.eq(q.field("webhookType"), args.webhookType))
      .first();

    if (existing && existing.status === "completed") {
      return { alreadyProcessed: true };
    }

    if (existing && existing.status === "pending") {
      return { alreadyScheduled: true, nextRetryAt: existing.nextRetryAt };
    }

    // Create new retry entry
    const retryId = await ctx.db.insert("webhook_retries", {
      webhookType: args.webhookType,
      referenceId: args.referenceId,
      payload: args.payload,
      attempt: 1,
      maxAttempts: MAX_RETRIES,
      nextRetryAt: now + RETRY_DELAYS[0],
      status: "pending",
      lastError: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return { retryId, nextRetryAt: now + RETRY_DELAYS[0] };
  },
});

export const processWebhookRetry = mutation({
  args: { retryId: v.id("webhook_retries") },
  handler: async (ctx, { retryId }) => {
    const retry = await ctx.db.get(retryId);
    if (!retry) throw new Error("Retry not found");
    if (retry.status === "completed") return { success: true, message: "Already completed" };
    if (retry.attempt >= retry.maxAttempts) {
      await ctx.db.patch(retryId, { status: "failed", updatedAt: Date.now() });
      throw new Error("Max retries exceeded");
    }

    await ctx.db.patch(retryId, { status: "processing", updatedAt: Date.now() });

    try {
      // Simulate webhook processing based on type
      let success = false;
      
      if (retry.webhookType === "payment") {
        // Process payment webhook
        success = true; 
      } else if (retry.webhookType === "disbursement") {
        // Process disbursement webhook  
        success = true;
      }

      if (success) {
        await ctx.db.patch(retryId, { 
          status: "completed", 
          updatedAt: Date.now() 
        });
        return { success: true };
      } else {
        throw new Error("Processing failed");
      }
    } catch (error: any) {
      const nextAttempt = retry.attempt + 1;
      const nextDelay = RETRY_DELAYS[Math.min(nextAttempt - 1, RETRY_DELAYS.length - 1)];
      
      await ctx.db.patch(retryId, {
        attempt: nextAttempt,
        nextRetryAt: Date.now() + nextDelay,
        status: nextAttempt >= retry.maxAttempts ? "failed" : "pending",
        lastError: error.message,
        updatedAt: Date.now(),
      });

      return { 
        success: false, 
        nextRetryAt: Date.now() + nextDelay,
        attempt: nextAttempt,
        maxAttempts: retry.maxAttempts 
      };
    }
  },
});

export const getPendingRetries = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const now = Date.now();
    const retries = await ctx.db.query("webhook_retries")
      .withIndex("by_status", q => q.eq("status", "pending"))
      .filter(q => q.lt(q.field("nextRetryAt"), now))
      .take(limit);
    return retries;
  },
});

export const getRetryByReference = query({
  args: { webhookType: v.string(), referenceId: v.string() },
  handler: async (ctx, { webhookType, referenceId }) => {
    return await ctx.db.query("webhook_retries")
      .withIndex("by_reference", q => q.eq("referenceId", referenceId))
      .filter(q => q.eq(q.field("webhookType"), webhookType))
      .first();
  },
});
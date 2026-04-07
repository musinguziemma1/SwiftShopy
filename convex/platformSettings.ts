import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Get All Settings ──────────────────────────────────────────────────
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("platform_settings").collect();
  },
});

// ─── Get Settings by Category ──────────────────────────────────────────
export const getByCategory = query({
  args: { category: v.union(v.literal("general"), v.literal("payment"), v.literal("security"), v.literal("notification"), v.literal("api")) },
  handler: async (ctx, { category }) => {
    return await ctx.db.query("platform_settings")
      .withIndex("by_category", q => q.eq("category", category))
      .collect();
  },
});

// ─── Get Setting by Key ────────────────────────────────────────────────
export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    return await ctx.db.query("platform_settings")
      .withIndex("by_key", q => q.eq("key", key))
      .first();
  },
});

// ─── Get API Settings ──────────────────────────────────────────────────
export const getApiSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("platform_settings")
      .withIndex("by_category", q => q.eq("category", "api"))
      .collect();
    
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },
});

// ─── Get Payment Settings ──────────────────────────────────────────────
export const getPaymentSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("platform_settings")
      .withIndex("by_category", q => q.eq("category", "payment"))
      .collect();
    
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },
});

// ─── Upsert Setting ────────────────────────────────────────────────────
export const upsert = mutation({
  args: {
    category: v.union(v.literal("general"), v.literal("payment"), v.literal("security"), v.literal("notification"), v.literal("api")),
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("platform_settings")
      .withIndex("by_key", q => q.eq("key", args.key))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description,
        updatedBy: args.updatedBy,
        updatedAt: now,
      });
      return { success: true, action: "updated", id: existing._id };
    } else {
      const id = await ctx.db.insert("platform_settings", {
        category: args.category,
        key: args.key,
        value: args.value,
        description: args.description,
        isActive: true,
        updatedBy: args.updatedBy,
        updatedAt: now,
      });
      return { success: true, action: "created", id };
    }
  },
});

// ─── Bulk Update Settings ──────────────────────────────────────────────
export const bulkUpdate = mutation({
  args: {
    settings: v.array(v.object({
      category: v.union(v.literal("general"), v.literal("payment"), v.literal("security"), v.literal("notification"), v.literal("api")),
      key: v.string(),
      value: v.any(),
      description: v.optional(v.string()),
    })),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results: any[] = [];

    for (const setting of args.settings) {
      const existing = await ctx.db.query("platform_settings")
        .withIndex("by_key", q => q.eq("key", setting.key))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          value: setting.value,
          description: setting.description,
          updatedBy: args.updatedBy,
          updatedAt: now,
        });
        results.push({ key: setting.key, action: "updated" });
      } else {
        await ctx.db.insert("platform_settings", {
          category: setting.category,
          key: setting.key,
          value: setting.value,
          description: setting.description,
          isActive: true,
          updatedBy: args.updatedBy,
          updatedAt: now,
        });
        results.push({ key: setting.key, action: "created" });
      }
    }

    return { success: true, results };
  },
});

// ─── Delete Setting ────────────────────────────────────────────────────
export const deleteSetting = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const existing = await ctx.db.query("platform_settings")
      .withIndex("by_key", q => q.eq("key", key))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true };
    }
    return { success: false, error: "Setting not found" };
  },
});

// ─── Initialize Default Settings ───────────────────────────────────────
export const initializeDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const existingCount = (await ctx.db.query("platform_settings").collect()).length;
    
    if (existingCount > 0) {
      return { message: "Settings already initialized" };
    }

    const defaults = [
      // API Settings - MTN MoMo Sandbox
      { category: "api" as const, key: "mtn_sandbox_base_url", value: "https://sandbox.momodeveloper.mtn.com", description: "MTN MoMo Sandbox Base URL" },
      { category: "api" as const, key: "mtn_sandbox_collections_key", value: "", description: "MTN MoMo Sandbox Collections Primary Key" },
      { category: "api" as const, key: "mtn_sandbox_disbursements_key", value: "", description: "MTN MoMo Sandbox Disbursements Primary Key" },
      { category: "api" as const, key: "mtn_sandbox_api_user_id", value: "", description: "MTN MoMo Sandbox API User ID" },
      { category: "api" as const, key: "mtn_sandbox_api_key", value: "", description: "MTN MoMo Sandbox API Key" },
      
      // API Settings - MTN MoMo Production
      { category: "api" as const, key: "mtn_production_base_url", value: "https://api.momodeveloper.mtn.com", description: "MTN MoMo Production Base URL" },
      { category: "api" as const, key: "mtn_production_collections_key", value: "", description: "MTN MoMo Production Collections Primary Key" },
      { category: "api" as const, key: "mtn_production_disbursements_key", value: "", description: "MTN MoMo Production Disbursements Primary Key" },
      { category: "api" as const, key: "mtn_production_api_user_id", value: "", description: "MTN MoMo Production API User ID" },
      { category: "api" as const, key: "mtn_production_api_key", value: "", description: "MTN MoMo Production API Key" },
      
      // API Settings - Airtel Money
      { category: "api" as const, key: "airtel_sandbox_base_url", value: "https://openapiuat.airtel.africa", description: "Airtel Money Sandbox URL" },
      { category: "api" as const, key: "airtel_production_base_url", value: "https://openapi.airtel.africa", description: "Airtel Money Production URL" },
      { category: "api" as const, key: "airtel_client_id", value: "", description: "Airtel Money Client ID" },
      { category: "api" as const, key: "airtel_client_secret", value: "", description: "Airtel Money Client Secret" },
      
      // API Settings - WhatsApp
      { category: "api" as const, key: "whatsapp_phone_number_id", value: "", description: "WhatsApp Business Phone Number ID" },
      { category: "api" as const, key: "whatsapp_access_token", value: "", description: "WhatsApp Business Access Token" },
      { category: "api" as const, key: "whatsapp_api_version", value: "v18.0", description: "WhatsApp API Version" },
      
      // API Settings - Email
      { category: "api" as const, key: "email_provider", value: "resend", description: "Email Provider (resend/sendgrid)" },
      { category: "api" as const, key: "resend_api_key", value: "", description: "Resend API Key" },
      { category: "api" as const, key: "sendgrid_api_key", value: "", description: "SendGrid API Key" },
      { category: "api" as const, key: "email_from", value: "SwiftShopy <noreply@swiftshopy.com>", description: "Email From Address" },
      
      // Payment Settings
      { category: "payment" as const, key: "environment", value: "sandbox", description: "Payment Environment (sandbox/production)" },
      { category: "payment" as const, key: "currency", value: "UGX", description: "Default Currency" },
      { category: "payment" as const, key: "callback_url", value: "", description: "Payment Callback URL" },
      { category: "payment" as const, key: "webhook_secret", value: "", description: "Webhook Secret" },
    ];

    for (const setting of defaults) {
      await ctx.db.insert("platform_settings", {
        ...setting,
        isActive: true,
        updatedAt: now,
      });
    }

    return { success: true, count: defaults.length };
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["*"],
  admin: [
    "users:read", "users:write", "sellers:read", "sellers:write", "sellers:suspend",
    "transactions:read", "transactions:refund", "products:read", "products:approve",
    "orders:read", "orders:write", "reports:read", "reports:export",
    "support:read", "support:write", "support:manage", "audit:read"
  ],
  support: [
    "sellers:read", "orders:read", "support:read", "support:write", "reports:read"
  ],
  analyst: [
    "sellers:read", "transactions:read", "orders:read", "products:read", "reports:read", "reports:export"
  ],
};

// ─── RBAC: Admin Users ────────────────────────────────────
export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("admin_users").collect(),
});

export const getById = query({
  args: { id: v.id("admin_users") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("support"), v.literal("analyst")),
  },
  handler: async (ctx, args) => {
    const permissions = ROLE_PERMISSIONS[args.role] || [];
    return await ctx.db.insert("admin_users", {
      ...args,
      permissions,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("admin_users"),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("support"), v.literal("analyst")),
  },
  handler: async (ctx, args) => {
    const permissions = ROLE_PERMISSIONS[args.role] || [];
    await ctx.db.patch(args.id, { role: args.role, permissions });
  },
});

export const toggleActive = mutation({
  args: { id: v.id("admin_users"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

export const updateLastLogin = mutation({
  args: { id: v.id("admin_users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastLoginAt: Date.now() });
  },
});

// ─── Audit Trail ─────────────────────────────────────────
export const logAction = mutation({
  args: {
    adminId: v.string(),
    adminName: v.optional(v.string()),
    action: v.string(),
    targetType: v.union(v.literal("user"), v.literal("seller"), v.literal("order"), v.literal("product"), v.literal("transaction"), v.literal("settings"), v.literal("system"), v.literal("ticket")),
    targetId: v.string(),
    targetName: v.optional(v.string()),
    details: v.any(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("audit_logs", {
      ...args,
      adminName: args.adminName || "Admin",
      createdAt: Date.now(),
    });
  },
});

export const listAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("audit_logs").collect();
    return logs.sort((a, b) => b.createdAt - a.createdAt).slice(0, args.limit || 100);
  },
});

// ─── Support Tickets ─────────────────────────────────────
export const createTicket = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    category: v.union(v.literal("payment"), v.literal("account"), v.literal("technical"), v.literal("billing"), v.literal("integration"), v.literal("other")),
    subject: v.string(),
    description: v.string(),
    orderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("support_tickets").collect();
    const ticketNumber = `TKT-${String(all.length + 1).padStart(5, "0")}`;
    const now = Date.now();
    const id = await ctx.db.insert("support_tickets", {
      ...args,
      ticketNumber,
      priority: "medium",
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
    return { id, ticketNumber };
  },
});

export const listTickets = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const tickets = await ctx.db.query("support_tickets").order("desc").take(args.limit || 50);
    return tickets;
  },
});

export const getTicket = query({
  args: { id: v.id("support_tickets") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const updateTicketStatus = mutation({
  args: {
    id: v.id("support_tickets"),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("pending"), v.literal("resolved"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: any = { status: args.status, updatedAt: now };
    const ticket = await ctx.db.get(args.id);
    if (ticket && !ticket.firstResponseAt && args.status === "in_progress") {
      updates.firstResponseAt = now;
    }
    if (args.status === "resolved" && !ticket?.resolvedAt) {
      updates.resolvedAt = now;
    }
    await ctx.db.patch(args.id, updates);
  },
});

export const assignTicket = mutation({
  args: { id: v.id("support_tickets"), assignedTo: v.string(), assignedToName: v.string() },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.id);
    if (ticket?.status === "open") {
      await ctx.db.patch(args.id, {
        assignedTo: args.assignedTo,
        assignedToName: args.assignedToName,
        status: "in_progress",
        updatedAt: Date.now(),
      });
    }
  },
});

export const addTicketMessage = mutation({
  args: {
    ticketId: v.id("support_tickets"),
    senderId: v.string(),
    senderName: v.string(),
    senderType: v.union(v.literal("user"), v.literal("admin"), v.literal("support")),
    message: v.string(),
    isInternal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("ticket_messages", {
      ...args,
      isInternal: args.isInternal ?? false,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.ticketId, { updatedAt: Date.now() });
    return id;
  },
});

export const getTicketMessages = query({
  args: { ticketId: v.id("support_tickets") },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query("ticket_messages").collect();
    return messages.filter(m => m.ticketId === args.ticketId).sort((a, b) => a.createdAt - b.createdAt);
  },
});

// ─── SLA Management ──────────────────────────────────────
export const getSLADeadline = query({
  args: { priority: v.union(v.literal("critical"), v.literal("high"), v.literal("medium"), v.literal("low")) },
  handler: async (_, args) => {
    const slaHours: Record<string, number> = {
      critical: 1, high: 4, medium: 24, low: 48
    };
    const hours = slaHours[args.priority] || 24;
    return Date.now() + hours * 60 * 60 * 1000;
  },
});

export const getBreachedTickets = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const tickets = await ctx.db.query("support_tickets").collect();
    return tickets.filter(t => t.status !== "resolved" && t.status !== "closed" && t.slaDeadline && t.slaDeadline < now);
  },
});

// ─── Bulk Operations ─────────────────────────────────────
export const createBulkOperation = mutation({
  args: {
    adminId: v.string(),
    type: v.union(v.literal("approve_sellers"), v.literal("suspend_sellers"), v.literal("activate_products"), v.literal("deactivate_products"), v.literal("export_data"), v.literal("import_data")),
    filters: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bulk_operations", {
      ...args,
      status: "pending",
      totalCount: 0,
      successCount: 0,
      failedCount: 0,
      results: [],
      createdAt: Date.now(),
    });
  },
});

export const listBulkOperations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const ops = await ctx.db.query("bulk_operations").order("desc").take(args.limit || 20);
    return ops;
  },
});

export const updateBulkOperation = mutation({
  args: {
    id: v.id("bulk_operations"),
    status: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed"))),
    totalCount: v.optional(v.number()),
    successCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
    results: v.optional(v.array(v.object({ id: v.string(), success: v.boolean(), error: v.optional(v.string()) }))),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    if (args.status) updates.status = args.status;
    if (args.totalCount !== undefined) updates.totalCount = args.totalCount;
    if (args.successCount !== undefined) updates.successCount = args.successCount;
    if (args.failedCount !== undefined) updates.failedCount = args.failedCount;
    if (args.results) updates.results = args.results;
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }
    await ctx.db.patch(args.id, updates);
  },
});

// ─── Scheduled Reports ──────────────────────────────────
export const createScheduledReport = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("revenue"), v.literal("sellers"), v.literal("orders"), v.literal("products"), v.literal("transactions"), v.literal("support"), v.literal("custom")),
    format: v.union(v.literal("json"), v.literal("csv"), v.literal("xlsx"), v.literal("pdf")),
    filters: v.any(),
    schedule: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    recipients: v.array(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const intervals: Record<string, number> = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    };
    return await ctx.db.insert("scheduled_reports", {
      ...args,
      nextRunAt: now + (intervals[args.schedule] || intervals.daily),
      isActive: true,
      createdAt: now,
    });
  },
});

export const listScheduledReports = query({
  args: {},
  handler: async (ctx) => ctx.db.query("scheduled_reports").collect(),
});

export const toggleScheduledReport = mutation({
  args: { id: v.id("scheduled_reports"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

// ─── Workflow Automation ──────────────────────────────────
export const autoAssignTicket = mutation({
  args: { ticketId: v.id("support_tickets") },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.assignedTo) return;
    const admins = await ctx.db.query("admin_users")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
    const supportAgents = admins.filter(a =>
      a.role === "support" || a.role === "admin" || a.role === "super_admin"
    );
    if (supportAgents.length === 0) return;
    const ticketCounts: Record<string, number> = {};
    for (const agent of supportAgents) {
      const count = await ctx.db.query("support_tickets")
        .filter(q => q.eq(q.field("assignedTo"), agent.userId))
        .filter(q => q.neq(q.field("status"), "resolved"))
        .filter(q => q.neq(q.field("status"), "closed"))
        .collect();
      ticketCounts[agent.userId] = count.length;
    }
    let bestAgent = supportAgents[0];
    let minTickets = ticketCounts[bestAgent.userId] ?? 0;
    for (const agent of supportAgents) {
      const count = ticketCounts[agent.userId] ?? 0;
      if (count < minTickets) {
        minTickets = count;
        bestAgent = agent;
      }
    }
    const slaHours: Record<string, number> = { critical: 1, high: 4, medium: 24, low: 48 };
    const hours = slaHours[ticket.priority] || 24;
    await ctx.db.patch(args.ticketId, {
      assignedTo: bestAgent.userId,
      assignedToName: bestAgent.name,
      status: "in_progress",
      slaDeadline: Date.now() + hours * 60 * 60 * 1000,
      updatedAt: Date.now(),
    });
    return { assignedTo: bestAgent.name };
  },
});

export const autoCloseResolvedTickets = mutation({
  args: { hoursThreshold: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const threshold = (args.hoursThreshold ?? 48) * 60 * 60 * 1000;
    const now = Date.now();
    const resolved = await ctx.db.query("support_tickets")
      .filter(q => q.eq(q.field("status"), "resolved"))
      .collect();
    let closed = 0;
    for (const ticket of resolved) {
      if (ticket.resolvedAt && now - ticket.resolvedAt > threshold) {
        await ctx.db.patch(ticket._id, { status: "closed", updatedAt: now });
        closed++;
      }
    }
    return { closed };
  },
});

export const escalateSLABreaches = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const tickets = await ctx.db.query("support_tickets")
      .filter(q => q.neq(q.field("status"), "resolved"))
      .filter(q => q.neq(q.field("status"), "closed"))
      .collect();
    const breached = tickets.filter(t => t.slaDeadline && t.slaDeadline < now);
    let escalated = 0;
    for (const ticket of breached) {
      if (ticket.priority !== "critical") {
        const priorities = ["low", "medium", "high", "critical"];
        const idx = priorities.indexOf(ticket.priority);
        if (idx < priorities.length - 1) {
          await ctx.db.patch(ticket._id, {
            priority: priorities[idx + 1] as any,
            updatedAt: now,
          });
          escalated++;
        }
      }
    }
    return { breachedCount: breached.length, escalated };
  },
});

// ─── Platform Settings ───────────────────────────────────
const SettingCategory = v.union(v.literal("general"), v.literal("payment"), v.literal("security"), v.literal("notification"), v.literal("api"));

export const getSettings = query({
  args: { category: v.optional(SettingCategory) },
  handler: async (ctx, { category }) => {
    if (category) {
      return await ctx.db.query("platform_settings")
        .withIndex("by_category", q => q.eq("category", category))
        .collect();
    }
    return await ctx.db.query("platform_settings").collect();
  },
});

export const getSettingByKey = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    return await ctx.db.query("platform_settings")
      .withIndex("by_key", q => q.eq("key", key))
      .first();
  },
});

export const upsertSetting = mutation({
  args: {
    category: v.union(v.literal("general"), v.literal("payment"), v.literal("security"), v.literal("notification"), v.literal("api")),
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("platform_settings")
      .withIndex("by_key", q => q.eq("key", args.key))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("platform_settings", {
        ...args,
        isActive: true,
        updatedAt: Date.now(),
      });
    }
  },
});

export const deleteSetting = mutation({
  args: { id: v.id("platform_settings") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const bulkUpsertSettings = mutation({
  args: {
    settings: v.array(v.object({
      category: v.union(v.literal("general"), v.literal("payment"), v.literal("security"), v.literal("notification"), v.literal("api")),
      key: v.string(),
      value: v.any(),
      description: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { settings }) => {
    const results: Array<{ key: string; id: any }> = [];
    for (const setting of settings) {
      const existing = await ctx.db.query("platform_settings")
        .withIndex("by_key", q => q.eq("key", setting.key))
        .first();
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          value: setting.value,
          description: setting.description,
          updatedAt: Date.now(),
        });
        results.push({ key: setting.key, id: existing._id });
      } else {
        const id = await ctx.db.insert("platform_settings", {
          ...setting,
          isActive: true,
          updatedAt: Date.now(),
        });
        results.push({ key: setting.key, id });
      }
    }
    return results;
  },
});

// ─── Seed Default Settings ─────────────────────────────────
type SettingCategory = "general" | "payment" | "security" | "notification" | "api";

interface DefaultSetting {
  category: SettingCategory;
  key: string;
  value: string | number | boolean;
  description: string;
}

export const seedDefaultSettings = mutation({
  args: {},
  handler: async (ctx) => {
    const defaults: DefaultSetting[] = [
      // General
      { category: "general", key: "platform_name", value: "SwiftShopy", description: "Platform name" },
      { category: "general", key: "support_email", value: "support@swiftshopy.com", description: "Support email" },
      { category: "general", key: "platform_description", value: "WhatsApp Commerce + Mobile Money Payments platform", description: "Platform description" },
      { category: "general", key: "maintenance_mode", value: false, description: "Enable maintenance mode" },
      // Payment Gateways
      { category: "payment", key: "mtn_momo_enabled", value: true, description: "Enable MTN MoMo" },
      { category: "payment", key: "mtn_momo_api_key", value: "", description: "MTN MoMo API Key" },
      { category: "payment", key: "mtn_momo_subscription_key", value: "", description: "MTN Subscription Key" },
      { category: "payment", key: "mtn_momo_collection_id", value: "", description: "MTN Collection Account ID" },
      { category: "payment", key: "airtel_money_enabled", value: true, description: "Enable Airtel Money" },
      { category: "payment", key: "airtel_money_api_key", value: "", description: "Airtel Money API Key" },
      { category: "payment", key: "cod_enabled", value: true, description: "Enable Cash on Delivery" },
      { category: "payment", key: "platform_commission", value: 10, description: "Platform commission percentage" },
      // Security
      { category: "security", key: "require_2fa", value: true, description: "Require 2FA for admins" },
      { category: "security", key: "api_rate_limit", value: 1000, description: "API rate limit per minute" },
      { category: "security", key: "seller_verification_required", value: true, description: "Require seller verification" },
      { category: "security", key: "session_timeout", value: 3600, description: "Session timeout in seconds" },
      { category: "security", key: "password_min_length", value: 8, description: "Minimum password length" },
      // Notifications
      { category: "notification", key: "new_seller_alert", value: true, description: "Alert on new seller registration" },
      { category: "notification", key: "high_value_threshold", value: 1000000, description: "High value transaction threshold" },
      { category: "notification", key: "failed_payment_alert", value: true, description: "Alert on failed payments" },
      { category: "notification", key: "system_error_alert", value: true, description: "Alert on system errors" },
      { category: "notification", key: "daily_report", value: false, description: "Send daily reports" },
      { category: "notification", key: "weekly_summary", value: true, description: "Send weekly summary" },
      { category: "notification", key: "notification_email", value: "admin@swiftshopy.com", description: "Notification email" },
      // API
      { category: "api", key: "webhook_url", value: "https://api.swiftshopy.com/webhooks", description: "Webhook URL" },
      { category: "api", key: "api_key", value: "", description: "Platform API Key" },
      { category: "api", key: "api_rate_limit", value: 1000, description: "API rate limit" },
      { category: "api", key: "api_secret", value: "", description: "Platform API Secret" },
    ];

    for (const setting of defaults) {
      const existing = await ctx.db.query("platform_settings")
        .withIndex("by_key", q => q.eq("key", setting.key))
        .first();
      
      if (!existing) {
        await ctx.db.insert("platform_settings", {
          category: setting.category,
          key: setting.key,
          value: setting.value,
          description: setting.description,
          isActive: true,
          updatedAt: Date.now(),
        });
      }
    }
    return { seeded: defaults.length };
  },
});
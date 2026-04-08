import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Support Tickets CRUD - matching existing schema

export const createTicket = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
    storeName: v.optional(v.string()),
    subject: v.string(),
    description: v.string(),
    category: v.optional(v.union(v.literal("payment"), v.literal("account"), v.literal("technical"), v.literal("billing"), v.literal("integration"), v.literal("other"))),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    const ticketNumber = "TKT-" + Date.now().toString(36).toUpperCase();
    const now = Date.now();
    
    // Calculate SLA deadline based on priority
    const slaHours: Record<string, number> = {
      critical: 1,
      high: 4,
      medium: 24,
      low: 48,
    };
    const slaDeadline = now + (slaHours[args.priority] || 24) * 60 * 60 * 1000;
    
    const ticketId = await ctx.db.insert("support_tickets", {
      ticketNumber,
      userId: args.userId,
      userName: args.userName,
      userEmail: args.userEmail,
      userPhone: args.userPhone || "",
      category: args.category || "other",
      priority: args.priority,
      status: "open",
      subject: args.subject,
      description: args.description,
      slaDeadline,
      createdAt: now,
      updatedAt: now,
    });

    // Notify admin
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "support_ticket",
      title: "New Support Ticket",
      message: `${args.userName} created ticket: ${args.subject}`,
      isRead: false,
      actionUrl: "/admin?tab=support",
      metadata: { ticketId, ticketNumber, priority: args.priority },
      createdAt: now,
    });

    // Notify seller about their ticket
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "support_ticket_created",
      title: "Payout Request Submitted",
      message: `Your payout request for UGX ${args.description.match(/UGX ([\d,]+)/)?.[1] || "0"} has been submitted. Ticket #${ticketNumber}. Admin will review and process it shortly.`,
      isRead: false,
      actionUrl: "/dashboard?tab=settings",
      metadata: { ticketId, ticketNumber, category: args.category },
      createdAt: now,
    });

    return { ticketId, ticketNumber };
  },
});

export const getAllTickets = query({
  args: {
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tickets = await ctx.db.query("support_tickets").collect();
    
    if (args.status && args.status !== "all") {
      tickets = tickets.filter(t => t.status === args.status);
    }
    if (args.priority && args.priority !== "all") {
      tickets = tickets.filter(t => t.priority === args.priority);
    }
    
    return tickets.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getTicketById = query({
  args: { id: v.id("support_tickets") },
  handler: async (ctx, { id }) => {
    const ticket = await ctx.db.get(id);
    const messages = await ctx.db.query("ticket_messages")
      .withIndex("by_ticket", q => q.eq("ticketId", id))
      .collect();
    return { ticket, messages: messages.sort((a, b) => a.createdAt - b.createdAt) };
  },
});

export const updateTicketStatus = mutation({
  args: {
    id: v.id("support_tickets"),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("pending"), v.literal("resolved"), v.literal("closed")),
    assignedTo: v.optional(v.string()),
    assignedToName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.id);
    if (!ticket) throw new Error("Ticket not found");
    
    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };
    
    if (args.assignedTo) {
      updates.assignedTo = args.assignedTo;
      updates.assignedToName = args.assignedToName;
    }
    
    if (args.status === "resolved" || args.status === "closed") {
      updates.resolvedAt = Date.now();
    }
    
    await ctx.db.patch(args.id, updates);

    // Notify user
    await ctx.db.insert("notifications", {
      userId: ticket.userId,
      type: "ticket_update",
      title: "Ticket Status Updated",
      message: `Your ticket #${ticket.ticketNumber} status changed to: ${args.status}`,
      isRead: false,
      actionUrl: "/dashboard?tab=support",
      metadata: { ticketId: args.id, ticketNumber: ticket.ticketNumber, status: args.status },
      createdAt: Date.now(),
    });
  },
});

export const addTicketMessage = mutation({
  args: {
    ticketId: v.id("support_tickets"),
    senderId: v.string(),
    senderName: v.string(),
    senderType: v.union(v.literal("user"), v.literal("support"), v.literal("admin")),
    message: v.string(),
    isInternal: v.boolean(),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    
    const messageId = await ctx.db.insert("ticket_messages", {
      ticketId: args.ticketId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderType: args.senderType,
      message: args.message,
      isInternal: args.isInternal,
      createdAt: Date.now(),
    });
    
    // Update ticket timestamp
    await ctx.db.patch(args.ticketId, { updatedAt: Date.now() });
    
    // Notify relevant parties
    if (args.senderType === "admin" || args.senderType === "support") {
      await ctx.db.insert("notifications", {
        userId: ticket.userId,
        type: "ticket_reply",
        title: "New Reply to Your Ticket",
        message: `New reply on ticket #${ticket.ticketNumber}`,
        isRead: false,
        actionUrl: "/dashboard?tab=support",
        metadata: { ticketId: args.ticketId, ticketNumber: ticket.ticketNumber },
        createdAt: Date.now(),
      });
    }
    
    return messageId;
  },
});

// Audit Logs

export const logAction = mutation({
  args: {
    action: v.string(),
    targetType: v.union(v.literal("user"), v.literal("seller"), v.literal("order"), v.literal("product"), v.literal("transaction"), v.literal("settings"), v.literal("system"), v.literal("ticket")),
    targetId: v.optional(v.string()),
    targetName: v.optional(v.string()),
    adminId: v.optional(v.string()),
    adminName: v.optional(v.string()),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("audit_logs", {
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId || "",
      targetName: args.targetName,
      adminId: args.adminId || "system",
      adminName: args.adminName || "System",
      details: args.details,
      ipAddress: args.ipAddress,
      createdAt: Date.now(),
    });
    return logId;
  },
});

export const getAuditLogs = query({
  args: {
    action: v.optional(v.string()),
    targetType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db.query("audit_logs").collect();
    
    if (args.action) {
      logs = logs.filter(l => l.action === args.action);
    }
    if (args.targetType) {
      logs = logs.filter(l => l.targetType === args.targetType);
    }
    
    const limit = args.limit || 100;
    return logs.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  },
});

export const getTicketStats = query({
  handler: async (ctx) => {
    const tickets = await ctx.db.query("support_tickets").collect();
    const now = Date.now();
    
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === "open").length,
      in_progress: tickets.filter(t => t.status === "in_progress").length,
      pending: tickets.filter(t => t.status === "pending").length,
      resolved: tickets.filter(t => t.status === "resolved").length,
      closed: tickets.filter(t => t.status === "closed").length,
      critical: tickets.filter(t => t.priority === "critical").length,
      high: tickets.filter(t => t.priority === "high").length,
      medium: tickets.filter(t => t.priority === "medium").length,
      low: tickets.filter(t => t.priority === "low").length,
      breached: tickets.filter(t => t.slaDeadline && t.slaDeadline < now && t.status !== "resolved" && t.status !== "closed").length,
    };
    
    return stats;
  },
});
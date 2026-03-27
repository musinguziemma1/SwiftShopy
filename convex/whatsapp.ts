import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── WhatsApp Account Management ───────────────────────────
export const getByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.query("whatsapp_accounts")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .first();
  },
});

export const createAccount = mutation({
  args: {
    storeId: v.id("stores"),
    phoneNumberId: v.string(),
    businessAccountId: v.string(),
    businessPhone: v.string(),
    businessName: v.string(),
    accessToken: v.string(),
    webhookVerifyToken: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("whatsapp_accounts", {
      ...args,
      isConnected: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateConnectionStatus = mutation({
  args: { id: v.id("whatsapp_accounts"), isConnected: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      isConnected: args.isConnected, 
      updatedAt: Date.now() 
    });
  },
});

export const generateQRCode = mutation({
  args: { id: v.id("whatsapp_accounts"), qrCode: v.string() },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    await ctx.db.patch(args.id, { 
      qrCode: args.qrCode, 
      qrCodeExpiresAt: expiresAt,
      updatedAt: Date.now()
    });
  },
});

// ─── WhatsApp Contacts ─────────────────────────────────────
export const getOrCreateContact = mutation({
  args: {
    storeId: v.id("stores"),
    waId: v.string(),
    phone: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("whatsapp_contacts")
      .withIndex("by_waId", q => q.eq("waId", args.waId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { 
        name: args.name || existing.name,
        lastSeenAt: Date.now(),
        updatedAt: Date.now()
      });
      return existing;
    }
    
    return await ctx.db.insert("whatsapp_contacts", {
      storeId: args.storeId,
      waId: args.waId,
      phone: args.phone,
      name: args.name,
      isBusiness: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getContacts = query({
  args: { storeId: v.id("stores"), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let contacts = await ctx.db.query("whatsapp_contacts")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    if (args.search) {
      const q = args.search.toLowerCase();
      contacts = contacts.filter(c => 
        c.name?.toLowerCase().includes(q) || 
        c.phone.includes(q)
      );
    }
    return contacts;
  },
});

export const updateContact = mutation({
  args: {
    id: v.id("whatsapp_contacts"),
    name: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.notes !== undefined) updates.notes = args.notes;
    await ctx.db.patch(args.id, updates);
  },
});

// ─── WhatsApp Conversations ────────────────────────────────
export const getConversations = query({
  args: { 
    storeId: v.id("stores"), 
    status: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let conversations = await ctx.db.query("whatsapp_conversations")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    if (args.status) {
      conversations = conversations.filter(c => c.status === args.status);
    }
    
    // Get contact info for each conversation
    const result = await Promise.all(conversations.map(async (conv) => {
      const contact = await ctx.db.get(conv.contactId);
      return { ...conv, contact };
    }));
    
    if (args.search) {
      const q = args.search.toLowerCase();
      return result.filter(c => 
        c.contact?.name?.toLowerCase().includes(q) ||
        c.contact?.phone.includes(q) ||
        c.lastMessagePreview.toLowerCase().includes(q)
      );
    }
    
    return result.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const getConversation = query({
  args: { id: v.id("whatsapp_conversations") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.id);
    if (!conv) return null;
    const contact = await ctx.db.get(conv.contactId);
    return { ...conv, contact };
  },
});

export const getOrCreateConversation = mutation({
  args: { storeId: v.id("stores"), contactId: v.id("whatsapp_contacts") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("whatsapp_conversations")
      .withIndex("by_contact", q => q.eq("contactId", args.contactId))
      .first();
    
    if (existing) return existing;
    
    return await ctx.db.insert("whatsapp_conversations", {
      storeId: args.storeId,
      contactId: args.contactId,
      lastMessageAt: Date.now(),
      lastMessagePreview: "",
      unreadCount: 0,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const archiveConversation = mutation({
  args: { id: v.id("whatsapp_conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      status: "archived",
      updatedAt: Date.now()
    });
  },
});

// ─── WhatsApp Messages ─────────────────────────────────────
export const getMessages = query({
  args: { 
    conversationId: v.id("whatsapp_conversations"),
    limit: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let messages = await ctx.db.query("whatsapp_messages")
      .withIndex("by_conversation", q => q.eq("conversationId", args.conversationId))
      .collect();
    
    if (args.before) {
      messages = messages.filter(m => m.createdAt < args.before!);
    }
    
    messages.sort((a, b) => b.createdAt - a.createdAt);
    
    if (args.limit) {
      messages = messages.slice(0, args.limit);
    }
    
    return messages;
  },
});

export const receiveMessage = mutation({
  args: {
    storeId: v.id("stores"),
    conversationId: v.id("whatsapp_conversations"),
    contactId: v.id("whatsapp_contacts"),
    waMessageId: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("audio"), v.literal("video"), v.literal("document"), v.literal("location"), v.literal("interactive")),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create message
    const messageId = await ctx.db.insert("whatsapp_messages", {
      ...args,
      direction: "inbound",
      status: "delivered",
      createdAt: now,
    });
    
    // Update conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      await ctx.db.patch(args.conversationId, {
        lastMessageAt: now,
        lastMessagePreview: args.content.slice(0, 100),
        unreadCount: conversation.unreadCount + 1,
        updatedAt: now,
      });
    }
    
    return messageId;
  },
});

export const sendMessage = mutation({
  args: {
    storeId: v.id("stores"),
    conversationId: v.id("whatsapp_conversations"),
    contactId: v.id("whatsapp_contacts"),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("audio"), v.literal("video"), v.literal("document"), v.literal("location"), v.literal("interactive")),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const waMessageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create message
    const messageId = await ctx.db.insert("whatsapp_messages", {
      ...args,
      waMessageId,
      direction: "outbound",
      status: "sent",
      createdAt: now,
    });
    
    // Update conversation
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessagePreview: args.content.slice(0, 100),
      updatedAt: now,
    });
    
    // Mark previous messages as read
    const messages = await ctx.db.query("whatsapp_messages")
      .withIndex("by_conversation", q => q.eq("conversationId", args.conversationId))
      .collect();
    
    for (const msg of messages) {
      if (msg.direction === "inbound" && msg.status !== "read") {
        await ctx.db.patch(msg._id, { status: "read" });
      }
    }
    
    // Reset unread count
    await ctx.db.patch(args.conversationId, { unreadCount: 0 });
    
    return { messageId, waMessageId };
  },
});

export const updateMessageStatus = mutation({
  args: {
    waMessageId: v.string(),
    status: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.query("whatsapp_messages")
      .withIndex("by_waMessageId", q => q.eq("waMessageId", args.waMessageId))
      .first();
    
    if (message) {
      await ctx.db.patch(message._id, { status: args.status });
    }
  },
});

export const searchMessages = query({
  args: { storeId: v.id("stores"), query: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query("whatsapp_messages")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    const q = args.query.toLowerCase();
    return messages.filter(m => m.content.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ─── Quick Replies ─────────────────────────────────────────
export const getQuickReplies = query({
  args: { storeId: v.id("stores"), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let replies = await ctx.db.query("whatsapp_quick_replies")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    if (args.search) {
      const q = args.search.toLowerCase();
      replies = replies.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.shortcut.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q)
      );
    }
    
    return replies.filter(r => r.isActive).sort((a, b) => b.usageCount - a.usageCount);
  },
});

export const createQuickReply = mutation({
  args: {
    storeId: v.id("stores"),
    title: v.string(),
    shortcut: v.string(),
    message: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("whatsapp_quick_replies", {
      ...args,
      usageCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const useQuickReply = mutation({
  args: { id: v.id("whatsapp_quick_replies") },
  handler: async (ctx, args) => {
    const reply = await ctx.db.get(args.id);
    if (reply) {
      await ctx.db.patch(args.id, { 
        usageCount: reply.usageCount + 1,
        updatedAt: Date.now()
      });
    }
  },
});

export const deleteQuickReply = mutation({
  args: { id: v.id("whatsapp_quick_replies") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ─── Templates ──────────────────────────────────────────────
export const getTemplates = query({
  args: { storeId: v.id("stores"), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let templates = await ctx.db.query("whatsapp_templates")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    if (args.category) {
      templates = templates.filter(t => t.category === args.category);
    }
    
    return templates.sort((a, b) => b.usageCount - a.usageCount);
  },
});

export const createTemplate = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    category: v.union(v.literal("marketing"), v.literal("transactional"), v.literal("utility")),
    language: v.string(),
    content: v.string(),
    components: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("whatsapp_templates", {
      ...args,
      status: "draft",
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ─── Payment Links ─────────────────────────────────────────
export const createPaymentLink = mutation({
  args: {
    storeId: v.id("stores"),
    conversationId: v.optional(v.id("whatsapp_conversations")),
    orderId: v.optional(v.id("orders")),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours
    const paymentLink = `https://pay.swiftshopy.com/pay/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return await ctx.db.insert("whatsapp_payment_links", {
      ...args,
      paymentLink,
      expiresAt,
      status: "pending",
      createdAt: now,
    });
  },
});

export const getPaymentLinks = query({
  args: { storeId: v.id("stores"), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let links = await ctx.db.query("whatsapp_payment_links")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    if (args.status) {
      links = links.filter(l => l.status === args.status);
    }
    
    return links.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updatePaymentLinkStatus = mutation({
  args: {
    id: v.id("whatsapp_payment_links"),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("expired"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// ─── Analytics ─────────────────────────────────────────────
export const getWhatsAppAnalytics = query({
  args: { storeId: v.id("stores"), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;
    
    const messages = await ctx.db.query("whatsapp_messages")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    const recentMessages = messages.filter(m => m.createdAt >= startDate);
    
    const conversations = await ctx.db.query("whatsapp_conversations")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    const inbound = recentMessages.filter(m => m.direction === "inbound").length;
    const outbound = recentMessages.filter(m => m.direction === "outbound").length;
    
    // Calculate average response time (inbound to first outbound reply)
    let totalResponseTime = 0;
    let respondedCount = 0;
    
    const convMessages: Record<string, typeof messages> = {};
    for (const msg of recentMessages) {
      const convId = msg._id;
      if (!convMessages[convId]) convMessages[convId] = [];
      convMessages[convId].push(msg);
    }
    
    for (const msgs of Object.values(convMessages)) {
      const inboundMsgs = msgs.filter(m => m.direction === "inbound");
      const outboundMsgs = msgs.filter(m => m.direction === "outbound");
      
      if (inboundMsgs.length > 0 && outboundMsgs.length > 0) {
        const firstInbound = Math.min(...inboundMsgs.map(m => m.createdAt));
        const firstOutbound = Math.min(...outboundMsgs.map(m => m.createdAt));
        if (firstOutbound > firstInbound) {
          totalResponseTime += firstOutbound - firstInbound;
          respondedCount++;
        }
      }
    }
    
    const avgResponseTime = respondedCount > 0 ? Math.round(totalResponseTime / respondedCount / 1000) : 0; // in seconds
    
    return {
      totalMessages: recentMessages.length,
      inbound,
      outbound,
      activeConversations: conversations.filter(c => c.status === "active").length,
      totalConversations: conversations.length,
      avgResponseTime, // in seconds
      responseRate: inbound > 0 ? Math.round((respondedCount / inbound) * 100) : 0,
    };
  },
});

// ─── Update Message Status by WA Message ID ──────────────────
export const updateMessageStatusByWamid = mutation({
  args: {
    waMessageId: v.string(),
    status: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.query("whatsapp_messages")
      .withIndex("by_waMessageId", q => q.eq("waMessageId", args.waMessageId))
      .first();
    
    if (message) {
      await ctx.db.patch(message._id, { status: args.status });
    }
  },
});

// ─── Get WhatsApp Analytics (alias) ─────────────────────────
export const getAnalytics = query({
  args: { storeId: v.id("stores"), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;
    
    const messages = await ctx.db.query("whatsapp_messages")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    const recentMessages = messages.filter(m => m.createdAt >= startDate);
    
    const conversations = await ctx.db.query("whatsapp_conversations")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();
    
    const inbound = recentMessages.filter(m => m.direction === "inbound").length;
    const outbound = recentMessages.filter(m => m.direction === "outbound").length;
    
    return {
      totalMessages: recentMessages.length,
      inbound,
      outbound,
      activeConversations: conversations.filter(c => c.status === "active").length,
      totalConversations: conversations.length,
      avgResponseTime: 0,
      responseRate: 0,
    };
  },
});

// ─── List all tickets (for testing) ───────────────────────────
export const listTickets = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const tickets = await ctx.db.query("support_tickets").collect();
    return tickets.slice(0, args.limit || 10);
  },
});

// ─── Webhook Verification ──────────────────────────────────
export const verifyWebhook = query({
  args: { mode: v.string(), token: v.string(), challenge: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // This would verify against stored webhook verify token
    // For now, just return the challenge if mode is verify
    if (args.mode === "verify" && args.challenge) {
      return args.challenge;
    }
    return null;
  },
});
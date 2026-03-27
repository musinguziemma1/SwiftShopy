import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("seller"), v.literal("admin")),
    phone: v.optional(v.string()),
    isActive: v.boolean(),
    joinDate: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_joinDate", ["joinDate"]),

  stores: defineTable({
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    phone: v.string(),
    logo: v.optional(v.string()),
    banner: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"]),

  products: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    image: v.optional(v.string()),
    stock: v.number(),
    sales: v.optional(v.number()),
    category: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_store", ["storeId"])
    .index("by_store_active", ["storeId", "isActive"])
    .index("by_category", ["category"]),

  orders: defineTable({
    storeId: v.id("stores"),
    orderNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    items: v.array(v.object({
      productId: v.string(),
      productName: v.string(),
      price: v.number(),
      quantity: v.number(),
      total: v.number(),
    })),
    subtotal: v.number(),
    total: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("by_store", ["storeId"])
    .index("by_status", ["status"])
    .index("by_orderNumber", ["orderNumber"])
    .index("by_createdAt", ["createdAt"]),

  transactions: defineTable({
    orderId: v.id("orders"),
    storeId: v.id("stores"),
    amount: v.number(),
    currency: v.string(),
    provider: v.union(v.literal("mtn_momo"), v.literal("airtel_money")),
    providerRef: v.string(),
    externalRef: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("successful"),
      v.literal("failed")
    ),
    customerPhone: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_order", ["orderId"])
    .index("by_store", ["storeId"])
    .index("by_externalRef", ["externalRef"])
    .index("by_providerRef", ["providerRef"]),

  // ─── Admin & Operations ─────────────────────────────────
  admin_users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("support"), v.literal("analyst")),
    permissions: v.array(v.string()),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_userId", ["userId"]),

  audit_logs: defineTable({
    adminId: v.string(),
    adminName: v.string(),
    action: v.string(),
    targetType: v.union(v.literal("user"), v.literal("seller"), v.literal("order"), v.literal("product"), v.literal("transaction"), v.literal("settings"), v.literal("system")),
    targetId: v.string(),
    targetName: v.optional(v.string()),
    details: v.any(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"])
    .index("by_action", ["action"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_date", ["createdAt"]),

  support_tickets: defineTable({
    ticketNumber: v.string(),
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    category: v.union(v.literal("payment"), v.literal("account"), v.literal("technical"), v.literal("billing"), v.literal("integration"), v.literal("other")),
    priority: v.union(v.literal("critical"), v.literal("high"), v.literal("medium"), v.literal("low")),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("pending"), v.literal("resolved"), v.literal("closed")),
    subject: v.string(),
    description: v.string(),
    orderId: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    assignedToName: v.optional(v.string()),
    slaDeadline: v.optional(v.number()),
    firstResponseAt: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ticketNumber", ["ticketNumber"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_assigned", ["assignedTo"])
    .index("by_date", ["createdAt"]),

  ticket_messages: defineTable({
    ticketId: v.id("support_tickets"),
    senderId: v.string(),
    senderName: v.string(),
    senderType: v.union(v.literal("user"), v.literal("admin"), v.literal("support")),
    message: v.string(),
    isInternal: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_ticket", ["ticketId"])
    .index("by_date", ["createdAt"]),

  bulk_operations: defineTable({
    adminId: v.string(),
    type: v.union(v.literal("approve_sellers"), v.literal("suspend_sellers"), v.literal("activate_products"), v.literal("deactivate_products"), v.literal("export_data"), v.literal("import_data")),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    totalCount: v.number(),
    successCount: v.number(),
    failedCount: v.number(),
    filters: v.any(),
    results: v.array(v.object({ id: v.string(), success: v.boolean(), error: v.optional(v.string()) })),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_admin", ["adminId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_date", ["createdAt"]),

  scheduled_reports: defineTable({
    name: v.string(),
    type: v.union(v.literal("revenue"), v.literal("sellers"), v.literal("orders"), v.literal("products"), v.literal("transactions"), v.literal("support"), v.literal("custom")),
    format: v.union(v.literal("json"), v.literal("csv"), v.literal("xlsx"), v.literal("pdf")),
    filters: v.any(),
    schedule: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    recipients: v.array(v.string()),
    lastRunAt: v.optional(v.number()),
    nextRunAt: v.number(),
    isActive: v.boolean(),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_schedule", ["schedule"])
    .index("by_active", ["isActive"]),

  // ─── Platform Settings ─────────────────────────────────────
  platform_settings: defineTable({
    category: v.union(v.literal("general"), v.literal("payment"), v.literal("security"), v.literal("notification"), v.literal("api")),
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    updatedBy: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_key", ["key"]),

  // ─── WhatsApp Integration ───────────────────────────────────
  whatsapp_accounts: defineTable({
    storeId: v.id("stores"),
    phoneNumberId: v.string(),
    businessAccountId: v.string(),
    businessPhone: v.string(),
    businessName: v.string(),
    accessToken: v.string(),
    webhookVerifyToken: v.string(),
    qrCode: v.optional(v.string()),
    qrCodeExpiresAt: v.optional(v.number()),
    isConnected: v.boolean(),
    lastSyncAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_phone", ["businessPhone"])
    .index("by_connected", ["isConnected"]),

  whatsapp_contacts: defineTable({
    storeId: v.id("stores"),
    waId: v.string(),
    phone: v.string(),
    name: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    isBusiness: v.boolean(),
    lastSeenAt: v.optional(v.number()),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_waId", ["waId"])
    .index("by_phone", ["phone"]),

  whatsapp_conversations: defineTable({
    storeId: v.id("stores"),
    contactId: v.id("whatsapp_contacts"),
    lastMessageAt: v.number(),
    lastMessagePreview: v.string(),
    unreadCount: v.number(),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("blocked")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_contact", ["contactId"])
    .index("by_lastMessageAt", ["lastMessageAt"])
    .index("by_status", ["status"]),

  whatsapp_messages: defineTable({
    storeId: v.id("stores"),
    conversationId: v.id("whatsapp_conversations"),
    contactId: v.id("whatsapp_contacts"),
    waMessageId: v.string(),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("audio"), v.literal("video"), v.literal("document"), v.literal("location"), v.literal("interactive")),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    status: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read"), v.literal("failed")),
    createdAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_conversation", ["conversationId"])
    .index("by_contact", ["contactId"])
    .index("by_waMessageId", ["waMessageId"])
    .index("by_direction", ["direction"])
    .index("by_date", ["createdAt"]),

  whatsapp_quick_replies: defineTable({
    storeId: v.id("stores"),
    title: v.string(),
    shortcut: v.string(),
    message: v.string(),
    category: v.optional(v.string()),
    usageCount: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_shortcut", ["shortcut"])
    .index("by_active", ["isActive"]),

  whatsapp_templates: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    category: v.union(v.literal("marketing"), v.literal("transactional"), v.literal("utility")),
    language: v.string(),
    content: v.string(),
    components: v.optional(v.any()),
    status: v.union(v.literal("draft"), v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    usageCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  whatsapp_payment_links: defineTable({
    storeId: v.id("stores"),
    conversationId: v.optional(v.id("whatsapp_conversations")),
    orderId: v.optional(v.id("orders")),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
    paymentLink: v.string(),
    expiresAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("expired"), v.literal("cancelled")),
    createdAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_order", ["orderId"])
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"]),
});

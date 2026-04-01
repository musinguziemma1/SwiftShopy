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

  // ─── Notifications ─────────────────────────────────────────
  notifications: defineTable({
    userId: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
    type: v.union(
      v.literal("order_new"),
      v.literal("order_paid"),
      v.literal("order_failed"),
      v.literal("order_updated"),
      v.literal("payment_received"),
      v.literal("product_low_stock"),
      v.literal("product_out_of_stock"),
      v.literal("product_created"),
      v.literal("product_updated"),
      v.literal("whatsapp_message"),
      v.literal("whatsapp_connected"),
      v.literal("system_alert"),
      v.literal("sla_breach"),
      v.literal("user_registered"),
      v.literal("user_suspended"),
      v.literal("user_activated"),
      v.literal("store_created"),
      v.literal("transaction_new"),
      v.literal("customer_inquiry"),
      v.literal("customer_chat"),
      v.literal("payout_requested"),
      v.literal("payout_completed"),
      v.literal("subscription_created"),
      v.literal("subscription_renewed"),
      v.literal("subscription_expired"),
      v.literal("subscription_upgraded"),
      v.literal("subscription_downgraded"),
      v.literal("payment_pending"),
      v.literal("payment_success"),
      v.literal("payment_failed"),
      v.literal("product_limit_reached"),
      v.literal("referral_bonus"),
      v.literal("usage_discount_applied")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_store", ["storeId"])
    .index("by_unread", ["isRead"])
    .index("by_date", ["createdAt"]),

  // ─── Customers ──────────────────────────────────────────
  customers: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    totalOrders: v.number(),
    totalSpent: v.number(),
    tier: v.union(v.literal("regular"), v.literal("vip"), v.literal("premium")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_phone", ["phone"])
    .index("by_tier", ["tier"]),

  // ─── Payouts ──────────────────────────────────────────
  payouts: defineTable({
    storeId: v.id("stores"),
    amount: v.number(),
    currency: v.string(),
    method: v.union(v.literal("mtn_momo"), v.literal("bank_transfer")),
    accountNumber: v.string(),
    accountName: v.string(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    reference: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"]),

  // ─── Subscriptions ─────────────────────────────────────────
  subscriptions: defineTable({
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("cancelled")),
    startDate: v.number(),
    endDate: v.number(),
    autoRenew: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_store", ["storeId"])
    .index("by_status", ["status"])
    .index("by_endDate", ["endDate"]),

   // ─── Subscription Payments ─────────────────────────────────
   subscription_payments: defineTable({
     userId: v.id("users"),
     subscriptionId: v.optional(v.id("subscriptions")),
     amount: v.number(),
     currency: v.string(),
     phone: v.string(),
     plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
     status: v.union(v.literal("pending"), v.literal("success"), v.literal("failed"), v.literal("cancelled")),
     provider: v.union(v.literal("mtn_momo"), v.literal("airtel_money")),
     providerRef: v.optional(v.string()),
     externalRef: v.string(),
     failureReason: v.optional(v.string()),
     createdAt: v.number(),
     processedAt: v.optional(v.number()),
   })
     .index("by_user", ["userId"])
     .index("by_subscription", ["subscriptionId"])
     .index("by_status", ["status"])
     .index("by_externalRef", ["externalRef"])
     .index("by_date", ["createdAt"]),

   // ─── Tokenization Tables ───────────────────────────────────
   payment_tokens: defineTable({
     token: v.string(),
     hashedData: v.string(),
     createdAt: v.number(),
     expiresAt: v.optional(v.number()),
     userId: v.optional(v.id("users")),
     storeId: v.optional(v.id("stores")),
   })
     .index("by_token", ["token"])
     .index("by_user", ["userId"])
     .index("by_expiresAt", ["expiresAt"]),

   token_audit_log: defineTable({
     tokenId: v.id("payment_tokens"),
     action: v.union(v.literal("create"), v.literal("validate"), v.literal("expire")),
     userId: v.optional(v.id("users")),
     ipAddress: v.optional(v.string()),
     userAgent: v.optional(v.string()),
     metadata: v.any(),
     createdAt: v.number(),
   })
     .index("by_tokenId", ["tokenId"])
     .index("by_action", ["action"])
     .index("by_user", ["userId"])
     .index("by_date", ["createdAt"]),

  // ─── Usage Tracking ─────────────────────────────────────────
  usage_tracking: defineTable({
    userId: v.id("users"),
    storeId: v.optional(v.id("stores")),
    month: v.string(),
    year: v.number(),
    totalTransactionAmount: v.number(),
    transactionCount: v.number(),
    platformFee: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_store", ["storeId"])
    .index("by_month", ["month", "year"]),

  // ─── Referrals ─────────────────────────────────────────────
  referrals: defineTable({
    referrerUserId: v.id("users"),
    referrerUserCode: v.string(),
    referredUserId: v.optional(v.id("users")),
    referredUserEmail: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    rewardGranted: v.boolean(),
    rewardType: v.optional(v.union(v.literal("free_month"), v.literal("discount"), v.literal("cash"))),
    rewardAmount: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_referrer", ["referrerUserId"])
    .index("by_referred", ["referredUserId"])
    .index("by_code", ["referrerUserCode"])
    .index("by_status", ["status"]),

  // ─── Billing Settings ───────────────────────────────────────
  billing_settings: defineTable({
    userId: v.id("users"),
    walletBalance: v.optional(v.number()),
    discountEligible: v.optional(v.boolean()),
    discountPercentage: v.optional(v.number()),
    discountReason: v.optional(v.string()),
    lastDiscountApplied: v.optional(v.number()),
    referralCode: v.string(),
    referralCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_referral_code", ["referralCode"]),

  // ─── Promotions & Incentives ──────────────────────────────
  promotions: defineTable({
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
    currentRedemptions: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("by_dates", ["startDate", "endDate"]),

  // ─── Email Verification ──────────────────────────────────
  email_verifications: defineTable({
    email: v.string(),
    code: v.string(),
    type: v.union(v.literal("registration"), v.literal("password_reset"), v.literal("email_change")),
    userId: v.optional(v.id("users")),
    isUsed: v.boolean(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_code", ["code"])
    .index("by_expires", ["expiresAt"]),

  // ─── Admin Invitations ──────────────────────────────────
  admin_invitations: defineTable({
    email: v.string(),
    invitedBy: v.string(),
    invitedByName: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("support"), v.literal("analyst")),
    permissions: v.array(v.string()),
    token: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired"), v.literal("cancelled")),
    acceptedBy: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_token", ["token"])
    .index("by_status", ["status"])
    .index("by_invitedBy", ["invitedBy"]),

  // ─── Email Queue ──────────────────────────────────────────
  email_queue: defineTable({
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    type: v.union(
      v.literal("verification"),
      v.literal("invitation"),
      v.literal("notification"),
      v.literal("password_reset"),
      v.literal("welcome"),
      v.literal("order"),
      v.literal("payment"),
      v.literal("subscription")
    ),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_to", ["to"]),

  // ─── Disbursements (Bulk Payouts) ────────────────────────
  disbursements: defineTable({
    batchId: v.string(),
    userId: v.id("users"),
    sellerName: v.string(),
    sellerEmail: v.string(),
    sellerPhone: v.string(),
    storeId: v.optional(v.id("stores")),
    storeName: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
    provider: v.union(v.literal("mtn_momo"), v.literal("airtel_money")),
    providerRef: v.optional(v.string()),
    externalRef: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    failureReason: v.optional(v.string()),
    transactionId: v.optional(v.id("transactions")),
    initiatedBy: v.string(),
    initiatedByName: v.string(),
    approvedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_batch", ["batchId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_provider", ["provider"])
    .index("by_plan", ["plan"])
    .index("by_date", ["createdAt"]),

  // ─── Disbursement Batches ────────────────────────────────
  disbursement_batches: defineTable({
    batchId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    plan: v.union(v.literal("all"), v.literal("free"), v.literal("pro"), v.literal("business"), v.literal("enterprise")),
    provider: v.union(v.literal("mtn_momo"), v.literal("airtel_money")),
    totalAmount: v.number(),
    totalSellers: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("pending_approval"),
      v.literal("approved"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    successCount: v.number(),
    failedCount: v.number(),
    initiatedBy: v.string(),
    initiatedByName: v.string(),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_batch", ["batchId"])
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"]),
});

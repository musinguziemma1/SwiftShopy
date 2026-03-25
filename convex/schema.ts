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
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

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
    isActive: v.boolean(),
  })
    .index("by_store", ["storeId"])
    .index("by_store_active", ["storeId", "isActive"]),

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
  })
    .index("by_store", ["storeId"])
    .index("by_status", ["status"])
    .index("by_orderNumber", ["orderNumber"]),

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
});

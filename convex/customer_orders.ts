import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.string(),
    orderNumber: v.string(),
    trackingNumber: v.optional(v.string()),
    items: v.array(v.object({
      productId: v.string(),
      productName: v.string(),
      price: v.number(),
      quantity: v.number(),
      total: v.number(),
      storeId: v.string(),
      sellerId: v.string(),
    })),
    subtotal: v.number(),
    total: v.number(),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    shippingAddress: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("processing"), v.literal("shipped"), v.literal("delivered"), v.literal("completed"), v.literal("cancelled"), v.literal("refunded")),
    deliveryStatus: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("dispatched"), v.literal("in_transit"), v.literal("delivered"), v.literal("buyer_confirmed"))),
    paymentMethod: v.optional(v.union(v.literal("mtn_momo"), v.literal("airtel_money"), v.literal("cash_on_delivery"), v.literal("bank_transfer"))),
    paymentStatus: v.optional(v.union(v.literal("pending"), v.literal("pending_confirmation"), v.literal("paid"), v.literal("failed"), v.literal("refunded"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customer_orders", args);
  },
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) => {
    return await ctx.db.query("customer_orders").withIndex("by_orderNumber", q => q.eq("orderNumber", orderNumber)).first();
  },
});

export const getByTracking = query({
  args: { trackingNumber: v.string() },
  handler: async (ctx, { trackingNumber }) => {
    return await ctx.db.query("customer_orders").withIndex("by_tracking", q => q.eq("trackingNumber", trackingNumber)).first();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query("customer_orders").withIndex("by_user", q => q.eq("userId", userId)).order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("customer_orders"),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("processing"), v.literal("shipped"), v.literal("delivered"), v.literal("completed"), v.literal("cancelled"), v.literal("refunded")),
    paymentStatus: v.optional(v.union(v.literal("pending"), v.literal("pending_confirmation"), v.literal("paid"), v.literal("failed"), v.literal("refunded"))),
    deliveryStatus: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("dispatched"), v.literal("in_transit"), v.literal("delivered"), v.literal("buyer_confirmed"))),
  },
  handler: async (ctx, { id, status, paymentStatus, deliveryStatus }) => {
    const updateData: any = { status, updatedAt: Date.now() };
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;
    await ctx.db.patch(id, updateData);
  },
});
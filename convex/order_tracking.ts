import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    orderId: v.id("orders"),
    storeId: v.id("stores"),
    sellerId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("packed"), v.literal("shipped"), v.literal("in_transit"), v.literal("delivered"), v.literal("cancelled")),
    currentLocation: v.optional(v.string()),
    estimatedDelivery: v.optional(v.number()),
    actualDelivery: v.optional(v.number()),
    trackingHistory: v.array(v.object({
      status: v.string(),
      location: v.optional(v.string()),
      description: v.string(),
      timestamp: v.number(),
    })),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("order_tracking", args);
  },
});

export const getByOrderId = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db.query("order_tracking").withIndex("by_order", q => q.eq("orderId", orderId)).first();
  },
});

export const getByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db.query("order_tracking").withIndex("by_store", q => q.eq("storeId", storeId)).order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("packed"), v.literal("shipped"), v.literal("in_transit"), v.literal("delivered"), v.literal("cancelled")),
    location: v.optional(v.string()),
    description: v.string(),
    estimatedDelivery: v.optional(v.number()),
  },
  handler: async (ctx, { orderId, status, location, description, estimatedDelivery }) => {
    const tracking = await ctx.db.query("order_tracking").withIndex("by_order", q => q.eq("orderId", orderId)).first();
    if (!tracking) throw new Error("Tracking not found");

    const now = Date.now();
    const history = [...tracking.trackingHistory, {
      status,
      location,
      description,
      timestamp: now,
    }];

    await ctx.db.patch(tracking._id, {
      status,
      currentLocation: location,
      estimatedDelivery,
      trackingHistory: history,
      updatedAt: now,
    });

    const order = await ctx.db.get(orderId);
    if (order?.userId) {
      await ctx.db.insert("notifications", {
        userId: order.userId,
        storeId: tracking.storeId,
        type: "order_updated",
        title: `Order ${status.replace("_", " ")}`,
        message: description,
        isRead: false,
        actionUrl: "/track",
        metadata: { orderId, status },
        createdAt: now,
      });
    }
  },
});
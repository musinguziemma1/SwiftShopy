import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByStore = query({
  args: { storeId: v.id("stores"), limit: v.optional(v.number()) },
  handler: async (ctx, { storeId, limit = 50 }) => {
    return await ctx.db.query("orders").withIndex("by_store", q => q.eq("storeId", storeId)).order("desc").take(limit);
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) => {
    return await ctx.db.query("orders").withIndex("by_orderNumber", q => q.eq("orderNumber", orderNumber)).first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").order("desc").take(100);
    return await Promise.all(orders.map(async (o) => {
      const store = await ctx.db.get(o.storeId);
      return { ...o, store };
    }));
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("orders").collect(),
});

export const getByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { startDate, endDate, limit = 50 }) => {
    let query = ctx.db.query("orders");
    if (startDate) {
      query = query.filter(q => q.gte(q.field("createdAt"), startDate));
    }
    if (endDate) {
      query = query.filter(q => q.lte(q.field("createdAt"), endDate));
    }
    return await query.order("desc").take(limit || 50);
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    userId: v.optional(v.id("users")),
    orderNumber: v.string(),
    trackingNumber: v.optional(v.string()),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    shippingAddress: v.optional(v.string()),
    items: v.array(v.object({
      productId: v.string(),
      productName: v.string(),
      price: v.number(),
      quantity: v.number(),
      total: v.number(),
      sellerId: v.optional(v.id("users")),
      storeId: v.optional(v.id("stores")),
    })),
    subtotal: v.number(),
    total: v.number(),
    status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("processing"), v.literal("shipped"), v.literal("delivered"), v.literal("completed"), v.literal("cancelled"))),
    paymentMethod: v.optional(v.union(v.literal("mtn_momo"), v.literal("airtel_money"), v.literal("cash_on_delivery"), v.literal("bank_transfer"))),
    paymentStatus: v.optional(v.union(v.literal("pending"), v.literal("pending_confirmation"), v.literal("paid"), v.literal("failed"))),
    notes: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = args.createdAt || Date.now();
    const orderId = await ctx.db.insert("orders", {
      storeId: args.storeId,
      userId: args.userId,
      orderNumber: args.orderNumber,
      trackingNumber: args.trackingNumber,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      shippingAddress: args.shippingAddress,
      items: args.items,
      subtotal: args.subtotal,
      total: args.total,
      status: args.status || "pending",
      paymentMethod: args.paymentMethod,
      paymentStatus: args.paymentStatus || "pending",
      notes: args.notes,
      deliveryStatus: "pending",
      createdAt: now,
      updatedAt: args.updatedAt || now,
    });
    
    const store = await ctx.db.get(args.storeId);
    const sellerId = store ? store.userId : undefined;

    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "order_new",
      title: "New Order Received",
      message: `Order ${args.orderNumber} from ${args.customerName} - UGX ${args.total.toLocaleString()}`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { orderId, storeId: args.storeId, orderNumber: args.orderNumber, total: args.total },
      createdAt: now,
    });

    if (sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: args.storeId,
        type: "order_new",
        title: "New Order!",
        message: `${args.customerName} placed an order for UGX ${args.total.toLocaleString()}. Order #${args.orderNumber}`,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { orderId, customerName: args.customerName, total: args.total },
        createdAt: now,
      });
    }

    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("cancelled"))),
    escrowStatus: v.optional(v.union(v.literal("awaiting_payment"), v.literal("held"), v.literal("released"), v.literal("refunded"))),
    deliveryStatus: v.optional(v.union(v.literal("pending"), v.literal("dispatched"), v.literal("delivered"), v.literal("buyer_confirmed"))),
    paymentStatus: v.optional(v.union(v.literal("pending"), v.literal("pending_confirmation"), v.literal("paid"), v.literal("failed"))),
  },
  handler: async (ctx, { id, status, escrowStatus, deliveryStatus, paymentStatus }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");
    
    const patchData: any = {};
    if (status) patchData.status = status;
    if (escrowStatus) patchData.escrowStatus = escrowStatus;
    if (deliveryStatus) patchData.deliveryStatus = deliveryStatus;
    if (paymentStatus) patchData.paymentStatus = paymentStatus;
    await ctx.db.patch(id, patchData);
    
    const now = Date.now();
    const currentStatus = status || order.status;
    const store = await ctx.db.get(order.storeId);
    const sellerId = store?.userId;

    // Determine notification type and messages
    let notificationType: "order_paid" | "order_failed" | "order_updated" = "order_updated";
    let adminMessage = "";
    let sellerMessage = "";

    if (status === "paid") {
      notificationType = "order_paid";
      adminMessage = `Order ${order.orderNumber} has been paid - UGX ${order.total.toLocaleString()}`;
      sellerMessage = `Payment received for Order #${order.orderNumber}! UGX ${order.total.toLocaleString()}`;
    } else if (status === "failed") {
      notificationType = "order_failed";
      adminMessage = `Order ${order.orderNumber} payment failed`;
      sellerMessage = `Payment failed for Order #${order.orderNumber}. Customer: ${order.customerName}`;
    } else if (status === "cancelled") {
      adminMessage = `Order ${order.orderNumber} has been cancelled`;
      sellerMessage = `Order #${order.orderNumber} has been cancelled`;
    } else {
      adminMessage = `Order ${order.orderNumber} status updated to ${currentStatus}`;
      sellerMessage = `Order #${order.orderNumber} status updated to ${currentStatus}`;
    }

    // Notify admin
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: notificationType,
      title: `Order ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}`,
      message: adminMessage,
      isRead: false,
      actionUrl: "/admin",
      metadata: { orderId: id, orderNumber: order.orderNumber, status: currentStatus, total: order.total },
      createdAt: now,
    });

    // Notify seller
    if (sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: order.storeId,
        type: notificationType,
        title: `Order ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}`,
        message: sellerMessage,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { orderId: id, orderNumber: order.orderNumber, status: currentStatus, total: order.total },
        createdAt: now,
      });
    }
  },
});

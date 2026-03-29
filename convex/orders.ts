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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const orderId = await ctx.db.insert("orders", { ...args, status: "pending", createdAt: now });
    
    // Get store info for seller notification
    const store = await ctx.db.get(args.storeId);
    const sellerId = store?.userId;

    // Notify admin about new order
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

    // Notify seller about new order
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
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("cancelled")),
  },
  handler: async (ctx, { id, status }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");
    
    await ctx.db.patch(id, { status });
    
    const now = Date.now();
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
      adminMessage = `Order ${order.orderNumber} status updated to ${status}`;
      sellerMessage = `Order #${order.orderNumber} status updated to ${status}`;
    }

    // Notify admin
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: notificationType,
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: adminMessage,
      isRead: false,
      actionUrl: "/admin",
      metadata: { orderId: id, orderNumber: order.orderNumber, status, total: order.total },
      createdAt: now,
    });

    // Notify seller
    if (sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: order.storeId,
        type: notificationType,
        title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: sellerMessage,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { orderId: id, orderNumber: order.orderNumber, status, total: order.total },
        createdAt: now,
      });
    }
  },
});

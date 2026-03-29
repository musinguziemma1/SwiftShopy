import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByStore = query({
  args: { storeId: v.id("stores"), activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, { storeId, activeOnly }) => {
    const products = await ctx.db.query("products").withIndex("by_store", q => q.eq("storeId", storeId)).collect();
    return activeOnly ? products.filter(p => p.isActive) : products;
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    image: v.optional(v.string()),
    stock: v.number(),
    sales: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const productId = await ctx.db.insert("products", { ...args, isActive: true, sales: args.sales ?? 0, category: args.category ?? "" });
    
    // Get store info
    const store = await ctx.db.get(args.storeId);
    const sellerId = store?.userId;

    // Notify seller about new product
    if (sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: args.storeId,
        type: "product_created",
        title: "New Product Added",
        message: `"${args.name}" has been added to your store with ${args.stock} units in stock.`,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { productId, productName: args.name, stock: args.stock, price: args.price },
        createdAt: now,
      });
    }

    // Notify admin about new product
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "product_created",
      title: "New Product Listed",
      message: `${store?.name || "Unknown Store"} added "${args.name}" - UGX ${args.price.toLocaleString()}`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { productId, storeId: args.storeId, productName: args.name, price: args.price },
      createdAt: now,
    });

    return productId;
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    image: v.optional(v.string()),
    stock: v.optional(v.number()),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");
    
    await ctx.db.patch(id, updates);
    
    const now = Date.now();
    const store = await ctx.db.get(product.storeId);
    const sellerId = store?.userId;

    // Check for low stock and notify
    if (updates.stock !== undefined && updates.stock <= 5 && updates.stock > 0) {
      if (sellerId) {
        await ctx.db.insert("notifications", {
          userId: sellerId,
          storeId: product.storeId,
          type: "product_low_stock",
          title: "Low Stock Alert!",
          message: `"${product.name}" has only ${updates.stock} units remaining. Consider restocking soon.`,
          isRead: false,
          actionUrl: "/dashboard",
          metadata: { productId: id, productName: product.name, stock: updates.stock },
          createdAt: now,
        });
      }
    }

    // Check for out of stock
    if (updates.stock !== undefined && updates.stock === 0) {
      if (sellerId) {
        await ctx.db.insert("notifications", {
          userId: sellerId,
          storeId: product.storeId,
          type: "product_out_of_stock",
          title: "Out of Stock!",
          message: `"${product.name}" is now out of stock. Restock to continue accepting orders.`,
          isRead: false,
          actionUrl: "/dashboard",
          metadata: { productId: id, productName: product.name },
          createdAt: now,
        });
      }
    }
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");
    
    const store = await ctx.db.get(product.storeId);
    const sellerId = store?.userId;
    const now = Date.now();

    await ctx.db.delete(id);

    // Notify seller about product deletion
    if (sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: product.storeId,
        type: "product_updated",
        title: "Product Removed",
        message: `"${product.name}" has been removed from your store.`,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { productName: product.name },
        createdAt: now,
      });
    }
  },
});

export const toggleActive = mutation({
  args: { id: v.id("products"), isActive: v.boolean() },
  handler: async (ctx, { id, isActive }) => {
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");
    
    await ctx.db.patch(id, { isActive });
    
    const store = await ctx.db.get(product.storeId);
    const sellerId = store?.userId;
    const now = Date.now();

    if (sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: product.storeId,
        type: "product_updated",
        title: isActive ? "Product Activated" : "Product Deactivated",
        message: `"${product.name}" has been ${isActive ? "activated" : "deactivated"}.`,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { productId: id, productName: product.name, isActive },
        createdAt: now,
      });
    }
  },
});

export const updateStock = mutation({
  args: { id: v.id("products"), stock: v.number() },
  handler: async (ctx, { id, stock }) => {
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");
    
    await ctx.db.patch(id, { stock });
    
    const store = await ctx.db.get(product.storeId);
    const sellerId = store?.userId;
    const now = Date.now();

    // Notify about low stock
    if (stock <= 5 && stock > 0 && sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: product.storeId,
        type: "product_low_stock",
        title: "Low Stock Alert!",
        message: `"${product.name}" has only ${stock} units remaining.`,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { productId: id, productName: product.name, stock },
        createdAt: now,
      });
    }

    // Notify about out of stock
    if (stock === 0 && sellerId) {
      await ctx.db.insert("notifications", {
        userId: sellerId,
        storeId: product.storeId,
        type: "product_out_of_stock",
        title: "Out of Stock!",
        message: `"${product.name}" is now out of stock. Restock immediately!`,
        isRead: false,
        actionUrl: "/dashboard",
        metadata: { productId: id, productName: product.name },
        createdAt: now,
      });
    }
  },
});

export const incrementSales = mutation({
  args: { id: v.id("products"), quantity: v.number() },
  handler: async (ctx, { id, quantity }) => {
    const product = await ctx.db.get(id);
    if (product) {
      await ctx.db.patch(id, { sales: (product.sales || 0) + quantity, stock: Math.max(0, product.stock - quantity) });
    }
  },
});

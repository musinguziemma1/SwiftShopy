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
    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");

    // ─── Plan Limit Gating ───
    const subscription = await ctx.db.query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", store.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();
    
    const planLimits = { free: 10, pro: 25, business: 75, enterprise: -1 };
    const plan = subscription?.plan || "free";
    const limit = planLimits[plan as keyof typeof planLimits];

    if (limit !== -1) {
      const currentCount = (await ctx.db.query("products")
        .withIndex("by_store", q => q.eq("storeId", args.storeId))
        .collect()).length;
      if (currentCount >= limit) {
        throw new Error(`Your ${plan} plan product limit of ${limit} has been reached.`);
      }
    }

    const productId = await ctx.db.insert("products", { ...args, isActive: true, sales: args.sales ?? 0, category: args.category ?? "" });
    
    // Get store info
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

export const getAllActive = query({
  args: {
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("price_asc"),
      v.literal("price_desc"),
      v.literal("price_low"),
      v.literal("price_high"),
      v.literal("best_selling"),
      v.literal("popular"),
      v.literal("featured")
    )),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();

    // Attach store info
    const productsWithStores = await Promise.all(products.map(async (p) => {
      const store = await ctx.db.get(p.storeId);
      return { ...p, store: store ? { name: store.name, slug: store.slug, phone: store.phone } : null };
    }));
    products = productsWithStores;

    // Filter by category
    if (args.category) {
      products = products.filter(p => (p.category ?? "General") === args.category);
    }

    // Filter by search
    if (args.search) {
      const q = args.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (args.sortBy) {
      case "newest":
        products.sort((a, b) => b._creationTime - a._creationTime);
        break;
      case "oldest":
        products.sort((a, b) => a._creationTime - b._creationTime);
        break;
      case "price_asc":
      case "price_low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
      case "price_high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "best_selling":
      case "popular":
        products.sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0));
        break;
      case "featured":
        products.sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0));
        break;
      default:
        products.sort((a, b) => b._creationTime - a._creationTime);
    }

    // Limit
    if (args.limit) {
      products = products.slice(0, args.limit);
    }

    return products;
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
    const categories = new Set(products.map(p => p.category ?? "General").filter(Boolean));
    return Array.from(categories);
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db.query("users").withIndex("by_email", q => q.eq("email", email)).first();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("seller"), v.literal("admin")),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
    if (existing) throw new Error("Email already registered");
    return await ctx.db.insert("users", { ...args, isActive: true });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("users").collect(),
});

export const toggleActive = mutation({
  args: { id: v.id("users"), isActive: v.boolean() },
  handler: async (ctx, { id, isActive }) => ctx.db.patch(id, { isActive }),
});

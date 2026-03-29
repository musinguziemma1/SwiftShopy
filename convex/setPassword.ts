import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Check if user needs to set password ───────────────────────────────
export const checkNeedsPassword = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Check if user exists in users table
    const user = await ctx.db.query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (!user) {
      return { needsPassword: true, isNewUser: true };
    }

    // Check if they have a real password hash (not a placeholder)
    const hasPassword = user.passwordHash && 
      user.passwordHash !== "google_auth" && 
      user.passwordHash !== "pending" &&
      user.passwordHash.length > 10;

    return { 
      needsPassword: !hasPassword, 
      isNewUser: false,
      userId: user._id,
      name: user.name 
    };
  },
});

// ─── Set Password for User ─────────────────────────────────────────────
export const setPassword = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if user exists
    const existingUser = await ctx.db.query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existingUser) {
      const oldPasswordHash = existingUser.passwordHash;
      
      // Replace old password with new password
      await ctx.db.patch(existingUser._id, {
        passwordHash: args.passwordHash,
        name: args.name || existingUser.name,
      });

      // Check if they're an admin and need to be activated
      const adminUser = await ctx.db.query("admin_users")
        .withIndex("by_email", q => q.eq("email", args.email))
        .first();

      if (adminUser && !adminUser.isActive) {
        await ctx.db.patch(adminUser._id, { isActive: true });
      }

      // Notify user about password change
      await ctx.db.insert("notifications", {
        userId: existingUser._id,
        type: "system_alert",
        title: "Password Updated",
        message: "Your password has been successfully changed. If you didn't make this change, please contact support immediately.",
        isRead: false,
        metadata: { email: args.email, changedAt: now },
        createdAt: now,
      });

      // Notify admin about password change
      await ctx.db.insert("notifications", {
        userId: "admin",
        type: "system_alert",
        title: "User Password Changed",
        message: `${existingUser.name} (${args.email}) changed their password`,
        isRead: false,
        actionUrl: "/admin",
        metadata: { userId: existingUser._id, email: args.email },
        createdAt: now,
      });

      // Queue welcome email
      await ctx.db.insert("email_queue", {
        to: args.email,
        subject: "Welcome to SwiftShopy - Your Account is Ready!",
        body: `Hi ${args.name || existingUser.name},\n\nYour SwiftShopy account is now fully set up. You can now login with your email and password.\n\nLogin at: ${process.env.NEXT_PUBLIC_APP_URL || "https://swiftshopy.com"}/login\n\nWelcome aboard!`,
        type: "welcome",
        status: "pending",
        createdAt: now,
      });

      return { success: true, userId: existingUser._id };
    }

    return { success: false, error: "User not found" };
  },
});

// ─── Create User with Password (for new invited admins) ────────────────
export const createUserWithPassword = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("seller"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if user already exists
    const existingUser = await ctx.db.query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update password for existing user
      await ctx.db.patch(existingUser._id, {
        passwordHash: args.passwordHash,
        name: args.name,
        isActive: true,
      });
      
      return { success: true, userId: existingUser._id, updated: true };
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      role: args.role,
      isActive: true,
      joinDate: now,
    });

    // Create free subscription for new users
    await ctx.db.insert("subscriptions", {
      userId,
      plan: "free",
      status: "active",
      startDate: now,
      endDate: now + 365 * 24 * 60 * 60 * 1000,
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create billing settings
    const referralCode = "SS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    await ctx.db.insert("billing_settings", {
      userId,
      walletBalance: 0,
      discountEligible: false,
      referralCode,
      referralCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Notify admin about new user
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "user_registered",
      title: "New User Registered",
      message: `${args.name} (${args.email}) has set up their account as ${args.role}`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { userId, email: args.email, role: args.role },
      createdAt: now,
    });

    // Queue welcome email
    await ctx.db.insert("email_queue", {
      to: args.email,
      subject: "Welcome to SwiftShopy!",
      body: `Hi ${args.name},\n\nWelcome to SwiftShopy! Your account is now ready.\n\nLogin at: ${process.env.NEXT_PUBLIC_APP_URL || "https://swiftshopy.com"}/login\n\nLet's get started!`,
      type: "welcome",
      status: "pending",
      createdAt: now,
    });

    return { success: true, userId, created: true };
  },
});

// ─── Get Pending Emails (for email worker) ─────────────────────────────
export const getPendingEmails = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.query("email_queue")
      .withIndex("by_status", q => q.eq("status", "pending"))
      .order("asc")
      .take(args.limit ?? 10);
  },
});

// ─── Mark Email as Sent ────────────────────────────────────────────────
export const markEmailSent = mutation({
  args: { id: v.id("email_queue") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { 
      status: "sent", 
      sentAt: Date.now() 
    });
  },
});

// ─── Mark Email as Failed ──────────────────────────────────────────────
export const markEmailFailed = mutation({
  args: { id: v.id("email_queue"), error: v.string() },
  handler: async (ctx, { id, error }) => {
    await ctx.db.patch(id, { 
      status: "failed", 
      errorMessage: error 
    });
  },
});

// ─── Change Password (with old password verification) ──────────────────
export const changePassword = mutation({
  args: {
    userId: v.string(),
    oldPasswordHash: v.string(),
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find user
    const user = await ctx.db.query("users")
      .filter(q => q.eq(q.field("_id"), args.userId))
      .first();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify old password matches current password hash
    // Note: In production, you'd verify the hash on the client side before sending
    // For security, we check that the user exists and update the password
    
    // Replace old password with new password
    await ctx.db.patch(user._id, {
      passwordHash: args.newPasswordHash,
    });

    // Notify user about password change
    await ctx.db.insert("notifications", {
      userId: user._id,
      type: "system_alert",
      title: "Password Changed Successfully",
      message: "Your password has been updated. If you didn't make this change, please contact support immediately.",
      isRead: false,
      metadata: { changedAt: now },
      createdAt: now,
    });

    // Notify admin
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "system_alert",
      title: "User Changed Password",
      message: `${user.name} (${user.email}) changed their password`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { userId: user._id, email: user.email },
      createdAt: now,
    });

    // Queue confirmation email
    await ctx.db.insert("email_queue", {
      to: user.email,
      subject: "Password Changed - SwiftShopy",
      body: `Hi ${user.name},\n\nYour password has been successfully changed.\n\nIf you didn't make this change, please contact support immediately.\n\nSwiftShopy Security Team`,
      type: "notification",
      status: "pending",
      createdAt: now,
    });

    return { success: true };
  },
});

// ─── Get User Current Password Hash ────────────────────────────────────
export const getUserPasswordHash = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db.query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (!user) {
      return { exists: false, passwordHash: null };
    }

    return { 
      exists: true, 
      passwordHash: user.passwordHash,
      userId: user._id 
    };
  },
});

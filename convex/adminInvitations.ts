import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ─── Invite Admin ──────────────────────────────────────────────────────
export const inviteAdmin = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("support"), v.literal("analyst")),
    permissions: v.array(v.string()),
    invitedBy: v.string(),
    invitedByName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if email already has pending invitation
    const existingInvite = await ctx.db.query("admin_invitations")
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      return { success: false, error: "This email already has a pending invitation" };
    }

    // Check if email is already an admin
    const existingAdmin = await ctx.db.query("admin_users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existingAdmin) {
      return { success: false, error: "This email is already an admin" };
    }

    const token = generateToken();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const invitationId = await ctx.db.insert("admin_invitations", {
      email: args.email,
      invitedBy: args.invitedBy,
      invitedByName: args.invitedByName,
      role: args.role,
      permissions: args.permissions,
      token,
      status: "pending",
      expiresAt,
      createdAt: now,
    });

    // Notify admin about invitation
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "system_alert",
      title: "Admin Invitation Sent",
      message: `${args.invitedByName} invited ${args.email} as ${args.role.replace("_", " ")}`,
      isRead: false,
      actionUrl: "/admin?tab=permissions",
      metadata: { invitationId, email: args.email, role: args.role },
      createdAt: now,
    });

    return { success: true, invitationId, token, expiresAt };
  },
});

// ─── Get All Invitations ───────────────────────────────────────────────
export const getAllInvitations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admin_invitations")
      .order("desc")
      .collect();
  },
});

// ─── Get Invitation by Token ───────────────────────────────────────────
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const invitation = await ctx.db.query("admin_invitations")
      .withIndex("by_token", q => q.eq("token", token))
      .first();

    if (!invitation) return null;

    const isExpired = invitation.expiresAt < Date.now();
    return { ...invitation, isExpired };
  },
});

// ─── Accept Invitation ─────────────────────────────────────────────────
export const acceptInvitation = mutation({
  args: {
    token: v.string(),
    userId: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const invitation = await ctx.db.query("admin_invitations")
      .withIndex("by_token", q => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return { success: false, error: "Invalid invitation token" };
    }

    if (invitation.status !== "pending") {
      return { success: false, error: "Invitation has already been used" };
    }

    if (invitation.expiresAt < now) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      return { success: false, error: "Invitation has expired" };
    }

    // Create admin user
    await ctx.db.insert("admin_users", {
      userId: args.userId,
      name: args.userName,
      email: invitation.email,
      role: invitation.role,
      permissions: invitation.permissions,
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
    });

    // Update invitation status
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedBy: args.userId,
      acceptedAt: now,
    });

    // Notify about acceptance
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "system_alert",
      title: "Admin Invitation Accepted",
      message: `${args.userName} (${invitation.email}) has joined as ${invitation.role.replace("_", " ")}`,
      isRead: false,
      actionUrl: "/admin?tab=permissions",
      metadata: { userId: args.userId, email: invitation.email, role: invitation.role },
      createdAt: now,
    });

    return { success: true, role: invitation.role, permissions: invitation.permissions };
  },
});

// ─── Cancel Invitation ─────────────────────────────────────────────────
export const cancelInvitation = mutation({
  args: { id: v.id("admin_invitations") },
  handler: async (ctx, { id }) => {
    const invitation = await ctx.db.get(id);
    if (!invitation) throw new Error("Invitation not found");
    
    if (invitation.status !== "pending") {
      return { success: false, error: "Invitation is not pending" };
    }

    await ctx.db.patch(id, { status: "cancelled" });
    return { success: true };
  },
});

// ─── Update Admin Role ─────────────────────────────────────────────────
export const updateAdminRole = mutation({
  args: {
    adminId: v.id("admin_users"),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("support"), v.literal("analyst")),
    permissions: v.array(v.string()),
    updatedBy: v.string(),
    updatedByName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const admin = await ctx.db.get(args.adminId);
    if (!admin) throw new Error("Admin not found");

    const oldRole = admin.role;
    await ctx.db.patch(args.adminId, {
      role: args.role,
      permissions: args.permissions,
    });

    // Notify about role change
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "system_alert",
      title: "Admin Role Updated",
      message: `${admin.name}'s role changed from ${oldRole.replace("_", " ")} to ${args.role.replace("_", " ")} by ${args.updatedByName}`,
      isRead: false,
      actionUrl: "/admin?tab=permissions",
      metadata: { adminId: args.adminId, oldRole, newRole: args.role, updatedBy: args.updatedBy },
      createdAt: now,
    });

    // Notify the affected admin
    await ctx.db.insert("notifications", {
      userId: admin.userId,
      type: "system_alert",
      title: "Your Role Has Been Updated",
      message: `Your admin role has been changed to ${args.role.replace("_", " ")}`,
      isRead: false,
      actionUrl: "/admin",
      metadata: { oldRole, newRole: args.role },
      createdAt: now,
    });

    return { success: true };
  },
});

// ─── Deactivate Admin ──────────────────────────────────────────────────
export const deactivateAdmin = mutation({
  args: {
    adminId: v.id("admin_users"),
    deactivatedBy: v.string(),
    deactivatedByName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const admin = await ctx.db.get(args.adminId);
    if (!admin) throw new Error("Admin not found");

    await ctx.db.patch(args.adminId, { isActive: false });

    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "user_suspended",
      title: "Admin Deactivated",
      message: `${admin.name} (${admin.email}) has been deactivated by ${args.deactivatedByName}`,
      isRead: false,
      actionUrl: "/admin?tab=permissions",
      metadata: { adminId: args.adminId, email: admin.email },
      createdAt: now,
    });

    return { success: true };
  },
});

// ─── Activate Admin ────────────────────────────────────────────────────
export const activateAdmin = mutation({
  args: {
    adminId: v.id("admin_users"),
    activatedBy: v.string(),
    activatedByName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const admin = await ctx.db.get(args.adminId);
    if (!admin) throw new Error("Admin not found");

    await ctx.db.patch(args.adminId, { isActive: true });

    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "user_activated",
      title: "Admin Activated",
      message: `${admin.name} (${admin.email}) has been reactivated by ${args.activatedByName}`,
      isRead: false,
      actionUrl: "/admin?tab=permissions",
      metadata: { adminId: args.adminId, email: admin.email },
      createdAt: now,
    });

    return { success: true };
  },
});

// ─── Get All Admins ────────────────────────────────────────────────────
export const getAllAdmins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admin_users")
      .order("desc")
      .collect();
  },
});

// ─── Get Admin by Email ────────────────────────────────────────────────
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db.query("admin_users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();
  },
});

// ─── Delete Admin ──────────────────────────────────────────────────────
export const deleteAdmin = mutation({
  args: {
    adminId: v.id("admin_users"),
    deletedBy: v.string(),
    deletedByName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const admin = await ctx.db.get(args.adminId);
    if (!admin) throw new Error("Admin not found");

    await ctx.db.delete(args.adminId);

    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "system_alert",
      title: "Admin Removed",
      message: `${admin.name} (${admin.email}) has been removed from admin team by ${args.deletedByName}`,
      isRead: false,
      actionUrl: "/admin?tab=permissions",
      metadata: { email: admin.email, role: admin.role },
      createdAt: now,
    });

    return { success: true };
  },
});

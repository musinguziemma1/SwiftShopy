import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ─── ID Format Validation ─────────────────────────────────────────────────
function validateIdFormat(idType: string, idNumber: string): { valid: boolean; flags: string[] } {
  const flags: string[] = [];
  let valid = true;

  if (!idNumber || idNumber.trim().length === 0) {
    flags.push("empty_id_number");
    return { valid: false, flags };
  }

  switch (idType) {
    case "national_id":
      // Uganda NIN: 14 alphanumeric chars (CM followed by alphanumeric)
      if (!/^[A-Z0-9]{10,14}$/i.test(idNumber.trim())) {
        flags.push("invalid_national_id_format");
        valid = false;
      }
      break;
    case "passport":
      // Passport: typically alphanumeric 6-12 chars
      if (!/^[A-Z0-9]{6,12}$/i.test(idNumber.trim())) {
        flags.push("invalid_passport_format");
        valid = false;
      }
      break;
    case "drivers_license":
      if (!/^[A-Z0-9]{5,15}$/i.test(idNumber.trim())) {
        flags.push("invalid_drivers_license_format");
        valid = false;
      }
      break;
    default:
      flags.push("unknown_id_type");
      valid = false;
  }

  return { valid, flags };
}

// ─── Risk Score Calculator ────────────────────────────────────────────────
function calculateRiskScore(params: {
  idFormatValid: boolean;
  isDuplicate: boolean;
  phoneConsistent: boolean;
  submissionCount: number;
  isBlacklisted: boolean;
  faceMatchScore?: number;
  livenessScore?: number;
}): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];

  // Base score for valid submission
  if (!params.idFormatValid) {
    score += 25;
    flags.push("invalid_id_format");
  }
  if (params.isDuplicate) {
    score += 40;
    flags.push("duplicate_id_detected");
  }
  if (!params.phoneConsistent) {
    score += 15;
    flags.push("phone_mismatch");
  }
  if (params.submissionCount > 3) {
    score += 20;
    flags.push("excessive_resubmissions");
  }
  if (params.isBlacklisted) {
    score += 100;
    flags.push("blacklisted_entry");
  }

  // Face verification checks
  if (params.faceMatchScore !== undefined) {
    if (params.faceMatchScore < 0.6) {
      score += 30;
      flags.push("face_match_failed");
    }
  } else {
    score += 20;
    flags.push("no_face_verification");
  }

  // Liveness check
  if (params.livenessScore !== undefined) {
    if (params.livenessScore < 0.5) {
      score += 15;
      flags.push("liveness_check_failed");
    }
  }

  return { score: Math.min(100, score), flags };
}

// ─── Submit KYC ───────────────────────────────────────────────────────────
export const submitKYC = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
    dateOfBirth: v.string(),
    idType: v.union(v.literal("national_id"), v.literal("passport"), v.literal("drivers_license")),
    idNumber: v.string(),
    documentUrl: v.string(),
    selfieUrl: v.string(),
    businessName: v.string(),
    phoneNumber: v.string(),
    // Tier 3 optional
    businessRegNumber: v.optional(v.string()),
    tinNumber: v.optional(v.string()),
    proofOfOwnershipUrl: v.optional(v.string()),
    // Metadata
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    // Face verification scores
    faceMatchScore: v.optional(v.number()),
    livenessScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Determine tier
    const tier = (args.businessRegNumber && args.tinNumber) ? "enterprise" : "verified";

    // Check for existing KYC submission
    const existing = await ctx.db.query("users_kyc")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    const submissionCount = existing ? existing.submissionCount + 1 : 1;

    // ── Automated Checks ──

    // 1. ID format validation
    const { valid: idFormatValid, flags: formatFlags } = validateIdFormat(args.idType, args.idNumber);

    // 2. Duplicate ID check
    const duplicateId = await ctx.db.query("users_kyc")
      .withIndex("by_idNumber", q => q.eq("idNumber", args.idNumber.trim().toUpperCase()))
      .first();
    const isDuplicate = duplicateId !== null && duplicateId.userId !== args.userId;

    // 3. Phone consistency check (phone must match user's registered phone or store phone)
    const store = await ctx.db.query("stores")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
    const userPhone = user.phone || "";
    const storePhone = store?.phone || "";
    const submittedPhone = args.phoneNumber.replace(/\D/g, "");
    const phoneConsistent = submittedPhone.includes(userPhone.replace(/\D/g, "")) ||
      userPhone.replace(/\D/g, "").includes(submittedPhone) ||
      submittedPhone.includes(storePhone.replace(/\D/g, "")) ||
      storePhone.replace(/\D/g, "").includes(submittedPhone) ||
      !userPhone; // If no phone set, skip check

    // 4. Blacklist check
    const blacklistedId = await ctx.db.query("kyc_blacklist")
      .withIndex("by_value", q => q.eq("value", args.idNumber.trim().toUpperCase()))
      .first();
    const blacklistedPhone = await ctx.db.query("kyc_blacklist")
      .withIndex("by_value", q => q.eq("value", submittedPhone))
      .first();
    const isBlacklisted = (blacklistedId?.isActive ?? false) || (blacklistedPhone?.isActive ?? false);

    if (isBlacklisted) {
      throw new Error("This identity has been flagged. Please contact support.");
    }

    // 5. Calculate risk score
    const { score: riskScore, flags: riskFlags } = calculateRiskScore({
      idFormatValid,
      isDuplicate,
      phoneConsistent,
      submissionCount,
      isBlacklisted,
      faceMatchScore: args.faceMatchScore,
      livenessScore: args.livenessScore,
    });

    const allFlags = [...formatFlags, ...riskFlags];

    // If duplicate ID is found, reject immediately
    if (isDuplicate) {
      throw new Error("This ID document is already associated with another account.");
    }

    // Delete old submission if resubmitting
    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Create KYC record
    const kycId = await ctx.db.insert("users_kyc", {
      userId: args.userId,
      fullName: args.fullName,
      dateOfBirth: args.dateOfBirth,
      idType: args.idType,
      idNumber: args.idNumber.trim().toUpperCase(),
      documentUrl: args.documentUrl,
      selfieUrl: args.selfieUrl,
      businessName: args.businessName,
      phoneNumber: args.phoneNumber,
      businessRegNumber: args.businessRegNumber,
      tinNumber: args.tinNumber,
      proofOfOwnershipUrl: args.proofOfOwnershipUrl,
      status: "pending",
      tier,
      riskScore,
      riskFlags: allFlags.length > 0 ? allFlags : undefined,
      idFormatValid,
      duplicateCheck: !isDuplicate,
      phoneConsistencyCheck: phoneConsistent,
      faceMatchScore: args.faceMatchScore,
      livenessScore: args.livenessScore,
      submittedAt: now,
      reviewedAt: undefined,
      reviewedBy: undefined,
      rejectionReason: undefined,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      submissionCount,
    });

    // Update user's KYC status
    await ctx.db.patch(args.userId, {
      kycStatus: "pending",
      kycTier: tier,
    });

    // Create KYC audit log
    await ctx.db.insert("kyc_audit_logs", {
      kycId,
      userId: args.userId,
      action: submissionCount > 1 ? "resubmitted" : "submitted",
      performedBy: args.userId,
      details: {
        idType: args.idType,
        tier,
        riskScore,
        riskFlags: allFlags,
        submissionCount,
      },
      createdAt: now,
    });

    // Auto-check audit log
    await ctx.db.insert("kyc_audit_logs", {
      kycId,
      userId: args.userId,
      action: "auto_checked",
      performedBy: "system",
      details: {
        idFormatValid,
        duplicateCheck: !isDuplicate,
        phoneConsistencyCheck: phoneConsistent,
        riskScore,
        riskFlags: allFlags,
      },
      createdAt: now,
    });

    // Flag high-risk if score > 50
    if (riskScore > 50) {
      await ctx.db.insert("kyc_audit_logs", {
        kycId,
        userId: args.userId,
        action: "flagged",
        performedBy: "system",
        details: { riskScore, reason: "High risk score detected", flags: allFlags },
        createdAt: now,
      });
    }

    // Notify seller
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "kyc_submitted",
      title: "KYC Verification Submitted",
      message: "Your identity verification has been submitted and is under review. You'll be notified once it's processed.",
      isRead: false,
      actionUrl: "/dashboard/kyc",
      metadata: { kycId, tier },
      createdAt: now,
    });

    // Notify admin
    await ctx.db.insert("notifications", {
      userId: "admin",
      type: "kyc_submitted",
      title: "New KYC Submission",
      message: `${args.fullName} (${args.businessName}) submitted KYC verification. Risk score: ${riskScore}/100.`,
      isRead: false,
      actionUrl: "/admin?tab=kyc",
      metadata: { kycId, userId: args.userId, riskScore, tier },
      createdAt: now,
    });

    return { kycId, riskScore, status: "pending" };
  },
});

// ─── Admin: Approve KYC ───────────────────────────────────────────────────
export const approveKYC = mutation({
  args: {
    kycId: v.id("users_kyc"),
    adminId: v.string(),
    adminName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const kyc = await ctx.db.get(args.kycId);
    if (!kyc) throw new Error("KYC submission not found");
    if (kyc.status === "verified") throw new Error("Already verified");

    // Update KYC record
    await ctx.db.patch(args.kycId, {
      status: "verified",
      reviewedAt: now,
      reviewedBy: args.adminId,
    });

    // Update user's KYC status
    await ctx.db.patch(kyc.userId, {
      kycStatus: "verified",
      kycTier: kyc.tier,
    });

    // KYC audit log
    await ctx.db.insert("kyc_audit_logs", {
      kycId: args.kycId,
      userId: kyc.userId,
      action: "approved",
      performedBy: args.adminId,
      details: { tier: kyc.tier },
      createdAt: now,
    });

    // Admin audit log
    await ctx.db.insert("audit_logs", {
      adminId: args.adminId,
      adminName: args.adminName || "Admin",
      action: "kyc_approved",
      targetType: "kyc",
      targetId: args.kycId,
      targetName: kyc.fullName,
      details: { userId: kyc.userId, tier: kyc.tier, businessName: kyc.businessName },
      createdAt: now,
    });

    // Notify user
    await ctx.db.insert("notifications", {
      userId: kyc.userId,
      type: "kyc_approved",
      title: "🎉 KYC Verification Approved!",
      message: "Congratulations! Your identity has been verified. You can now receive payments and process transactions.",
      isRead: false,
      actionUrl: "/dashboard",
      metadata: { kycId: args.kycId, tier: kyc.tier },
      createdAt: now,
    });

    return { success: true };
  },
});

// ─── Admin: Reject KYC ───────────────────────────────────────────────────
export const rejectKYC = mutation({
  args: {
    kycId: v.id("users_kyc"),
    adminId: v.string(),
    adminName: v.optional(v.string()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const kyc = await ctx.db.get(args.kycId);
    if (!kyc) throw new Error("KYC submission not found");

    // Update KYC record
    await ctx.db.patch(args.kycId, {
      status: "rejected",
      reviewedAt: now,
      reviewedBy: args.adminId,
      rejectionReason: args.reason,
    });

    // Update user's KYC status
    await ctx.db.patch(kyc.userId, {
      kycStatus: "rejected",
    });

    // KYC audit log
    await ctx.db.insert("kyc_audit_logs", {
      kycId: args.kycId,
      userId: kyc.userId,
      action: "rejected",
      performedBy: args.adminId,
      details: { reason: args.reason, tier: kyc.tier },
      createdAt: now,
    });

    // Admin audit log
    await ctx.db.insert("audit_logs", {
      adminId: args.adminId,
      adminName: args.adminName || "Admin",
      action: "kyc_rejected",
      targetType: "kyc",
      targetId: args.kycId,
      targetName: kyc.fullName,
      details: { userId: kyc.userId, reason: args.reason },
      createdAt: now,
    });

    // Notify user
    await ctx.db.insert("notifications", {
      userId: kyc.userId,
      type: "kyc_rejected",
      title: "KYC Verification Rejected",
      message: `Your verification was rejected. Reason: ${args.reason}. Please update your documents and resubmit.`,
      isRead: false,
      actionUrl: "/dashboard/kyc",
      metadata: { kycId: args.kycId, reason: args.reason },
      createdAt: now,
    });

    return { success: true };
  },
});

// ─── Query: Get User KYC ──────────────────────────────────────────────────
export const getUserKYC = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query("users_kyc")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();
  },
});

// ─── Query: Get KYC by ID ─────────────────────────────────────────────────
export const getKYCById = query({
  args: { id: v.id("users_kyc") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

// ─── Query: List All KYC Submissions ──────────────────────────────────────
export const listAllKYC = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))),
  },
  handler: async (ctx, { status }) => {
    let submissions;
    if (status) {
      submissions = await ctx.db.query("users_kyc")
        .withIndex("by_status", q => q.eq("status", status))
        .order("desc")
        .collect();
    } else {
      submissions = await ctx.db.query("users_kyc")
        .order("desc")
        .collect();
    }

    // Enrich with user data
    return await Promise.all(submissions.map(async (kyc) => {
      const user = await ctx.db.get(kyc.userId as Id<"users">);
      const store = await ctx.db.query("stores")
        .withIndex("by_user", q => q.eq("userId", kyc.userId))
        .first();
      return {
        ...kyc,
        userEmail: (user as any)?.email ?? "Unknown",
        userName: (user as any)?.name ?? "Unknown",
        storeName: store?.name ?? "No Store",
        storeSlug: store?.slug ?? "",
      };
    }));
  },
});

// ─── Query: Get KYC Stats ─────────────────────────────────────────────────
export const getKYCStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users_kyc").collect();
    const pending = all.filter(k => k.status === "pending").length;
    const verified = all.filter(k => k.status === "verified").length;
    const rejected = all.filter(k => k.status === "rejected").length;
    const highRisk = all.filter(k => k.riskScore > 50).length;

    // Average processing time (for verified/rejected)
    const processed = all.filter(k => k.reviewedAt && k.submittedAt);
    const avgProcessingTime = processed.length > 0
      ? processed.reduce((sum, k) => sum + ((k.reviewedAt ?? 0) - k.submittedAt), 0) / processed.length
      : 0;

    return {
      total: all.length,
      pending,
      verified,
      rejected,
      highRisk,
      avgProcessingTimeHours: Math.round(avgProcessingTime / (1000 * 60 * 60) * 10) / 10,
    };
  },
});

// ─── Query: Get KYC Audit Logs ────────────────────────────────────────────
export const getKYCAuditLogs = query({
  args: { kycId: v.optional(v.id("users_kyc")), limit: v.optional(v.number()) },
  handler: async (ctx, { kycId, limit }) => {
    if (kycId) {
      return await ctx.db.query("kyc_audit_logs")
        .withIndex("by_kyc", q => q.eq("kycId", kycId))
        .order("desc")
        .take(limit ?? 50);
    }
    return await ctx.db.query("kyc_audit_logs")
      .order("desc")
      .take(limit ?? 100);
  },
});

// ─── KYC Verification Check (for payment blocking) ───────────────────────
export const checkKYCVerified = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return { verified: false, status: "unverified" as const, message: "User not found" };

    const kycStatus = user.kycStatus || "unverified";
    const verified = kycStatus === "verified";

    return {
      verified,
      status: kycStatus,
      tier: user.kycTier || "basic",
      message: verified
        ? "KYC verification complete"
        : kycStatus === "pending"
          ? "KYC verification is under review"
          : kycStatus === "rejected"
            ? "KYC verification was rejected — please resubmit"
            : "KYC verification required before accepting payments",
    };
  },
});

// ─── Blacklist Management ─────────────────────────────────────────────────
export const addToBlacklist = mutation({
  args: {
    type: v.union(v.literal("id_number"), v.literal("phone"), v.literal("ip_address"), v.literal("device")),
    value: v.string(),
    reason: v.string(),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already blacklisted
    const existing = await ctx.db.query("kyc_blacklist")
      .withIndex("by_value", q => q.eq("value", args.value))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: true, reason: args.reason });
      return existing._id;
    }

    return await ctx.db.insert("kyc_blacklist", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const removeFromBlacklist = mutation({
  args: { id: v.id("kyc_blacklist") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isActive: false });
  },
});

export const getBlacklist = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("kyc_blacklist")
      .withIndex("by_active", q => q.eq("isActive", true))
      .collect();
  },
});

// ─── Check if user is KYC verified (helper for transaction blocking) ─────
export const isUserVerified = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user?.kycStatus === "verified";
  },
});

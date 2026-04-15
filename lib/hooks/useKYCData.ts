import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import type { Id } from "@/convex/_generated/dataModel";

/**
 * Hook to get KYC data for a seller
 */
export function useKYCData(userId: string | undefined) {
  const typedUserId = userId as Id<"users"> | undefined;

  const kyc = useQuery(
    api.kyc.getUserKYC,
    typedUserId ? { userId: typedUserId } : "skip"
  );

  const kycCheck = useQuery(
    api.kyc.checkKYCVerified,
    typedUserId ? { userId: typedUserId } : "skip"
  );

  return {
    kyc,
    isVerified: kycCheck?.verified ?? false,
    kycStatus: kycCheck?.status ?? "unverified",
    kycTier: kycCheck?.tier ?? "basic",
    kycMessage: kycCheck?.message ?? "",
    isLoading: kyc === undefined,
  };
}

/**
 * Hook to get KYC admin data
 */
export function useKYCAdminData(statusFilter?: "pending" | "verified" | "rejected") {
  const submissions = useQuery(api.kyc.listAllKYC, { status: statusFilter });
  const stats = useQuery(api.kyc.getKYCStats);
  const blacklist = useQuery(api.kyc.getBlacklist);

  return {
    submissions: submissions ?? [],
    stats: stats ?? { total: 0, pending: 0, verified: 0, rejected: 0, highRisk: 0, avgProcessingTimeHours: 0 },
    blacklist: blacklist ?? [],
    isLoading: submissions === undefined,
  };
}

/**
 * Hook for KYC mutations
 */
export function useKYCMutations() {
  const submitKYC = useMutation(api.kyc.submitKYC);
  const approveKYC = useMutation(api.kyc.approveKYC);
  const rejectKYC = useMutation(api.kyc.rejectKYC);
  const addToBlacklist = useMutation(api.kyc.addToBlacklist);
  const removeFromBlacklist = useMutation(api.kyc.removeFromBlacklist);

  return {
    submitKYC,
    approveKYC,
    rejectKYC,
    addToBlacklist,
    removeFromBlacklist,
  };
}

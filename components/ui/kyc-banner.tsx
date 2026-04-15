"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface KYCBannerProps {
  kycStatus: string;
  rejectionReason?: string;
}

export function KYCBanner({ kycStatus, rejectionReason }: KYCBannerProps) {
  if (kycStatus === "verified") return null;

  const config: Record<string, {
    icon: React.ReactNode;
    title: string;
    message: string;
    gradient: string;
    borderColor: string;
    buttonLabel: string;
    buttonStyle: string;
  }> = {
    unverified: {
      icon: <Shield className="w-6 h-6" />,
      title: "Complete Identity Verification",
      message: "You must verify your identity before you can receive payments or process transactions. This is required for all sellers on SwiftShopy.",
      gradient: "from-amber-500/10 via-orange-500/10 to-red-500/10",
      borderColor: "border-amber-500/30",
      buttonLabel: "Start Verification",
      buttonStyle: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl",
    },
    pending: {
      icon: <Clock className="w-6 h-6" />,
      title: "Verification In Progress",
      message: "Your identity verification is being reviewed by our team. This usually takes 1-2 business days. You'll be notified once it's complete.",
      gradient: "from-blue-500/10 via-indigo-500/10 to-purple-500/10",
      borderColor: "border-blue-500/30",
      buttonLabel: "View Submission",
      buttonStyle: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl",
    },
    rejected: {
      icon: <XCircle className="w-6 h-6" />,
      title: "Verification Rejected",
      message: rejectionReason
        ? `Your verification was rejected: "${rejectionReason}". Please update your documents and resubmit.`
        : "Your verification was rejected. Please review the feedback and resubmit your documents.",
      gradient: "from-red-500/10 via-rose-500/10 to-pink-500/10",
      borderColor: "border-red-500/30",
      buttonLabel: "Resubmit Verification",
      buttonStyle: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg hover:shadow-xl",
    },
  };

  const status = config[kycStatus] || config.unverified;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-5 rounded-xl border-2 ${status.borderColor} bg-gradient-to-r ${status.gradient}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`p-3 rounded-xl ${kycStatus === "unverified" ? "bg-amber-500/20 text-amber-600" : kycStatus === "pending" ? "bg-blue-500/20 text-blue-600" : "bg-red-500/20 text-red-600"}`}>
          {status.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
            {status.title}
            {kycStatus === "unverified" && (
              <span className="px-2 py-0.5 bg-red-500/15 text-red-500 text-xs font-bold rounded-full animate-pulse">
                REQUIRED
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{status.message}</p>
        </div>
        <Link
          href="/dashboard/kyc"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] whitespace-nowrap ${status.buttonStyle}`}
        >
          {status.buttonLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

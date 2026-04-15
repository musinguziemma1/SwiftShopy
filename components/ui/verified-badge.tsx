"use client";

import { motion } from "framer-motion";
import { CheckCircle, Shield } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function VerifiedBadge({ size = "md", showLabel = true, className = "" }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  const iconSize = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center ${sizeClasses[size]} px-2.5 py-1 rounded-full
        bg-gradient-to-r from-emerald-500/15 to-teal-500/15 
        border border-emerald-500/30
        text-emerald-600 dark:text-emerald-400
        font-semibold select-none ${className}`}
    >
      <CheckCircle className={`${iconSize[size]} fill-emerald-500 text-white dark:text-gray-900`} />
      {showLabel && <span>Verified Seller</span>}
    </motion.div>
  );
}

interface KYCTierBadgeProps {
  tier: "basic" | "verified" | "enterprise";
  size?: "sm" | "md";
}

export function KYCTierBadge({ tier, size = "sm" }: KYCTierBadgeProps) {
  const config = {
    basic: { label: "Basic", className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
    verified: { label: "Verified", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    enterprise: { label: "Enterprise", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  };

  const { label, className } = config[tier];
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      <Shield className={iconSize} />
      {label}
    </span>
  );
}

import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "check-sla-breaches",
  { minutes: 30 },
  api.admin.escalateSLABreaches,
  {}
);

crons.interval(
  "auto-close-resolved-tickets",
  { hours: 6 },
  api.admin.autoCloseResolvedTickets,
  { hoursThreshold: 48 }
);

crons.interval(
  "check-subscription-expiry",
  { hours: 1 },
  api.subscriptions.checkAndExpireSubscriptions,
  {}
);

crons.interval(
  "grant-referral-bonuses",
  { hours: 24 },
  api.referrals.processAllReferralBonuses,
  {}
);

crons.interval(
  "cleanup-expired-tokens",
  { hours: 1 },
  api.tokenization.cleanupExpiredTokens,
  {}
);

export default crons;

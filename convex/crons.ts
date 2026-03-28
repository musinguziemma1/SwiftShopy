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

export default crons;

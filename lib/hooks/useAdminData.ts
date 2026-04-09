import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useAdminData = () => {
  const sellers = useQuery(api.users.listSellers as any);
  const stores = useQuery(api.stores.getAll as any);
  const orders = useQuery(api.orders.list as any);
  const transactions = useQuery(api.transactions.list as any);
  const subscriptions = useQuery(api.subscriptions.getAllSubscriptions as any);
  const payments = useQuery(api.payments.getAllPayments as any);
  const billingAnalytics = useQuery(api.analytics.getBillingAnalytics as any);
  const revenueByPlan = useQuery(api.analytics.getRevenueByPlan as any);
  const referralStats = useQuery(api.referrals.getGlobalReferralStats as any);
  const expiringSubscriptions = useQuery(api.subscriptions.getExpiringSubscriptions as any, { daysAhead: 7 } as any);
  const adminSummary = useQuery(api.analytics.getAdminSummary as any);
  const ticketStats = useQuery(api.support.getTicketStats as any);
  const auditLogsRaw = useQuery(api.admin.listAuditLogs as any, { limit: 50 } as any);
  const auditLogs = (auditLogsRaw ?? []) as any;
  const disputesRaw = useQuery(api.payments.getDisputes as any, { status: "all" } as any);
  const disputes = (disputesRaw ?? []) as any;

  return {
    sellers: sellers ?? [],
    stores: stores ?? [],
    orders: orders ?? [],
    transactions: transactions ?? [],
    subscriptions: subscriptions ?? [],
    payments: payments ?? [],
    billingAnalytics: billingAnalytics ?? null,
    revenueByPlan: revenueByPlan ?? [],
    referralStats: referralStats ?? null,
    expiringSubscriptions: expiringSubscriptions ?? [],
    adminSummary: adminSummary ?? null,
    ticketStats: ticketStats ?? null,
    auditLogs: auditLogs ?? [],
    disputes: disputes,
    isLoading: sellers === undefined || stores === undefined || orders === undefined,
  };
};

export const useAdminMutations = () => {
  const toggleUserActive = useMutation(api.users.toggleActive);
  const updateUserRole = useMutation(api.users.updateRole);
  const updateOrderStatus = useMutation(api.orders.updateStatus);
  const toggleProductActive = useMutation(api.products.toggleActive);
  const upgradePlan = useMutation(api.subscriptions.upgradePlan);
  const renewSubscription = useMutation(api.subscriptions.renewSubscription);
  const cancelSubscription = useMutation(api.subscriptions.cancelSubscription);
  const expireSubscription = useMutation(api.subscriptions.expireSubscription);
  const updatePaymentStatus = useMutation(api.payments.updatePaymentStatus);
  
  // Support ticket mutations
  const updateTicketStatus = useMutation(api.support.updateTicketStatus);
  const addTicketMessage = useMutation(api.support.addTicketMessage);
  const logAction = useMutation(api.support.logAction);

  // Audit log mutation
  const createAuditLog = useMutation(api.admin.logAction as any);

  // Payment mutations
  const refundPayment = useMutation(api.payments.refundPayment as any);
  const resolveDispute = useMutation(api.payments.resolveDispute as any);

  return {
    toggleUserActive,
    updateUserRole,
    updateOrderStatus,
    toggleProductActive,
    upgradePlan,
    renewSubscription,
    cancelSubscription,
    expireSubscription,
    updatePaymentStatus,
    updateTicketStatus,
    addTicketMessage,
    logAction,
    createAuditLog,
    refundPayment,
    resolveDispute,
  };
};

export const useSupportTickets = (status?: string, priority?: string) => {
  const tickets = useQuery(api.support.getAllTickets as any, { 
    status: status || undefined, 
    priority: priority || undefined 
  });
  const stats = useQuery(api.support.getTicketStats as any);
  
  return {
    tickets: tickets ?? [],
    stats: stats ?? null,
  };
};

export const useSupportMutations = () => {
  const createTicket = useMutation(api.support.createTicket as any);
  const updateTicketStatus = useMutation(api.support.updateTicketStatus as any);
  const addTicketMessage = useMutation(api.support.addTicketMessage as any);
  
  return {
    createTicket,
    updateTicketStatus,
    addTicketMessage,
  };
};

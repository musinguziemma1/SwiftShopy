import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useAdminData = () => {
  const sellers = useQuery(api.users.listSellers);
  const stores = useQuery(api.stores.getAll);
  const orders = useQuery(api.orders.list);
  const transactions = useQuery(api.transactions.list);
  const subscriptions = useQuery(api.subscriptions.getAllSubscriptions);
  const payments = useQuery(api.payments.getAllPayments);
  const billingAnalytics = useQuery(api.analytics.getBillingAnalytics);
  const revenueByPlan = useQuery(api.analytics.getRevenueByPlan);
  const referralStats = useQuery(api.referrals.getGlobalReferralStats);
  const expiringSubscriptions = useQuery(api.subscriptions.getExpiringSubscriptions, { daysAhead: 7 });

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
  };
};

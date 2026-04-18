import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const EMAIL_STORE_MAP: Record<string, { slug: string; userId: string }> = {
  "seller@swiftshopy.com": { slug: "nakato-styles", userId: "user_seller_1" },
  "mugisha@swiftshopy.com": { slug: "mugisha-electronics", userId: "user_seller_2" },
  "apio@swiftshopy.com": { slug: "apios-kitchen", userId: "user_seller_3" },
};

export const useSellerData = (userEmail?: string | null) => {
  const store = useQuery(
    api.stores.getByEmail,
    userEmail ? { email: userEmail } : "skip"
  );

  const storeId = store?._id;
  const userId = store?.userId;

  const products = useQuery(
    api.products.getByStore,
    storeId ? { storeId: storeId as any } : "skip"
  );

  const orders = useQuery(
    api.orders.getByStore,
    storeId ? { storeId: storeId as any } : "skip"
  );

  const subscription = useQuery(
    api.subscriptions.getByUser,
    userId ? { userId: userId as any } : "skip"
  );

  const billingInfo = useQuery(
    api.billing.getUserBillingInfo,
    userId ? { userId: userId as any } : "skip"
  );

  const referralStats = useQuery(
    api.referrals.getReferralStats,
    userId ? { userId: userId as any } : "skip"
  );

  const usageDiscount = useQuery(
    api.billing.checkUsageDiscountEligibility,
    userId ? { userId: userId as any } : "skip"
  );

  const payouts = useQuery(
    api.payouts.getByStore,
    storeId ? { storeId: storeId as any } : "skip"
  );

  const tickets = useQuery(
    api.support.getUserTickets,
    userId ? { userId: userId as string } : "skip"
  );

  const activePlansTable = useQuery(api.plans.getActivePlans);

  return {
    store: store ?? null,
    storeId: storeId ?? null,
    userId: userId ?? null,
    products: products ?? [],
    orders: orders ?? [],
    subscription: subscription ?? null,
    billingInfo: billingInfo ?? null,
    activePlans: activePlansTable ?? [],
    referralStats: referralStats ?? null,
    usageDiscount: usageDiscount ?? null,
    payouts: payouts ?? [],
    tickets: tickets ?? [],
    isLoading: store === undefined || products === undefined || orders === undefined || activePlansTable === undefined,
  };
};

export const useStoreMutations = () => {
  const updateStore = useMutation(api.stores.update as any);
  const createStore = useMutation(api.stores.create as any);
  const updateStoreStatus = useMutation(api.stores.updateStatus as any);
  const createPayout = useMutation(api.payouts.create as any);
  const createTicket = useMutation(api.support.createTicket as any);
  const updateTicketStatus = useMutation(api.support.updateTicketStatus as any);
  const addTicketMessage = useMutation(api.support.addTicketMessage as any);

  return { updateStore, createStore, updateStoreStatus, createPayout, createTicket, updateTicketStatus, addTicketMessage };
};

export const useProductMutations = () => {
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const toggleProduct = useMutation(api.products.toggleActive);
  const updateStock = useMutation(api.products.updateStock);

  return { createProduct, updateProduct, deleteProduct, toggleProduct, updateStock };
};

export const useOrderMutations = () => {
  const createOrder = useMutation(api.orders.create);
  const updateOrderStatus = useMutation(api.orders.updateStatus);

  return { createOrder, updateOrderStatus };
};

export const useSubscriptionMutations = () => {
  const upgradePlan = useMutation(api.subscriptions.upgradePlan);
  const renewSubscription = useMutation(api.subscriptions.renewSubscription);
  const cancelSubscription = useMutation(api.subscriptions.cancelSubscription);
  const createSubscription = useMutation(api.subscriptions.create);

  return { upgradePlan, renewSubscription, cancelSubscription, createSubscription };
};

export const useReferralMutations = () => {
  const generateReferralCode = useMutation(api.referrals.createReferralCode);
  const createReferral = useMutation(api.referrals.createReferral);

  return { generateReferralCode, createReferral };
};

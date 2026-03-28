import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useAdminData = () => {
  const sellers = useQuery(api.users.listSellers);
  const stores = useQuery(api.stores.getAll);
  const orders = useQuery(api.orders.list);
  const transactions = useQuery(api.transactions.list);
  const products = useQuery(api.products.getByStore, {} as any);

  return {
    sellers: sellers ?? [],
    stores: stores ?? [],
    orders: orders ?? [],
    transactions: transactions ?? [],
    isLoading: sellers === undefined || stores === undefined || orders === undefined,
  };
};

export const useAdminMutations = () => {
  const toggleUserActive = useMutation(api.users.toggleActive);
  const updateUserRole = useMutation(api.users.updateRole);
  const updateOrderStatus = useMutation(api.orders.updateStatus);
  const toggleProductActive = useMutation(api.products.toggleActive);

  return { toggleUserActive, updateUserRole, updateOrderStatus, toggleProductActive };
};

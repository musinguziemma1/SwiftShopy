import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useSellerData = (storeId: string | null | undefined) => {
  const hasValidId = storeId && !storeId.includes("store");

  const products = useQuery(
    api.products.getByStore,
    hasValidId ? { storeId: storeId as any } : "skip"
  );

  const orders = useQuery(
    api.orders.getByStore,
    hasValidId ? { storeId: storeId as any } : "skip"
  );

  const store = useQuery(
    api.stores.getById,
    hasValidId ? { id: storeId as any } : "skip"
  );

  return {
    store: store ?? null,
    products: products ?? [],
    orders: orders ?? [],
    isLoading: products === undefined || orders === undefined,
  };
};

export const useStoreMutations = () => {
  const updateStore = useMutation(api.stores.update);
  const createStore = useMutation(api.stores.create);
  const updateStoreStatus = useMutation(api.stores.updateStatus);

  return { updateStore, createStore, updateStoreStatus };
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

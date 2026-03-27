import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useSellerData = (userEmail?: string | null) => {
  // Get all stores and find the one owned by this user
  const allStores = useQuery(api.stores.list);
  
  // Find store by email (matching against phone or slug that contains email pattern)
  // For demo, we use the first store
  const store = allStores && allStores.length > 0 ? allStores[0] : null;
  const storeId = store?._id;

  const products = useQuery(
    api.products.getByStore,
    storeId ? { storeId: storeId as any } : "skip"
  );

  const orders = useQuery(
    api.orders.getByStore,
    storeId ? { storeId: storeId as any } : "skip"
  );

  return {
    store: store ?? null,
    storeId: storeId ?? null,
    products: products ?? [],
    orders: orders ?? [],
    isLoading: allStores === undefined || products === undefined || orders === undefined,
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

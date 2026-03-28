import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Email to store mapping for demo purposes
const EMAIL_STORE_MAP: Record<string, { slug: string; userId: string }> = {
  "seller@swiftshopy.com": { slug: "nakato-styles", userId: "user_seller_1" },
  "mugisha@swiftshopy.com": { slug: "mugisha-electronics", userId: "user_seller_2" },
  "apio@swiftshopy.com": { slug: "apios-kitchen", userId: "user_seller_3" },
};

export const useSellerData = (userEmail?: string | null) => {
  // Get store by email
  const store = useQuery(
    api.stores.getByEmail,
    userEmail ? { email: userEmail } : "skip"
  );

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
    isLoading: store === undefined || products === undefined || orders === undefined,
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

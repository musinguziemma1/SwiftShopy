// ─── User & Auth ─────────────────────────────────────────
export type UserRole = "seller" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: number;
}

// ─── Store ────────────────────────────────────────────────
export interface Store {
  _id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  phone: string;
  logo?: string;
  banner?: string;
  isActive: boolean;
  createdAt: number;
}

// ─── Product ──────────────────────────────────────────────
export interface Product {
  _id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock: number;
  isActive: boolean;
  createdAt: number;
}

// ─── Order ────────────────────────────────────────────────
export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  _id: string;
  storeId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: number;
}

// ─── Transaction ──────────────────────────────────────────
export type TransactionStatus = "pending" | "successful" | "failed";
export type PaymentProvider = "mtn_momo" | "airtel_money";

export interface Transaction {
  _id: string;
  orderId: string;
  storeId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerRef: string;
  externalRef: string;
  status: TransactionStatus;
  customerPhone: string;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

// ─── Analytics ────────────────────────────────────────────
export interface DailySales {
  date: string;
  orders: number;
  revenue: number;
}

export interface StoreSummary {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
}

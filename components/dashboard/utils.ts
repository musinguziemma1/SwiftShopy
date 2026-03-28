import { AnimatePresence, motion, Variants } from "framer-motion";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sales: number;
  image: string;
  category: string;
  isActive?: boolean;
  description?: string;
  _id?: any;
  _creationTime?: number;
}

export interface Order {
  id: string;
  customer: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  date: string;
  items: number;
  total?: number;
  orderNumber?: string;
  customerName?: string;
  createdAt?: number;
  _id?: any;
  _creationTime?: number;
}

export interface Store {
  _id: string;
  name: string;
  slug: string;
  phone: string;
  description?: string;
  currency?: string;
  timezone?: string;
  logo?: string;
  banner?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
}



export const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: reducedMotion ? 0 : 0.05,
      delayChildren: reducedMotion ? 0 : 0.1,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: reducedMotion ? 0 : 0.4,
      ease: "easeOut",
    },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: reducedMotion ? 0 : 0.4 },
  },
};

export const statusColor = (s: string) => {
  switch (s) {
    case "paid":
      return "bg-green-500/10 text-green-500 border border-green-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
    default:
      return "bg-red-500/10 text-red-500 border border-red-500/20";
  }
};

export const statusIconLabel = (s: string) => {
  if (s === "paid") return "Paid";
  if (s === "pending") return "Pending";
  return "Failed";
};

export const fmt = (n: number, currency = "UGX") =>
  `${currency} ${n.toLocaleString()}`;

export { motion, AnimatePresence };

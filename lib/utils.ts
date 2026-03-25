import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "UGX"): string {
  if (currency === "UGX") {
    return `UGX ${amount.toLocaleString("en-UG")}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(ts: number | string): string {
  try {
    return format(new Date(typeof ts === "number" ? ts : Number(ts)), "MMM dd, yyyy");
  } catch { return "—"; }
}

export function formatDateTime(ts: number): string {
  try { return format(new Date(ts), "MMM dd, yyyy HH:mm"); } catch { return "—"; }
}

export function timeAgo(ts: number): string {
  try { return formatDistanceToNow(new Date(ts), { addSuffix: true }); } catch { return "—"; }
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function generateOrderNumber(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  const intl = cleaned.startsWith("0") ? `256${cleaned.slice(1)}` : cleaned;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export function buildOrderWhatsAppMessage(storeName: string, items: Array<{ productName: string; quantity: number; price: number }>, total: number): string {
  const itemsList = items.map((i) => `• ${i.productName} x${i.quantity} = UGX ${(i.price * i.quantity).toLocaleString()}`).join("\n");
  return `Hello! I'd like to order from *${storeName}*:\n\n${itemsList}\n\n*Total: UGX ${total.toLocaleString()}*\n\nPlease confirm my order. Thank you! 🛍️`;
}

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
  successful: "bg-green-100 text-green-800",
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-500",
};

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

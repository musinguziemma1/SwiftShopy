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

// ─── RBAC ─────────────────────────────────────────────────
export type AdminRole = "super_admin" | "admin" | "support" | "analyst";
export type Permission = 
  | "users:read" | "users:write" | "users:delete"
  | "sellers:read" | "sellers:write" | "sellers:suspend"
  | "transactions:read" | "transactions:refund"
  | "products:read" | "products:approve"
  | "orders:read" | "orders:write"
  | "reports:read" | "reports:export"
  | "settings:read" | "settings:write"
  | "support:read" | "support:write" | "support:manage"
  | "audit:read" | "billing:read" | "billing:write"
  | "*";

export interface AdminUser {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: number;
  createdAt: number;
}

export interface RoleDefinition {
  role: AdminRole;
  name: string;
  description: string;
  permissions: Permission[];
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  { role: "super_admin", name: "Super Admin", description: "Full system access", permissions: ["*"] },
  { role: "admin", name: "Admin", description: "Full management except billing", permissions: ["users:read", "users:write", "sellers:read", "sellers:write", "sellers:suspend", "transactions:read", "transactions:refund", "products:read", "products:approve", "orders:read", "orders:write", "reports:read", "reports:export", "support:read", "support:write", "support:manage", "audit:read"] },
  { role: "support", name: "Support", description: "Support and limited sellers", permissions: ["sellers:read", "orders:read", "support:read", "support:write", "reports:read"] },
  { role: "analyst", name: "Analyst", description: "Read-only analytics access", permissions: ["sellers:read", "transactions:read", "orders:read", "products:read", "reports:read", "reports:export"] },
];

// ─── Audit Trail ─────────────────────────────────────────
export type AuditAction = 
  | "user_created" | "user_updated" | "user_deleted" | "user_suspended"
  | "seller_approved" | "seller_suspended" | "seller_banned"
  | "order_updated" | "order_cancelled" | "order_refunded"
  | "product_approved" | "product_rejected" | "product_deleted"
  | "transaction_refunded" | "transaction_disputed"
  | "settings_updated" | "commission_changed"
  | "bulk_operation" | "export_performed" | "import_performed"
  | "login_success" | "login_failed" | "logout";

export interface AuditLog {
  _id: string;
  adminId: string;
  adminName: string;
  action: AuditAction;
  targetType: "user" | "seller" | "order" | "product" | "transaction" | "settings" | "system";
  targetId: string;
  targetName?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
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

// ─── Support Tickets ───────────────────────────────────────
export type TicketPriority = "critical" | "high" | "medium" | "low";
export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketCategory = "payment" | "account" | "technical" | "billing" | "integration" | "other";

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  orderId?: string;
  assignedTo?: string;
  assignedToName?: string;
  slaDeadline?: number;
  firstResponseAt?: number;
  resolvedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface TicketMessage {
  _id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "admin" | "support";
  message: string;
  isInternal: boolean;
  createdAt: number;
}

export interface SLASettings {
  critical: number;  // hours
  high: number;
  medium: number;
  low: number;
}

// ─── Bulk Operations ───────────────────────────────────────
export type BulkOperationType = "approve_sellers" | "suspend_sellers" | "activate_products" | "deactivate_products" | "export_data" | "import_data";
export type BulkOperationStatus = "pending" | "processing" | "completed" | "failed";

export interface BulkOperation {
  _id: string;
  adminId: string;
  type: BulkOperationType;
  status: BulkOperationStatus;
  totalCount: number;
  successCount: number;
  failedCount: number;
  filters: Record<string, any>;
  results: Array<{ id: string; success: boolean; error?: string }>;
  createdAt: number;
  completedAt?: number;
}

// ─── Reporting ────────────────────────────────────────────
export type ReportType = "revenue" | "sellers" | "orders" | "products" | "transactions" | "support" | "custom";
export type ReportFormat = "json" | "csv" | "xlsx" | "pdf";

export interface ScheduledReport {
  _id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  filters: Record<string, any>;
  schedule: "daily" | "weekly" | "monthly";
  recipients: string[];
  lastRunAt?: number;
  nextRunAt: number;
  isActive: boolean;
  createdBy: string;
  createdAt: number;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  data: any;
  generatedAt: number;
  generatedBy: string;
}

// ─── WhatsApp Integration ───────────────────────────────────
export type WhatsAppMessageType = "text" | "image" | "audio" | "video" | "document" | "location" | "interactive";
export type WhatsAppMessageDirection = "inbound" | "outbound";
export type WhatsAppMessageStatus = "sent" | "delivered" | "read" | "failed";
export type WhatsAppConversationStatus = "active" | "archived" | "blocked";
export type WhatsAppTemplateCategory = "marketing" | "transactional" | "utility";
export type WhatsAppTemplateStatus = "draft" | "pending" | "approved" | "rejected";
export type WhatsAppPaymentLinkStatus = "pending" | "paid" | "expired" | "cancelled";

export interface WhatsAppAccount {
  _id: string;
  storeId: string;
  phoneNumberId: string;
  businessAccountId: string;
  businessPhone: string;
  businessName: string;
  accessToken: string;
  webhookVerifyToken: string;
  qrCode?: string;
  qrCodeExpiresAt?: number;
  isConnected: boolean;
  lastSyncAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface WhatsAppContact {
  _id: string;
  storeId: string;
  waId: string;
  phone: string;
  name?: string;
  profilePictureUrl?: string;
  isBusiness: boolean;
  lastSeenAt?: number;
  tags: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WhatsAppConversation {
  _id: string;
  storeId: string;
  contactId: string;
  contact?: WhatsAppContact;
  lastMessageAt: number;
  lastMessagePreview: string;
  unreadCount: number;
  status: WhatsAppConversationStatus;
  createdAt: number;
  updatedAt: number;
}

export interface WhatsAppMessage {
  _id: string;
  storeId: string;
  conversationId: string;
  contactId: string;
  waMessageId: string;
  direction: WhatsAppMessageDirection;
  type: WhatsAppMessageType;
  content: string;
  mediaUrl?: string;
  metadata?: Record<string, any>;
  status: WhatsAppMessageStatus;
  createdAt: number;
}

export interface WhatsAppQuickReply {
  _id: string;
  storeId: string;
  title: string;
  shortcut: string;
  message: string;
  category?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WhatsAppTemplate {
  _id: string;
  storeId: string;
  name: string;
  category: WhatsAppTemplateCategory;
  language: string;
  content: string;
  components?: Record<string, any>;
  status: WhatsAppTemplateStatus;
  usageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface WhatsAppPaymentLink {
  _id: string;
  storeId: string;
  conversationId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  description: string;
  paymentLink: string;
  expiresAt: number;
  status: WhatsAppPaymentLinkStatus;
  createdAt: number;
}

export interface WhatsAppAnalytics {
  totalMessages: number;
  inbound: number;
  outbound: number;
  activeConversations: number;
  totalConversations: number;
  avgResponseTime: number; // in seconds
  responseRate: number; // percentage
}

// ─── Subscriptions & Billing ───────────────────────────────
export type SubscriptionPlan = "free" | "pro" | "business" | "enterprise";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";
export type RewardType = "free_month" | "discount" | "cash";

export interface Subscription {
  _id: string;
  userId: string;
  storeId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: number;
  endDate: number;
  autoRenew?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SubscriptionPayment {
  _id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  phone: string;
  plan: SubscriptionPlan;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerRef?: string;
  externalRef: string;
  failureReason?: string;
  createdAt: number;
  processedAt?: number;
}

export interface UsageTracking {
  _id: string;
  userId: string;
  storeId?: string;
  month: string;
  year: number;
  totalTransactionAmount: number;
  transactionCount: number;
  platformFee: number;
  lastUpdated: number;
}

export interface Referral {
  _id: string;
  referrerUserId: string;
  referrerUserCode: string;
  referredUserId?: string;
  referredUserEmail: string;
  status: "pending" | "completed" | "cancelled";
  rewardGranted: boolean;
  rewardType?: RewardType;
  rewardAmount?: number;
  createdAt: number;
  completedAt?: number;
}

export interface BillingSettings {
  _id: string;
  userId: string;
  walletBalance?: number;
  discountEligible?: boolean;
  discountPercentage?: number;
  discountReason?: string;
  lastDiscountApplied?: number;
  referralCode: string;
  referralCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface PlanLimits {
  productLimit: number | "Unlimited";
  monthlyFee: number;
  transactionFee: number;
}

export interface BillingAnalytics {
  mrr: number;
  mrrGrowth: number;
  totalRevenue: number;
  activeSubscribers: number;
  freeUsers: number;
  proUsers: number;
  businessUsers: number;
  enterpriseUsers: number;
  paidUsers: number;
  arpu: number;
  conversionRate: number;
  churnRate: number;
  totalPayments: number;
  successfulPayments: number;
}

export interface UserBillingInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate?: number;
  endDate?: number;
  productLimit: number;
  productCount: number;
  transactionFee: number;
  monthlyFee: number;
  totalPaid: number;
  daysRemaining: number;
}

// ─── Zod Validation Schemas ─────────────────────────────────
import { z } from "zod";

export const CreatePaymentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  plan: z.enum(["pro", "business", "enterprise"]),
  phone: z.string().regex(/^\+256[0-9]{9}$/, "Valid Uganda phone required (e.g., +256700000000)"),
  provider: z.enum(["mtn_momo", "airtel_money"]).optional().default("mtn_momo"),
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});

export const CreateTicketSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  userName: z.string().min(1, "Name is required"),
  userEmail: z.string().email("Valid email required"),
  userPhone: z.string().optional(),
  storeId: z.string().optional(),
  storeName: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  category: z.enum(["payment", "account", "technical", "billing", "integration", "other"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export const UpdateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Valid email required").optional(),
  phone: z.string().optional(),
  role: z.enum(["seller", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

export const CreatePayoutSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  amount: z.number().positive("Amount must be positive").max(100000000, "Amount exceeds maximum"),
  method: z.enum(["mtn_momo", "bank_transfer"]),
  account: z.string().min(5, "Account details required"),
});

export const InviteAdminSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(2, "Name is required"),
  role: z.enum(["super_admin", "admin", "support", "analyst"]),
  permissions: z.array(z.string()).optional(),
});

export const CreateProductSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  name: z.string().min(3, "Product name must be at least 3 characters").max(200),
  description: z.string().max(5000).optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Valid email required"),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
    "Password must contain uppercase, lowercase, number, and special character"
  ),
});

// Type exports for validation
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreatePayoutInput = z.infer<typeof CreatePayoutSchema>;
export type InviteAdminInput = z.infer<typeof InviteAdminSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

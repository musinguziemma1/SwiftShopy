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

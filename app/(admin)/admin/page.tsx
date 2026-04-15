"use client"

import React, { useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import NotificationsCenter from "@/components/ui/notifications-center"
import {
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Bell,
  Settings,
  LogOut,
  Zap,
  Menu,
  X,
  Eye,
  Edit,
  Trash2,
  Shield,
  Activity,
  Package,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  XCircle,
  Clock,
  Filter,
  Download,
  Crown,
  Store,
  CreditCard,
  Lock,
  Unlock,
  Ban,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  FileText,
  FileBarChart,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Plus,
  Copy,
  QrCode,
  Gift,
  Calendar,
  UserPlus,
  UserMinus,
  Key,
} from "lucide-react"
import { useAdminData, useAdminMutations, useSupportTickets } from "@/lib/hooks/useAdminData"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useAdminDashboardData } from "@/lib/hooks/useAdminDashboardData"
import { useKYCAdminData, useKYCMutations } from "@/lib/hooks/useKYCData"
import { VerifiedBadge, KYCTierBadge } from "@/components/ui/verified-badge"

// Types
interface Seller {
  id: string
  name: string
  email: string
  storeName: string
  status: "active" | "inactive" | "suspended"
  revenue: number
  products: number
  orders: number
  commission: number
  joinDate: string
  avatar: string
  plan?: "free" | "pro" | "business" | "enterprise"
  phone?: string
  storeId?: string
}

interface Transaction {
  id: string
  seller: string
  amount: number
  commission: number
  type: "sale" | "subscription" | "refund"
  status: "completed" | "pending" | "failed"
  date: string
}

interface AdminStats {
  totalRevenue: number
  totalSellers: number
  totalOrders: number
  totalCommission: number
  revenueChange: number
  sellersChange: number
  ordersChange: number
  commissionChange: number
}

function AdminDashboard() {

  // Pagination State
  const ITEMS_PER_PAGE = 30;
  const [sellerPage, setSellerPage] = useState(1);
  const [txnPage, setTxnPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);

  const renderPagination = (currentPage: number, totalItems: number, setPage: (p: number) => void) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 glass rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50 transition-all">Previous</button>
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold">{currentPage}</div>
          <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1 glass rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50 transition-all">Next</button>
        </div>
      </div>
    );
  };

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedSellers, setSelectedSellers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSellerModal, setShowSellerModal] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<any>(null)
  const [sellerModalMode, setSellerModalMode] = useState<"view" | "edit">("view")
  const [showExportDropdown, setShowExportDropdown] = useState<string | null>(null)
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false)
  const [bulkAction, setBulkAction] = useState("")
  const [showRoleModal, setShowRoleModal] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [auditFilter, setAuditFilter] = useState("all")
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutProvider, setPayoutProvider] = useState<"mtn_momo" | "airtel_money">("mtn_momo")
  const [payoutPlan, setPayoutPlan] = useState<"all" | "free" | "pro" | "business" | "enterprise">("all")
  const [txnSearch, setTxnSearch] = useState("")
  const [txnStatusFilter, setTxnStatusFilter] = useState("all")
  const [txnTypeFilter, setTxnTypeFilter] = useState("all")
  const [selectedPayoutSellers, setSelectedPayoutSellers] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(true)
  const [showCreateReportModal, setShowCreateReportModal] = useState(false)
  const [billingSubTab, setBillingSubTab] = useState<"overview" | "plans" | "subscribers">("overview")
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false)
  const [newPlan, setNewPlan] = useState({ name: "", description: "", price: 0, currency: "UGX", interval: "monthly" as const, features: [], isPopular: false })

  const handleCreatePlan = async () => {
    try {
      await createPlan(newPlan)
      setShowCreatePlanModal(false)
      setNewPlan({ name: "", description: "", price: 0, currency: "UGX", interval: "monthly", features: [], isPopular: false })
    } catch (error) {
      console.error("Failed to create plan:", error)
    }
  }

  const handleUpdatePlan = async () => {
    try {
      await updatePlan({ id: editingPlan._id, ...editingPlan })
      setShowPlanModal(false)
      setEditingPlan(null)
    } catch (error) {
      console.error("Failed to update plan:", error)
    }
  }

  const handleTogglePlanActive = async (planId: any, isActive: boolean) => {
    try {
      await updatePlan({ id: planId, isActive })
    } catch (error) {
      console.error("Failed to toggle plan:", error)
    }
  }

  const confirmDeletePlan = async (planId: any) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      try {
        await deletePlan({ id: planId })
      } catch (error) {
        console.error("Failed to delete plan:", error)
      }
    }
  }
  const [editingPromotion, setEditingPromotion] = useState<any>(null)
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  
  // KYC state
  const [kycStatusFilter, setKycStatusFilter] = useState<"pending" | "verified" | "rejected" | undefined>(undefined)
  const [selectedKYC, setSelectedKYC] = useState<any>(null)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [kycRejectReason, setKycRejectReason] = useState("")
  const [kycProcessing, setKycProcessing] = useState(false)
  
  // Settings state
  const [settingsSubTab, setSettingsSubTab] = useState("general")
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "SwiftShopy",
    supportEmail: "support@swiftshopy.com",
    platformDescription: "WhatsApp Commerce + Mobile Money Payments platform for small businesses",
    maintenanceMode: false,
  })
  const [paymentSettings, setPaymentSettings] = useState({
    mtnEnabled: true,
    mtnApiKey: "",
    mtnSubscriptionKey: "",
    mtnCollectionId: "",
    airtelEnabled: true,
    airtelApiKey: "",
    codEnabled: true,
    platformCommission: 10,
  })
  const [securitySettings, setSecuritySettings] = useState({
    require2FA: true,
    apiRateLimit: 1000,
    sellerVerification: true,
    sessionTimeout: 3600,
    passwordMinLength: 8,
  })
  const [notificationSettings, setNotificationSettings] = useState({
    newSellerAlert: true,
    highValueThreshold: 1000000,
    failedPaymentAlert: true,
    systemErrorAlert: true,
    dailyReport: false,
    weeklySummary: true,
    notificationEmail: "admin@swiftshopy.com",
  })
  const [apiSettings, setApiSettings] = useState({
    environment: "sandbox" as "sandbox" | "production",
    // MTN MoMo Sandbox
    mtnSandboxCollectionsKey: "",
    mtnSandboxDisbursementsKey: "",
    mtnSandboxApiUserId: "",
    mtnSandboxApiKey: "",
    // MTN MoMo Production
    mtnProductionCollectionsKey: "",
    mtnProductionDisbursementsKey: "",
    mtnProductionApiUserId: "",
    mtnProductionApiKey: "",
    // Airtel
    airtelClientId: "",
    airtelClientSecret: "",
    // WhatsApp
    whatsappPhoneNumberId: "",
    whatsappAccessToken: "",
    whatsappApiVersion: "v18.0",
    // Email
    emailProvider: "resend",
    resendApiKey: "",
    sendgridApiKey: "",
    emailFrom: "SwiftShopy <noreply@swiftshopy.com>",
    // Callbacks
    callbackUrl: "",
    webhookSecret: "",
  })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [settingsError, setSettingsError] = useState("")
  
  // Support ticket states
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all")
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all")
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketMessage, setTicketMessage] = useState("")
  const [sendingReply, setSendingReply] = useState(false)

  // Get support ticket data
  const { tickets, stats: ticketStats } = useSupportTickets(ticketFilter === "all" ? undefined : ticketFilter, ticketPriorityFilter === "all" ? undefined : ticketPriorityFilter)
  const { updateTicketStatus, addTicketMessage, logAction } = useAdminMutations()
  const { auditLogs: dbAuditLogs } = useAdminData()

  // Convex mutations
  const bulkUpdateSettings = useMutation(api.platformSettings.bulkUpdate)
  const initializeDefaults = useMutation(api.platformSettings.initializeDefaults)

  const saveSettings = async () => {
    setSettingsSaving(true)
    setSettingsSaved(false)
    setSettingsError("")
    try {
      // Save to database
      await bulkUpdateSettings({
        settings: [
          { category: "api", key: "environment", value: apiSettings.environment },
          { category: "api", key: "mtn_sandbox_collections_key", value: apiSettings.mtnSandboxCollectionsKey },
          { category: "api", key: "mtn_sandbox_disbursements_key", value: apiSettings.mtnSandboxDisbursementsKey },
          { category: "api", key: "mtn_sandbox_api_user_id", value: apiSettings.mtnSandboxApiUserId },
          { category: "api", key: "mtn_sandbox_api_key", value: apiSettings.mtnSandboxApiKey },
          { category: "api", key: "mtn_production_collections_key", value: apiSettings.mtnProductionCollectionsKey },
          { category: "api", key: "mtn_production_disbursements_key", value: apiSettings.mtnProductionDisbursementsKey },
          { category: "api", key: "mtn_production_api_user_id", value: apiSettings.mtnProductionApiUserId },
          { category: "api", key: "mtn_production_api_key", value: apiSettings.mtnProductionApiKey },
          { category: "api", key: "airtel_client_id", value: apiSettings.airtelClientId },
          { category: "api", key: "airtel_client_secret", value: apiSettings.airtelClientSecret },
          { category: "api", key: "whatsapp_phone_number_id", value: apiSettings.whatsappPhoneNumberId },
          { category: "api", key: "whatsapp_access_token", value: apiSettings.whatsappAccessToken },
          { category: "api", key: "whatsapp_api_version", value: apiSettings.whatsappApiVersion },
          { category: "api", key: "email_provider", value: apiSettings.emailProvider },
          { category: "api", key: "resend_api_key", value: apiSettings.resendApiKey },
          { category: "api", key: "sendgrid_api_key", value: apiSettings.sendgridApiKey },
          { category: "api", key: "email_from", value: apiSettings.emailFrom },
          { category: "payment", key: "callback_url", value: apiSettings.callbackUrl },
          { category: "payment", key: "webhook_secret", value: apiSettings.webhookSecret },
          { category: "payment", key: "environment", value: apiSettings.environment },
        ],
        updatedBy: "admin",
      })

      // Update .env.local file
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            mtn_sandbox_collections_key: apiSettings.mtnSandboxCollectionsKey,
            mtn_sandbox_disbursements_key: apiSettings.mtnSandboxDisbursementsKey,
            mtn_sandbox_api_user_id: apiSettings.mtnSandboxApiUserId,
            mtn_sandbox_api_key: apiSettings.mtnSandboxApiKey,
            mtn_production_collections_key: apiSettings.mtnProductionCollectionsKey,
            mtn_production_disbursements_key: apiSettings.mtnProductionDisbursementsKey,
            mtn_production_api_user_id: apiSettings.mtnProductionApiUserId,
            mtn_production_api_key: apiSettings.mtnProductionApiKey,
            airtel_client_id: apiSettings.airtelClientId,
            airtel_client_secret: apiSettings.airtelClientSecret,
            whatsapp_phone_number_id: apiSettings.whatsappPhoneNumberId,
            whatsapp_access_token: apiSettings.whatsappAccessToken,
            whatsapp_api_version: apiSettings.whatsappApiVersion,
            email_provider: apiSettings.emailProvider,
            resend_api_key: apiSettings.resendApiKey,
            sendgrid_api_key: apiSettings.sendgridApiKey,
            email_from: apiSettings.emailFrom,
            callback_url: apiSettings.callbackUrl,
            webhook_secret: apiSettings.webhookSecret,
            environment: apiSettings.environment,
          },
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to update .env.local")
      }

      console.log("Settings saved:", result)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 5000)
    } catch (error: any) {
      console.error("Failed to save settings:", error)
      setSettingsError(error.message || "Failed to save settings")
      setTimeout(() => setSettingsError(""), 5000)
    } finally {
      setSettingsSaving(false)
    }
  }

  // Get real data from Convex
  const { sellers: convexSellers, stores, orders, transactions, subscriptions, payments, billingAnalytics, revenueByPlan, referralStats, expiringSubscriptions, isLoading, disputes } = useAdminData()
  const { toggleUserActive, updateOrderStatus, upgradePlan, renewSubscription, cancelSubscription, expireSubscription, updatePaymentStatus, createAuditLog, refundPayment, resolveDispute } = useAdminMutations()
  
  // Session
  const { data: session } = useSession()

  // Admin management data
  const allAdmins = useQuery(api.adminInvitations.getAllAdmins) ?? []
  const allInvitations = useQuery(api.adminInvitations.getAllInvitations) ?? []
  const pendingInvitations = allInvitations.filter(i => i.status === "pending")
  
  // Admin mutations
  const inviteAdmin = useMutation(api.adminInvitations.inviteAdmin)
  const updateAdminRole = useMutation(api.adminInvitations.updateAdminRole)
  const deactivateAdmin = useMutation(api.adminInvitations.deactivateAdmin)
  const activateAdmin = useMutation(api.adminInvitations.activateAdmin)
  const cancelInvitation = useMutation(api.adminInvitations.cancelInvitation)

  // Promotions data and mutations
  const promotions = useQuery(api.promotions.getAllPromotions)
  const createPromotion = useMutation(api.promotions.createPromotion)
  const updatePromotion = useMutation(api.promotions.updatePromotion)
  const deletePromotion = useMutation(api.promotions.deletePromotion)
  const togglePromotionStatus = useMutation(api.promotions.togglePromotionStatus)

  // Subscription plans data and mutations
  const plans = useQuery(api.plans.getPlans) ?? []
  const createPlan = useMutation(api.plans.createPlan)
  const updatePlan = useMutation(api.plans.updatePlan)
  const deletePlan = useMutation(api.plans.deletePlan)

  // KYC admin data
  const { submissions: kycSubmissions, stats: kycStats, isLoading: kycLoading } = useKYCAdminData(kycStatusFilter)
  const { approveKYC, rejectKYC } = useKYCMutations()

  // Calculate stats from real data
  const totalRevenue = orders?.filter(o => o.status === "paid").reduce((sum, o) => sum + o.total, 0) ?? 0
  const totalSellers = convexSellers?.length ?? 0
  const totalOrders = orders?.length ?? 0
  const totalCommission = Math.round(totalRevenue * 0.1)

  const stats: AdminStats = {
    totalRevenue,
    totalSellers,
    totalOrders,
    totalCommission,
    revenueChange: 18.5,
    sellersChange: 12.3,
    ordersChange: 22.7,
    commissionChange: 15.2,
  }

  // Map Convex sellers to display format
  const sellers: Seller[] = convexSellers?.map(s => ({
    id: s._id,
    name: s.name,
    email: s.email,
    storeName: s.storeName ?? "No Store",
    status: s.isActive ? "active" : "inactive",
    revenue: s.revenue ?? 0,
    products: s.productCount ?? 0,
    orders: s.orderCount ?? 0,
    commission: Math.round((s.revenue ?? 0) * 0.1),
    joinDate: s.joinDate ? new Date(s.joinDate).toLocaleDateString() : "N/A",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  })) ?? []

  // Map Convex transactions to display format
  const txnList: Transaction[] = transactions?.map(t => ({
    id: t._id.slice(0, 8),
    seller: "Store",
    amount: t.amount,
    commission: Math.round(t.amount * 0.1),
    type: "sale",
    status: t.status === "successful" ? "completed" : t.status,
    date: new Date(t._creationTime).toLocaleDateString(),
  })) ?? []

  // Legacy static audit logs (can be removed when real data populates)
  const staticAuditLogs = [
    { id: "AL-001", admin: "Super Admin", action: "seller_approve", target: "Nakato Styles", date: "2024-01-15 14:32" },
    { id: "AL-002", admin: "Support Agent", action: "ticket_resolve", target: "TKT-001", date: "2024-01-15 13:10" },
    { id: "AL-003", admin: "Super Admin", action: "seller_suspend", target: "JM Electronics", date: "2024-01-14 11:45" },
    { id: "AL-004", admin: "Admin", action: "config_update", target: "Commission Rate", date: "2024-01-14 09:20" },
  ]

  const scheduledReports = [
    { id: "RPT-001", name: "Daily Revenue Summary", type: "revenue", format: "csv", schedule: "daily", recipients: "admin@swiftshopy.com", active: true },
    { id: "RPT-002", name: "Weekly Seller Performance", type: "sellers", format: "xlsx", schedule: "weekly", recipients: "ops@swiftshopy.com", active: true },
    { id: "RPT-003", name: "Monthly Order Report", type: "orders", format: "pdf", schedule: "monthly", recipients: "finance@swiftshopy.com", active: true },
  ]

  const breachedTickets = [
    { id: "TKT-001", subject: "Payment not received", priority: "critical", breachedAt: "2 hours ago" },
    { id: "TKT-003", subject: "WhatsApp integration issue", priority: "high", breachedAt: "30 min ago" },
  ]

  const rolePermissions: Record<string, string[]> = {
    "Super Admin": ["seller_management", "transaction_view", "transaction_edit", "reports_view", "reports_export", "system_config", "user_management", "support_access", "support_resolve", "bulk_operations", "audit_logs"],
    "Admin": ["seller_management", "transaction_view", "reports_view", "reports_export", "support_access", "support_resolve"],
    "Support": ["transaction_view", "support_access", "support_resolve"],
  }

  const allPermissions = [
    { key: "seller_management", label: "Seller Management" },
    { key: "transaction_view", label: "View Transactions" },
    { key: "transaction_edit", label: "Edit Transactions" },
    { key: "reports_view", label: "View Reports" },
    { key: "reports_export", label: "Export Reports" },
    { key: "system_config", label: "System Configuration" },
    { key: "user_management", label: "User Management" },
    { key: "support_access", label: "Access Support" },
    { key: "support_resolve", label: "Resolve Tickets" },
    { key: "bulk_operations", label: "Bulk Operations" },
    { key: "audit_logs", label: "View Audit Logs" },
  ]

  const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "pending":
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "suspended":
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
      case "inactive":
        return <Clock className="w-4 h-4" />
      case "suspended":
      case "failed":
        return <Ban className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full bg-card border-b border-border z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-accent rounded-lg transition-colors hidden lg:block"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-accent rounded-lg transition-colors lg:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Admin Panel
                  </span>
                  <div className="text-xs text-muted-foreground">SwiftShopy</div>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sellers, transactions, stores..."
                  className="w-full pl-10 pr-4 py-2 bg-accent rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <NotificationsCenter adminMode={true} />
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
              <button className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-lg transition-colors">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop"
                  alt="Admin"
                  className="w-8 h-8 rounded-full ring-2 ring-purple-600"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">Admin</div>
                  <div className="text-xs text-muted-foreground">Super Admin</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0 lg:w-20"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-4 space-y-2 overflow-y-auto h-full">
          <SidebarButton icon={<BarChart3 className="w-5 h-5" />} label="Overview" active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<Users className="w-5 h-5" />} label="Sellers" active={activeTab === "sellers"} onClick={() => { setActiveTab("sellers"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<DollarSign className="w-5 h-5" />} label="Transactions" active={activeTab === "transactions"} onClick={() => { setActiveTab("transactions"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<ArrowUpRight className="w-5 h-5" />} label="Disbursements" active={activeTab === "disbursements"} onClick={() => { setActiveTab("disbursements"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<CreditCard className="w-5 h-5" />} label="Billing" active={activeTab === "billing"} onClick={() => { setActiveTab("billing"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<Shield className="w-5 h-5" />} label="Permissions" active={activeTab === "permissions"} onClick={() => { setActiveTab("permissions"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<Activity className="w-5 h-5" />} label="Analytics" active={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<MessageSquare className="w-5 h-5" />} label="Support" active={activeTab === "support"} onClick={() => { setActiveTab("support"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<AlertCircle className="w-5 h-5" />} label="Disputes" active={activeTab === "disputes"} onClick={() => { setActiveTab("disputes"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<Shield className="w-5 h-5" />} label={<span className="flex items-center gap-2">KYC{kycStats.pending > 0 && <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">{kycStats.pending}</span>}</span>} active={activeTab === "kyc"} onClick={() => { setActiveTab("kyc"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<FileText className="w-5 h-5" />} label="Audit Trail" active={activeTab === "audit"} onClick={() => { setActiveTab("audit"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<FileBarChart className="w-5 h-5" />} label="Reports" active={activeTab === "reports"} onClick={() => { setActiveTab("reports"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <div className="pt-4 mt-4 border-t border-border">
            <SidebarButton icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
            <SidebarButton icon={<LogOut className="w-5 h-5" />} label="Logout" active={false} onClick={() => signOut({ callbackUrl: "/" })} collapsed={!sidebarOpen} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-20"}`}>
        <div className="p-4 sm:p-6 lg:p-8">

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          )}

          {/* ── Overview Tab ── */}
          {!isLoading && activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Overview</h1>
                <p className="text-muted-foreground">Monitor and manage your entire SwiftShopy platform</p>
              </div>

              {/* Platform Health Monitor */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 rounded-xl border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <h3 className="text-lg font-semibold">Platform Health</h3>
                  </div>
                  <span className="text-sm font-medium text-green-500">All Systems Operational</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { name: "API Server", uptime: "99.99%", latency: "45ms", secure: true },
                    { name: "Database", uptime: "100%", latency: "15ms", secure: true },
                    { name: "Payment Gateway", uptime: "99.95%", latency: "320ms", secure: true },
                    { name: "WhatsApp API", uptime: "99.98%", latency: "180ms", secure: true },
                    { name: "Email Service", uptime: "99.99%", latency: "250ms", secure: true },
                    { name: "CDN", uptime: "100%", latency: "12ms", secure: true },
                  ].map((service, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-lg bg-card border border-border hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium truncate">{service.name}</span>
                        {service.secure && <Lock className="w-3 h-3 text-green-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>Uptime: {service.uptime}</div>
                        <div>Latency: {service.latency}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Security Status */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" /> Security Status
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Protected
                  </span>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Data Encryption</span>
                    </div>
                    <p className="text-sm text-muted-foreground">AES-256 encryption for sensitive data</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">2FA Enabled</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Two-factor auth required for admins</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Audit Logging</span>
                    </div>
                    <p className="text-sm text-muted-foreground">All admin actions logged</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AdminStatsCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} change={stats.revenueChange} icon={<DollarSign className="w-6 h-6" />} color="bg-green-500" />
                <AdminStatsCard title="Active Sellers" value={stats.totalSellers.toString()} change={stats.sellersChange} icon={<Users className="w-6 h-6" />} color="bg-blue-500" />
                <AdminStatsCard title="Total Orders" value={stats.totalOrders.toString()} change={stats.ordersChange} icon={<Package className="w-6 h-6" />} color="bg-purple-500" />
                <AdminStatsCard title="Commission Earned" value={formatCurrency(stats.totalCommission)} change={stats.commissionChange} icon={<TrendingUp className="w-6 h-6" />} color="bg-orange-500" />
              </div>

              {/* Real-time Activity Feed */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <h3 className="text-lg font-semibold">Live Platform Activity</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Concurrent Users: <span className="font-bold text-foreground">1,234</span></span>
                    <span className="text-muted-foreground">Active: <span className="font-bold text-green-500">892</span></span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    [
                      { event: "New seller registered", detail: "Tech Store UG - Kampala", time: "Just now", icon: <Users className="w-4 h-4" />, color: "text-blue-500" },
                      { event: "Order placed", detail: "Order #12345 - UGX 450,000", time: "5s ago", icon: <ShoppingCart className="w-4 h-4" />, color: "text-green-500" },
                      { event: "Payment processed", detail: "UGX 890,000 via MTN MoMo", time: "12s ago", icon: <DollarSign className="w-4 h-4" />, color: "text-green-600" },
                      { event: "Store went live", detail: "Grace's Fashion", time: "1m ago", icon: <Store className="w-4 h-4" />, color: "text-purple-500" },
                    ],
                    [
                      { event: "Product listed", detail: "Smart Watch Pro - Electronics", time: "1m ago", icon: <Package className="w-4 h-4" />, color: "text-purple-500" },
                      { event: "Review submitted", detail: "5 stars - Nakato Styles", time: "2m ago", icon: <Star className="w-4 h-4" />, color: "text-yellow-500" },
                      { event: "Support ticket", detail: "#TKT-789 - Payment issue", time: "3m ago", icon: <AlertCircle className="w-4 h-4" />, color: "text-orange-500" },
                      { event: "Subscription renewed", detail: "Business Plan - UGX 50K", time: "5m ago", icon: <CreditCard className="w-4 h-4" />, color: "text-blue-500" },
                    ],
                  ].map((col, ci) => (
                    <div key={ci} className="space-y-3">
                      {col.map((activity, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + ci * 0.2 + i * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                          <div className={`w-8 h-8 rounded-lg bg-accent flex items-center justify-center ${activity.color}`}>{activity.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.event}</p>
                            <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-1">Platform Revenue</h3>
                  <p className="text-sm text-muted-foreground mb-6">Monthly revenue growth</p>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[45, 52, 48, 65, 58, 72, 68, 85, 78, 92, 88, 95].map((height, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Top Sellers */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold mb-0.5">Top Performing Sellers</h3>
                      <p className="text-xs text-muted-foreground">Highest revenue generators</p>
                    </div>
                    <button onClick={() => setActiveTab("sellers")} className="px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-accent rounded-lg transition-colors">View All</button>
                  </div>
                  <div className="space-y-1">
                    {sellers.slice((sellerPage - 1) * 5, sellerPage * 5).map((seller, i) => (
                      <motion.div key={seller.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="text-sm font-bold text-muted-foreground w-5">#{(sellerPage - 1) * 5 + i + 1}</div>
                        <img src={seller.avatar} alt={seller.name} className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{seller.storeName}</div>
                          <div className="text-xs text-muted-foreground">{seller.orders} orders</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{formatCurrency(seller.revenue)}</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(seller.commission)} comm.</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {sellers.length > 5 && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        {(sellerPage - 1) * 5 + 1}-{Math.min(sellerPage * 5, sellers.length)} of {sellers.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSellerPage(Math.max(1, sellerPage - 1))} disabled={sellerPage === 1} className="px-2 py-1 text-xs font-medium hover:bg-accent rounded disabled:opacity-50 transition-all">Prev</button>
                        <button onClick={() => setSellerPage(Math.min(Math.ceil(sellers.length / 5), sellerPage + 1))} disabled={sellerPage >= Math.ceil(sellers.length / 5)} className="px-2 py-1 text-xs font-medium hover:bg-accent rounded disabled:opacity-50 transition-all">Next</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold mb-0.5">Recent Transactions</h3>
                    <p className="text-xs text-muted-foreground">Latest platform transactions</p>
                  </div>
                  <button onClick={() => setActiveTab("transactions")} className="px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-accent rounded-lg transition-colors">View All</button>
                </div>
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["ID","Amount","Comm.","Status","Date"].map((h) => (
                          <th key={h} className="text-left py-2 px-2 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txnList.slice((txnPage - 1) * 5, txnPage * 5).map((txn, i) => (
                        <motion.tr key={txn.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}
                          className="border-b border-border hover:bg-accent/50 transition-colors">
                          <td className="py-2 px-2 text-xs font-medium">{txn.id}</td>
                          <td className="py-2 px-2 text-xs font-medium">{formatCurrency(txn.amount)}</td>
                          <td className="py-2 px-2 text-xs text-green-500 font-medium">{formatCurrency(txn.commission)}</td>
                          <td className="py-2 px-2">
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium border ${getStatusColor(txn.status)}`}>
                              {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-xs text-muted-foreground">{txn.date}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {txnList.length > 5 && (
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      {(txnPage - 1) * 5 + 1}-{Math.min(txnPage * 5, txnList.length)} of {txnList.length}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setTxnPage(Math.max(1, txnPage - 1))} disabled={txnPage === 1} className="px-2 py-1 text-xs font-medium hover:bg-accent rounded disabled:opacity-50 transition-all">Prev</button>
                      <button onClick={() => setTxnPage(Math.min(Math.ceil(txnList.length / 5), txnPage + 1))} disabled={txnPage >= Math.ceil(txnList.length / 5)} className="px-2 py-1 text-xs font-medium hover:bg-accent rounded disabled:opacity-50 transition-all">Next</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Sellers Tab ── */}
          {!isLoading && activeTab === "sellers" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Seller Management</h1>
                  <p className="text-muted-foreground">Manage all sellers on the platform</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input type="text" placeholder="Search sellers..." value={searchQuery}
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm w-64"
                      onChange={(e) => setSearchQuery(e.target.value)} />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="relative">
                    <button onClick={() => setShowExportDropdown(showExportDropdown === "sellers" ? null : "sellers")}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export <ChevronDown className="w-3 h-3" />
                    </button>
                    {showExportDropdown === "sellers" && (
                      <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
                        <button onClick={() => {
                          const filteredSellers = sellers.filter(s => {
                            if (!searchQuery) return true;
                            const q = searchQuery.toLowerCase();
                            return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.storeName && s.storeName.toLowerCase().includes(q));
                          });
                          const dataStr = JSON.stringify(filteredSellers, null, 2);
                          const dataBlob = new Blob([dataStr], { type: "application/json" });
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `sellers-${new Date().toISOString().split("T")[0]}.json`;
                          link.click();
                          URL.revokeObjectURL(url);
                          setShowExportDropdown(null);
                        }} className="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors rounded-t-lg flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Export JSON
                        </button>
                        <button onClick={() => {
                          const filteredSellers = sellers.filter(s => {
                            if (!searchQuery) return true;
                            const q = searchQuery.toLowerCase();
                            return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.storeName && s.storeName.toLowerCase().includes(q));
                          });
                          const headers = ["Name", "Email", "Store", "Revenue", "Orders", "Status"];
                          const csvContent = [
                            headers.join(","),
                            ...filteredSellers.map(s => [
                              `"${s.name}"`,
                              `"${s.email}"`,
                              `"${s.storeName || "No Store"}"`,
                              s.revenue,
                              s.orders,
                              s.status
                            ].join(","))
                          ].join("\n");
                          const dataBlob = new Blob([csvContent], { type: "text/csv" });
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `sellers-${new Date().toISOString().split("T")[0]}.csv`;
                          link.click();
                          URL.revokeObjectURL(url);
                          setShowExportDropdown(null);
                        }} className="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors rounded-b-lg flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Export CSV
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seller Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Sellers", value: sellers.length, icon: <Users className="w-5 h-5 text-blue-500" />, color: "bg-blue-500/10" },
                  { label: "Active", value: sellers.filter(s => s.status === "active").length, icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "bg-green-500/10" },
                  { label: "Suspended", value: sellers.filter(s => s.status === "suspended").length, icon: <Lock className="w-5 h-5 text-yellow-500" />, color: "bg-yellow-500/10" },
                  { label: "Total Revenue", value: formatCurrency(sellers.reduce((sum, s) => sum + s.revenue, 0)), icon: <DollarSign className="w-5 h-5 text-purple-500" />, color: "bg-purple-500/10" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedSellers.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedSellers.length} seller(s) selected</span>
                    <div className="flex items-center gap-2">
                      <button onClick={async () => {
                        for (const id of selectedSellers) {
                          await toggleUserActive({ id: id as any, isActive: true });
                          await createAuditLog({ adminId: "admin", action: "seller_approve", targetType: "seller", targetId: id as string, targetName: "Seller", details: { action: "Activated seller account" } });
                        }
                        setSelectedSellers([]);
                      }} className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Activate All
                      </button>
                      <button onClick={async () => {
                        for (const id of selectedSellers) {
                          await toggleUserActive({ id: id as any, isActive: false });
                          await createAuditLog({ adminId: "admin", action: "seller_suspend", targetType: "seller", targetId: id as string, targetName: "Seller", details: { action: "Suspended seller account" } });
                        }
                        setSelectedSellers([]);
                      }} className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1">
                        <Lock className="w-4 h-4" /> Suspend All
                      </button>
                      <button onClick={() => setSelectedSellers([])} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors">
                        Clear
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="py-3 px-4 text-left">
                          <input type="checkbox" 
                            checked={selectedSellers.length === sellers.filter(s => {
                              if (!searchQuery) return true;
                              const q = searchQuery.toLowerCase();
                              return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.storeName && s.storeName.toLowerCase().includes(q));
                            }).length && sellers.filter(s => {
                              if (!searchQuery) return true;
                              const q = searchQuery.toLowerCase();
                              return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.storeName && s.storeName.toLowerCase().includes(q));
                            }).length > 0}
                            onChange={(e) => {
                              const filtered = sellers.filter(s => {
                                if (!searchQuery) return true;
                                const q = searchQuery.toLowerCase();
                                return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.storeName && s.storeName.toLowerCase().includes(q));
                              });
                              if (e.target.checked) {
                                setSelectedSellers(filtered.map(s => s.id));
                              } else {
                                setSelectedSellers([]);
                              }
                            }}
                            className="w-4 h-4 rounded border-border" />
                        </th>
                        {["Seller", "Store", "Revenue", "Orders", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.filter(seller => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return seller.name.toLowerCase().includes(q) || 
                          seller.email.toLowerCase().includes(q) || 
                          (seller.storeName && seller.storeName.toLowerCase().includes(q));
                      }).map((seller, i) => (
                        <motion.tr key={seller.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: i * 0.03 }}
                          className="border-b border-border hover:bg-accent/30 transition-colors">
                          <td className="py-3 px-4">
                            <input type="checkbox"
                              checked={selectedSellers.includes(seller.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSellers([...selectedSellers, seller.id]);
                                } else {
                                  setSelectedSellers(selectedSellers.filter(id => id !== seller.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-border" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                {seller.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{seller.name}</div>
                                <div className="text-sm text-muted-foreground">{seller.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{seller.storeName || "No Store"}</td>
                          <td className="py-3 px-4 text-sm font-medium">{formatCurrency(seller.revenue)}</td>
                          <td className="py-3 px-4 text-sm">{seller.orders}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              seller.status === "active" 
                                ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}>
                              {seller.status === "active" ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {/* View */}
                              <button onClick={() => {
                                setSelectedSeller(seller);
                                setSellerModalMode("view");
                                setShowSellerModal(true);
                              }} className="p-2 hover:bg-accent rounded-lg transition-colors" title="View Details">
                                <Eye className="w-4 h-4" />
                              </button>
                              {/* Edit */}
                              <button onClick={() => {
                                setSelectedSeller(seller);
                                setSellerModalMode("edit");
                                setShowSellerModal(true);
                              }} className="p-2 hover:bg-accent rounded-lg transition-colors" title="Edit Seller">
                                <Edit className="w-4 h-4" />
                              </button>
                              {/* Activate/Deactivate */}
                              <button onClick={async () => {
                                const newStatus = seller.status === "active" ? false : true;
                                await toggleUserActive({ id: seller.id as any, isActive: newStatus });
                                await createAuditLog({ 
                                  adminId: "admin", 
                                  action: newStatus ? "seller_approve" : "seller_suspend", 
                                  targetType: "seller", 
                                  targetId: seller.id as string, 
                                  targetName: seller.name, 
                                  details: { action: newStatus ? "Activated seller" : "Suspended seller" } 
                                });
                              }} 
                                className={`p-2 rounded-lg transition-colors ${
                                  seller.status === "active" 
                                    ? "hover:bg-yellow-500/10 text-yellow-500" 
                                    : "hover:bg-green-500/10 text-green-500"
                                }`}
                                title={seller.status === "active" ? "Suspend Seller" : "Activate Seller"}>
                                {seller.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                              {/* Delete */}
                              <button onClick={async () => {
                                if (confirm(`Are you sure you want to delete ${seller.name}? This action cannot be undone.`)) {
                                  await toggleUserActive({ id: seller.id as any, isActive: false });
                                  // In production, you'd have a proper delete function
                                }
                              }} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500" title="Delete Seller">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                      {sellers.filter(seller => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return seller.name.toLowerCase().includes(q) || 
                          seller.email.toLowerCase().includes(q) || 
                          (seller.storeName && seller.storeName.toLowerCase().includes(q));
                      }).length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>{searchQuery ? "No sellers match your search" : "No sellers found"}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Seller Detail Modal */}
              {showSellerModal && selectedSeller && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl bg-card rounded-xl border border-border p-6 my-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">
                        {sellerModalMode === "view" ? "Seller Details" : "Edit Seller"}
                      </h3>
                      <button onClick={() => { setShowSellerModal(false); setSelectedSeller(null); }} 
                        className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {sellerModalMode === "view" ? (
                      <div className="space-y-6">
                        {/* Profile Section */}
                        <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-xl">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                            {selectedSeller.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">{selectedSeller.name}</h4>
                            <p className="text-muted-foreground">{selectedSeller.email}</p>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${
                              selectedSeller.status === "active" 
                                ? "bg-green-500/10 text-green-500" 
                                : "bg-red-500/10 text-red-500"
                            }`}>
                              {selectedSeller.status === "active" ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {selectedSeller.status.charAt(0).toUpperCase() + selectedSeller.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-accent/30 rounded-xl text-center">
                            <p className="text-2xl font-bold">{formatCurrency(selectedSeller.revenue)}</p>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                          </div>
                          <div className="p-4 bg-accent/30 rounded-xl text-center">
                            <p className="text-2xl font-bold">{selectedSeller.orders}</p>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                          </div>
                          <div className="p-4 bg-accent/30 rounded-xl text-center">
                            <p className="text-2xl font-bold">{selectedSeller.productCount || 0}</p>
                            <p className="text-sm text-muted-foreground">Products</p>
                          </div>
                        </div>

                        {/* Store Info */}
                        <div className="p-4 border border-border rounded-xl">
                          <h5 className="font-medium mb-3">Store Information</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Store Name</p>
                              <p className="font-medium">{selectedSeller.storeName || "No Store"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Store Slug</p>
                              <p className="font-medium">{selectedSeller.storeSlug || "-"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button onClick={() => setSellerModalMode("edit")} 
                            className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2">
                            <Edit className="w-4 h-4" /> Edit Seller
                          </button>
                          <button onClick={async () => {
                            const newStatus = selectedSeller.status === "active" ? false : true;
                            await toggleUserActive({ id: selectedSeller.id as any, isActive: newStatus });
                            setShowSellerModal(false);
                            setSelectedSeller(null);
                          }} 
                            className={`flex-1 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                              selectedSeller.status === "active"
                                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}>
                            {selectedSeller.status === "active" ? (
                              <><Lock className="w-4 h-4" /> Suspend Seller</>
                            ) : (
                              <><Unlock className="w-4 h-4" /> Activate Seller</>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        // Update seller info
                        const updates = {
                          name: formData.get("name") as string,
                          email: formData.get("email") as string,
                          phone: formData.get("phone") as string,
                        };
                        
                        // Call API to update seller
                        await fetch("/api/admin/update-seller", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ sellerId: selectedSeller.id, ...updates }),
                        });

                        setShowSellerModal(false);
                        setSelectedSeller(null);
                      }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <input name="name" defaultValue={selectedSeller.name} required
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input name="email" type="email" defaultValue={selectedSeller.email} required
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <input name="phone" type="tel" defaultValue={selectedSeller.phone || ""}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select name="status" defaultValue={selectedSeller.status}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button type="button" onClick={() => { setShowSellerModal(false); setSelectedSeller(null); }}
                            className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors">
                            Cancel
                          </button>
                          <button type="submit"
                            className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Transactions Tab ── */}
          {!isLoading && activeTab === "transactions" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Transactions</h1>
                  <p className="text-muted-foreground">All platform sales, payments, and transaction history</p>
                </div>
                <div className="relative">
                  <button onClick={() => setShowExportDropdown(showExportDropdown === "transactions" ? null : "transactions")}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export <ChevronDown className="w-3 h-3" />
                  </button>
                  {showExportDropdown === "transactions" && (
                    <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-lg z-10">
                      <button onClick={() => setShowExportDropdown(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors rounded-t-lg">Export JSON</button>
                      <button onClick={() => setShowExportDropdown(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors rounded-b-lg">Export CSV</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Sales", value: formatCurrency(transactions.filter(t => t.status === "successful").reduce((s, t) => s + t.amount, 0)), icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "bg-green-500/10" },
                  { label: "Platform Fees", value: formatCurrency(transactions.filter(t => t.status === "successful").reduce((s, t) => s + Math.round(t.amount * 0.025), 0)), icon: <DollarSign className="w-5 h-5 text-blue-500" />, color: "bg-blue-500/10" },
                  { label: "Pending", value: formatCurrency(transactions.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0)), icon: <Clock className="w-5 h-5 text-yellow-500" />, color: "bg-yellow-500/10" },
                  { label: "Failed", value: formatCurrency(transactions.filter(t => t.status === "failed").reduce((s, t) => s + t.amount, 0)), icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-500/10" },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center`}>{s.icon}</div>
                    </div>
                    <div className="text-xl font-bold">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <select className="px-4 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="all">All Status</option>
                  <option value="successful">Successful</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <select className="px-4 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="all">All Types</option>
                  <option value="sale">Sales</option>
                  <option value="subscription">Subscriptions</option>
                  <option value="refund">Refunds</option>
                </select>
              </div>

              {/* Transactions Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {["Transaction ID","Seller","Type","Amount","Fee","Status","Date"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txnList.map((txn, i) => (
                        <tr key={txn.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                          <td className="py-3 px-4 text-sm font-mono">{txn.id}</td>
                          <td className="py-3 px-4 text-sm">{txn.seller}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              txn.type === "refund" ? "bg-red-500/10 text-red-500" :
                              txn.type === "subscription" ? "bg-purple-500/10 text-purple-500" :
                              "bg-blue-500/10 text-blue-500"
                            }`}>{txn.type}</span>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{formatCurrency(txn.amount)}</td>
                          <td className="py-3 px-4 text-sm text-green-500">{formatCurrency(txn.commission)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(txn.status)}`}>
                              {getStatusIcon(txn.status)} {txn.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{txn.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Disbursements Tab ── */}
          {activeTab === "disbursements" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Bulk Payouts</h1>
                <p className="text-muted-foreground">Process disbursements to sellers via Mobile Money</p>
              </div>

              {/* Payout Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Disbursed", value: formatCurrency(0), icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "bg-green-500/10" },
                  { label: "Pending Payouts", value: formatCurrency(0), icon: <Clock className="w-5 h-5 text-yellow-500" />, color: "bg-yellow-500/10" },
                  { label: "Total Sellers", value: sellers.filter(s => s.status === "active").length, icon: <Users className="w-5 h-5 text-blue-500" />, color: "bg-blue-500/10" },
                  { label: "Platform Fees", value: formatCurrency(sellers.reduce((sum, s) => sum + Math.round(s.revenue * 0.025), 0)), icon: <DollarSign className="w-5 h-5 text-purple-500" />, color: "bg-purple-500/10" },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center`}>{s.icon}</div>
                    </div>
                    <div className="text-xl font-bold">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Panel - Configuration */}
                <div className="space-y-6">
                  {/* Provider Selection */}
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="font-semibold mb-4">Payment Provider</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setPayoutProvider("mtn_momo")}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          payoutProvider === "mtn_momo" ? "border-yellow-500 bg-yellow-500/10" : "border-border hover:border-yellow-500/50"
                        }`}>
                        <div className="text-2xl mb-1">🟡</div>
                        <div className="text-sm font-medium">MTN MoMo</div>
                      </button>
                      <button onClick={() => setPayoutProvider("airtel_money")}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          payoutProvider === "airtel_money" ? "border-red-500 bg-red-500/10" : "border-border hover:border-red-500/50"
                        }`}>
                        <div className="text-2xl mb-1">🔴</div>
                        <div className="text-sm font-medium">Airtel Money</div>
                      </button>
                    </div>
                  </div>

                  {/* Plan Filter */}
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="font-semibold mb-4">Filter by Plan</h3>
                    <div className="space-y-2">
                      {["all", "free", "pro", "business", "enterprise"].map((plan) => {
                        const count = plan === "all" 
                          ? sellers.filter(s => s.status === "active").length
                          : sellers.filter(s => s.status === "active" && (s.plan ?? "free") === plan).length;
                        const feeRate = plan === "all" ? null : plan === "free" ? "4%" : plan === "pro" ? "2.5%" : plan === "business" ? "1.5%" : "1%";
                        return (
                          <button key={plan} onClick={() => setPayoutPlan(plan as any)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              payoutPlan === plan ? "border-primary bg-primary/10" : "border-border hover:bg-accent/30"
                            }`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${
                                plan === "all" ? "bg-gray-500" : plan === "free" ? "bg-gray-400" : plan === "pro" ? "bg-blue-500" : plan === "business" ? "bg-purple-500" : "bg-orange-500"
                              }`} />
                              <span className="text-sm font-medium capitalize">{plan} {plan !== "all" ? "Plan" : " Plans"}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold">{count}</span>
                              {feeRate && <span className="text-xs text-muted-foreground ml-2">({feeRate})</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Panel - Seller Selection & Calculations */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Selected Summary */}
                  <div className="p-6 rounded-xl border border-border bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                    <h3 className="font-semibold mb-4">Payout Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Selected Sellers</p>
                        <p className="text-3xl font-bold">{sellers.filter(s => s.status === "active" && (payoutPlan === "all" || (s.plan ?? "free") === payoutPlan)).length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gross Amount</p>
                        <p className="text-3xl font-bold">{formatCurrency(sellers.filter(s => s.status === "active" && (payoutPlan === "all" || (s.plan ?? "free") === payoutPlan)).reduce((sum, s) => sum + s.revenue, 0))}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Net Payout</p>
                        <p className="text-3xl font-bold text-green-500">{formatCurrency(sellers.filter(s => s.status === "active" && (payoutPlan === "all" || (s.plan ?? "free") === payoutPlan)).reduce((sum, s) => {
                          const fee = s.plan === "free" ? 0.04 : s.plan === "pro" ? 0.025 : s.plan === "business" ? 0.015 : 0.01;
                          return sum + s.revenue * (1 - fee);
                        }, 0))}</p>
                      </div>
                    </div>
                  </div>

                  {/* Seller List */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                      <h3 className="font-semibold">Sellers</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {sellers.filter(s => s.status === "active" && (payoutPlan === "all" || (s.plan ?? "free") === payoutPlan)).length} sellers
                        </span>
                        <button onClick={() => {
                          const checkboxes = document.querySelectorAll('.seller-checkbox');
                          checkboxes.forEach((cb: any) => cb.checked = true);
                        }} className="text-xs text-primary hover:underline">Select All</button>
                      </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-card">
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-4 w-10"></th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Seller</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Plan</th>
                            <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Gross</th>
                            <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Fee</th>
                            <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">Net Payout</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sellers.filter(s => s.status === "active" && (payoutPlan === "all" || (s.plan ?? "free") === payoutPlan)).map((seller) => {
                            const fee = seller.plan === "free" ? 0.04 : seller.plan === "pro" ? 0.025 : seller.plan === "business" ? 0.015 : 0.01;
                            const feeAmount = Math.round(seller.revenue * fee);
                            const netPayout = seller.revenue - feeAmount;
                            return (
                              <tr key={seller.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                                <td className="py-3 px-4">
                                  <input type="checkbox" defaultChecked className="seller-checkbox w-4 h-4 rounded" />
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                      {seller.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{seller.name}</p>
                                      <p className="text-xs text-muted-foreground">{seller.storeName}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    seller.plan === "enterprise" ? "bg-orange-500/10 text-orange-500" :
                                    seller.plan === "business" ? "bg-purple-500/10 text-purple-500" :
                                    seller.plan === "pro" ? "bg-blue-500/10 text-blue-500" :
                                    "bg-gray-500/10 text-gray-500"
                                  }`}>{seller.plan ?? "free"}</span>
                                </td>
                                <td className="py-3 px-4 text-sm text-right">{formatCurrency(seller.revenue)}</td>
                                <td className="py-3 px-4 text-sm text-right text-red-500">-{formatCurrency(feeAmount)}</td>
                                <td className="py-3 px-4 text-sm text-right font-medium text-green-500">{formatCurrency(netPayout)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Process Button */}
                  <button onClick={async () => {
                    const selectedSellers = sellers.filter(s => s.status === "active" && (payoutPlan === "all" || (s.plan ?? "free") === payoutPlan));
                    const totalPayout = selectedSellers.reduce((sum, s) => {
                      const fee = s.plan === "free" ? 0.04 : s.plan === "pro" ? 0.025 : s.plan === "business" ? 0.015 : 0.01;
                      return sum + s.revenue * (1 - fee);
                    }, 0);
                    
                    alert(`Payout Batch Created!\n\nProvider: ${payoutProvider === "mtn_momo" ? "MTN MoMo" : "Airtel Money"}\nPlan Filter: ${payoutPlan}\nSellers: ${selectedSellers.length}\nTotal: UGX ${Math.round(totalPayout).toLocaleString()}\n\nIn production, this will initiate disbursements to each seller's mobile money account.`);
                  }}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    <ArrowUpRight className="w-5 h-5" /> Process Payouts via {payoutProvider === "mtn_momo" ? "MTN MoMo" : "Airtel Money"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Billing Tab ── */}
          {activeTab === "billing" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Billing & Subscriptions</h1>
                <p className="text-muted-foreground">Manage subscription plans, payments, and billing analytics</p>
              </div>

              {/* Billing Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
                  { id: "plans", label: "Manage Plans", icon: <Settings className="w-4 h-4" /> },
                  { id: "subscribers", label: "Subscribers", icon: <Users className="w-4 h-4" /> },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setBillingSubTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      billingSubTab === tab.id
                        ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg"
                        : "glass hover:bg-accent/50"
                    }`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {billingSubTab === "overview" && (
              <div>
                {/* Billing Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Monthly Recurring Revenue</span>
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-500" /></div>
                    </div>
                    <p className="text-2xl font-bold">UGX {(billingAnalytics?.mrr ?? 0).toLocaleString()}</p>
                    <p className="text-sm text-green-500">{billingAnalytics?.mrrGrowth ? (billingAnalytics.mrrGrowth > 0 ? "+" : "") + billingAnalytics.mrrGrowth.toFixed(1) + "%" : "+0%"} from last month</p>
                  </div>
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Active Subscribers</span>
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-blue-500" /></div>
                    </div>
                    <p className="text-2xl font-bold">{billingAnalytics?.activeSubscribers ?? 0}</p>
                    <p className="text-sm text-muted-foreground">{((billingAnalytics?.activeSubscribers ?? 0) / Math.max(1, totalSellers) * 100).toFixed(1)}% of total users</p>
                  </div>
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">ARPU</span>
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-purple-500" /></div>
                    </div>
                    <p className="text-2xl font-bold">UGX {(billingAnalytics?.arpu ?? 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Average per user</p>
                  </div>
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Churn Rate</span>
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-orange-500" /></div>
                    </div>
                    <p className="text-2xl font-bold">{(billingAnalytics?.churnRate ?? 0).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Monthly churn</p>
                  </div>
                </div>

                {/* Plan Distribution */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="text-lg font-semibold mb-6">Subscription Plans</h3>
                    <div className="space-y-4">
                      {[
                        { plan: "Free", count: subscriptions.filter(s => s.plan === "free" && s.status === "active").length, color: "bg-gray-500", price: "UGX 0" },
                        { plan: "Pro", count: subscriptions.filter(s => s.plan === "pro" && s.status === "active").length, color: "bg-blue-500", price: "UGX 15,000/mo" },
                        { plan: "Business", count: subscriptions.filter(s => s.plan === "business" && s.status === "active").length, color: "bg-purple-500", price: "UGX 35,000/mo" },
                        { plan: "Enterprise", count: subscriptions.filter(s => s.plan === "enterprise" && s.status === "active").length, color: "bg-orange-500", price: "UGX 60,000/mo" },
                      ].map((p, i) => (
                        <motion.div key={p.plan} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${p.color}`} />
                              <span className="font-medium">{p.plan}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold">{p.count}</span>
                              <span className="text-sm text-muted-foreground ml-2">users</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{p.price}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="text-lg font-semibold mb-6">Revenue by Plan</h3>
                    <div className="space-y-4">
                      {revenueByPlan.length > 0 ? revenueByPlan.map((r: { plan: string; revenue: number }, i: number) => (
                        <motion.div key={r.plan} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">{r.plan}</span>
                            <span className="text-lg font-bold text-green-500">UGX {r.revenue.toLocaleString()}</span>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No revenue data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              )}

              {billingSubTab === "plans" && (
              <div className="space-y-6">
                {/* Plans Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Subscription Plans</h3>
                    <p className="text-sm text-muted-foreground">Manage pricing plans and features</p>
                  </div>
                  <button onClick={() => { setNewPlan({ name: "", description: "", price: 0, currency: "UGX", interval: "monthly", features: [], isPopular: false }); setShowCreatePlanModal(true) }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" /> Add Plan
                  </button>
                  <div className="text-sm text-muted-foreground">
                    {subscriptions.filter(s => s.status === "active").length} active subscribers
                  </div>
                </div>

                {/* Plan Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan: any, i: number) => {
                    const planColors = ["gray", "blue", "purple", "orange", "green", "red", "pink", "cyan"]
                    const color = planColors[i % planColors.length]
                    return (
                      <motion.div key={plan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              color === "gray" ? "bg-gray-500/10 text-gray-500" :
                              color === "blue" ? "bg-blue-500/10 text-blue-500" :
                              color === "purple" ? "bg-purple-500/10 text-purple-500" :
                              color === "orange" ? "bg-orange-500/10 text-orange-500" :
                              color === "green" ? "bg-green-500/10 text-green-500" :
                              "bg-indigo-500/10 text-indigo-500"
                            }`}>
                              <Zap className="w-5 h-5" />
                            </div>
                            <h4 className="text-lg font-semibold">{plan.name}</h4>
                            {plan.isPopular && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">Popular</span>
                            )}
                          </div>
                          <button onClick={() => { setEditingPlan(plan); setShowPlanModal(true) }} className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-3xl font-bold mb-1">{plan.currency} {plan.price.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mb-4">per {plan.interval}</p>
                        <div className="space-y-2 text-sm mb-6">
                          {(plan.features || []).map((f: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-border flex items-center justify-between">
                          <button onClick={() => handleTogglePlanActive(plan._id, !plan.isActive)} 
                            className={`flex items-center gap-2 text-sm ${plan.isActive ? "text-green-500" : "text-red-500"}`}>
                            {plan.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {plan.isActive ? "Active" : "Disabled"}
                          </button>
                          <button onClick={() => confirmDeletePlan(plan._id)} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Promotions & Incentives Management */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Promotions & Incentives</h3>
                    <button onClick={() => { setEditingPromotion(null); setShowPromotionModal(true) }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                      <Plus className="w-4 h-4" /> Add Promotion
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {promotions && promotions.length > 0 ? promotions.map((promo: any, i: number) => (
                      <motion.div key={promo._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            promo.type === "referral" ? "bg-purple-500/10 text-purple-500" :
                            promo.type === "performance" ? "bg-green-500/10 text-green-500" :
                            promo.type === "loyalty" ? "bg-orange-500/10 text-orange-500" :
                            promo.type === "annual" ? "bg-blue-500/10 text-blue-500" :
                            "bg-gray-500/10 text-gray-500"
                          }`}>
                            {promo.type === "referral" ? <Users className="w-6 h-6" /> :
                             promo.type === "performance" ? <TrendingUp className="w-6 h-6" /> :
                             promo.type === "loyalty" ? <Star className="w-6 h-6" /> :
                             promo.type === "annual" ? <Calendar className="w-6 h-6" /> :
                             <Gift className="w-6 h-6" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={async () => {
                              await togglePromotionStatus({ id: promo._id })
                            }} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 ${
                              promo.isActive ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"
                            }`}>
                              {promo.isActive ? "Active" : "Inactive"}
                            </button>
                            <button onClick={() => { setEditingPromotion(promo); setShowPromotionModal(true) }}
                              className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={async () => {
                              if (confirm("Are you sure you want to delete this promotion?")) {
                                await deletePromotion({ id: promo._id })
                              }
                            }} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-semibold mb-2">{promo.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                            <span className="text-muted-foreground">Reward</span>
                            <span className="font-medium">
                              {promo.rewardType === "free_month" ? "1 Month Free" :
                               promo.rewardType === "discount_percentage" ? `${promo.rewardValue}% Off` :
                               promo.rewardType === "discount_fixed" ? `UGX ${promo.rewardValue.toLocaleString()}` :
                               `UGX ${promo.rewardValue.toLocaleString()} Cash`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                            <span className="text-muted-foreground">Trigger</span>
                            <span className="font-medium">
                              {promo.triggerCondition.type === "referral_count" ? `${promo.triggerCondition.threshold} Referrals` :
                               promo.triggerCondition.type === "transaction_volume" ? `UGX ${promo.triggerCondition.threshold.toLocaleString()}` :
                               promo.triggerCondition.type === "subscription_months" ? `${promo.triggerCondition.threshold} Months` :
                               "Manual"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                            <span className="text-muted-foreground">Redemptions</span>
                            <span className="font-medium">{promo.currentRedemptions}{promo.maxRedemptions ? ` / ${promo.maxRedemptions}` : ""}</span>
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="col-span-3 text-center py-12 text-muted-foreground">
                        <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No promotions yet. Create your first promotion!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}

              {billingSubTab === "subscribers" && (
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">All Subscribers</h3>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Seller", "Email", "Plan", "Status", "Start Date", "End Date", "Auto Renew", "Actions"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.length > 0 ? subscriptions.map((sub: { _id: string; userId: string; plan: string; status: string; startDate: number; endDate: number; autoRenew?: boolean }, i: number) => {
                        const seller = convexSellers?.find((s: any) => s._id === sub.userId);
                        return (
                          <motion.tr key={sub._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="border-b border-border hover:bg-accent/50 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium">{seller?.name ?? "Unknown Seller"}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{seller?.email ?? "-"}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                sub.plan === "enterprise" ? "bg-orange-500/10 text-orange-500" :
                                sub.plan === "business" ? "bg-purple-500/10 text-purple-500" :
                                sub.plan === "pro" ? "bg-blue-500/10 text-blue-500" :
                                "bg-gray-500/10 text-gray-500"
                              }`}>
                                {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                                sub.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                sub.status === "expired" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                              }`}>
                                {sub.status === "active" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">{new Date(sub.startDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-sm">{new Date(sub.endDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              {sub.autoRenew ? (
                                <span className="inline-flex items-center gap-1 text-sm text-green-500"><Check className="w-4 h-4" /> Yes</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><X className="w-4 h-4" /> No</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button className="p-1 hover:bg-accent rounded transition-colors" title="View Details">
                                  <Eye className="w-4 h-4" />
                                </button>
                                {sub.status === "active" && (
                                  <button onClick={async () => {
                                    if (confirm("Cancel this subscription?")) {
                                      await cancelSubscription({ id: sub._id as any });
                                    }
                                  }} className="p-1 hover:bg-accent rounded transition-colors text-red-500" title="Cancel">
                                    <Ban className="w-4 h-4" />
                                  </button>
                                )}
                                {sub.status === "expired" && (
                                  <button onClick={async () => {
                                    await renewSubscription({ userId: sub.userId as any, plan: sub.plan as any });
                                  }} className="p-1 hover:bg-accent rounded transition-colors text-green-500" title="Renew">
                                    <ArrowUpRight className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-muted-foreground">
                            No subscribers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </motion.div>
          )}

          {/* ── Commission Tab ── */}
          {activeTab === "commission" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Commission Management</h1>
                <p className="text-muted-foreground">Configure platform commission rates</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-6">Commission Settings</h3>
                  <div className="space-y-6">
                    {[
                      { label: "Default Commission Rate (%)", type: "number", value: "10", hint: "Applied to all new sellers" },
                      { label: "Minimum Transaction Amount", type: "text", value: "10,000", hint: "UGX minimum per transaction" },
                    ].map((f, i) => (
                      <div key={i}>
                        <label className="block text-sm font-medium mb-2">{f.label}</label>
                        <input type={f.type} defaultValue={f.value} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                        <p className="text-sm text-muted-foreground mt-1">{f.hint}</p>
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium mb-2">Payment Schedule</label>
                      <select className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600">
                        <option>Weekly</option><option>Bi-weekly</option><option>Monthly</option>
                      </select>
                    </div>
                    <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Save Settings</button>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-6">Commission Tiers</h3>
                  <div className="space-y-4">
                    {[
                      { tier: "Starter", threshold: "0 - 5M", rate: "10%", color: "bg-gray-500" },
                      { tier: "Growing", threshold: "5M - 20M", rate: "8%", color: "bg-blue-500" },
                      { tier: "Professional", threshold: "20M - 50M", rate: "6%", color: "bg-purple-500" },
                      { tier: "Enterprise", threshold: "50M+", rate: "4%", color: "bg-orange-500" },
                    ].map((tier, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                            <span className="font-medium">{tier.tier}</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">{tier.rate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Revenue: UGX {tier.threshold}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Permissions Tab ── */}
          {activeTab === "permissions" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Permissions & Roles</h1>
                  <p className="text-muted-foreground">Manage admin access, invite team members, and assign roles</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> Invite Admin
                </button>
              </div>

              {/* Role Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { role: "super_admin", label: "Super Admin", permissions: ["All Access", "User Management", "System Config", "Delete Admins"], color: "bg-purple-500" },
                  { role: "admin", label: "Admin", permissions: ["Seller Management", "Transaction View", "Reports", "Order Management"], color: "bg-blue-500" },
                  { role: "support", label: "Support", permissions: ["Customer Support", "Order View", "Basic Reports", "Ticket Management"], color: "bg-green-500" },
                  { role: "analyst", label: "Analyst", permissions: ["Analytics View", "Reports Export", "Data Insights"], color: "bg-orange-500" },
                ].map((roleInfo, i) => {
                  const count = allAdmins.filter(a => a.role === roleInfo.role && a.isActive).length;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 ${roleInfo.color} rounded-lg flex items-center justify-center text-white`}>
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{roleInfo.label}</h3>
                          <p className="text-sm text-muted-foreground">{count} active</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {roleInfo.permissions.slice(0, 3).map((perm, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className="w-3 h-3 text-green-500" />
                            <span>{perm}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Admins List */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{allAdmins.filter(a => a.isActive).length} active</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Name", "Email", "Role", "Status", "Last Login", "Actions"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allAdmins.map((admin, i) => (
                        <motion.tr key={admin._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                          className="border-b border-border hover:bg-accent/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                                {admin.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">{admin.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{admin.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              admin.role === "super_admin" ? "bg-purple-500/10 text-purple-500" :
                              admin.role === "admin" ? "bg-blue-500/10 text-blue-500" :
                              admin.role === "support" ? "bg-green-500/10 text-green-500" :
                              "bg-orange-500/10 text-orange-500"
                            }`}>
                              {admin.role.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`flex items-center gap-1 text-xs ${admin.isActive ? "text-green-500" : "text-red-500"}`}>
                              <div className={`w-2 h-2 rounded-full ${admin.isActive ? "bg-green-500" : "bg-red-500"}`} />
                              {admin.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : "Never"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setSelectedAdmin(admin); setShowEditRoleModal(true); }}
                                className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                                title="Edit Role"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {admin.isActive ? (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Deactivate ${admin.name}?`)) {
                                      await deactivateAdmin({ adminId: admin._id, deactivatedBy: "admin", deactivatedByName: "Admin" });
                                    }
                                  }}
                                  className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                                  title="Deactivate"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    await activateAdmin({ adminId: admin._id, activatedBy: "admin", activatedByName: "Admin" });
                                  }}
                                  className="p-1.5 hover:bg-green-500/10 rounded-lg transition-colors text-green-500"
                                  title="Activate"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                      {allAdmins.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No admins found. Invite your first team member!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <div className="mt-6 bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold">Pending Invitations</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {pendingInvitations.map((inv) => (
                      <div key={inv._id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{inv.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited as {inv.role.replace("_", " ")} by {inv.invitedByName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/invite?token=${inv.token}`);
                              alert("Invitation link copied!");
                            }}
                            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Cancel this invitation?")) {
                                await cancelInvitation({ id: inv._id });
                              }
                            }}
                            className="px-3 py-1.5 text-sm border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invite Modal */}
              {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Invite Admin</h3>
                      <button onClick={() => setShowInviteModal(false)} className="p-1 hover:bg-accent rounded transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const email = formData.get("email") as string;
                      const role = formData.get("role") as any;
                      
                      const rolePermissions: Record<string, string[]> = {
                        super_admin: ["all_access", "user_management", "system_config"],
                        admin: ["seller_management", "transaction_view", "reports"],
                        support: ["customer_support", "order_view", "basic_reports"],
                        analyst: ["analytics_view", "reports_export", "data_insights"],
                      };

                      try {
                        const result = await inviteAdmin({
                          email,
                          role,
                          permissions: rolePermissions[role] || [],
                          invitedBy: (session?.user as any)?.id || "admin",
                          invitedByName: session?.user?.name || "Admin",
                        });

                        if (result.success) {
                          const inviteLink = `${window.location.origin}/invite?token=${result.token}`;
                          
                          // Send invitation email via dedicated endpoint
                          const emailResponse = await fetch("/api/invite-admin", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              email,
                              role,
                              inviterName: session?.user?.name || "Admin",
                              inviteLink,
                            }),
                          });

                          const emailResult = await emailResponse.json();
                          
                          if (emailResult.success) {
                            alert(`Invitation email sent to ${email}!`);
                          } else {
                            alert(`Invitation created but email failed to send. Copy the link manually.`);
                          }
                          
                          setShowInviteModal(false);
                        } else {
                          alert(result.error);
                        }
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Email Address</label>
                          <input name="email" type="email" required placeholder="admin@example.com"
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Role</label>
                          <select name="role" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="admin">Admin</option>
                            <option value="support">Support</option>
                            <option value="analyst">Analyst</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setShowInviteModal(false)}
                          className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
                        <button type="submit"
                          className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">Send Invitation</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Edit Role Modal */}
              {showEditRoleModal && selectedAdmin && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Edit Role: {selectedAdmin.name}</h3>
                      <button onClick={() => { setShowEditRoleModal(false); setSelectedAdmin(null); }} className="p-1 hover:bg-accent rounded transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const newRole = formData.get("role") as any;
                      
                      const rolePermissions: Record<string, string[]> = {
                        super_admin: ["all_access", "user_management", "system_config"],
                        admin: ["seller_management", "transaction_view", "reports"],
                        support: ["customer_support", "order_view", "basic_reports"],
                        analyst: ["analytics_view", "reports_export", "data_insights"],
                      };

                      await updateAdminRole({
                        adminId: selectedAdmin._id,
                        role: newRole,
                        permissions: rolePermissions[newRole] || [],
                        updatedBy: "admin",
                        updatedByName: session?.user?.name || "Admin",
                      });

                      setShowEditRoleModal(false);
                      setSelectedAdmin(null);
                    }}>
                      <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <select name="role" defaultValue={selectedAdmin.role}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="support">Support</option>
                          <option value="analyst">Analyst</option>
                        </select>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => { setShowEditRoleModal(false); setSelectedAdmin(null); }}
                          className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
                        <button type="submit"
                          className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">Update Role</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Analytics Tab ── */}
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
                <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: "Platform Growth", value: "+42.5%", trend: "+18.2% from last month", icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
                  { label: "Active Sellers Rate", value: "87.3%", trend: "+5.1% from last month", icon: <Users className="w-5 h-5 text-blue-500" /> },
                  { label: "Avg Transaction Size", value: formatCurrency(425_000), trend: "+12.7% from last month", icon: <DollarSign className="w-5 h-5 text-purple-500" /> },
                  { label: "Platform Uptime", value: "99.9%", trend: "Excellent", icon: <Activity className="w-5 h-5 text-orange-500" /> },
                ].map((m, i) => (
                  <div key={i} className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                      {m.icon}
                    </div>
                    <div className="text-3xl font-bold mb-1">{m.value}</div>
                    <div className="text-sm text-green-500">{m.trend}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue vs Commission */}
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-1">Revenue vs Commission</h3>
                  <p className="text-sm text-muted-foreground mb-6">Platform earnings breakdown</p>
                  <div className="space-y-6">
                    {[
                      { label: "Seller Revenue", value: formatCurrency(405_000_000), pct: "90%", color: "from-blue-500 to-blue-600" },
                      { label: "Platform Commission", value: formatCurrency(45_000_000), pct: "10%", color: "from-green-500 to-green-600", textColor: "text-green-500" },
                    ].map((bar, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{bar.label}</span>
                          <span className={`text-sm font-bold ${bar.textColor || ""}`}>{bar.value}</span>
                        </div>
                        <div className="h-3 bg-accent rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: bar.pct }} transition={{ duration: 0.5, delay: i * 0.2 }}
                            className={`h-full bg-gradient-to-r ${bar.color}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-accent/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Platform Volume</span>
                      <span className="text-lg font-bold">{formatCurrency(450_000_000)}</span>
                    </div>
                  </div>
                </div>

                {/* Seller Activity */}
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-1">Seller Activity</h3>
                  <p className="text-sm text-muted-foreground mb-6">Daily active sellers</p>
                  <div className="h-48 flex items-end justify-between gap-1">
                    {[65, 72, 68, 75, 70, 78, 85, 82, 88, 92, 87, 95, 90, 93].map((height, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    <span>2 weeks ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-6">Regional Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { region: "Central Region (Kampala)", sellers: 456, revenue: 180_000_000, percentage: 40 },
                      { region: "Eastern Region", sellers: 234, revenue: 90_000_000, percentage: 20 },
                      { region: "Western Region", sellers: 312, revenue: 112_500_000, percentage: 25 },
                      { region: "Northern Region", sellers: 178, revenue: 45_000_000, percentage: 10 },
                      { region: "Other Areas", sellers: 54, revenue: 22_500_000, percentage: 5 },
                    ].map((region, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{region.region}</span>
                            <div className="text-sm text-muted-foreground">{region.sellers} sellers • {formatCurrency(region.revenue)}</div>
                          </div>
                          <span className="text-sm font-bold">{region.percentage}%</span>
                        </div>
                        <div className="h-2 bg-accent rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${region.percentage}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-6">Category Performance</h3>
                  <div className="space-y-4">
                    {[
                      { category: "Electronics", percentage: 35, color: "bg-blue-500" },
                      { category: "Fashion", percentage: 28, color: "bg-purple-500" },
                      { category: "Food", percentage: 18, color: "bg-green-500" },
                      { category: "Beauty", percentage: 12, color: "bg-pink-500" },
                      { category: "Other", percentage: 7, color: "bg-orange-500" },
                    ].map((cat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{cat.category}</div>
                          <div className="text-xs text-muted-foreground">{cat.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: <Store className="w-8 h-8 text-blue-500" />, value: "1,234", label: "Total Stores" },
                  { icon: <Package className="w-8 h-8 text-purple-500" />, value: "45,678", label: "Products Listed" },
                  { icon: <ShoppingCart className="w-8 h-8 text-green-500" />, value: "15,678", label: "Total Orders" },
                  { icon: <Users className="w-8 h-8 text-orange-500" />, value: "89,234", label: "Total Customers" },
                ].map((s, i) => (
                  <div key={i} className="p-6 rounded-xl border border-border bg-card">
                    <div className="mb-3">{s.icon}</div>
                    <div className="text-2xl font-bold mb-1">{s.value}</div>
                    <div className="text-sm text-muted-foreground mb-2">{s.label}</div>
                    <div className="text-xs text-green-500">+12.3% this month</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Support Tab ── */}
          {activeTab === "support" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
                <p className="text-muted-foreground">Manage customer and seller support requests</p>
              </div>

              {breachedTickets.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl border-2 border-red-500/30 bg-red-500/5 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-500 mb-1">SLA Breached — {breachedTickets.length} ticket(s) overdue</h4>
                    <div className="space-y-1">
                      {breachedTickets.map((t) => (
                        <div key={t.id} className="text-sm text-muted-foreground">
                          <span className="font-mono font-medium text-foreground">{t.id}</span> — {t.subject} <span className="text-red-400">(breached {t.breachedAt})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid sm:grid-cols-4 gap-6 mb-8">
                {[
                  { label: "Critical", count: ticketStats?.critical ?? 0, sla: "1 hour", color: "text-red-500", border: "border-red-500/20", bg: "bg-red-500/5" },
                  { label: "High", count: ticketStats?.high ?? 0, sla: "4 hours", color: "text-orange-500", border: "border-orange-500/20", bg: "bg-orange-500/5" },
                  { label: "Medium", count: ticketStats?.medium ?? 0, sla: "24 hours", color: "text-yellow-500", border: "border-yellow-500/20", bg: "bg-yellow-500/5" },
                  { label: "Low", count: ticketStats?.low ?? 0, sla: "48 hours", color: "text-blue-500", border: "border-blue-500/20", bg: "bg-blue-500/5" },
                ].map((s, i) => (
                  <div key={i} className={`p-6 rounded-xl border-2 ${s.border} ${s.bg}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className={`w-6 h-6 ${s.color}`} />
                      <span className="font-semibold">{s.label}</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{s.count}</div>
                    <div className="text-sm text-muted-foreground">SLA: {s.sla}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: "Avg Response Time", value: "15 min", trend: "-5 min from last week", icon: <Clock className="w-5 h-5 text-blue-500" /> },
                  { label: "Resolution Rate", value: "94.5%", trend: "+2.3% from last week", icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
                  { label: "Satisfaction Score", value: "4.8/5", trend: "+0.2 from last week", icon: <Star className="w-5 h-5 text-yellow-500" /> },
                ].map((m, i) => (
                  <div key={i} className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                      {m.icon}
                    </div>
                    <div className="text-2xl font-bold mb-1">{m.value}</div>
                    <div className="text-sm text-green-500">{m.trend}</div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Active Tickets</h3>
                  <div className="flex items-center gap-2">
                    <select 
                      value={ticketFilter} 
                      onChange={(e) => setTicketFilter(e.target.value as any)}
                      className="px-3 py-1.5 text-sm border border-border rounded-lg"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  {tickets && tickets.length > 0 ? tickets.map((ticket: any, i: number) => (
                    <motion.div key={ticket._id || ticket.ticketNumber} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
                      onClick={() => { setSelectedTicket(ticket); setShowTicketModal(true); }}
                      className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono font-medium">{ticket.ticketNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              ticket.priority === "critical" ? "bg-red-500/10 text-red-500" :
                              ticket.priority === "high" ? "bg-orange-500/10 text-orange-500" :
                              ticket.priority === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                              "bg-blue-500/10 text-blue-500"}`}>
                              {ticket.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              ticket.status === "open" ? "bg-green-500/10 text-green-500" :
                              ticket.status === "in_progress" ? "bg-yellow-500/10 text-yellow-500" :
                              "bg-blue-500/10 text-blue-500"}`}>
                              {ticket.status.replace("_", " ")}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-1">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground">From: {ticket.userName}</p>
                          <span className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleString()}</span>
                        </div>
                        <button className="p-2 hover:bg-accent rounded-lg">
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No support tickets found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Audit Trail Tab ── */}
          {activeTab === "audit" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Audit Trail</h1>
                  <p className="text-muted-foreground">Track all admin actions and changes</p>
                </div>
                <select value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600">
                  <option value="all">All Actions</option>
                  <option value="seller_approve">Seller Approve</option>
                  <option value="seller_suspend">Seller Suspend</option>
                  <option value="ticket_create">Ticket Create</option>
                  <option value="ticket_resolve">Ticket Resolve</option>
                  <option value="ticket_reply">Ticket Reply</option>
                  <option value="payment_refund">Payment Refund</option>
                  <option value="config_update">Config Update</option>
                  <option value="role_update">Role Update</option>
                  <option value="export_data">Export Data</option>
                </select>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Admin", "Action", "Target", "Date"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dbAuditLogs && dbAuditLogs.length > 0 ? (
                        dbAuditLogs
                          .filter((log: any) => auditFilter === "all" || log.action === auditFilter)
                          .map((log: any, i: number) => (
                            <motion.tr key={log._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                              className="border-b border-border hover:bg-accent/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-purple-500" />
                                  </div>
                                  <span className="text-sm font-medium">{log.adminName || "System"}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                  {log.action?.replace(/_/g, " ") || "Unknown"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">{log.targetName || log.targetType || "-"}</td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</td>
                            </motion.tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            <FileBarChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No audit logs found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Reports Tab ── */}
          {activeTab === "reports" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Scheduled Reports</h1>
                  <p className="text-muted-foreground">Manage automated report generation and delivery</p>
                </div>
                <button onClick={() => setShowCreateReportModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Report
                </button>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Name", "Type", "Format", "Schedule", "Recipients", "Status"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scheduledReports.map((report, i) => (
                        <motion.tr key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="border-b border-border hover:bg-accent/50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">{report.name}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 capitalize">{report.type}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 uppercase">{report.format}</span>
                          </td>
                          <td className="py-3 px-4 text-sm capitalize">{report.schedule}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{report.recipients}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${report.active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
                              {report.active ? "Active" : "Paused"}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {showCreateReportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Create Scheduled Report</h3>
                      <button onClick={() => setShowCreateReportModal(false)} className="p-1 hover:bg-accent rounded transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Report Name</label>
                        <input type="text" placeholder="e.g. Daily Revenue Summary" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Type</label>
                          <select className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600">
                            <option value="revenue">Revenue</option>
                            <option value="sellers">Sellers</option>
                            <option value="orders">Orders</option>
                            <option value="products">Products</option>
                            <option value="transactions">Transactions</option>
                            <option value="support">Support</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Format</label>
                          <select className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600">
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                            <option value="xlsx">XLSX</option>
                            <option value="pdf">PDF</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Schedule</label>
                        <select className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600">
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Recipients (comma separated)</label>
                        <input type="text" placeholder="admin@swiftshopy.com, ops@swiftshopy.com" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-6">
                      <button onClick={() => setShowCreateReportModal(false)}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
                      <button onClick={() => setShowCreateReportModal(false)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">Create Report</button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Disputes Tab ── */}
          {activeTab === "disputes" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Payment Disputes</h1>
                <p className="text-muted-foreground">Manage customer payment disputes and refunds</p>
              </div>

              <div className="grid sm:grid-cols-4 gap-6 mb-8">
                {(() => {
                  const open = disputes?.filter(d => d.status === "open").length ?? 0;
                  const investigating = disputes?.filter(d => d.status === "investigating").length ?? 0;
                  const resolved = disputes?.filter(d => d.status === "resolved").length ?? 0;
                  const total = disputes?.length ?? 0;
                  return [
                    { label: "Open Disputes", count: open, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/20" },
                    { label: "Under Review", count: investigating, color: "text-yellow-500", bg: "bg-yellow-500/5", border: "border-yellow-500/20" },
                    { label: "Resolved", count: resolved, color: "text-green-500", bg: "bg-green-500/5", border: "border-green-500/20" },
                    { label: "Total Disputes", count: total, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/20" },
                  ].map((s, i) => (
                    <div key={i} className={`p-6 rounded-xl border-2 ${s.border} ${s.bg}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className={`w-6 h-6 ${s.color}`} />
                        <span className="font-semibold">{s.label}</span>
                      </div>
                      <div className="text-3xl font-bold mb-1">{s.count}</div>
                    </div>
                  ));
                })()}
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">All Disputes</h3>
                  <select className="px-3 py-1.5 text-sm border border-border rounded-lg">
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="investigating">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                {disputes && disputes.length > 0 ? (
                  <div className="space-y-3">
                    {disputes.map((dispute: any) => (
                      <div key={dispute._id} className="p-4 rounded-lg border border-border hover:bg-accent/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                dispute.status === "open" ? "bg-red-500/10 text-red-500" :
                                dispute.status === "investigating" ? "bg-yellow-500/10 text-yellow-500" :
                                "bg-green-500/10 text-green-500"
                              }`}>
                                {dispute.status}
                              </span>
                              <span className="text-sm font-mono">UGX {dispute.amount?.toLocaleString()}</span>
                            </div>
                            <p className="font-medium">{dispute.reason}</p>
                            <p className="text-sm text-muted-foreground">{dispute.description}</p>
                            <span className="text-xs text-muted-foreground">{new Date(dispute.createdAt).toLocaleString()}</span>
                          </div>
                          {dispute.status === "open" && (
                            <button className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No disputes found</p>
                    <p className="text-sm">Disputes will appear here when customers raise payment issues</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── KYC Management Tab ── */}
          {activeTab === "kyc" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">KYC Verification Management</h1>
                <p className="text-muted-foreground">Review and manage seller identity verification submissions</p>
              </div>

              {/* KYC Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                  { label: "Total", value: kycStats.total, color: "text-foreground", bg: "bg-accent" },
                  { label: "Pending", value: kycStats.pending, color: "text-amber-500", bg: "bg-amber-500/10" },
                  { label: "Verified", value: kycStats.verified, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Rejected", value: kycStats.rejected, color: "text-red-500", bg: "bg-red-500/10" },
                  { label: "High Risk", value: kycStats.highRisk, color: "text-orange-500", bg: "bg-orange-500/10" },
                  { label: "Avg Time", value: `${kycStats.avgProcessingTimeHours}h`, color: "text-blue-500", bg: "bg-blue-500/10" },
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-xl border border-border ${stat.bg}`}>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { label: "All", value: undefined as any },
                  { label: `Pending (${kycStats.pending})`, value: "pending" as const },
                  { label: `Verified (${kycStats.verified})`, value: "verified" as const },
                  { label: `Rejected (${kycStats.rejected})`, value: "rejected" as const },
                ].map((f) => (
                  <button key={f.label} onClick={() => setKycStatusFilter(f.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      kycStatusFilter === f.value
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-card border border-border hover:bg-accent"
                    }`}>{f.label}</button>
                ))}
              </div>

              {/* Submissions Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-accent/30">
                        {["Seller", "Business", "ID Type", "Tier", "Risk", "Status", "Submitted", "Actions"].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {kycSubmissions.length === 0 && (
                        <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No KYC submissions found</td></tr>
                      )}
                      {kycSubmissions.map((kyc: any) => (
                        <tr key={kyc._id} className="border-b border-border hover:bg-accent/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm">{kyc.fullName}</div>
                            <div className="text-xs text-muted-foreground">{kyc.userEmail}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">{kyc.businessName}</td>
                          <td className="py-3 px-4 text-sm capitalize">{kyc.idType?.replace("_", " ")}</td>
                          <td className="py-3 px-4"><KYCTierBadge tier={kyc.tier} /></td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              kyc.riskScore > 50 ? "bg-red-500/15 text-red-500" :
                              kyc.riskScore > 25 ? "bg-amber-500/15 text-amber-500" :
                              "bg-emerald-500/15 text-emerald-500"
                            }`}>{kyc.riskScore}/100</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                              kyc.status === "verified" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                              kyc.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}>
                              {kyc.status === "verified" ? <Check className="w-3 h-3" /> : kyc.status === "pending" ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {kyc.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{new Date(kyc.submittedAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setSelectedKYC(kyc); setShowKYCModal(true); }}
                                className="px-3 py-1 text-xs font-medium bg-accent rounded-lg hover:bg-accent/80 transition-all">Review</button>
                              {kyc.status === "pending" && (
                                <>
                                  <button onClick={async () => {
                                    setKycProcessing(true);
                                    try {
                                      await approveKYC({ kycId: kyc._id, adminId: session?.user?.email || "admin", adminName: session?.user?.name || "Admin" });
                                    } catch (e: any) { alert(e.message); }
                                    setKycProcessing(false);
                                  }} disabled={kycProcessing}
                                    className="px-3 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-600 rounded-lg hover:bg-emerald-500/25 transition-all disabled:opacity-50">
                                    Approve
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KYC Detail Modal */}
              <AnimatePresence>
                {showKYCModal && selectedKYC && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowKYCModal(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      onClick={e => e.stopPropagation()}
                      className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-500" /> KYC Review
                          </h2>
                          <button onClick={() => setShowKYCModal(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-3 mb-6">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${
                            selectedKYC.status === "verified" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            selectedKYC.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}>{selectedKYC.status.toUpperCase()}</span>
                          <KYCTierBadge tier={selectedKYC.tier} size="md" />
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            selectedKYC.riskScore > 50 ? "bg-red-500/15 text-red-500" :
                            selectedKYC.riskScore > 25 ? "bg-amber-500/15 text-amber-500" :
                            "bg-emerald-500/15 text-emerald-500"
                          }`}>Risk: {selectedKYC.riskScore}/100</span>
                        </div>

                        {/* Personal Info */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                          {[
                            { label: "Full Name", value: selectedKYC.fullName },
                            { label: "Email", value: selectedKYC.userEmail },
                            { label: "Date of Birth", value: selectedKYC.dateOfBirth },
                            { label: "Phone Number", value: selectedKYC.phoneNumber },
                            { label: "Business Name", value: selectedKYC.businessName },
                            { label: "Store", value: selectedKYC.storeName },
                            { label: "ID Type", value: selectedKYC.idType?.replace("_", " ") },
                            { label: "ID Number", value: selectedKYC.idNumber },
                          ].map((f, i) => (
                            <div key={i} className="p-3 rounded-lg bg-accent/30">
                              <div className="text-xs text-muted-foreground mb-1">{f.label}</div>
                              <div className="text-sm font-medium capitalize">{f.value || "N/A"}</div>
                            </div>
                          ))}
                        </div>

                        {/* Enterprise fields if present */}
                        {(selectedKYC.businessRegNumber || selectedKYC.tinNumber) && (
                          <div className="mb-6 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                            <h3 className="text-sm font-bold text-purple-500 mb-3">Enterprise Verification</h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {selectedKYC.businessRegNumber && <div className="text-sm"><span className="text-muted-foreground">Reg Number:</span> <span className="font-medium">{selectedKYC.businessRegNumber}</span></div>}
                              {selectedKYC.tinNumber && <div className="text-sm"><span className="text-muted-foreground">TIN:</span> <span className="font-medium">{selectedKYC.tinNumber}</span></div>}
                            </div>
                          </div>
                        )}

                        {/* Automated Checks */}
                        <div className="mb-6 p-4 rounded-xl border border-border bg-accent/20">
                          <h3 className="text-sm font-bold mb-3">Automated Verification Checks</h3>
                          <div className="grid sm:grid-cols-3 gap-3">
                            {[
                              { label: "ID Format", passed: selectedKYC.idFormatValid },
                              { label: "Duplicate Check", passed: selectedKYC.duplicateCheck },
                              { label: "Phone Consistency", passed: selectedKYC.phoneConsistencyCheck },
                            ].map((check, i) => (
                              <div key={i} className={`p-2 rounded-lg flex items-center gap-2 text-sm ${
                                check.passed ? "bg-emerald-500/10 text-emerald-500" : check.passed === false ? "bg-red-500/10 text-red-500" : "bg-gray-500/10 text-gray-500"
                              }`}>
                                {check.passed ? <CheckCircle className="w-4 h-4" /> : check.passed === false ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                {check.label}
                              </div>
                            ))}
                          </div>
                          {selectedKYC.riskFlags && selectedKYC.riskFlags.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Risk Flags:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedKYC.riskFlags.map((f: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-xs font-medium">{f}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Rejection Reason (if rejected) */}
                        {selectedKYC.status === "rejected" && selectedKYC.rejectionReason && (
                          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                            <h3 className="text-sm font-bold text-red-500 mb-2">Rejection Reason</h3>
                            <p className="text-sm">{selectedKYC.rejectionReason}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {selectedKYC.status === "pending" && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Rejection Reason (if rejecting)</label>
                              <textarea value={kycRejectReason} onChange={e => setKycRejectReason(e.target.value)}
                                placeholder="e.g. ID document is blurry, please upload a clearer image"
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                            </div>
                            <div className="flex gap-3">
                              <button onClick={async () => {
                                setKycProcessing(true);
                                try {
                                  await approveKYC({ kycId: selectedKYC._id, adminId: session?.user?.email || "admin", adminName: session?.user?.name || "Admin" });
                                  setShowKYCModal(false);
                                  setSelectedKYC(null);
                                } catch (e: any) { alert(e.message); }
                                setKycProcessing(false);
                              }} disabled={kycProcessing}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50">
                                {kycProcessing ? "Processing..." : "✓ Approve Verification"}
                              </button>
                              <button onClick={async () => {
                                if (!kycRejectReason.trim()) { alert("Please provide a rejection reason"); return; }
                                setKycProcessing(true);
                                try {
                                  await rejectKYC({ kycId: selectedKYC._id, adminId: session?.user?.email || "admin", adminName: session?.user?.name || "Admin", reason: kycRejectReason });
                                  setShowKYCModal(false);
                                  setSelectedKYC(null);
                                  setKycRejectReason("");
                                } catch (e: any) { alert(e.message); }
                                setKycProcessing(false);
                              }} disabled={kycProcessing || !kycRejectReason.trim()}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50">
                                {kycProcessing ? "Processing..." : "✕ Reject Verification"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
                          <div>Submitted: {new Date(selectedKYC.submittedAt).toLocaleString()}</div>
                          {selectedKYC.reviewedAt && <div>Reviewed: {new Date(selectedKYC.reviewedAt).toLocaleString()}</div>}
                          {selectedKYC.reviewedBy && <div>Reviewed by: {selectedKYC.reviewedBy}</div>}
                          <div>Submission count: {selectedKYC.submissionCount}</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Settings Tab ── */}
          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
                  <p className="text-muted-foreground">Configure global platform settings and preferences</p>
                </div>
                <div className="flex items-center gap-4">
                  {settingsError && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {settingsError}
                    </motion.div>
                  )}
                  {settingsSaved && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4" /> Settings saved! Restart server to apply.
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-2">
                  {[
                    { id: "general", label: "General", icon: <Settings className="w-5 h-5" /> },
                    { id: "payment", label: "Payment Gateway", icon: <CreditCard className="w-5 h-5" /> },
                    { id: "security", label: "Security", icon: <Shield className="w-5 h-5" /> },
                    { id: "notification", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
                    { id: "api", label: "API Configuration", icon: <Activity className="w-5 h-5" /> },
                  ].map((item) => (
                    <button key={item.id} onClick={() => setSettingsSubTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left ${
                        settingsSubTab === item.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : ""
                      }`}>
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-3 space-y-6">
                  {/* General Settings */}
                  {settingsSubTab === "general" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <h3 className="text-lg font-semibold mb-6">General Settings</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Platform Name</label>
                            <input type="text" value={generalSettings.platformName}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Support Email</label>
                            <input type="email" value={generalSettings.supportEmail}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Platform Description</label>
                            <textarea rows={3} value={generalSettings.platformDescription}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, platformDescription: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none" />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div>
                              <div className="font-medium">Maintenance Mode</div>
                              <div className="text-sm text-muted-foreground">Temporarily disable platform access</div>
                            </div>
                            <button onClick={() => setGeneralSettings({ ...generalSettings, maintenanceMode: !generalSettings.maintenanceMode })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${generalSettings.maintenanceMode ? "bg-red-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${generalSettings.maintenanceMode ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Payment Gateway Settings */}
                  {settingsSubTab === "payment" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <h3 className="text-lg font-semibold mb-6">Payment Gateways</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">🟡</div>
                              <div>
                                <div className="font-medium">MTN Mobile Money</div>
                                <div className="text-sm text-muted-foreground">Accept payments via MTN MoMo</div>
                              </div>
                            </div>
                            <button onClick={() => setPaymentSettings({ ...paymentSettings, mtnEnabled: !paymentSettings.mtnEnabled })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${paymentSettings.mtnEnabled ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${paymentSettings.mtnEnabled ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          {paymentSettings.mtnEnabled && (
                            <div className="pl-4 ml-4 border-l-2 border-yellow-500/30 space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">API Key</label>
                                <input type="password" value={paymentSettings.mtnApiKey}
                                  onChange={(e) => setPaymentSettings({ ...paymentSettings, mtnApiKey: e.target.value })}
                                  placeholder="Enter MTN MoMo API Key"
                                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Subscription Key</label>
                                <input type="password" value={paymentSettings.mtnSubscriptionKey}
                                  onChange={(e) => setPaymentSettings({ ...paymentSettings, mtnSubscriptionKey: e.target.value })}
                                  placeholder="Enter Subscription Key"
                                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Collection Account ID</label>
                                <input type="text" value={paymentSettings.mtnCollectionId}
                                  onChange={(e) => setPaymentSettings({ ...paymentSettings, mtnCollectionId: e.target.value })}
                                  placeholder="Enter Collection Account ID"
                                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">🔴</div>
                              <div>
                                <div className="font-medium">Airtel Money</div>
                                <div className="text-sm text-muted-foreground">Accept payments via Airtel</div>
                              </div>
                            </div>
                            <button onClick={() => setPaymentSettings({ ...paymentSettings, airtelEnabled: !paymentSettings.airtelEnabled })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${paymentSettings.airtelEnabled ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${paymentSettings.airtelEnabled ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          {paymentSettings.airtelEnabled && (
                            <div className="pl-4 ml-4 border-l-2 border-red-500/30 space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">API Key</label>
                                <input type="password" value={paymentSettings.airtelApiKey}
                                  onChange={(e) => setPaymentSettings({ ...paymentSettings, airtelApiKey: e.target.value })}
                                  placeholder="Enter Airtel Money API Key"
                                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">💵</div>
                              <div>
                                <div className="font-medium">Cash on Delivery</div>
                                <div className="text-sm text-muted-foreground">Let customers pay on delivery</div>
                              </div>
                            </div>
                            <button onClick={() => setPaymentSettings({ ...paymentSettings, codEnabled: !paymentSettings.codEnabled })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${paymentSettings.codEnabled ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${paymentSettings.codEnabled ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <h3 className="text-lg font-semibold mb-6">Commission Settings</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Platform Commission (%)</label>
                            <input type="number" value={paymentSettings.platformCommission}
                              onChange={(e) => setPaymentSettings({ ...paymentSettings, platformCommission: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                            <p className="text-sm text-muted-foreground mt-1">Fee charged on each sale</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Security Settings */}
                  {settingsSubTab === "security" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <h3 className="text-lg font-semibold mb-6">Security Configuration</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div>
                              <div className="font-medium">Two-Factor Authentication</div>
                              <div className="text-sm text-muted-foreground">Require 2FA for admin accounts</div>
                            </div>
                            <button onClick={() => setSecuritySettings({ ...securitySettings, require2FA: !securitySettings.require2FA })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${securitySettings.require2FA ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${securitySettings.require2FA ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div>
                              <div className="font-medium">Seller Verification</div>
                              <div className="text-sm text-muted-foreground">Manual approval for new sellers</div>
                            </div>
                            <button onClick={() => setSecuritySettings({ ...securitySettings, sellerVerification: !securitySettings.sellerVerification })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${securitySettings.sellerVerification ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${securitySettings.sellerVerification ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">API Rate Limit (requests/minute)</label>
                            <input type="number" value={securitySettings.apiRateLimit}
                              onChange={(e) => setSecuritySettings({ ...securitySettings, apiRateLimit: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Session Timeout (seconds)</label>
                            <input type="number" value={securitySettings.sessionTimeout}
                              onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
                            <input type="number" value={securitySettings.passwordMinLength}
                              onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Notification Settings */}
                  {settingsSubTab === "notification" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div>
                              <div className="font-medium">New Seller Registration</div>
                              <div className="text-sm text-muted-foreground">Get notified when new sellers sign up</div>
                            </div>
                            <button onClick={() => setNotificationSettings({ ...notificationSettings, newSellerAlert: !notificationSettings.newSellerAlert })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${notificationSettings.newSellerAlert ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationSettings.newSellerAlert ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div>
                              <div className="font-medium">Failed Payments</div>
                              <div className="text-sm text-muted-foreground">Notify when payments fail</div>
                            </div>
                            <button onClick={() => setNotificationSettings({ ...notificationSettings, failedPaymentAlert: !notificationSettings.failedPaymentAlert })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${notificationSettings.failedPaymentAlert ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationSettings.failedPaymentAlert ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div>
                              <div className="font-medium">System Errors</div>
                              <div className="text-sm text-muted-foreground">Critical system error alerts</div>
                            </div>
                            <button onClick={() => setNotificationSettings({ ...notificationSettings, systemErrorAlert: !notificationSettings.systemErrorAlert })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${notificationSettings.systemErrorAlert ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationSettings.systemErrorAlert ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div>
                              <div className="font-medium">Daily Reports</div>
                              <div className="text-sm text-muted-foreground">Automated daily performance reports</div>
                            </div>
                            <button onClick={() => setNotificationSettings({ ...notificationSettings, dailyReport: !notificationSettings.dailyReport })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${notificationSettings.dailyReport ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationSettings.dailyReport ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div>
                              <div className="font-medium">Weekly Summary</div>
                              <div className="text-sm text-muted-foreground">Weekly platform summary emails</div>
                            </div>
                            <button onClick={() => setNotificationSettings({ ...notificationSettings, weeklySummary: !notificationSettings.weeklySummary })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${notificationSettings.weeklySummary ? "bg-green-500" : "bg-accent"}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationSettings.weeklySummary ? "right-1" : "left-1"}`} />
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">High Value Threshold (UGX)</label>
                            <input type="number" value={notificationSettings.highValueThreshold}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, highValueThreshold: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                            <p className="text-sm text-muted-foreground mt-1">Alert for transactions over this amount</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Notification Email</label>
                            <input type="email" value={notificationSettings.notificationEmail}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, notificationEmail: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* API Configuration */}
                  {settingsSubTab === "api" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      {/* Payment Environment Toggle */}
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">Payment Environment</h3>
                            <p className="text-sm text-muted-foreground">Switch between sandbox and production</p>
                          </div>
                          <button onClick={() => setApiSettings({ ...apiSettings, environment: apiSettings.environment === "sandbox" ? "production" : "sandbox" })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${apiSettings.environment === "sandbox" ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" : "bg-green-500/10 text-green-600 border border-green-500/20"}`}>
                            {apiSettings.environment === "sandbox" ? "🧪 Sandbox" : "🚀 Production"}
                          </button>
                        </div>
                      </div>

                      {/* MTN MoMo Sandbox */}
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-2xl">🟡</div>
                          <div>
                            <h3 className="text-lg font-semibold">MTN MoMo - Sandbox</h3>
                            <p className="text-sm text-muted-foreground">Test payment credentials</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Collections Primary Key</label>
                            <input type="password" value={apiSettings.mtnSandboxCollectionsKey || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, mtnSandboxCollectionsKey: e.target.value })}
                              placeholder="Enter Collections Key"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Disbursements Primary Key</label>
                            <input type="password" value={apiSettings.mtnSandboxDisbursementsKey || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, mtnSandboxDisbursementsKey: e.target.value })}
                              placeholder="Enter Disbursements Key"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">API User ID</label>
                            <input type="text" value={apiSettings.mtnSandboxApiUserId || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, mtnSandboxApiUserId: e.target.value })}
                              placeholder="UUID format"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">API Key</label>
                            <input type="password" value={apiSettings.mtnSandboxApiKey || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, mtnSandboxApiKey: e.target.value })}
                              placeholder="Enter API Key"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* MTN MoMo Production */}
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl">🟡</div>
                          <div>
                            <h3 className="text-lg font-semibold">MTN MoMo - Production</h3>
                            <p className="text-sm text-muted-foreground">Live payment credentials</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Collections Primary Key</label>
                            <input type="password" value={apiSettings.mtnProductionCollectionsKey || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, mtnProductionCollectionsKey: e.target.value })}
                              placeholder="Enter Collections Key"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Disbursements Primary Key</label>
                            <input type="password" value={apiSettings.mtnProductionDisbursementsKey || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, mtnProductionDisbursementsKey: e.target.value })}
                              placeholder="Enter Disbursements Key"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">API User ID</label>
                            <input type="text" value={apiSettings.mtnProductionApiUserId || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, mtnProductionApiUserId: e.target.value })}
                              placeholder="UUID format"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">API Key</label>
                            <input type="password" value={apiSettings.mtnProductionApiKey || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, mtnProductionApiKey: e.target.value })}
                              placeholder="Enter API Key"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Airtel Money */}
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-2xl">🔴</div>
                          <div>
                            <h3 className="text-lg font-semibold">Airtel Money</h3>
                            <p className="text-sm text-muted-foreground">Airtel payment credentials</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Client ID</label>
                            <input type="text" value={apiSettings.airtelClientId || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, airtelClientId: e.target.value })}
                              placeholder="Enter Client ID"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Client Secret</label>
                            <input type="password" value={apiSettings.airtelClientSecret || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, airtelClientSecret: e.target.value })}
                              placeholder="Enter Client Secret"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Business */}
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl">💬</div>
                          <div>
                            <h3 className="text-lg font-semibold">WhatsApp Business API</h3>
                            <p className="text-sm text-muted-foreground">WhatsApp notification credentials</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Phone Number ID</label>
                            <input type="text" value={apiSettings.whatsappPhoneNumberId || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, whatsappPhoneNumberId: e.target.value })}
                              placeholder="Enter Phone Number ID"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Access Token</label>
                            <input type="password" value={apiSettings.whatsappAccessToken || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, whatsappAccessToken: e.target.value })}
                              placeholder="Enter Access Token"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">API Version</label>
                            <input type="text" value={apiSettings.whatsappApiVersion || "v18.0"}
                              onChange={(e) => setApiSettings({ ...apiSettings, whatsappApiVersion: e.target.value })}
                              placeholder="v18.0"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Email Configuration */}
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">📧</div>
                          <div>
                            <h3 className="text-lg font-semibold">Email Configuration</h3>
                            <p className="text-sm text-muted-foreground">Email service provider settings</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Email Provider</label>
                            <select value={apiSettings.emailProvider || "resend"}
                              onChange={(e) => setApiSettings({ ...apiSettings, emailProvider: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                              <option value="resend">Resend</option>
                              <option value="sendgrid">SendGrid</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">From Address</label>
                            <input type="text" value={apiSettings.emailFrom || "SwiftShopy <noreply@swiftshopy.com>"}
                              onChange={(e) => setApiSettings({ ...apiSettings, emailFrom: e.target.value })}
                              placeholder="SwiftShopy <noreply@swiftshopy.com>"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Resend API Key</label>
                            <input type="password" value={apiSettings.resendApiKey || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, resendApiKey: e.target.value })}
                              placeholder="re_xxxxxxxxxxxxxx"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">SendGrid API Key</label>
                            <input type="password" value={apiSettings.sendgridApiKey || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, sendgridApiKey: e.target.value })}
                              placeholder="SG.xxxxxxxxxxxxxxxx"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Callback URLs */}
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><Activity className="w-5 h-5 text-purple-500" /></div>
                          <div>
                            <h3 className="text-lg font-semibold">Webhooks & Callbacks</h3>
                            <p className="text-sm text-muted-foreground">Payment callback URLs</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">MTN Callback URL</label>
                            <input type="url" value={apiSettings.callbackUrl || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, callbackUrl: e.target.value })}
                              placeholder="https://yourdomain.com/api/webhooks/mtn"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Webhook Secret</label>
                            <input type="password" value={apiSettings.webhookSecret || ""}
                              onChange={(e) => setApiSettings({ ...apiSettings, webhookSecret: e.target.value })}
                              placeholder="Enter webhook secret"
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-end gap-4">
                    <button onClick={() => {
                      setGeneralSettings({ platformName: "SwiftShopy", supportEmail: "support@swiftshopy.com", platformDescription: "WhatsApp Commerce + Mobile Money Payments platform", maintenanceMode: false })
                      setPaymentSettings({ mtnEnabled: true, mtnApiKey: "", mtnSubscriptionKey: "", mtnCollectionId: "", airtelEnabled: true, airtelApiKey: "", codEnabled: true, platformCommission: 10 })
                      setSecuritySettings({ require2FA: true, apiRateLimit: 1000, sellerVerification: true, sessionTimeout: 3600, passwordMinLength: 8 })
                      setNotificationSettings({ newSellerAlert: true, highValueThreshold: 1000000, failedPaymentAlert: true, systemErrorAlert: true, dailyReport: false, weeklySummary: true, notificationEmail: "admin@swiftshopy.com" })
                      setApiSettings({
                        environment: "sandbox",
                        mtnSandboxCollectionsKey: "",
                        mtnSandboxDisbursementsKey: "",
                        mtnSandboxApiUserId: "",
                        mtnSandboxApiKey: "",
                        mtnProductionCollectionsKey: "",
                        mtnProductionDisbursementsKey: "",
                        mtnProductionApiUserId: "",
                        mtnProductionApiKey: "",
                        airtelClientId: "",
                        airtelClientSecret: "",
                        whatsappPhoneNumberId: "",
                        whatsappAccessToken: "",
                        whatsappApiVersion: "v18.0",
                        emailProvider: "resend",
                        resendApiKey: "",
                        sendgridApiKey: "",
                        emailFrom: "SwiftShopy <noreply@swiftshopy.com>",
                        callbackUrl: "",
                        webhookSecret: "",
                      })
                    }}
                      className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">Reset to Defaults</button>
                    <button onClick={saveSettings} disabled={settingsSaving}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                      {settingsSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {settingsSaving ? "Saving..." : "Save All Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* ── Plan Edit Modal ── */}
      {showPlanModal && editingPlan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowPlanModal(false); setEditingPlan(null); }}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            className="bg-card rounded-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit {editingPlan.name} Plan</h2>
              <button onClick={() => { setShowPlanModal(false); setEditingPlan(null); }} className="p-2 hover:bg-accent rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plan Name</label>
                <input type="text" value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea value={editingPlan.description || ""}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input type="number" value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <input type="text" value={editingPlan.currency || "UGX"}
                    onChange={(e) => setEditingPlan({ ...editingPlan, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Billing Interval</label>
                <select value={editingPlan.interval || "monthly"}
                  onChange={(e) => setEditingPlan({ ...editingPlan, interval: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Features (comma-separated)</label>
                <textarea value={(editingPlan.features || []).join(", ")}
                  onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split(",").map(f => f.trim()).filter(Boolean) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" rows={3} 
                  placeholder="Up to 10 products, 4% transaction fee, Basic support" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPopular"
                  checked={editingPlan.isPopular || false}
                  onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                  className="w-4 h-4" />
                <label htmlFor="isPopular" className="text-sm">Mark as Popular</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowPlanModal(false); setEditingPlan(null); }}
                className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors">
                Cancel
              </button>
              <button onClick={handleUpdatePlan}
                className="flex-1 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── Create Plan Modal ── */}
      {showCreatePlanModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreatePlanModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            className="bg-card rounded-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New Plan</h2>
              <button onClick={() => setShowCreatePlanModal(false)} className="p-2 hover:bg-accent rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plan Name</label>
                <input type="text" value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="e.g., Business" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" rows={2}
                  placeholder="Great for growing businesses" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input type="number" value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <input type="text" value={newPlan.currency}
                    onChange={(e) => setNewPlan({ ...newPlan, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="UGX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Billing Interval</label>
                <select value={newPlan.interval}
                  onChange={(e) => setNewPlan({ ...newPlan, interval: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Features (comma-separated)</label>
                <textarea value={newPlan.features.join(", ")}
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value.split(",").map(f => f.trim()).filter(Boolean) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" rows={3}
                  placeholder="Up to 10 products, 4% transaction fee, Basic support" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="newPlanPopular"
                  checked={newPlan.isPopular}
                  onChange={(e) => setNewPlan({ ...newPlan, isPopular: e.target.checked })}
                  className="w-4 h-4" />
                <label htmlFor="newPlanPopular" className="text-sm">Mark as Popular</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreatePlanModal(false)}
                className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors">
                Cancel
              </button>
              <button onClick={handleCreatePlan}
                className="flex-1 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                Create Plan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── Promotion Edit Modal ── */}
      {showPromotionModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => { setShowPromotionModal(false); setEditingPromotion(null); }}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            className="bg-card rounded-2xl w-full max-w-lg p-6 my-8"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingPromotion ? "Edit" : "Create"} Promotion</h2>
              <button onClick={() => { setShowPromotionModal(false); setEditingPromotion(null); }} className="p-2 hover:bg-accent rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                type: formData.get("type") as any,
                rewardType: formData.get("rewardType") as any,
                rewardValue: parseFloat(formData.get("rewardValue") as string),
                triggerCondition: {
                  type: formData.get("triggerType") as any,
                  threshold: parseFloat(formData.get("threshold") as string),
                  period: formData.get("period") as any || undefined,
                },
                isActive: formData.get("isActive") === "true",
                maxRedemptions: formData.get("maxRedemptions") ? parseInt(formData.get("maxRedemptions") as string) : undefined,
                startDate: new Date(formData.get("startDate") as string).getTime(),
                endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string).getTime() : undefined,
              };

              try {
                if (editingPromotion) {
                  await updatePromotion({ id: editingPromotion._id, ...data });
                } else {
                  await createPromotion(data);
                }
                setShowPromotionModal(false);
                setEditingPromotion(null);
              } catch (err: any) {
                alert(err.message || "Failed to save promotion");
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input name="name" type="text" defaultValue={editingPromotion?.name || ""}
                    required className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea name="description" defaultValue={editingPromotion?.description || ""}
                    required rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select name="type" defaultValue={editingPromotion?.type || "referral"}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="referral">Referral</option>
                      <option value="performance">Performance</option>
                      <option value="loyalty">Loyalty</option>
                      <option value="annual">Annual</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select name="isActive" defaultValue={editingPromotion?.isActive?.toString() || "true"}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Reward Type</label>
                    <select name="rewardType" defaultValue={editingPromotion?.rewardType || "free_month"}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="free_month">Free Month</option>
                      <option value="discount_percentage">Discount (%)</option>
                      <option value="discount_fixed">Discount (Fixed)</option>
                      <option value="cash_reward">Cash Reward</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reward Value</label>
                    <input name="rewardValue" type="number" step="0.01"
                      defaultValue={editingPromotion?.rewardValue || 0}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Trigger Type</label>
                    <select name="triggerType" defaultValue={editingPromotion?.triggerCondition?.type || "referral_count"}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="referral_count">Referral Count</option>
                      <option value="transaction_volume">Transaction Volume</option>
                      <option value="subscription_months">Subscription Months</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Threshold</label>
                    <input name="threshold" type="number"
                      defaultValue={editingPromotion?.triggerCondition?.threshold || 3}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input name="startDate" type="date" required
                      defaultValue={editingPromotion ? new Date(editingPromotion.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                    <input name="endDate" type="date"
                      defaultValue={editingPromotion?.endDate ? new Date(editingPromotion.endDate).toISOString().split("T")[0] : ""}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Redemptions (Optional)</label>
                  <input name="maxRedemptions" type="number"
                    defaultValue={editingPromotion?.maxRedemptions || ""}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowPromotionModal(false); setEditingPromotion(null); }}
                  className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                  {editingPromotion ? "Save Changes" : "Create Promotion"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* ── Ticket Details Modal ── */}
      {showTicketModal && selectedTicket && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => { setShowTicketModal(false); setSelectedTicket(null); }}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            className="bg-card rounded-2xl w-full max-w-2xl p-6 my-8"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Ticket {selectedTicket.ticketNumber}</h2>
                <p className="text-sm text-muted-foreground">{selectedTicket.subject}</p>
              </div>
              <button onClick={() => { setShowTicketModal(false); setSelectedTicket(null); }} className="p-2 hover:bg-accent rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-accent/50">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="font-medium">{selectedTicket.userName}</p>
                <p className="text-sm text-muted-foreground">{selectedTicket.userEmail}</p>
              </div>
                <div className="p-4 rounded-lg bg-accent/50">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <select
                  value={selectedTicket.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as "open" | "in_progress" | "resolved" | "closed";
                    try {
                      await updateTicketStatus({ id: selectedTicket._id, status: newStatus });
                      await createAuditLog({ adminId: "admin", action: "ticket_resolve", targetType: "ticket", targetId: selectedTicket._id, targetName: selectedTicket.ticketNumber, details: { action: `Updated ticket status to ${newStatus}`, subject: selectedTicket.subject } });
                      setSelectedTicket({ ...selectedTicket, status: newStatus });
                    } catch (err) {
                      console.error("Failed to update status:", err);
                    }
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Description</p>
              <div className="p-4 rounded-lg bg-accent/50 text-sm whitespace-pre-wrap">{selectedTicket.description}</div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Reply to Customer</p>
              <textarea
                id="ticketReply"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background min-h-[100px]"
                placeholder="Type your reply here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const reply = (document.getElementById("ticketReply") as HTMLTextAreaElement)?.value;
                  if (!reply?.trim()) {
                    alert("Please enter a reply");
                    return;
                  }
                  try {
                    await addTicketMessage({
                      ticketId: selectedTicket._id,
                      senderId: "admin",
                      senderName: "Admin",
                      senderType: "admin",
                      message: reply,
                      isInternal: false,
                    });
                    await createAuditLog({ adminId: "admin", action: "ticket_reply", targetType: "ticket", targetId: selectedTicket._id, targetName: selectedTicket.ticketNumber, details: { action: "Replied to ticket", subject: selectedTicket.subject, reply: reply.substring(0, 100) } });
                    (document.getElementById("ticketReply") as HTMLTextAreaElement).value = "";
                    alert("Reply sent to customer!");
                  } catch (err) {
                    console.error("Failed to send reply:", err);
                    alert("Failed to send reply");
                  }
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90"
              >
                Send Reply
              </button>
              <button
                onClick={() => { setShowTicketModal(false); setSelectedTicket(null); }}
                className="px-6 py-2.5 border border-border rounded-lg hover:bg-accent"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

// Helper Components
interface SidebarButtonProps {
  icon: React.ReactNode
  label: React.ReactNode
  active: boolean
  onClick: () => void
  collapsed: boolean
}

function SidebarButton({ icon, label, active, onClick, collapsed }: SidebarButtonProps) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
        active ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md" : "hover:bg-accent"
      } ${collapsed ? "justify-center" : ""}`}>
      {icon}
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </button>
  )
}

interface AdminStatsCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
}

function AdminStatsCard({ title, value, change, icon, color }: AdminStatsCardProps) {
  const isPositive = change > 0
  return (
    <motion.div whileHover={{ scale: 1.05, y: -5 }} className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>{icon}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </motion.div>
  )
}

export default function AdminDashboardPage() {
  return <AdminDashboard />
}

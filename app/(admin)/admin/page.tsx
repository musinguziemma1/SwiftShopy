"use client"

import React, { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { motion } from "framer-motion"
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
  AlertTriangle,
  Plus,
  Copy,
  QrCode,
} from "lucide-react"
import { useAdminData, useAdminMutations } from "@/lib/hooks/useAdminData"
import { useAdminDashboardData } from "@/lib/hooks/useAdminDashboardData"

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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedSellers, setSelectedSellers] = useState<string[]>([])
  const [showExportDropdown, setShowExportDropdown] = useState<string | null>(null)
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false)
  const [bulkAction, setBulkAction] = useState("")
  const [showRoleModal, setShowRoleModal] = useState<string | null>(null)
  const [auditFilter, setAuditFilter] = useState("all")
  const [showCreateReportModal, setShowCreateReportModal] = useState(false)
  
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
    webhookUrl: "https://api.swiftshopy.com/webhooks",
    apiKey: "sk_live_xxxxxxxxxxxxxxxxxxxx",
    apiRateLimit: 1000,
    apiSecret: "",
  })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  const saveSettings = async () => {
    setSettingsSaving(true)
    setSettingsSaved(false)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSettingsSaving(false)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
  }

  // Get real data from Convex
  const { sellers: convexSellers, stores, orders, transactions, isLoading } = useAdminData()
  const { toggleUserActive, updateOrderStatus } = useAdminMutations()

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

  const auditLogs = [
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
              <NotificationsCenter />
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
          <SidebarButton icon={<CreditCard className="w-5 h-5" />} label="Commission" active={activeTab === "commission"} onClick={() => { setActiveTab("commission"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<Shield className="w-5 h-5" />} label="Permissions" active={activeTab === "permissions"} onClick={() => { setActiveTab("permissions"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<Activity className="w-5 h-5" />} label="Analytics" active={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<MessageSquare className="w-5 h-5" />} label="Support" active={activeTab === "support"} onClick={() => { setActiveTab("support"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<FileText className="w-5 h-5" />} label="Audit Trail" active={activeTab === "audit"} onClick={() => { setActiveTab("audit"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <SidebarButton icon={<FileBarChart className="w-5 h-5" />} label="Reports" active={activeTab === "reports"} onClick={() => { setActiveTab("reports"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
          <div className="pt-4 mt-4 border-t border-border">
            <SidebarButton icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false) }} collapsed={!sidebarOpen} />
            <SidebarButton icon={<LogOut className="w-5 h-5" />} label="Logout" active={false} onClick={() => {}} collapsed={!sidebarOpen} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-20"}`}>
        <div className="p-4 sm:p-6 lg:p-8">

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
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
                    { name: "API Server", uptime: "99.99%", latency: "45ms" },
                    { name: "Database", uptime: "100%", latency: "15ms" },
                    { name: "Payment Gateway", uptime: "99.95%", latency: "320ms" },
                    { name: "WhatsApp API", uptime: "99.98%", latency: "180ms" },
                    { name: "Email Service", uptime: "99.99%", latency: "250ms" },
                    { name: "CDN", uptime: "100%", latency: "12ms" },
                  ].map((service, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-lg bg-card border border-border hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-medium truncate">{service.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>Uptime: {service.uptime}</div>
                        <div>Latency: {service.latency}</div>
                      </div>
                    </motion.div>
                  ))}
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
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-1">Top Performing Sellers</h3>
                  <p className="text-sm text-muted-foreground mb-6">Highest revenue generators</p>
                  <div className="space-y-2">
                    {sellers.map((seller, i) => (
                      <motion.div key={seller.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</div>
                        <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{seller.storeName}</div>
                          <div className="text-sm text-muted-foreground">{seller.orders} orders</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{formatCurrency(seller.revenue)}</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(seller.commission)} comm.</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Recent Transactions</h3>
                    <p className="text-sm text-muted-foreground">Latest platform transactions</p>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-accent rounded-lg transition-colors">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Transaction ID","Seller","Amount","Commission","Status","Date"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txnList.map((txn, i) => (
                        <motion.tr key={txn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="border-b border-border hover:bg-accent/50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">{txn.id}</td>
                          <td className="py-3 px-4 text-sm">{txn.seller}</td>
                          <td className="py-3 px-4 text-sm font-medium">{formatCurrency(txn.amount)}</td>
                          <td className="py-3 px-4 text-sm text-green-500 font-medium">{formatCurrency(txn.commission)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(txn.status)}`}>
                              {getStatusIcon(txn.status)}
                              {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{txn.date}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Sellers Tab ── */}
          {activeTab === "sellers" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Seller Management</h1>
                  <p className="text-muted-foreground">Manage all sellers on the platform</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowExportDropdown(showExportDropdown === "sellers" ? null : "sellers")}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export <ChevronDown className="w-3 h-3" />
                    </button>
                    {showExportDropdown === "sellers" && (
                      <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-lg z-10">
                        <button onClick={() => setShowExportDropdown(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors rounded-t-lg">Export JSON</button>
                        <button onClick={() => setShowExportDropdown(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors rounded-b-lg">Export CSV</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedSellers.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedSellers.length} seller(s) selected</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setBulkAction("approve"); setShowBulkConfirmModal(true) }} className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => { setBulkAction("suspend"); setShowBulkConfirmModal(true) }} className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1">
                        <Lock className="w-4 h-4" /> Suspend
                      </button>
                      <button onClick={() => { setBulkAction("ban"); setShowBulkConfirmModal(true) }} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1">
                        <Ban className="w-4 h-4" /> Ban
                      </button>
                      <button onClick={() => setSelectedSellers([])} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors">
                        Clear
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {showBulkConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bulkAction === "ban" ? "bg-red-500/10" : bulkAction === "suspend" ? "bg-yellow-500/10" : "bg-green-500/10"}`}>
                        <AlertTriangle className={`w-5 h-5 ${bulkAction === "ban" ? "text-red-500" : bulkAction === "suspend" ? "text-yellow-500" : "text-green-500"}`} />
                      </div>
                      <h3 className="text-lg font-semibold">Confirm Bulk {bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Are you sure you want to <strong>{bulkAction}</strong> {selectedSellers.length} selected seller(s)? This action will be logged in the audit trail.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => setShowBulkConfirmModal(false)}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
                      <button onClick={() => { setShowBulkConfirmModal(false); setSelectedSellers([]) }}
                        className={`px-4 py-2 text-white rounded-lg transition-colors ${bulkAction === "ban" ? "bg-red-500 hover:bg-red-600" : bulkAction === "suspend" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}`}>
                        Confirm {bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Seller","Store","Revenue","Orders","Commission","Status","Actions"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map((seller, i) => (
                        <motion.tr key={seller.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="border-b border-border hover:bg-accent/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-full object-cover" />
                              <div>
                                <div className="font-medium">{seller.name}</div>
                                <div className="text-sm text-muted-foreground">{seller.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{seller.storeName}</td>
                          <td className="py-3 px-4 text-sm font-medium">{formatCurrency(seller.revenue)}</td>
                          <td className="py-3 px-4 text-sm">{seller.orders}</td>
                          <td className="py-3 px-4 text-sm text-green-500 font-medium">{formatCurrency(seller.commission)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(seller.status)}`}>
                              {getStatusIcon(seller.status)}
                              {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1 hover:bg-accent rounded transition-colors"><Eye className="w-4 h-4" /></button>
                              <button className="p-1 hover:bg-accent rounded transition-colors"><Edit className="w-4 h-4" /></button>
                              <button className="p-1 hover:bg-accent rounded transition-colors">
                                {seller.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Transactions Tab ── */}
          {activeTab === "transactions" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Transactions</h1>
                  <p className="text-muted-foreground">All platform transactions and payments</p>
                </div>
                <div className="relative">
                  <button onClick={() => setShowExportDropdown(showExportDropdown === "transactions" ? null : "transactions")}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report <ChevronDown className="w-3 h-3" />
                  </button>
                  {showExportDropdown === "transactions" && (
                    <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-lg z-10">
                      <button onClick={() => setShowExportDropdown(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors rounded-t-lg">Export JSON</button>
                      <button onClick={() => setShowExportDropdown(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors rounded-b-lg">Export CSV</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {[
                  { label: "Total Processed", value: formatCurrency(425_000_000), icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
                  { label: "Pending", value: formatCurrency(15_000_000), icon: <Clock className="w-5 h-5 text-yellow-500" /> },
                  { label: "Failed", value: formatCurrency(2_500_000), icon: <XCircle className="w-5 h-5 text-red-500" /> },
                ].map((s, i) => (
                  <div key={i} className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                      {s.icon}
                    </div>
                    <div className="text-2xl font-bold">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Transaction ID","Seller","Type","Amount","Commission","Status","Date","Actions"].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txnList.map((txn, i) => (
                        <motion.tr key={txn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="border-b border-border hover:bg-accent/50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">{txn.id}</td>
                          <td className="py-3 px-4 text-sm">{txn.seller}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">{txn.type}</span>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{formatCurrency(txn.amount)}</td>
                          <td className="py-3 px-4 text-sm text-green-500 font-medium">{formatCurrency(txn.commission)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(txn.status)}`}>
                              {getStatusIcon(txn.status)} {txn.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{txn.date}</td>
                          <td className="py-3 px-4">
                            <button className="p-1 hover:bg-accent rounded transition-colors"><Eye className="w-4 h-4" /></button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Permissions & Roles</h1>
                <p className="text-muted-foreground">Manage admin access and permissions</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { role: "Super Admin", count: 2, permissions: ["All Access", "User Management", "System Config"], color: "bg-purple-500" },
                  { role: "Admin", count: 5, permissions: ["Seller Management", "Transaction View", "Reports"], color: "bg-blue-500" },
                  { role: "Support", count: 12, permissions: ["Customer Support", "Order View", "Basic Reports"], color: "bg-green-500" },
                ].map((role, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center text-white`}>
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{role.role}</h3>
                        <p className="text-sm text-muted-foreground">{role.count} users</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {role.permissions.map((perm, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{perm}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setShowRoleModal(role.role)} className="w-full px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">Manage Role</button>
                  </motion.div>
                ))}
              </div>

              {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Manage Role: {showRoleModal}</h3>
                      <button onClick={() => setShowRoleModal(null)} className="p-1 hover:bg-accent rounded transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {allPermissions.map((perm) => {
                        const rolePerms = rolePermissions[showRoleModal] || []
                        const isChecked = rolePerms.includes(perm.key)
                        return (
                          <label key={perm.key} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                            <input type="checkbox" defaultChecked={isChecked}
                              className="w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-600" />
                            <span className="text-sm font-medium">{perm.label}</span>
                          </label>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-6">
                      <button onClick={() => setShowRoleModal(null)}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
                      <button onClick={() => setShowRoleModal(null)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">Save Permissions</button>
                    </div>
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
                  { label: "Critical", count: 2, sla: "1 hour", color: "text-red-500", border: "border-red-500/20", bg: "bg-red-500/5" },
                  { label: "High", count: 5, sla: "4 hours", color: "text-orange-500", border: "border-orange-500/20", bg: "bg-orange-500/5" },
                  { label: "Medium", count: 10, sla: "24 hours", color: "text-yellow-500", border: "border-yellow-500/20", bg: "bg-yellow-500/5" },
                  { label: "Low", count: 7, sla: "48 hours", color: "text-blue-500", border: "border-blue-500/20", bg: "bg-blue-500/5" },
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
                    {["All", "Assigned to Me"].map((btn, i) => (
                      <button key={i} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors">{btn}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { id: "TKT-001", seller: "Sarah Nakato", subject: "Payment not received", priority: "critical", status: "open", time: "5 min ago" },
                    { id: "TKT-002", seller: "David Okello", subject: "How to add products?", priority: "low", status: "open", time: "15 min ago" },
                    { id: "TKT-003", seller: "Grace Nambi", subject: "WhatsApp integration issue", priority: "high", status: "in_progress", time: "1 hour ago" },
                    { id: "TKT-004", seller: "John Mwesigwa", subject: "Account verification", priority: "medium", status: "open", time: "2 hours ago" },
                  ].map((ticket, i) => (
                    <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono font-medium">{ticket.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              ticket.priority === "critical" ? "bg-red-500/10 text-red-500" :
                              ticket.priority === "high" ? "bg-orange-500/10 text-orange-500" :
                              ticket.priority === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                              "bg-blue-500/10 text-blue-500"}`}>
                              {ticket.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              ticket.status === "open" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"}`}>
                              {ticket.status.replace("_", " ")}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-1">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground">From: {ticket.seller}</p>
                          <span className="text-xs text-muted-foreground">{ticket.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-accent rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                          <button className="p-2 hover:bg-accent rounded-lg transition-colors"><MessageSquare className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs
                        .filter((log) => auditFilter === "all" || log.action === auditFilter)
                        .map((log, i) => (
                          <motion.tr key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="border-b border-border hover:bg-accent/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                  <Shield className="w-4 h-4 text-purple-500" />
                                </div>
                                <span className="text-sm font-medium">{log.admin}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                {log.action.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">{log.target}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{log.date}</td>
                          </motion.tr>
                        ))}
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
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{h}</th>
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

          {/* ── Settings Tab ── */}
          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
                  <p className="text-muted-foreground">Configure global platform settings and preferences</p>
                </div>
                {settingsSaved && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4" /> Settings saved!
                  </motion.div>
                )}
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <h3 className="text-lg font-semibold mb-6">API Configuration</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Webhook URL</label>
                            <input type="url" value={apiSettings.webhookUrl}
                              onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Rate Limit (requests/minute)</label>
                            <input type="number" value={apiSettings.apiRateLimit}
                              onChange={(e) => setApiSettings({ ...apiSettings, apiRateLimit: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-600" />
                          </div>
                          <div className="p-4 rounded-lg bg-accent/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">API Key</div>
                              <button className="text-xs text-purple-500 font-medium">Regenerate</button>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 px-3 py-2 bg-background rounded text-sm font-mono">{apiSettings.apiKey}</code>
                              <button onClick={() => navigator.clipboard.writeText(apiSettings.apiKey)}
                                className="px-3 py-2 bg-background rounded hover:bg-accent transition-colors">
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-accent/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">API Secret</div>
                              <button className="text-xs text-purple-500 font-medium">Regenerate</button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="password" value={apiSettings.apiSecret}
                                onChange={(e) => setApiSettings({ ...apiSettings, apiSecret: e.target.value })}
                                placeholder="Enter or generate API Secret"
                                className="flex-1 px-3 py-2 bg-background rounded text-sm" />
                            </div>
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
                      setApiSettings({ webhookUrl: "https://api.swiftshopy.com/webhooks", apiKey: "sk_live_xxxxxxxxxxxxxxxxxxxx", apiRateLimit: 1000, apiSecret: "" })
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
    </div>
  )
}

// Helper Components
interface SidebarButtonProps {
  icon: React.ReactNode
  label: string
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

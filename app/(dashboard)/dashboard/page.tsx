"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsCenter from "@/components/ui/notifications-center";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  ShoppingCart, Package, DollarSign, TrendingUp, Users, Search,
  Settings, LogOut, Menu, X, Plus, Edit, Trash2, Eye, Download,
  Filter, Calendar, ArrowUpRight, ArrowDownRight, MoreVertical,
  Check, Clock, XCircle, MessageSquare, BarChart3, PieChart,
  Activity, Star, AlertCircle, Copy, QrCode, ExternalLink, Share2, Zap,
  Send, Paperclip, Image as ImageIcon, Phone, Video, MoreHorizontal,
  Search as SearchIcon, RefreshCw, Link2, Smartphone, Globe,
  ChevronRight, Store, CreditCard, Upload, Save, Shield, Lock as LockIcon
} from "lucide-react";
import { useSellerData, useStoreMutations, useProductMutations, useOrderMutations } from "@/lib/hooks/useSellerData";

interface Product {
  id: string; name: string; price: number; stock: number; sales: number;
  image: string; category: string;
}
interface Order {
  id: string; customer: string; amount: number;
  status: "pending" | "paid" | "failed" | "cancelled"; date: string; items: number;
}
interface DashboardStats {
  totalRevenue: number; totalOrders: number; totalProducts: number;
  totalCustomers: number; revenueChange: number; ordersChange: number;
  productsChange: number; customersChange: number;
}

export default function SellerDashboardPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStorePreview, setShowStorePreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [whatsappSubTab, setWhatsappSubTab] = useState("conversations");
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [chatMessage, setChatMessage] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState("store");
  const [storeForm, setStoreForm] = useState({
    name: "Nakato Styles", slug: "nakato-styles", phone: "+256772100001",
    description: "Trendy African fashion, handbags & accessories for the modern Ugandan woman.",
    currency: "UGX", timezone: "Africa/Kampala"
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: 0, stock: 0, category: "", description: "" });
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const itemsPerPage = 8;

  // Mutations
  const { updateStore } = useStoreMutations();
  const { createProduct, updateProduct, deleteProduct, toggleProduct } = useProductMutations();
  const { updateOrderStatus } = useOrderMutations();

  // Get seller store data from Convex using session email
  const userEmail = (session?.user as any)?.email;
  const { store, storeId, products: convexProducts, orders: convexOrders, isLoading } = useSellerData(userEmail);

  // Calculate stats from real data
  const totalRevenue = convexOrders?.filter(o => o.status === "paid").reduce((sum, o) => sum + o.total, 0) ?? 0;
  const totalOrders = convexOrders?.length ?? 0;
  const totalProducts = convexProducts?.length ?? 0;

  // Use real data from Convex
  const stats: DashboardStats = {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers: 5_678,
    revenueChange: 12.5,
    ordersChange: 8.3,
    productsChange: -2.4,
    customersChange: 15.7,
  };

  // Map Convex products to display format
  const products: Product[] = convexProducts?.map(p => ({
    id: p._id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    sales: p.sales ?? 0,
    image: p.image ?? "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
    category: p.category ?? "General",
  })) ?? [];

  // Map Convex orders to display format
  const orders: Order[] = convexOrders?.map(o => ({
    id: o.orderNumber,
    customer: o.customerName,
    amount: o.total,
    status: o.status,
    date: new Date(o.createdAt ?? o._creationTime).toLocaleDateString(),
    items: o.items.length,
  })) ?? [];

  // Update store info in Convex
  const handleSaveStore = async () => {
    if (!store?._id) return;
    setSaving(true);
    try {
      await updateStore({
        id: store._id,
        name: storeForm.name,
        description: storeForm.description,
        phone: storeForm.phone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to update store:", e);
    }
    setSaving(false);
  };

  // Handle product operations
  const handleCreateProduct = async () => {
    if (!store?._id) return;
    try {
      await createProduct({
        storeId: store._id,
        name: newProduct.name,
        price: newProduct.price,
        stock: newProduct.stock,
        category: newProduct.category,
        description: newProduct.description,
      });
      setShowAddProduct(false);
      setNewProduct({ name: "", price: 0, stock: 0, category: "", description: "" });
    } catch (e) {
      console.error("Failed to create product:", e);
    }
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await updateProduct({
        id: id as any,
        name: data.name,
        price: data.price,
        stock: data.stock,
        category: data.category,
      });
      setEditingProduct(null);
    } catch (e) {
      console.error("Failed to update product:", e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct({ id: id as any });
    } catch (e) {
      console.error("Failed to delete product:", e);
    }
  };

  const handleToggleProduct = async (id: string, isActive: boolean) => {
    try {
      await toggleProduct({ id: id as any, isActive });
    } catch (e) {
      console.error("Failed to toggle product:", e);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: "pending" | "paid" | "failed" | "cancelled") => {
    try {
      await updateOrderStatus({ id: id as any, status });
    } catch (e) {
      console.error("Failed to update order:", e);
    }
  };

  // Load store data into form
  useEffect(() => {
    if (store) {
      setStoreForm({
        name: store.name ?? "Nakato Styles",
        slug: store.slug ?? "nakato-styles",
        phone: store.phone ?? "+256772100001",
        description: store.description ?? "",
        currency: "UGX",
        timezone: "Africa/Kampala",
      });
    }
  }, [store]);

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

  const statusColor = (s: string) => {
    if (s === "paid") return "bg-green-500/10 text-green-500 border border-green-500/20";
    if (s === "pending") return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
    return "bg-red-500/10 text-red-500 border border-red-500/20";
  };
  const statusIcon = (s: string) => {
    if (s === "paid") return <Check className="w-3 h-3" />;
    if (s === "pending") return <Clock className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "products", label: "Products", icon: <Package className="w-5 h-5" /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { id: "customers", label: "Customers", icon: <Users className="w-5 h-5" /> },
    { id: "analytics", label: "Analytics", icon: <PieChart className="w-5 h-5" /> },
    { id: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full glass border-b border-border/50 z-50">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-accent/50 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gradient">SwiftShopy</span>
              </Link>
            </div>

            <div className="flex-1 max-w-xl mx-6 relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search products, orders..." className="w-full pl-10 pr-4 py-2 glass rounded-lg border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationsCenter />
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 px-3 py-2 glass rounded-lg hover:bg-accent/50 transition-all text-sm text-red-500 hover:text-red-600">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {session?.user?.name?.slice(0, 2).toUpperCase() || "US"}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] glass border-r border-border/50 transition-all duration-300 z-40 overflow-y-auto ${sidebarOpen ? "w-64" : "w-20"}`}>
        <div className="p-4">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
              activeTab === item.id
                ? "bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-lg"
                : "hover:bg-accent/50 text-foreground"
            }`}>
              {item.icon}
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
          <div className="border-t border-border/50 mt-4 pt-4">
            <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-lg"
                : "hover:bg-accent/50 text-foreground"
            }`}>
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6">

          {/* Quick Actions Bar */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 glass rounded-xl">
            <div className="flex flex-wrap gap-3 items-center">
              {[
                { label: "Add Product", icon: <Plus className="w-4 h-4" />, primary: true },
                { label: "Share Store", icon: <Share2 className="w-4 h-4" />, onClick: () => setShowShareModal(true) },
                { label: "Preview Store", icon: <Eye className="w-4 h-4" />, onClick: () => setShowStorePreview(true) },
                { label: "Payments", icon: <DollarSign className="w-4 h-4" /> },
                { label: "Reports", icon: <Download className="w-4 h-4" /> },
              ].map((btn, i) => (
                <button key={i} onClick={btn.onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                  btn.primary
                    ? "bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-lg"
                    : "glass hover:bg-accent/50"
                }`}>
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome back, {session?.user?.name?.split(" ")[0]}! Here&apos;s what&apos;s happening with your store.</p>
              </div>

              {/* Today's Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-6 glass rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Today&apos;s Summary
                  </h3>
                  <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-UG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Sales Today", value: "UGX 450,000", icon: <DollarSign className="w-5 h-5" />, bg: "bg-green-500/20", color: "text-green-500" },
                    { label: "Orders", value: "12", badge: "3 pending", icon: <ShoppingCart className="w-5 h-5" />, bg: "bg-blue-500/20", color: "text-blue-500" },
                    { label: "New Customers", value: "5", icon: <Users className="w-5 h-5" />, bg: "bg-purple-500/20", color: "text-purple-500" },
                    { label: "Messages", value: "8", badge: "unread", icon: <MessageSquare className="w-5 h-5" />, bg: "bg-orange-500/20", color: "text-orange-500" },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl glass hover:shadow-smooth transition-all cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-3`}>
                        {item.icon}
                      </div>
                      <div className="text-2xl font-bold mb-1">{item.value}</div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                      {item.badge && <span className="inline-block mt-2 px-2 py-0.5 bg-muted rounded-full text-xs">{item.badge}</span>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { title: "Total Revenue", value: fmt(stats.totalRevenue), change: stats.revenueChange, color: "from-green-500 to-emerald-500" },
                  { title: "Total Orders", value: stats.totalOrders.toLocaleString(), change: stats.ordersChange, color: "from-blue-500 to-indigo-500" },
                  { title: "Total Products", value: stats.totalProducts.toString(), change: stats.productsChange, color: "from-purple-500 to-pink-500" },
                  { title: "Total Customers", value: stats.totalCustomers.toLocaleString(), change: stats.customersChange, color: "from-orange-500 to-amber-500" },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.02, y: -4 }} className="p-5 glass rounded-xl cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <span className={`flex items-center gap-1 text-sm font-medium ${s.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {s.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(s.change)}%
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{s.value}</div>
                    <div className="text-sm text-muted-foreground">{s.title}</div>
                  </motion.div>
                ))}
              </div>

              {/* Sales Goals */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="mb-6 p-6 glass rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Sales Goals
                  </h3>
                  <button className="text-sm text-primary hover:underline">Edit Goals</button>
                </div>
                <div className="space-y-6">
                  {[
                    { period: "Daily Goal", target: 1_000_000, current: 450_000, pct: 45 },
                    { period: "Weekly Goal", target: 5_000_000, current: 3_200_000, pct: 64 },
                    { period: "Monthly Goal", target: 20_000_000, current: 12_500_000, pct: 62.5 },
                  ].map((g, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{g.period}</span>
                        <span className="text-sm text-muted-foreground">{fmt(g.current)} / {fmt(g.target)}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${g.pct}%` }} transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full" />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{g.pct}% complete</span>
                        <span className="text-xs font-medium text-primary">{fmt(g.target - g.current)} to go</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="p-6 glass rounded-xl">
                  <h3 className="text-lg font-semibold mb-6">Revenue Overview</h3>
                  <div className="h-64 flex items-end gap-2 justify-between">
                    {[65,45,78,52,90,67,85,72,95,80,88,92].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-primary to-indigo-500 rounded-t cursor-pointer hover:opacity-80 transition-opacity" />
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                    {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                      <span key={i}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Category Chart */}
                <div className="p-6 glass rounded-xl">
                  <h3 className="text-lg font-semibold mb-6">Sales by Category</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Electronics", value: 45, color: "bg-blue-500" },
                      { name: "Fashion", value: 30, color: "bg-purple-500" },
                      { name: "Food & Beverage", value: 15, color: "bg-green-500" },
                      { name: "Beauty", value: 10, color: "bg-pink-500" },
                    ].map((c, i) => (
                      <div key={c.name}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{c.name}</span>
                          <span className="text-sm text-muted-foreground">{c.value}%</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${c.value}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`h-full ${c.color} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity + Recent Orders */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Activity */}
                <div className="p-6 glass rounded-xl">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {[
                      { action: "New order received", detail: "Order #1234", time: "2 min ago", color: "text-green-500", bg: "bg-green-500/20" },
                      { action: "Payment confirmed", detail: "UGX 250,000", time: "15 min ago", color: "text-blue-500", bg: "bg-blue-500/20" },
                      { action: "Product updated", detail: "Smart Watch Pro", time: "1 hour ago", color: "text-purple-500", bg: "bg-purple-500/20" },
                      { action: "Customer message", detail: "Sarah Nakato", time: "2 hours ago", color: "text-orange-500", bg: "bg-orange-500/20" },
                      { action: "Low stock alert", detail: "Running Shoes", time: "3 hours ago", color: "text-red-500", bg: "bg-red-500/20" },
                    ].map((a, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className={`w-10 h-10 rounded-xl ${a.bg} ${a.color} flex items-center justify-center shrink-0`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{a.action}</p>
                          <p className="text-xs text-muted-foreground">{a.detail}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">{a.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-2 p-6 glass rounded-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Recent Orders</h3>
                    <button className="text-sm text-primary hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {orders.map((order, i) => (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl glass hover:shadow-smooth transition-all cursor-pointer">
                        <div>
                          <div className="font-medium mb-1">{order.id}</div>
                          <div className="text-sm text-muted-foreground">{order.customer}</div>
                        </div>
                        <div className="text-right mr-4">
                          <div className="font-semibold">{fmt(order.amount)}</div>
                          <div className="text-xs text-muted-foreground">{order.items} items</div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                          {statusIcon(order.status)} {order.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Products</h1>
                  <p className="text-muted-foreground">Manage your product catalog</p>
                </div>
                <button onClick={() => setShowAddProduct(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg font-medium hover:scale-105 transition-all shadow-lg">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {/* Add Product Modal */}
              <AnimatePresence>
                {showAddProduct && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowAddProduct(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg glass rounded-2xl z-50 p-4 sm:p-6 overflow-y-auto sm:max-h-[90vh] max-h-[calc(100vh-2rem)]">
                      <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-bold">Add New Product</h3>
                        <button onClick={() => setShowAddProduct(false)} className="p-2 hover:bg-accent/50 rounded-lg"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Product Name</label>
                          <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="Enter product name"
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Price (UGX)</label>
                            <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) })}
                              placeholder="0" className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Stock</label>
                            <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                              placeholder="0" className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Category</label>
                          <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                            <option value="">Select category</option>
                            <option value="Fashion">Fashion</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Food">Food</option>
                            <option value="Home">Home</option>
                            <option value="Beauty">Beauty</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea rows={3} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            placeholder="Product description"
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                        </div>
                        <button onClick={handleCreateProduct}
                          className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                          Create Product
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Inventory Alerts - Dynamic based on products */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Low Stock", count: products.filter(p => p.stock > 0 && p.stock <= 5).length, desc: "Products below 5 units", color: "border-amber-500/30 bg-amber-500/10", icon: "text-amber-500" },
                  { label: "Out of Stock", count: products.filter(p => p.stock === 0).length, desc: "Products unavailable", color: "border-red-500/30 bg-red-500/10", icon: "text-red-500" },
                  { label: "Well Stocked", count: products.filter(p => p.stock > 5).length, desc: "Products in good stock", color: "border-green-500/30 bg-green-500/10", icon: "text-green-500" },
                ].map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-xl border-2 ${a.color} cursor-pointer`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className={`w-5 h-5 ${a.icon}`} />
                      <span className="font-semibold">{a.label}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{a.count}</div>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage).map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="p-4 glass rounded-xl cursor-pointer">
                    <div className="relative mb-4">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg" />
                    </div>
                    <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.category}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold">{fmt(product.price)}</span>
                      <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Sales: {product.sales}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleToggleProduct(product.id, true)}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setEditingProduct(product.id)}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Products Pagination */}
              {products.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    Showing {((productsPage - 1) * itemsPerPage) + 1}-{Math.min(productsPage * itemsPerPage, products.length)} of {products.length}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setProductsPage(p => Math.max(1, p - 1))} disabled={productsPage === 1}
                      className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                      Prev
                    </button>
                    {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, i) => (
                      <button key={i + 1} onClick={() => setProductsPage(i + 1)}
                        className={`px-3 py-1.5 text-sm rounded-lg border ${productsPage === i + 1 ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setProductsPage(p => Math.min(Math.ceil(products.length / itemsPerPage), p + 1))}
                      disabled={productsPage === Math.ceil(products.length / itemsPerPage)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1">Orders</h1>
                <p className="text-muted-foreground">Track and manage customer orders</p>
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Pending", count: orders.filter(o => o.status === "pending").length, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
                  { label: "Paid", count: orders.filter(o => o.status === "paid").length, color: "bg-green-500/10 text-green-500 border-green-500/20" },
                  { label: "Failed", count: orders.filter(o => o.status === "failed").length, color: "bg-red-500/10 text-red-500 border-red-500/20" },
                  { label: "Total", count: orders.length, color: "bg-primary/10 text-primary border-primary/20" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${s.color}`}>
                    <div className="text-2xl font-bold">{s.count}</div>
                    <div className="text-sm">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex gap-2 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-accent/50 transition-all text-sm">
                      <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-accent/50 transition-all text-sm">
                      <Calendar className="w-4 h-4" /> Date Range
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-accent/50 transition-all text-sm">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        {["Order ID","Customer","Items","Amount","Status","Date","Actions"].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage).map((order, i) => (
                        <motion.tr key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                          <td className="py-4 px-4 text-sm font-medium">{order.id}</td>
                          <td className="py-4 px-4 text-sm">{order.customer}</td>
                          <td className="py-4 px-4 text-sm">{order.items}</td>
                          <td className="py-4 px-4 text-sm font-medium">{fmt(order.amount)}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                              {statusIcon(order.status)} {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">{order.date}</td>
                          <td className="py-4 px-4">
                            <div className="flex gap-1">
                              <button className="p-2 rounded-lg hover:bg-accent transition-colors"><Eye className="w-4 h-4" /></button>
                              <button className="p-2 rounded-lg hover:bg-accent transition-colors"><MessageSquare className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {orders.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage).map((order, i) => (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-sm">{order.id}</div>
                          <div className="text-xs text-muted-foreground">{order.customer}</div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                          {statusIcon(order.status)} {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold">{fmt(order.amount)}</span>
                        <span className="text-muted-foreground">{order.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {orders.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Showing {((ordersPage - 1) * itemsPerPage) + 1}-{Math.min(ordersPage * itemsPerPage, orders.length)} of {orders.length}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setOrdersPage(p => Math.max(1, p - 1))} disabled={ordersPage === 1}
                        className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                        Prev
                      </button>
                      {Array.from({ length: Math.ceil(orders.length / itemsPerPage) }, (_, i) => (
                        <button key={i + 1} onClick={() => setOrdersPage(i + 1)}
                          className={`px-3 py-1.5 text-sm rounded-lg border ${ordersPage === i + 1 ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>
                          {i + 1}
                        </button>
                      ))}
                      <button onClick={() => setOrdersPage(p => Math.min(Math.ceil(orders.length / itemsPerPage), p + 1))}
                        disabled={ordersPage === Math.ceil(orders.length / itemsPerPage)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Customers</h1>
                  <p className="text-muted-foreground">Manage customer relationships</p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: <Users className="w-8 h-8" />, value: "5,678", label: "Total Customers", color: "text-blue-500" },
                  { icon: <Star className="w-8 h-8" />, value: "234", label: "VIP Customers", color: "text-amber-500" },
                  { icon: <TrendingUp className="w-8 h-8" />, value: "35%", label: "Retention Rate", color: "text-green-500" },
                  { icon: <DollarSign className="w-8 h-8" />, value: fmt(325_000), label: "Avg Order Value", color: "text-purple-500" },
                ].map((s, i) => (
                  <div key={i} className="p-5 glass rounded-xl">
                    <div className={`${s.color} mb-4`}>{s.icon}</div>
                    <div className="text-2xl font-bold mb-1">{s.value}</div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Sarah Nakato", email: "sarah@example.com", orders: 12, spent: 1_450_000, tier: "VIP", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
                  { name: "David Okello", email: "david@example.com", orders: 8, spent: 890_000, tier: "Regular", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
                  { name: "Grace Nambi", email: "grace@example.com", orders: 15, spent: 2_100_000, tier: "VIP", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
                  { name: "John Mwesigwa", email: "john@example.com", orders: 5, spent: 650_000, tier: "Regular", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
                ].map((c, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.02, y: -5 }} className="p-5 glass rounded-xl text-center cursor-pointer">
                    <div className="relative inline-block mb-4">
                      <img src={c.avatar} alt={c.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20" />
                      {c.tier === "VIP" && <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"><Star className="w-3 h-3 text-white" /></div>}
                    </div>
                    <h3 className="font-semibold mb-1">{c.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{c.email}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Orders:</span>
                        <span className="font-medium">{c.orders}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent:</span>
                        <span className="font-medium">{fmt(c.spent)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="py-2 glass rounded-lg text-xs font-medium hover:bg-accent/50 transition-colors flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button className="py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Message
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1">Analytics</h1>
                <p className="text-muted-foreground">Deep insights into your business performance</p>
              </div>

              {/* Financial Overview */}
              <div className="mb-6 p-6 glass rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" /> Financial Overview
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    {[
                      { label: "Gross Revenue", value: fmt(45_230_000), color: "text-foreground" },
                      { label: "Platform Fee (10%)", value: `-${fmt(4_523_000)}`, color: "text-red-500" },
                      { label: "Net Revenue", value: fmt(40_707_000), color: "text-green-500", bold: true, border: true },
                    ].map((item, i) => (
                      <div key={i} className={`flex justify-between ${item.border ? 'pt-3 border-t border-border/50' : ''}`}>
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className={`${item.bold ? 'text-lg font-bold' : 'text-sm font-bold'} ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Pending Payouts", value: fmt(2_500_000), color: "text-amber-500" },
                      { label: "Paid Out", value: fmt(38_207_000), color: "text-green-500" },
                      { label: "Available Balance", value: fmt(2_500_000), color: "text-foreground", bold: true, border: true },
                    ].map((item, i) => (
                      <div key={i} className={`flex justify-between ${item.border ? 'pt-3 border-t border-border/50' : ''}`}>
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className={`${item.bold ? 'text-lg font-bold' : 'text-sm font-bold'} ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    {[
                      { label: "Profit Margin", value: "32.5%" },
                      { label: "ROI", value: "245%" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between mb-3">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-bold text-green-500">{item.value}</span>
                      </div>
                    ))}
                    <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg font-medium hover:scale-105 transition-all shadow-lg">
                      Request Payout
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Conversion Rate", value: "24.5%", trend: "+5.2% from last month", icon: <TrendingUp className="w-5 h-5" />, color: "text-green-500" },
                  { label: "Avg Order Value", value: fmt(325_000), trend: "+12.3% from last month", icon: <DollarSign className="w-5 h-5" />, color: "text-blue-500" },
                  { label: "Return Rate", value: "2.8%", trend: "+0.5% from last month", icon: <Activity className="w-5 h-5" />, color: "text-orange-500" },
                  { label: "Customer Satisfaction", value: "4.8/5", trend: "+0.3 from last month", icon: <Star className="w-5 h-5" />, color: "text-amber-500" },
                ].map((m, i) => (
                  <div key={i} className="p-5 glass rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                      <span className={m.color}>{m.icon}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{m.value}</div>
                    <div className="text-sm text-green-500">{m.trend}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 glass rounded-xl">
                  <h3 className="text-lg font-semibold mb-6">Top Selling Products</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Premium Wireless Headphones", sales: 234, revenue: 58_500_000 },
                      { name: "Smart Watch Series 5", sales: 189, revenue: 85_050_000 },
                      { name: "Running Shoes Pro", sales: 312, revenue: 37_440_000 },
                      { name: "Designer Handbag", sales: 156, revenue: 28_080_000 },
                    ].map((p, i) => (
                      <div key={i} className="flex justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer">
                        <div>
                          <div className="font-medium mb-1">{p.name}</div>
                          <div className="text-sm text-muted-foreground">{p.sales} units sold</div>
                        </div>
                        <div className="font-semibold">{fmt(p.revenue)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 glass rounded-xl">
                  <h3 className="text-lg font-semibold mb-6">Traffic Sources</h3>
                  <div className="space-y-4">
                    {[
                      { source: "WhatsApp", pct: 45, color: "bg-green-500" },
                      { source: "Direct", pct: 25, color: "bg-blue-500" },
                      { source: "Social Media", pct: 20, color: "bg-purple-500" },
                      { source: "Search", pct: 10, color: "bg-orange-500" },
                    ].map((t, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{t.source}</span>
                          <span className="text-sm text-muted-foreground">{t.pct}%</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${t.pct}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`h-full ${t.color} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── WhatsApp Tab ── */}
          {activeTab === "whatsapp" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">WhatsApp Business</h1>
                <p className="text-muted-foreground">Manage customer conversations and your WhatsApp catalog</p>
              </div>

              {/* WhatsApp Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Messages Today", value: "142", change: "+23%", icon: <MessageSquare className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-500/10" },
                  { label: "Active Chats", value: "28", change: "+5", icon: <Users className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Response Rate", value: "94%", change: "+2%", icon: <Check className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { label: "Avg Response", value: "2m", change: "-30s", icon: <Clock className="w-5 h-5" />, color: "text-orange-500", bg: "bg-orange-500/10" },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-4 glass rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                      <span className="text-xs font-medium text-green-500">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { id: "conversations", label: "Conversations" },
                  { id: "quick-actions", label: "Quick Actions" },
                  { id: "catalog", label: "Catalog Link" },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setWhatsappSubTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      whatsappSubTab === tab.id
                        ? "bg-green-500 text-white shadow-lg"
                        : "glass hover:bg-accent/50"
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Conversations */}
              {whatsappSubTab === "conversations" && (
                <div className="grid lg:grid-cols-3 gap-6 h-[60vh]">
                  {/* Chat List */}
                  <div className="glass rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-border/50">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" placeholder="Search conversations..."
                          className="w-full pl-10 pr-4 py-2 bg-accent/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {[
                        { id: "1", name: "Sarah Nakato", msg: "Is the Ankara dress available in blue?", time: "2m", unread: 2, avatar: "SN", online: true },
                        { id: "2", name: "David Okello", msg: "Payment confirmed. When will it arrive?", time: "15m", unread: 0, avatar: "DO", online: true },
                        { id: "3", name: "Grace Nambi", msg: "Thank you! Got my order 🎉", time: "1h", unread: 0, avatar: "GN", online: false },
                        { id: "4", name: "John Mwesigwa", msg: "Can I get a discount for 3 items?", time: "2h", unread: 1, avatar: "JM", online: false },
                        { id: "5", name: "Aisha Nambi", msg: "I want to order the leather bag", time: "3h", unread: 0, avatar: "AN", online: true },
                      ].map((chat) => (
                        <button key={chat.id} onClick={() => setSelectedChat(chat.id)}
                          className={`w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors border-b border-border/30 text-left ${
                            selectedChat === chat.id ? "bg-accent/50" : ""
                          }`}>
                          <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                              {chat.avatar}
                            </div>
                            {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{chat.name}</span>
                              <span className="text-xs text-muted-foreground">{chat.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{chat.msg}</p>
                          </div>
                          {chat.unread > 0 && (
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                              {chat.unread}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Window */}
                  <div className="lg:col-span-2 glass rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-border/50 flex items-center justify-between bg-green-500/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">SN</div>
                        <div>
                          <h3 className="font-semibold text-sm">Sarah Nakato</h3>
                          <p className="text-xs text-green-500">Online</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-accent/50 rounded-lg transition-colors"><Phone className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-accent/50 rounded-lg transition-colors"><Video className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-accent/50 rounded-lg transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {[
                        { from: "customer", text: "Hi! I saw your Ankara dress on the catalog", time: "10:30 AM" },
                        { from: "customer", text: "Is the Ankara dress available in blue?", time: "10:31 AM" },
                        { from: "me", text: "Hello Sarah! Yes, we have the Ankara dress in blue. Would you like to see photos?", time: "10:32 AM" },
                        { from: "me", text: "The price is UGX 85,000 and we have sizes S, M, and L available", time: "10:32 AM" },
                        { from: "customer", text: "Yes please! Can I see the blue one? And do you deliver to Ntinda?", time: "10:33 AM" },
                      ].map((msg, i) => (
                        <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] p-3 rounded-2xl ${
                            msg.from === "me"
                              ? "bg-green-500 text-white rounded-br-sm"
                              : "glass rounded-bl-sm"
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.from === "me" ? "text-green-100" : "text-muted-foreground"}`}>{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-border/50 flex items-center gap-3">
                      <button className="p-2 hover:bg-accent/50 rounded-lg transition-colors"><Paperclip className="w-5 h-5 text-muted-foreground" /></button>
                      <button className="p-2 hover:bg-accent/50 rounded-lg transition-colors"><ImageIcon className="w-5 h-5 text-muted-foreground" /></button>
                      <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50" />
                      <button className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {whatsappSubTab === "quick-actions" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Send Catalog", desc: "Share your product catalog with a customer", icon: <Package className="w-6 h-6" />, color: "from-blue-500 to-indigo-500" },
                    { title: "Send Payment Link", desc: "Generate and send a payment link via MTN MoMo", icon: <CreditCard className="w-6 h-6" />, color: "from-yellow-500 to-orange-500" },
                    { title: "Auto Reply Setup", desc: "Configure automated welcome & away messages", icon: <MessageSquare className="w-6 h-6" />, color: "from-green-500 to-emerald-500" },
                    { title: "Broadcast Message", desc: "Send a message to multiple customers at once", icon: <Send className="w-6 h-6" />, color: "from-purple-500 to-pink-500" },
                    { title: "Order Confirmation", desc: "Send order confirmation with tracking details", icon: <Check className="w-6 h-6" />, color: "from-teal-500 to-cyan-500" },
                    { title: "Feedback Request", desc: "Ask customers to rate their purchase experience", icon: <Star className="w-6 h-6" />, color: "from-amber-500 to-yellow-500" },
                  ].map((action, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-6 glass rounded-xl text-left hover:shadow-lg transition-all group">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                      <div className="flex items-center gap-1 mt-3 text-sm font-medium text-green-500">
                        Use <ChevronRight className="w-4 h-4" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Catalog Link */}
              {whatsappSubTab === "catalog" && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="p-6 glass rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold">WhatsApp Business Catalog</h3>
                        <p className="text-sm text-muted-foreground mt-1">Link your WhatsApp Business catalog to sync products</p>
                      </div>
                      <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Connected
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-accent/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="font-medium text-sm">+256 772 100 001</div>
                            <div className="text-xs text-muted-foreground">WhatsApp Business Account</div>
                          </div>
                        </div>
                        <RefreshCw className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                      </div>
                      <div className="p-4 rounded-xl bg-accent/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="font-medium text-sm">18 Products Synced</div>
                            <div className="text-xs text-muted-foreground">Last synced 5 minutes ago</div>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
                          Sync Now
                        </button>
                      </div>
                      <button onClick={() => setShowLinkModal(true)}
                        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:border-green-500 hover:text-green-500 transition-all flex items-center justify-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Link Different Account
                      </button>
                    </div>
                  </div>

                  <div className="p-6 glass rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Catalog Products</h3>
                    <p className="text-sm text-muted-foreground mb-6">Products synced from your WhatsApp Business catalog</p>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {products.map((p, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{fmt(p.price)} · Stock: {p.stock}</div>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Settings Tab ── */}
          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Settings</h1>
                <p className="text-muted-foreground">Manage your store information and payment methods</p>
              </div>

              {/* Settings Sub-tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { id: "store", label: "Store Info", icon: <Store className="w-4 h-4" /> },
                  { id: "payment", label: "Payment Methods", icon: <CreditCard className="w-4 h-4" /> },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setSettingsSubTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      settingsSubTab === tab.id
                        ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg"
                        : "glass hover:bg-accent/50"
                    }`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Store Info */}
              {settingsSubTab === "store" && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 glass rounded-xl">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Store className="w-5 h-5 text-primary" /> Store Information
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Store Name</label>
                          <input type="text" value={storeForm.name}
                            onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Store URL Slug</label>
                          <div className="flex">
                            <span className="px-3 py-2.5 bg-accent/50 rounded-l-xl text-sm text-muted-foreground border-r border-border">swiftshopy.com/</span>
                            <input type="text" value={storeForm.slug}
                              onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
                              className="flex-1 px-4 py-2.5 bg-accent/50 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone Number</label>
                          <input type="tel" value={storeForm.phone}
                            onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email</label>
                          <input type="email" defaultValue="seller@swiftshopy.com"
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea rows={3} value={storeForm.description}
                            onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Currency</label>
                          <select value={storeForm.currency}
                            onChange={(e) => setStoreForm({ ...storeForm, currency: e.target.value })}
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                            <option value="UGX">UGX - Ugandan Shilling</option>
                            <option value="KES">KES - Kenyan Shilling</option>
                            <option value="TZS">TZS - Tanzanian Shilling</option>
                            <option value="USD">USD - US Dollar</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Timezone</label>
                          <select value={storeForm.timezone}
                            onChange={(e) => setStoreForm({ ...storeForm, timezone: e.target.value })}
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                            <option value="Africa/Kampala">Africa/Kampala (EAT)</option>
                            <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                            <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (EAT)</option>
                            <option value="UTC">UTC</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end mt-6">
                        {saved && (
                          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                            className="mr-4 flex items-center gap-2 text-green-500 text-sm">
                            <Check className="w-4 h-4" /> Saved!
                          </motion.div>
                        )}
                        <button onClick={handleSaveStore} disabled={saving}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>

                    <div className="p-6 glass rounded-xl">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-primary" /> Store Branding
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Store Logo</label>
                          {store?.logo ? (
                            <div className="relative group">
                              <img src={store.logo} alt="Store Logo" className="w-full h-40 object-contain rounded-xl border border-border" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <label className="cursor-pointer px-4 py-2 bg-white text-black rounded-lg text-sm font-medium">
                                  Change
                                  <input type="file" accept="image/*" className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file && store?._id) {
                                        const url = URL.createObjectURL(file);
                                        await updateStore({ id: store._id, logo: url });
                                      }
                                    }} />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                              <input type="file" accept="image/*" className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file && store?._id) {
                                    const url = URL.createObjectURL(file);
                                    await updateStore({ id: store._id, logo: url });
                                  }
                                }} />
                            </label>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Store Banner</label>
                          {store?.banner ? (
                            <div className="relative group">
                              <img src={store.banner} alt="Store Banner" className="w-full h-40 object-cover rounded-xl border border-border" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <label className="cursor-pointer px-4 py-2 bg-white text-black rounded-lg text-sm font-medium">
                                  Change
                                  <input type="file" accept="image/*" className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file && store?._id) {
                                        const url = URL.createObjectURL(file);
                                        await updateStore({ id: store._id, banner: url });
                                      }
                                    }} />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG 1200x400px recommended</p>
                              <input type="file" accept="image/*" className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file && store?._id) {
                                    const url = URL.createObjectURL(file);
                                    await updateStore({ id: store._id, banner: url });
                                  }
                                }} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 glass rounded-xl">
                      <h3 className="text-lg font-semibold mb-4">Store Preview</h3>
                      <div className="text-center mb-4">
                        {store?.logo ? (
                          <img src={store.logo} alt="Logo" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-border" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Store className="w-8 h-8 text-white" />
                          </div>
                        )}
                        <h4 className="font-semibold">{store?.name ?? storeForm.name}</h4>
                        <p className="text-sm text-muted-foreground">swiftshopy.com/{store?.slug ?? storeForm.slug}</p>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="font-medium">{store?.phone ?? storeForm.phone}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-muted-foreground">Email</span>
                          <span className="font-medium truncate ml-2">{userEmail ?? "seller@swiftshopy.com"}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-muted-foreground">Description</span>
                          <span className="font-medium truncate ml-2 max-w-[60%] text-right">{store?.description?.slice(0, 30) ?? "No description"}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 glass rounded-xl">
                      <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
                      <div className="space-y-3">
                        <button className="w-full py-2.5 border border-red-500/30 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500/10 transition-colors">
                          Deactivate Store
                        </button>
                        <p className="text-xs text-muted-foreground text-center">
                          Your store will be hidden from customers. You can reactivate it anytime.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              {settingsSubTab === "payment" && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 glass rounded-xl">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" /> Payment Methods
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Configure how customers pay for orders. Enable or disable payment methods for your store.
                      </p>
                      <div className="space-y-4">
                        {[
                          { name: "MTN Mobile Money", desc: "Accept payments via MTN MoMo. Most popular in Uganda.", enabled: true, icon: "🟡", status: "Connected", color: "text-yellow-500" },
                          { name: "Airtel Money", desc: "Accept payments via Airtel Money.", enabled: true, icon: "🔴", status: "Connected", color: "text-red-500" },
                          { name: "Cash on Delivery", desc: "Let customers pay when they receive their order.", enabled: true, icon: "💵", status: "Active", color: "text-green-500" },
                          { name: "Bank Transfer", desc: "Accept direct bank transfers.", enabled: false, icon: "🏦", status: "Not configured", color: "text-muted-foreground" },
                        ].map((method, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">{method.icon}</div>
                              <div>
                                <div className="font-medium">{method.name}</div>
                                <div className="text-sm text-muted-foreground">{method.desc}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-xs font-medium ${method.color}`}>{method.status}</span>
                              <div className={`w-12 h-6 ${method.enabled ? "bg-green-500" : "bg-accent"} rounded-full relative cursor-pointer transition-colors`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${method.enabled ? "right-1" : "left-1"}`} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 glass rounded-xl">
                      <h3 className="text-lg font-semibold mb-6">MTN Mobile Money Configuration</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">API Key</label>
                          <input type="password" readOnly value="sk_live_xxxxxxxxxxxxxx"
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Collection Account</label>
                          <input type="text" readOnly value="+256772100001"
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Environment</label>
                          <select className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                            <option value="sandbox">Sandbox (Testing)</option>
                            <option value="production">Production (Live)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Callback URL</label>
                          <input type="text" readOnly value="https://api.swiftshopy.com/webhooks/mtn"
                            className="w-full px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 glass rounded-xl">
                      <h3 className="text-lg font-semibold mb-6">Commission & Fees</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                          <div>
                            <div className="font-medium">Platform Commission</div>
                            <div className="text-sm text-muted-foreground">Fee charged on each sale</div>
                          </div>
                          <div className="text-lg font-bold text-primary">10%</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                          <div>
                            <div className="font-medium">MTN MoMo Transaction Fee</div>
                            <div className="text-sm text-muted-foreground">Charged by MTN per transaction</div>
                          </div>
                          <div className="text-lg font-bold text-muted-foreground">1.5%</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                          <div>
                            <div className="font-medium">Payout Frequency</div>
                            <div className="text-sm text-muted-foreground">How often you receive earnings</div>
                          </div>
                          <select className="px-3 py-1.5 bg-background rounded-lg text-sm border border-border">
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Bi-weekly</option>
                            <option>Monthly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 glass rounded-xl">
                      <h3 className="text-lg font-semibold mb-4">Payout Summary</h3>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                          <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
                          <div className="text-2xl font-bold text-green-500">UGX 2,500,000</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Pending</span>
                          <span className="font-medium">UGX 450,000</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Total Earned</span>
                          <span className="font-medium">UGX 40,707,000</span>
                        </div>
                        <button className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                          Request Payout
                        </button>
                      </div>
                    </div>

                    <div className="p-6 glass rounded-xl">
                      <h3 className="text-lg font-semibold mb-4">Security</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Two-Factor Auth</span>
                          </div>
                          <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <LockIcon className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Payment PIN</span>
                          </div>
                          <button className="text-xs text-primary font-medium">Set PIN</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Link Account Modal */}
          <AnimatePresence>
            {showLinkModal && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowLinkModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md glass rounded-2xl z-50 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-2rem)]">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold">Link WhatsApp Business</h3>
                    <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-accent/50 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="inline-flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48 bg-white rounded-2xl border-2 border-border/50 mb-4 p-4">
                      <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] rounded-lg" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Scan this QR code with your WhatsApp Business app</p>
                    <p className="text-xs text-muted-foreground">Settings → Linked Devices → Link a Device</p>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Enter Phone Number</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="tel" placeholder="+256 XXX XXX XXX"
                        className="flex-1 px-4 py-2.5 bg-accent/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50" />
                      <button className="px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
                        Link
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Share Store Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShareModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md glass rounded-2xl z-50 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-2rem)]">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold">Share Your Store</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-accent/50 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium mb-2">Store Link</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" readOnly value="https://swiftshopy.com/shop/your-store" className="flex-1 px-4 py-2 glass rounded-lg text-sm" />
                  <button onClick={() => navigator.clipboard.writeText("https://swiftshopy.com/shop/your-store")} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48 bg-muted rounded-xl border-2 border-border/50 mb-4">
                  <QrCode className="w-16 h-16 sm:w-24 sm:h-24 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Scan to visit your store</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Store Preview Modal */}
      <AnimatePresence>
        {showStorePreview && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowStorePreview(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-3xl sm:max-h-[90vh] glass rounded-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-border/50 flex justify-between items-center bg-accent/30">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Store Preview</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">How customers see your store</p>
                  </div>
                </div>
                <button onClick={() => setShowStorePreview(false)} className="p-2 hover:bg-accent/50 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-8rem)] sm:max-h-[calc(90vh-5rem)] bg-accent/20">
                {/* Store Banner */}
                {store?.banner ? (
                  <div className="w-full h-32 sm:h-48 relative">
                    <img src={store.banner} alt="Store Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                ) : (
                  <div className="w-full h-32 sm:h-48 bg-gradient-to-br from-primary to-indigo-600 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
                  </div>
                )}
                
                <div className="p-4 sm:p-8 -mt-12 sm:-mt-16 relative">
                  {/* Store Logo & Info */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6 sm:mb-8">
                    {store?.logo ? (
                      <img src={store.logo} alt="Store Logo" className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-background shadow-lg" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center border-4 border-background shadow-lg">
                        <Store className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      </div>
                    )}
                    <div className="text-center sm:text-left">
                      <h1 className="text-xl sm:text-3xl font-bold mb-1">{store?.name ?? "My Store"}</h1>
                      <p className="text-sm sm:text-base text-muted-foreground">{store?.description ?? "Premium products at affordable prices"}</p>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {products.length > 0 ? products.slice(0,6).map((p, i) => (
                      <div key={i} className="p-3 sm:p-4 glass rounded-xl">
                        <img src={p.image} alt={p.name} className="w-full h-24 sm:h-32 object-cover rounded-lg mb-3 sm:mb-4" />
                        <h4 className="font-medium mb-2 truncate text-sm sm:text-base">{p.name}</h4>
                        <div className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">{fmt(p.price)}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="py-2 bg-green-500 text-white rounded-lg text-xs font-medium">Order</button>
                          <button className="py-2 bg-primary text-white rounded-lg text-xs font-medium">Pay Now</button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No products yet. Add your first product to see it here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

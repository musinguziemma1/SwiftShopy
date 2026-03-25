"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Package, DollarSign, TrendingUp, Users, Search,
  Settings, LogOut, Menu, X, Plus, Edit, Trash2, Eye, Download,
  Filter, Calendar, ArrowUpRight, ArrowDownRight, MoreVertical,
  Check, Clock, XCircle, MessageSquare, BarChart3, PieChart,
  Activity, Star, AlertCircle, Copy, QrCode, ExternalLink, Share2, Zap
} from "lucide-react";

interface Product {
  id: string; name: string; price: number; stock: number; sales: number;
  image: string; category: string;
}
interface Order {
  id: string; customer: string; amount: number;
  status: "pending" | "paid" | "failed"; date: string; items: number;
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

  const stats: DashboardStats = {
    totalRevenue: 45_230_000, totalOrders: 1_234, totalProducts: 89, totalCustomers: 5_678,
    revenueChange: 12.5, ordersChange: 8.3, productsChange: -2.4, customersChange: 15.7,
  };

  const products: Product[] = [
    { id: "1", name: "Premium Wireless Headphones", price: 250_000, stock: 45, sales: 234, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop", category: "Electronics" },
    { id: "2", name: "Smart Watch Series 5", price: 450_000, stock: 23, sales: 189, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop", category: "Electronics" },
    { id: "3", name: "Designer Handbag", price: 180_000, stock: 67, sales: 156, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop", category: "Fashion" },
    { id: "4", name: "Running Shoes Pro", price: 120_000, stock: 89, sales: 312, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop", category: "Fashion" },
  ];

  const orders: Order[] = [
    { id: "ORD-001", customer: "Sarah Nakato", amount: 450_000, status: "paid", date: "2024-01-15", items: 2 },
    { id: "ORD-002", customer: "David Okello", amount: 250_000, status: "pending", date: "2024-01-15", items: 1 },
    { id: "ORD-003", customer: "Grace Nambi", amount: 680_000, status: "paid", date: "2024-01-14", items: 3 },
    { id: "ORD-004", customer: "John Mwesigwa", amount: 120_000, status: "failed", date: "2024-01-14", items: 1 },
  ];

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
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Top Nav */}
      <nav style={{ position: "fixed", top: 0, width: "100%", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", zIndex: 50 }}>
        <div style={{ padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "none", background: "transparent", cursor: "pointer" }}>
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                <div style={{ width: "2rem", height: "2rem", background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap className="w-4 h-4" style={{ color: "#ffffff" }} />
                </div>
                <span style={{ fontSize: "1.125rem", fontWeight: 700, background: "linear-gradient(to right, #3b82f6, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SwiftShopy</span>
              </Link>
            </div>

            <div style={{ flex: 1, maxWidth: "28rem", margin: "0 2rem", position: "relative" }}>
              <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#64748b" }} />
              <input type="text" placeholder="Search products, orders..." style={{ width: "100%", paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", background: "transparent", cursor: "pointer", fontSize: "0.875rem", color: "#ef4444" }}>
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
              <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "9999px", backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#2563eb" }}>
                {session?.user?.name?.slice(0, 2).toUpperCase() || "US"}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside style={{
        position: "fixed", top: "4rem", left: 0,
        height: "calc(100vh - 4rem)",
        width: sidebarOpen ? "16rem" : "5rem",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        transition: "width 0.3s",
        zIndex: 40,
        overflowY: "auto",
        overflowX: "hidden",
      }}>
        <div style={{ padding: "1rem" }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: "0.75rem", padding: "0.625rem 0.75rem",
              borderRadius: "0.5rem", border: "none", cursor: "pointer",
              backgroundColor: activeTab === item.id ? "#3b82f6" : "transparent",
              color: activeTab === item.id ? "#ffffff" : "#374151",
              marginBottom: "0.25rem", transition: "all 0.15s",
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}>
              {item.icon}
              {sidebarOpen && <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{item.label}</span>}
            </button>
          ))}
          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "1rem", paddingTop: "1rem" }}>
            <button onClick={() => setActiveTab("settings")} style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: "0.75rem", padding: "0.625rem 0.75rem",
              borderRadius: "0.5rem", border: "none", cursor: "pointer",
              backgroundColor: activeTab === "settings" ? "#3b82f6" : "transparent",
              color: activeTab === "settings" ? "#ffffff" : "#374151",
              transition: "all 0.15s",
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}>
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Settings</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ paddingTop: "4rem", marginLeft: sidebarOpen ? "16rem" : "5rem", transition: "margin-left 0.3s" }}>
        <div style={{ padding: "1.5rem 2rem" }}>

          {/* Quick Actions Bar */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
              {[
                { label: "Add Product", icon: <Plus className="w-4 h-4" />, primary: true },
                { label: "Share Store", icon: <Share2 className="w-4 h-4" />, onClick: () => setShowShareModal(true) },
                { label: "Preview Store", icon: <Eye className="w-4 h-4" />, onClick: () => setShowStorePreview(true) },
                { label: "Payments", icon: <DollarSign className="w-4 h-4" /> },
                { label: "Reports", icon: <Download className="w-4 h-4" /> },
              ].map((btn, i) => (
                <button key={i} onClick={btn.onClick} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0",
                  backgroundColor: btn.primary ? "#3b82f6" : "#ffffff",
                  color: btn.primary ? "#ffffff" : "#374151",
                  fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Dashboard Overview</h1>
                <p style={{ color: "#64748b" }}>Welcome back, {session?.user?.name?.split(" ")[0]}! Here&apos;s what&apos;s happening with your store.</p>
              </div>

              {/* Today's Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: "2rem", padding: "1.5rem", borderRadius: "0.75rem", border: "2px solid rgba(59,130,246,0.2)", background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(99,102,241,0.05))" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Activity className="w-5 h-5" style={{ color: "#3b82f6" }} /> Today&apos;s Summary
                  </h3>
                  <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{new Date().toLocaleDateString("en-UG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                  {[
                    { label: "Sales Today", value: "UGX 450,000", icon: <DollarSign className="w-5 h-5" />, bg: "#dcfce7", color: "#16a34a" },
                    { label: "Orders", value: "12", badge: "3 pending", icon: <ShoppingCart className="w-5 h-5" />, bg: "#dbeafe", color: "#2563eb" },
                    { label: "New Customers", value: "5", icon: <Users className="w-5 h-5" />, bg: "#f3e8ff", color: "#7c3aed" },
                    { label: "Messages", value: "8", badge: "unread", icon: <MessageSquare className="w-5 h-5" />, bg: "#ffedd5", color: "#ea580c" },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                      style={{ padding: "1rem", borderRadius: "0.5rem", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", cursor: "pointer" }}>
                      <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", backgroundColor: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                        {item.icon}
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>{item.value}</div>
                      <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{item.label}</div>
                      {item.badge && <span style={{ display: "inline-block", marginTop: "0.5rem", padding: "0.125rem 0.5rem", backgroundColor: "#f1f5f9", borderRadius: "9999px", fontSize: "0.75rem" }}>{item.badge}</span>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                  { title: "Total Revenue", value: fmt(stats.totalRevenue), change: stats.revenueChange, color: "#22c55e" },
                  { title: "Total Orders", value: stats.totalOrders.toLocaleString(), change: stats.ordersChange, color: "#3b82f6" },
                  { title: "Total Products", value: stats.totalProducts.toString(), change: stats.productsChange, color: "#a855f7" },
                  { title: "Total Customers", value: stats.totalCustomers.toLocaleString(), change: stats.customersChange, color: "#f97316" },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.03, y: -4 }} style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <div style={{ width: "3rem", height: "3rem", borderRadius: "0.5rem", backgroundColor: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <DollarSign className="w-6 h-6" style={{ color: "#ffffff" }} />
                      </div>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.875rem", fontWeight: 500, color: s.change >= 0 ? "#22c55e" : "#ef4444" }}>
                        {s.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(s.change)}%
                      </span>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>{s.value}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{s.title}</div>
                  </motion.div>
                ))}
              </div>

              {/* Sales Goals */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ marginBottom: "2rem", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <TrendingUp className="w-5 h-5" style={{ color: "#3b82f6" }} /> Sales Goals
                  </h3>
                  <button style={{ fontSize: "0.875rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>Edit Goals</button>
                </div>
                {[
                  { period: "Daily Goal", target: 1_000_000, current: 450_000, pct: 45 },
                  { period: "Weekly Goal", target: 5_000_000, current: 3_200_000, pct: 64 },
                  { period: "Monthly Goal", target: 20_000_000, current: 12_500_000, pct: 62.5 },
                ].map((g, i) => (
                  <div key={i} style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{g.period}</span>
                      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{fmt(g.current)} / {fmt(g.target)}</span>
                    </div>
                    <div style={{ height: "0.75rem", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${g.pct}%` }} transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                        style={{ height: "100%", background: "linear-gradient(to right, #3b82f6, #6366f1)", borderRadius: "9999px" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{g.pct}% complete</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#3b82f6" }}>{fmt(g.target - g.current)} to go</span>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Revenue Chart */}
                <div style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Revenue Overview</h3>
                  <div style={{ height: "16rem", display: "flex", alignItems: "flex-end", gap: "0.5rem", justifyContent: "space-between" }}>
                    {[65,45,78,52,90,67,85,72,95,80,88,92].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.5, delay: i * 0.05 }}
                        style={{ flex: 1, background: "linear-gradient(to top, #3b82f6, #6366f1)", borderRadius: "0.25rem 0.25rem 0 0", cursor: "pointer" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
                    {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                      <span key={i} style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Category Chart */}
                <div style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Sales by Category</h3>
                  {[
                    { name: "Electronics", value: 45, color: "#3b82f6" },
                    { name: "Fashion", value: 30, color: "#a855f7" },
                    { name: "Food & Beverage", value: 15, color: "#22c55e" },
                    { name: "Beauty", value: 10, color: "#ec4899" },
                  ].map((c, i) => (
                    <div key={c.name} style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{c.name}</span>
                        <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{c.value}%</span>
                      </div>
                      <div style={{ height: "0.5rem", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.value}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                          style={{ height: "100%", backgroundColor: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity + Recent Orders */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
                {/* Activity */}
                <div style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Activity className="w-5 h-5" style={{ color: "#3b82f6" }} /> Recent Activity
                  </h3>
                  {[
                    { action: "New order received", detail: "Order #1234", time: "2 min ago", color: "#22c55e" },
                    { action: "Payment confirmed", detail: "UGX 250,000", time: "15 min ago", color: "#3b82f6" },
                    { action: "Product updated", detail: "Smart Watch Pro", time: "1 hour ago", color: "#a855f7" },
                    { action: "Customer message", detail: "Sarah Nakato", time: "2 hours ago", color: "#f97316" },
                    { action: "Low stock alert", detail: "Running Shoes", time: "3 hours ago", color: "#ef4444" },
                  ].map((a, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "0.25rem", cursor: "pointer" }}>
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: a.color, flexShrink: 0 }}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{a.action}</p>
                        <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{a.detail}</p>
                        <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>{a.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Recent Orders</h3>
                    <button style={{ fontSize: "0.875rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>View All</button>
                  </div>
                  {orders.map((order, i) => (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", marginBottom: "0.75rem", cursor: "pointer" }}>
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: "0.25rem", fontSize: "0.875rem" }}>{order.id}</div>
                        <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{order.customer}</div>
                      </div>
                      <div style={{ textAlign: "right", marginRight: "1rem" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{fmt(order.amount)}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{order.items} items</div>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500 }} className={statusColor(order.status)}>
                        {statusIcon(order.status)} {order.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Products</h1>
                  <p style={{ color: "#64748b" }}>Manage your product catalog</p>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem", backgroundColor: "#3b82f6", color: "#ffffff", borderRadius: "0.5rem", border: "none", fontWeight: 500, cursor: "pointer", fontSize: "0.875rem" }}>
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {/* Inventory Alerts */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { label: "Low Stock", count: 12, desc: "Products below 5 units", color: "#f59e0b", bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.2)" },
                  { label: "Out of Stock", count: 3, desc: "Products unavailable", color: "#ef4444", bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.2)" },
                  { label: "Well Stocked", count: 74, desc: "Products in good stock", color: "#22c55e", bg: "rgba(34,197,94,0.05)", border: "rgba(34,197,94,0.2)" },
                ].map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    style={{ padding: "1rem", borderRadius: "0.5rem", border: `2px solid ${a.border}`, backgroundColor: a.bg, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <AlertCircle className="w-5 h-5" style={{ color: a.color }} />
                      <span style={{ fontWeight: 600 }}>{a.label}</span>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>{a.count}</div>
                    <p style={{ fontSize: "0.875rem", color: "#64748b" }}>{a.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
                {products.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    style={{ padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", cursor: "pointer" }}>
                    <div style={{ position: "relative", marginBottom: "1rem" }}>
                      <img src={product.image} alt={product.name} style={{ width: "100%", height: "12rem", objectFit: "cover", borderRadius: "0.5rem" }} />
                    </div>
                    <h3 style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.875rem" }}>{product.name}</h3>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1rem" }}>{product.category}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", alignItems: "center" }}>
                      <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>{fmt(product.price)}</span>
                      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Stock: {product.stock}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Sales: {product.sales}</span>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {[<Eye className="w-4 h-4" />, <Edit className="w-4 h-4" />, <Trash2 className="w-4 h-4" />].map((icon, j) => (
                          <button key={j} style={{ padding: "0.25rem", borderRadius: "0.25rem", border: "none", background: "transparent", cursor: "pointer", color: j === 2 ? "#ef4444" : "#374151" }}>{icon}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Orders</h1>
                <p style={{ color: "#64748b" }}>Track and manage customer orders</p>
              </div>
              <div style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[{ icon: <Filter className="w-4 h-4" />, label: "Filter" }, { icon: <Calendar className="w-4 h-4" />, label: "Date Range" }].map((btn, i) => (
                      <button key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "#ffffff", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>
                        {btn.icon} {btn.label}
                      </button>
                    ))}
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "#ffffff", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        {["Order ID","Customer","Items","Amount","Status","Date","Actions"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#64748b" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, i) => (
                        <motion.tr key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                          style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{order.id}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem" }}>{order.customer}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem" }}>{order.items}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{fmt(order.amount)}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500 }} className={statusColor(order.status)}>
                              {statusIcon(order.status)} {order.status}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#64748b" }}>{order.date}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button style={{ padding: "0.25rem", border: "none", background: "transparent", cursor: "pointer" }}><Eye className="w-4 h-4" /></button>
                              <button style={{ padding: "0.25rem", border: "none", background: "transparent", cursor: "pointer" }}><MessageSquare className="w-4 h-4" /></button>
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

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Customers</h1>
                  <p style={{ color: "#64748b" }}>Manage customer relationships</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { icon: <Users className="w-8 h-8" />, value: "5,678", label: "Total Customers", color: "#3b82f6" },
                  { icon: <Star className="w-8 h-8" />, value: "234", label: "VIP Customers", color: "#f59e0b" },
                  { icon: <TrendingUp className="w-8 h-8" />, value: "35%", label: "Retention Rate", color: "#22c55e" },
                  { icon: <DollarSign className="w-8 h-8" />, value: fmt(325_000), label: "Avg Order Value", color: "#a855f7" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                    <div style={{ color: s.color, marginBottom: "0.75rem" }}>{s.icon}</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>{s.value}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem" }}>
                {[
                  { name: "Sarah Nakato", email: "sarah@example.com", orders: 12, spent: 1_450_000, tier: "VIP", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
                  { name: "David Okello", email: "david@example.com", orders: 8, spent: 890_000, tier: "Regular", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
                  { name: "Grace Nambi", email: "grace@example.com", orders: 15, spent: 2_100_000, tier: "VIP", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
                  { name: "John Mwesigwa", email: "john@example.com", orders: 5, spent: 650_000, tier: "Regular", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
                ].map((c, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05, y: -5 }} style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
                      <img src={c.avatar} alt={c.name} style={{ width: "5rem", height: "5rem", borderRadius: "9999px", objectFit: "cover" }} />
                      {c.tier === "VIP" && <div style={{ position: "absolute", top: "-0.25rem", right: "-0.25rem", width: "1.5rem", height: "1.5rem", backgroundColor: "#f59e0b", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center" }}><Star className="w-3 h-3" style={{ color: "#ffffff" }} /></div>}
                    </div>
                    <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{c.name}</h3>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1rem" }}>{c.email}</p>
                    <div style={{ marginBottom: "1rem" }}>
                      {[["Orders:", c.orders], ["Spent:", fmt(c.spent)]].map(([k, v], j) => (
                        <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                          <span style={{ color: "#64748b" }}>{k}</span>
                          <span style={{ fontWeight: 500 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <button style={{ padding: "0.5rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", fontSize: "0.75rem" }}>
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button style={{ padding: "0.5rem", backgroundColor: "#22c55e", color: "#ffffff", border: "none", borderRadius: "0.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", fontSize: "0.75rem" }}>
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
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Analytics</h1>
                <p style={{ color: "#64748b" }}>Deep insights into your business performance</p>
              </div>

              {/* Financial Overview */}
              <div style={{ marginBottom: "2rem", padding: "1.5rem", borderRadius: "0.75rem", border: "2px solid rgba(59,130,246,0.2)", background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(99,102,241,0.05))" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <DollarSign className="w-5 h-5" style={{ color: "#3b82f6" }} /> Financial Overview
                  </h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[["Gross Revenue", fmt(45_230_000), "#374151"], ["Platform Fee (10%)", `-${fmt(4_523_000)}`, "#ef4444"], ["Net Revenue", fmt(40_707_000), "#22c55e"]].map(([k, v, c], i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingTop: i === 2 ? "0.75rem" : 0, borderTop: i === 2 ? "1px solid #e2e8f0" : "none" }}>
                        <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{k}</span>
                        <span style={{ fontSize: i === 2 ? "1.125rem" : "0.875rem", fontWeight: 700, color: c }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[["Pending Payouts", fmt(2_500_000), "#f59e0b"], ["Paid Out", fmt(38_207_000), "#22c55e"], ["Available Balance", fmt(2_500_000), "#374151"]].map(([k, v, c], i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingTop: i === 2 ? "0.75rem" : 0, borderTop: i === 2 ? "1px solid #e2e8f0" : "none" }}>
                        <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{k}</span>
                        <span style={{ fontSize: i === 2 ? "1.125rem" : "0.875rem", fontWeight: 700, color: c }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    {[["Profit Margin", "32.5%"], ["ROI", "245%"]].map(([k, v], i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{k}</span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#22c55e" }}>{v}</span>
                      </div>
                    ))}
                    <button style={{ width: "100%", marginTop: "0.75rem", padding: "0.625rem 1rem", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>Request Payout</button>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                  { label: "Conversion Rate", value: "24.5%", trend: "+5.2% from last month", icon: <TrendingUp className="w-5 h-5" />, color: "#22c55e" },
                  { label: "Avg Order Value", value: fmt(325_000), trend: "+12.3% from last month", icon: <DollarSign className="w-5 h-5" />, color: "#3b82f6" },
                  { label: "Return Rate", value: "2.8%", trend: "+0.5% from last month", icon: <Activity className="w-5 h-5" />, color: "#f97316" },
                  { label: "Customer Satisfaction", value: "4.8/5", trend: "+0.3 from last month", icon: <Star className="w-5 h-5" />, color: "#f59e0b" },
                ].map((m, i) => (
                  <div key={i} style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{m.label}</span>
                      <span style={{ color: m.color }}>{m.icon}</span>
                    </div>
                    <div style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.25rem" }}>{m.value}</div>
                    <div style={{ fontSize: "0.875rem", color: "#22c55e" }}>{m.trend}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Top Selling Products</h3>
                  {[
                    { name: "Premium Wireless Headphones", sales: 234, revenue: 58_500_000 },
                    { name: "Smart Watch Series 5", sales: 189, revenue: 85_050_000 },
                    { name: "Running Shoes Pro", sales: 312, revenue: 37_440_000 },
                    { name: "Designer Handbag", sales: 156, revenue: 28_080_000 },
                  ].map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "0.25rem", cursor: "pointer" }}>
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: "0.25rem", fontSize: "0.875rem" }}>{p.name}</div>
                        <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{p.sales} units sold</div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{fmt(p.revenue)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Traffic Sources</h3>
                  {[
                    { source: "WhatsApp", pct: 45, color: "#22c55e" },
                    { source: "Direct", pct: 25, color: "#3b82f6" },
                    { source: "Social Media", pct: 20, color: "#a855f7" },
                    { source: "Search", pct: 10, color: "#f97316" },
                  ].map((t, i) => (
                    <div key={i} style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{t.source}</span>
                        <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{t.pct}%</span>
                      </div>
                      <div style={{ height: "0.5rem", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${t.pct}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                          style={{ height: "100%", backgroundColor: t.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* WhatsApp / Settings placeholder */}
          {(activeTab === "whatsapp" || activeTab === "settings") && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh" }}>
              <Activity className="w-16 h-16" style={{ color: "#94a3b8", marginBottom: "1rem" }} />
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Coming Soon</h2>
              <p style={{ color: "#64748b" }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} page is under development</p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Share Store Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShareModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 50 }} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "100%", maxWidth: "32rem", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", zIndex: 51, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Share Your Store</h3>
                <button onClick={() => setShowShareModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X className="w-5 h-5" /></button>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Store Link</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="text" readOnly value="https://swiftshopy.com/shop/your-store" style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem" }} />
                  <button onClick={() => navigator.clipboard.writeText("https://swiftshopy.com/shop/your-store")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "12rem", height: "12rem", backgroundColor: "#f1f5f9", borderRadius: "0.5rem", border: "2px solid #e2e8f0", marginBottom: "0.75rem" }}>
                  <QrCode className="w-24 h-24" style={{ color: "#94a3b8" }} />
                </div>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Scan to visit your store</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Store Preview Modal */}
      <AnimatePresence>
        {showStorePreview && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowStorePreview(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 50 }} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "100%", maxWidth: "56rem", maxHeight: "90vh", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", zIndex: 51, overflow: "hidden" }}>
              <div style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Eye className="w-5 h-5" style={{ color: "#3b82f6" }} />
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: "0.875rem" }}>Store Preview</h3>
                    <p style={{ fontSize: "0.75rem", color: "#64748b" }}>How customers see your store</p>
                  </div>
                </div>
                <button onClick={() => setShowStorePreview(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X className="w-5 h-5" /></button>
              </div>
              <div style={{ padding: "2rem", overflowY: "auto", maxHeight: "calc(90vh - 5rem)", backgroundColor: "#f8fafc" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <div style={{ width: "5rem", height: "5rem", background: "linear-gradient(135deg, #3b82f6, #6366f1)", borderRadius: "9999px", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingCart className="w-8 h-8" style={{ color: "#ffffff" }} />
                  </div>
                  <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>SwiftShopy Store</h1>
                  <p style={{ color: "#64748b" }}>Premium products at affordable prices</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
                  {products.slice(0,3).map((p, i) => (
                    <div key={i} style={{ padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                      <img src={p.image} alt={p.name} style={{ width: "100%", height: "8rem", objectFit: "cover", borderRadius: "0.5rem", marginBottom: "0.75rem" }} />
                      <h4 style={{ fontWeight: 500, fontSize: "0.875rem", marginBottom: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</h4>
                      <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.75rem" }}>{fmt(p.price)}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <button style={{ padding: "0.375rem", fontSize: "0.75rem", backgroundColor: "#22c55e", color: "#ffffff", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}>Order</button>
                        <button style={{ padding: "0.375rem", fontSize: "0.75rem", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}>Pay Now</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

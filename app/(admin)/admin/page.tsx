"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Users, DollarSign, TrendingUp, Search, Settings,
  LogOut, Menu, X, Eye, Edit, Shield, Activity, Package, BarChart3,
  ArrowUpRight, ArrowDownRight, Check, XCircle, Clock, Filter,
  Download, Crown, Store, CreditCard, Lock, Unlock, Ban, CheckCircle,
  AlertCircle, Star, MessageSquare, Bell
} from "lucide-react";

interface Seller {
  id: string; name: string; email: string; storeName: string;
  status: "active" | "inactive" | "suspended"; revenue: number;
  products: number; orders: number; commission: number;
  joinDate: string; avatar: string;
}
interface Transaction {
  id: string; seller: string; amount: number; commission: number;
  type: "sale" | "subscription" | "refund";
  status: "completed" | "pending" | "failed"; date: string;
}
interface AdminStats {
  totalRevenue: number; totalSellers: number; totalOrders: number;
  totalCommission: number; revenueChange: number; sellersChange: number;
  ordersChange: number; commissionChange: number;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);

  const stats: AdminStats = {
    totalRevenue: 450_000_000, totalSellers: 1_234, totalOrders: 15_678,
    totalCommission: 45_000_000, revenueChange: 18.5, sellersChange: 12.3,
    ordersChange: 22.7, commissionChange: 15.2,
  };

  const sellers: Seller[] = [
    { id: "S001", name: "Sarah Nakato", email: "sarah@example.com", storeName: "Nakato Styles", status: "active", revenue: 15_450_000, products: 45, orders: 234, commission: 1_545_000, joinDate: "2024-01-15", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { id: "S002", name: "David Okello", email: "david@example.com", storeName: "Tech Hub UG", status: "active", revenue: 22_890_000, products: 67, orders: 456, commission: 2_289_000, joinDate: "2023-11-20", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { id: "S003", name: "Grace Nambi", email: "grace@example.com", storeName: "Grace's Kitchen", status: "active", revenue: 8_100_000, products: 23, orders: 178, commission: 810_000, joinDate: "2024-02-10", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
    { id: "S004", name: "John Mwesigwa", email: "john@example.com", storeName: "JM Electronics", status: "suspended", revenue: 3_650_000, products: 15, orders: 89, commission: 365_000, joinDate: "2023-12-05", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
  ];

  const transactions: Transaction[] = [
    { id: "TXN-001", seller: "Nakato Styles", amount: 450_000, commission: 45_000, type: "sale", status: "completed", date: "2024-01-15" },
    { id: "TXN-002", seller: "Tech Hub UG", amount: 890_000, commission: 89_000, type: "sale", status: "completed", date: "2024-01-15" },
    { id: "TXN-003", seller: "Grace's Kitchen", amount: 250_000, commission: 25_000, type: "sale", status: "pending", date: "2024-01-14" },
    { id: "TXN-004", seller: "JM Electronics", amount: 120_000, commission: 12_000, type: "sale", status: "failed", date: "2024-01-14" },
  ];

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

  const statusColor = (s: string): React.CSSProperties => {
    if (s === "active" || s === "completed") return { backgroundColor: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)" };
    if (s === "pending" || s === "inactive") return { backgroundColor: "rgba(234,179,8,0.1)", color: "#ca8a04", border: "1px solid rgba(234,179,8,0.2)" };
    return { backgroundColor: "rgba(239,68,68,0.1)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" };
  };

  const statusIcon = (s: string) => {
    if (s === "active" || s === "completed") return <CheckCircle className="w-3 h-3" />;
    if (s === "pending" || s === "inactive") return <Clock className="w-3 h-3" />;
    return <Ban className="w-3 h-3" />;
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "sellers", label: "Sellers", icon: <Users className="w-5 h-5" /> },
    { id: "transactions", label: "Transactions", icon: <DollarSign className="w-5 h-5" /> },
    { id: "commission", label: "Commission", icon: <CreditCard className="w-5 h-5" /> },
    { id: "permissions", label: "Permissions", icon: <Shield className="w-5 h-5" /> },
    { id: "analytics", label: "Analytics", icon: <Activity className="w-5 h-5" /> },
    { id: "support", label: "Support", icon: <MessageSquare className="w-5 h-5" /> },
  ];

  // Shared card style
  const card: React.CSSProperties = { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "1.5rem" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>

      {/* ── Top Nav ── */}
      <nav style={{ position: "fixed", top: 0, width: "100%", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", zIndex: 50 }}>
        <div style={{ padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4rem" }}>
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "none", background: "transparent", cursor: "pointer" }}>
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                <div style={{ width: "2rem", height: "2rem", background: "linear-gradient(135deg, #9333ea, #ec4899)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Crown className="w-4 h-4" style={{ color: "#ffffff" }} />
                </div>
                <div>
                  <span style={{ fontSize: "1rem", fontWeight: 700, background: "linear-gradient(to right, #9333ea, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Admin Panel</span>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "-2px" }}>SwiftShopy</div>
                </div>
              </Link>
            </div>

            {/* Search */}
            <div style={{ flex: 1, maxWidth: "28rem", margin: "0 2rem", position: "relative" }}>
              <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#64748b" }} />
              <input type="text" placeholder="Search sellers, transactions, stores..." style={{ width: "100%", paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
            </div>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "none", background: "transparent", cursor: "pointer" }}><Bell className="w-5 h-5" /></button>
              <button style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "none", background: "transparent", cursor: "pointer" }}><Settings className="w-5 h-5" /></button>
              <div style={{ width: "1px", height: "2rem", backgroundColor: "#e2e8f0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "2rem", height: "2rem", borderRadius: "9999px", background: "linear-gradient(135deg, #9333ea, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#ffffff", outline: "2px solid #9333ea", outlineOffset: "2px" }}>
                  AD
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>Admin</div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Super Admin</div>
                </div>
              </div>
              <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", border: "1px solid #fecaca", borderRadius: "0.5rem", background: "transparent", cursor: "pointer", fontSize: "0.8rem", color: "#ef4444" }}>
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Sidebar ── */}
      <aside style={{
        position: "fixed", top: "4rem", left: 0, height: "calc(100vh - 4rem)",
        width: sidebarOpen ? "16rem" : "5rem",
        backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0",
        transition: "width 0.3s", zIndex: 40, overflowY: "auto", overflowX: "hidden",
      }}>
        <div style={{ padding: "1rem" }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem",
              border: "none", cursor: "pointer", marginBottom: "0.25rem",
              background: activeTab === item.id ? "linear-gradient(to right, #9333ea, #ec4899)" : "transparent",
              color: activeTab === item.id ? "#ffffff" : "#374151",
              transition: "all 0.15s",
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}>
              {item.icon}
              {sidebarOpen && <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{item.label}</span>}
            </button>
          ))}
          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "1rem", paddingTop: "1rem" }}>
            {[
              { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem",
                border: "none", cursor: "pointer", marginBottom: "0.25rem",
                background: activeTab === item.id ? "linear-gradient(to right, #9333ea, #ec4899)" : "transparent",
                color: activeTab === item.id ? "#ffffff" : "#374151",
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}>
                {item.icon}
                {sidebarOpen && <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{item.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ paddingTop: "4rem", marginLeft: sidebarOpen ? "16rem" : "5rem", transition: "margin-left 0.3s" }}>
        <div style={{ padding: "2rem" }}>

          {/* ══ OVERVIEW ══ */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Admin Overview</h1>
                <p style={{ color: "#64748b" }}>Monitor and manage your entire SwiftShopy platform</p>
              </div>

              {/* Platform Health */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: "2rem", padding: "1.5rem", borderRadius: "0.75rem", border: "2px solid rgba(34,197,94,0.2)", background: "linear-gradient(135deg, rgba(34,197,94,0.05), rgba(16,185,129,0.05))" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "0.75rem", height: "0.75rem", backgroundColor: "#22c55e", borderRadius: "9999px", animation: "pulse 2s infinite" }} />
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Platform Health</h3>
                  </div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#22c55e" }}>All Systems Operational</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem" }}>
                  {[
                    { name: "API Server", uptime: "99.99%", latency: "45ms" },
                    { name: "Database", uptime: "100%", latency: "15ms" },
                    { name: "Payment", uptime: "99.95%", latency: "320ms" },
                    { name: "WhatsApp", uptime: "99.98%", latency: "180ms" },
                    { name: "Email", uptime: "99.99%", latency: "250ms" },
                    { name: "CDN", uptime: "100%", latency: "12ms" },
                  ].map((svc, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      style={{ padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <div style={{ width: "0.5rem", height: "0.5rem", backgroundColor: "#22c55e", borderRadius: "9999px" }} />
                        <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{svc.name}</span>
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                        <div>Uptime: {svc.uptime}</div>
                        <div>Latency: {svc.latency}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                  { title: "Total Revenue", value: fmt(stats.totalRevenue), change: stats.revenueChange, color: "#22c55e" },
                  { title: "Active Sellers", value: stats.totalSellers.toLocaleString(), change: stats.sellersChange, color: "#3b82f6" },
                  { title: "Total Orders", value: stats.totalOrders.toLocaleString(), change: stats.ordersChange, color: "#a855f7" },
                  { title: "Commission Earned", value: fmt(stats.totalCommission), change: stats.commissionChange, color: "#f97316" },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.03, y: -4 }}
                    style={{ ...card, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={{ width: "3rem", height: "3rem", backgroundColor: s.color, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

              {/* Live Activity Feed */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ ...card, marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "0.5rem", height: "0.5rem", backgroundColor: "#22c55e", borderRadius: "9999px" }} />
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Live Platform Activity</h3>
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem" }}>
                    <span style={{ color: "#64748b" }}>Concurrent Users: <strong style={{ color: "#0f172a" }}>1,234</strong></span>
                    <span style={{ color: "#64748b" }}>Active: <strong style={{ color: "#22c55e" }}>892</strong></span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {[
                    [
                      { event: "New seller registered", detail: "Tech Store UG - Kampala", time: "Just now", color: "#3b82f6" },
                      { event: "Order placed", detail: "Order #12345 - UGX 450,000", time: "5s ago", color: "#22c55e" },
                      { event: "Payment processed", detail: "UGX 890,000 via MTN MoMo", time: "12s ago", color: "#16a34a" },
                      { event: "Store went live", detail: "Grace's Fashion", time: "1m ago", color: "#a855f7" },
                    ],
                    [
                      { event: "Product listed", detail: "Smart Watch Pro - Electronics", time: "1m ago", color: "#a855f7" },
                      { event: "Review submitted", detail: "5 stars - Nakato Styles", time: "2m ago", color: "#eab308" },
                      { event: "Support ticket", detail: "#TKT-789 - Payment issue", time: "3m ago", color: "#f97316" },
                      { event: "Subscription renewed", detail: "Business Plan - UGX 50K", time: "5m ago", color: "#3b82f6" },
                    ],
                  ].map((col, ci) => (
                    <div key={ci}>
                      {col.map((a, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + ci * 0.2 + i * 0.05 }}
                          style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "0.25rem", cursor: "pointer" }}>
                          <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: a.color, flexShrink: 0 }}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{a.event}</p>
                            <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{a.detail}</p>
                            <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>{a.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Charts Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Revenue Bar Chart */}
                <div style={card}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>Platform Revenue</h3>
                  <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>Monthly revenue growth</p>
                  <div style={{ height: "16rem", display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
                    {[45,52,48,65,58,72,68,85,78,92,88,95].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.5, delay: i * 0.05 }}
                        style={{ flex: 1, background: "linear-gradient(to top, #9333ea, #ec4899)", borderRadius: "0.25rem 0.25rem 0 0", cursor: "pointer" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
                    {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                      <span key={i} style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Top Sellers */}
                <div style={card}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>Top Performing Sellers</h3>
                  <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>Highest revenue generators</p>
                  {sellers.map((seller, i) => (
                    <motion.div key={seller.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "0.25rem", cursor: "pointer" }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "#94a3b8", width: "1.5rem" }}>#{i+1}</div>
                      <img src={seller.avatar} alt={seller.name} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "9999px", objectFit: "cover" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{seller.storeName}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{seller.orders} orders</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{fmt(seller.revenue)}</div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{fmt(seller.commission)} comm.</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>Recent Transactions</h3>
                    <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Latest platform transactions</p>
                  </div>
                  <button style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#9333ea", background: "none", border: "none", cursor: "pointer" }}>View All</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        {["Transaction ID","Seller","Amount","Commission","Status","Date"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#64748b" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn, i) => (
                        <motion.tr key={txn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                          style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{txn.id}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem" }}>{txn.seller}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{fmt(txn.amount)}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#22c55e" }}>{fmt(txn.commission)}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, ...statusColor(txn.status) }}>
                              {statusIcon(txn.status)} {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#64748b" }}>{txn.date}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ SELLERS ══ */}
          {activeTab === "sellers" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Seller Management</h1>
                  <p style={{ color: "#64748b" }}>Manage all sellers on the platform</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[{ icon: <Filter className="w-4 h-4" />, label: "Filter" }, { icon: <Download className="w-4 h-4" />, label: "Export" }].map((btn, i) => (
                    <button key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "#ffffff", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedSellers.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "0.75rem", backgroundColor: "rgba(147,51,234,0.05)", border: "1px solid rgba(147,51,234,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{selectedSellers.length} seller(s) selected</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {[
                        { label: "Approve", color: "#22c55e", hover: "#16a34a", icon: <CheckCircle className="w-4 h-4" /> },
                        { label: "Suspend", color: "#eab308", hover: "#ca8a04", icon: <Lock className="w-4 h-4" /> },
                        { label: "Ban", color: "#ef4444", hover: "#dc2626", icon: <Ban className="w-4 h-4" /> },
                      ].map((btn, i) => (
                        <button key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", backgroundColor: btn.color, color: "#ffffff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                          {btn.icon} {btn.label}
                        </button>
                      ))}
                      <button onClick={() => setSelectedSellers([])} style={{ padding: "0.375rem 0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "#ffffff", cursor: "pointer", fontSize: "0.875rem" }}>Clear</button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div style={card}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        {["Seller","Store","Revenue","Orders","Commission","Status","Actions"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#64748b" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map((seller, i) => (
                        <motion.tr key={seller.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                          style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <img src={seller.avatar} alt={seller.name} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "9999px", objectFit: "cover" }} />
                              <div>
                                <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{seller.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{seller.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem" }}>{seller.storeName}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{fmt(seller.revenue)}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem" }}>{seller.orders}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#22c55e" }}>{fmt(seller.commission)}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, ...statusColor(seller.status) }}>
                              {statusIcon(seller.status)} {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ display: "flex", gap: "0.375rem" }}>
                              {[<Eye className="w-4 h-4" />, <Edit className="w-4 h-4" />, seller.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />].map((icon, j) => (
                                <button key={j} style={{ padding: "0.25rem", border: "none", background: "transparent", cursor: "pointer", color: "#374151" }}>{icon}</button>
                              ))}
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

          {/* ══ TRANSACTIONS ══ */}
          {activeTab === "transactions" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Transactions</h1>
                  <p style={{ color: "#64748b" }}>All platform transactions and payments</p>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "#ffffff", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>
                  <Download className="w-4 h-4" /> Export Report
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                  { label: "Total Processed", value: fmt(425_000_000), icon: <CheckCircle className="w-5 h-5" />, color: "#22c55e" },
                  { label: "Pending", value: fmt(15_000_000), icon: <Clock className="w-5 h-5" />, color: "#eab308" },
                  { label: "Failed", value: fmt(2_500_000), icon: <XCircle className="w-5 h-5" />, color: "#ef4444" },
                ].map((s, i) => (
                  <div key={i} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{s.label}</span>
                      <span style={{ color: s.color }}>{s.icon}</span>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={card}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        {["Transaction ID","Seller","Type","Amount","Commission","Status","Date","Actions"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#64748b" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn, i) => (
                        <motion.tr key={txn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                          style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{txn.id}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem" }}>{txn.seller}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span style={{ padding: "0.25rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{txn.type}</span>
                          </td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{fmt(txn.amount)}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#22c55e" }}>{fmt(txn.commission)}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, ...statusColor(txn.status) }}>
                              {statusIcon(txn.status)} {txn.status}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#64748b" }}>{txn.date}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <button style={{ padding: "0.25rem", border: "none", background: "transparent", cursor: "pointer" }}><Eye className="w-4 h-4" /></button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ COMMISSION ══ */}
          {activeTab === "commission" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Commission Management</h1>
                <p style={{ color: "#64748b" }}>Configure platform commission rates</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={card}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Commission Settings</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {[
                      { label: "Default Commission Rate (%)", type: "number", value: "10", hint: "Applied to all new sellers" },
                      { label: "Minimum Transaction Amount (UGX)", type: "text", value: "10,000", hint: "UGX minimum per transaction" },
                    ].map((f, i) => (
                      <div key={i}>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>{f.label}</label>
                        <input type={f.type} defaultValue={f.value} style={{ width: "100%", padding: "0.5rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                        <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>{f.hint}</p>
                      </div>
                    ))}
                    <div>
                      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Payment Schedule</label>
                      <select style={{ width: "100%", padding: "0.5rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none" }}>
                        <option>Weekly</option><option>Bi-weekly</option><option>Monthly</option>
                      </select>
                    </div>
                    <button style={{ width: "100%", padding: "0.75rem", background: "linear-gradient(to right, #9333ea, #ec4899)", color: "#ffffff", border: "none", borderRadius: "0.5rem", fontWeight: 500, cursor: "pointer" }}>Save Settings</button>
                  </div>
                </div>
                <div style={card}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Commission Tiers</h3>
                  {[
                    { tier: "Starter", threshold: "0 - 5M", rate: "10%", color: "#6b7280" },
                    { tier: "Growing", threshold: "5M - 20M", rate: "8%", color: "#3b82f6" },
                    { tier: "Professional", threshold: "20M - 50M", rate: "6%", color: "#9333ea" },
                    { tier: "Enterprise", threshold: "50M+", rate: "4%", color: "#f97316" },
                  ].map((tier, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", marginBottom: "0.75rem", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "9999px", backgroundColor: tier.color }} />
                          <span style={{ fontWeight: 500 }}>{tier.tier}</span>
                        </div>
                        <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#9333ea" }}>{tier.rate}</span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Revenue: UGX {tier.threshold}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ PERMISSIONS ══ */}
          {activeTab === "permissions" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Permissions & Roles</h1>
                <p style={{ color: "#64748b" }}>Manage admin access and permissions</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
                {[
                  { role: "Super Admin", count: 2, permissions: ["All Access", "User Management", "System Config"], color: "#9333ea" },
                  { role: "Admin", count: 5, permissions: ["Seller Management", "Transaction View", "Reports"], color: "#3b82f6" },
                  { role: "Support", count: 12, permissions: ["Customer Support", "Order View", "Basic Reports"], color: "#22c55e" },
                ].map((role, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    style={{ ...card, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div style={{ width: "3rem", height: "3rem", backgroundColor: role.color, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Shield className="w-6 h-6" style={{ color: "#ffffff" }} />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 600 }}>{role.role}</h3>
                        <p style={{ fontSize: "0.875rem", color: "#64748b" }}>{role.count} users</p>
                      </div>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      {role.permissions.map((perm, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                          <Check className="w-4 h-4" style={{ color: "#22c55e" }} /> {perm}
                        </div>
                      ))}
                    </div>
                    <button style={{ width: "100%", padding: "0.5rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "#ffffff", cursor: "pointer", fontSize: "0.875rem" }}>Manage Role</button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ ANALYTICS ══ */}
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Platform Analytics</h1>
                <p style={{ color: "#64748b" }}>Comprehensive insights into platform performance</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                  { label: "Platform Growth", value: "+42.5%", trend: "+18.2% from last month", icon: <TrendingUp className="w-5 h-5" />, color: "#22c55e" },
                  { label: "Active Sellers Rate", value: "87.3%", trend: "+5.1% from last month", icon: <Users className="w-5 h-5" />, color: "#3b82f6" },
                  { label: "Avg Transaction Size", value: fmt(425_000), trend: "+12.7% from last month", icon: <DollarSign className="w-5 h-5" />, color: "#a855f7" },
                  { label: "Platform Uptime", value: "99.9%", trend: "Excellent", icon: <Activity className="w-5 h-5" />, color: "#f97316" },
                ].map((m, i) => (
                  <div key={i} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{m.label}</span>
                      <span style={{ color: m.color }}>{m.icon}</span>
                    </div>
                    <div style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.25rem" }}>{m.value}</div>
                    <div style={{ fontSize: "0.875rem", color: "#22c55e" }}>{m.trend}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                <div style={card}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Regional Distribution</h3>
                  {[
                    { region: "Central Region (Kampala)", sellers: 456, revenue: 180_000_000, pct: 40 },
                    { region: "Eastern Region", sellers: 234, revenue: 90_000_000, pct: 20 },
                    { region: "Western Region", sellers: 312, revenue: 112_500_000, pct: 25 },
                    { region: "Northern Region", sellers: 178, revenue: 45_000_000, pct: 10 },
                    { region: "Other Areas", sellers: 54, revenue: 22_500_000, pct: 5 },
                  ].map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                        <div>
                          <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{r.region}</span>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.sellers} sellers • {fmt(r.revenue)}</div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{r.pct}%</span>
                      </div>
                      <div style={{ height: "0.5rem", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                          style={{ height: "100%", background: "linear-gradient(to right, #9333ea, #ec4899)" }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div style={card}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Category Performance</h3>
                  {[
                    { category: "Electronics", pct: 35, color: "#3b82f6" },
                    { category: "Fashion", pct: 28, color: "#a855f7" },
                    { category: "Food", pct: 18, color: "#22c55e" },
                    { category: "Beauty", pct: 12, color: "#ec4899" },
                    { category: "Other", pct: 7, color: "#f97316" },
                  ].map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "9999px", backgroundColor: c.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{c.category}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.pct}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem" }}>
                {[
                  { icon: <Store className="w-8 h-8" />, value: "1,234", label: "Total Stores", color: "#3b82f6" },
                  { icon: <Package className="w-8 h-8" />, value: "45,678", label: "Products Listed", color: "#a855f7" },
                  { icon: <ShoppingCart className="w-8 h-8" />, value: "15,678", label: "Total Orders", color: "#22c55e" },
                  { icon: <Users className="w-8 h-8" />, value: "89,234", label: "Total Customers", color: "#f97316" },
                ].map((s, i) => (
                  <div key={i} style={card}>
                    <div style={{ color: s.color, marginBottom: "0.75rem" }}>{s.icon}</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>{s.value}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>{s.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "#22c55e" }}>+12.3% this month</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ SUPPORT ══ */}
          {activeTab === "support" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Support Tickets</h1>
                <p style={{ color: "#64748b" }}>Manage customer and seller support requests</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                  { label: "Critical", count: 2, sla: "1 hour", color: "#ef4444", border: "rgba(239,68,68,0.2)", bg: "rgba(239,68,68,0.05)" },
                  { label: "High", count: 5, sla: "4 hours", color: "#f97316", border: "rgba(249,115,22,0.2)", bg: "rgba(249,115,22,0.05)" },
                  { label: "Medium", count: 10, sla: "24 hours", color: "#eab308", border: "rgba(234,179,8,0.2)", bg: "rgba(234,179,8,0.05)" },
                  { label: "Low", count: 7, sla: "48 hours", color: "#3b82f6", border: "rgba(59,130,246,0.2)", bg: "rgba(59,130,246,0.05)" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "1.5rem", borderRadius: "0.75rem", border: `2px solid ${s.border}`, backgroundColor: s.bg }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <AlertCircle className="w-6 h-6" style={{ color: s.color }} />
                      <span style={{ fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.25rem" }}>{s.count}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>SLA: {s.sla}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                  { label: "Avg Response Time", value: "15 min", trend: "-5 min from last week", icon: <Clock className="w-5 h-5" />, color: "#3b82f6" },
                  { label: "Resolution Rate", value: "94.5%", trend: "+2.3% from last week", icon: <CheckCircle className="w-5 h-5" />, color: "#22c55e" },
                  { label: "Satisfaction Score", value: "4.8/5", trend: "+0.2 from last week", icon: <Star className="w-5 h-5" />, color: "#eab308" },
                ].map((m, i) => (
                  <div key={i} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{m.label}</span>
                      <span style={{ color: m.color }}>{m.icon}</span>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>{m.value}</div>
                    <div style={{ fontSize: "0.875rem", color: "#22c55e" }}>{m.trend}</div>
                  </div>
                ))}
              </div>
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Active Tickets</h3>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {["All", "Assigned to Me"].map((btn, i) => (
                      <button key={i} style={{ padding: "0.375rem 0.75rem", fontSize: "0.875rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "#ffffff", cursor: "pointer" }}>{btn}</button>
                    ))}
                  </div>
                </div>
                {[
                  { id: "TKT-001", seller: "Sarah Nakato", subject: "Payment not received", priority: "critical", status: "open", time: "5 min ago" },
                  { id: "TKT-002", seller: "David Okello", subject: "How to add products?", priority: "low", status: "open", time: "15 min ago" },
                  { id: "TKT-003", seller: "Grace Nambi", subject: "WhatsApp integration issue", priority: "high", status: "in_progress", time: "1 hour ago" },
                  { id: "TKT-004", seller: "John Mwesigwa", subject: "Account verification", priority: "medium", status: "open", time: "2 hours ago" },
                ].map((ticket, i) => (
                  <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    style={{ padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", marginBottom: "0.75rem", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.875rem", fontFamily: "monospace", fontWeight: 500 }}>{ticket.id}</span>
                          <span style={{ padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, backgroundColor: ticket.priority === "critical" ? "rgba(239,68,68,0.1)" : ticket.priority === "high" ? "rgba(249,115,22,0.1)" : ticket.priority === "medium" ? "rgba(234,179,8,0.1)" : "rgba(59,130,246,0.1)", color: ticket.priority === "critical" ? "#ef4444" : ticket.priority === "high" ? "#f97316" : ticket.priority === "medium" ? "#eab308" : "#3b82f6" }}>{ticket.priority}</span>
                          <span style={{ padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, backgroundColor: ticket.status === "open" ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)", color: ticket.status === "open" ? "#22c55e" : "#3b82f6" }}>{ticket.status.replace("_", " ")}</span>
                        </div>
                        <h4 style={{ fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.875rem" }}>{ticket.subject}</h4>
                        <p style={{ fontSize: "0.875rem", color: "#64748b" }}>From: {ticket.seller}</p>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{ticket.time}</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button style={{ padding: "0.5rem", border: "none", background: "transparent", cursor: "pointer" }}><Eye className="w-4 h-4" /></button>
                        <button style={{ padding: "0.5rem", border: "none", background: "transparent", cursor: "pointer" }}><MessageSquare className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ SETTINGS ══ */}
          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Platform Settings</h1>
                <p style={{ color: "#64748b" }}>Configure global platform settings and preferences</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "1.5rem" }}>
                <div>
                  {[
                    { label: "General", icon: <Settings className="w-5 h-5" /> },
                    { label: "Payment Gateway", icon: <CreditCard className="w-5 h-5" /> },
                    { label: "Security", icon: <Shield className="w-5 h-5" /> },
                    { label: "Notifications", icon: <Bell className="w-5 h-5" /> },
                    { label: "API Config", icon: <Activity className="w-5 h-5" /> },
                    { label: "Maintenance", icon: <AlertCircle className="w-5 h-5" /> },
                  ].map((item, i) => (
                    <button key={i} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem", color: "#374151" }}>
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* General */}
                  <div style={card}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>General Settings</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {[["Platform Name","text","SwiftShopy"],["Support Email","email","support@swiftshopy.com"]].map(([label,type,val],i) => (
                        <div key={i}>
                          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>{label}</label>
                          <input type={type} defaultValue={val} style={{ width: "100%", padding: "0.5rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>Maintenance Mode</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Temporarily disable platform access</div>
                        </div>
                        <div style={{ width: "3rem", height: "1.5rem", backgroundColor: "#f1f5f9", borderRadius: "9999px", position: "relative", cursor: "pointer" }}>
                          <div style={{ position: "absolute", left: "0.25rem", top: "0.25rem", width: "1rem", height: "1rem", backgroundColor: "#ffffff", borderRadius: "9999px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Payment Gateway */}
                  <div style={card}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem" }}>Payment Gateway</h3>
                    {[
                      { name: "MTN Mobile Money", desc: "Primary payment provider", active: true, color: "#eab308" },
                      { name: "Airtel Money", desc: "Secondary payment provider", active: false, color: "#ef4444" },
                    ].map((gw, i) => (
                      <div key={i} style={{ padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ width: "3rem", height: "3rem", borderRadius: "0.5rem", backgroundColor: `${gw.color}1a`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <DollarSign className="w-6 h-6" style={{ color: gw.color }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{gw.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{gw.desc}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.875rem", color: gw.active ? "#22c55e" : "#64748b" }}>{gw.active ? "Active" : "Inactive"}</span>
                            <div style={{ width: "3rem", height: "1.5rem", backgroundColor: gw.active ? "#22c55e" : "#f1f5f9", borderRadius: "9999px", position: "relative", cursor: "pointer" }}>
                              <div style={{ position: "absolute", [gw.active ? "right" : "left"]: "0.25rem", top: "0.25rem", width: "1rem", height: "1rem", backgroundColor: "#ffffff", borderRadius: "9999px" }} />
                            </div>
                          </div>
                        </div>
                        {gw.active && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            {["API Key","API Secret"].map((lbl, j) => (
                              <div key={j}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 500, marginBottom: "0.375rem" }}>{lbl}</label>
                                <input type="password" defaultValue="••••••••••••" style={{ width: "100%", padding: "0.375rem 0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Save */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                    <button style={{ padding: "0.75rem 1.5rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "#ffffff", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>Reset to Defaults</button>
                    <button style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(to right, #9333ea, #ec4899)", color: "#ffffff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>Save All Changes</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}

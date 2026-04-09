"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle, MapPin, Phone, Mail, ShoppingBag, X, ChevronRight, Clock, CreditCard } from "lucide-react";
import Link from "next/link";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: ShoppingBag, color: "#f59e0b" },
  { key: "paid", label: "Payment Confirmed", icon: CheckCircle, color: "#22c55e" },
  { key: "processing", label: "Processing", icon: Package, color: "#8b5cf6" },
  { key: "shipped", label: "Shipped", icon: Truck, color: "#3b82f6" },
  { key: "delivered", label: "Delivered", icon: MapPin, color: "#10b981" },
];

const getStepIndex = (status: string) => {
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-300",
  paid: "bg-green-100 text-green-700 border-green-300",
  processing: "bg-purple-100 text-purple-700 border-purple-300",
  shipped: "bg-blue-100 text-blue-700 border-blue-300",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
  failed: "bg-red-100 text-red-700 border-red-300",
};

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const trackingNum = searchParams?.get("tracking");
    const orderNum = searchParams?.get("orderNumber");
    if (trackingNum) { setSearchQuery(trackingNum); searchOrder(trackingNum); }
    else if (orderNum) { setSearchQuery(orderNum); searchOrder(orderNum); }
  }, [searchParams]);

  const searchOrder = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setOrder(null);
    try {
      const response = await fetch(`/api/orders/create?orderNumber=${encodeURIComponent(query)}&tracking=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.order) { setOrder(data.order); }
      else if (data.error) { setError(data.error); }
      else { setError("Order not found. Please check your details."); }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const handleSearch = () => searchOrder(searchQuery);
  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </Link>
            <div>
              <h1 className="font-bold text-xl text-gray-900 dark:text-white">Track Order</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">SwiftShopy</p>
            </div>
          </div>
          <Link href="/shop" className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Card */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Find Your Order</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter order number or tracking number"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2"
            >
              <X className="w-5 h-5" /> {error}
            </motion.div>
          )}
        </motion.div>

        {/* Order Details */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Order Status Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Order Number</p>
                      <p className="text-2xl font-bold">{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-200 text-sm">Tracking</p>
                      <p className="font-mono text-lg">{order.trackingNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStep;
                      const isCurrent = index === currentStep;
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-col items-center flex-1 relative">
                          {index < statusSteps.length - 1 && (
                            <div className={`absolute top-6 left-1/2 w-full h-1 ${isCompleted ? "bg-purple-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                          )}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 relative z-10 ${isCompleted ? "bg-purple-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className={`text-xs text-center ${isCurrent ? "font-semibold text-purple-600 dark:text-purple-400" : "text-gray-500"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[order.status] || statusColors.pending}`}>
                      {order.status?.toUpperCase() || "PENDING"}
                    </span>
                    <button onClick={() => setShowDetails(!showDetails)} className="text-purple-600 font-medium text-sm flex items-center gap-1 hover:underline">
                      {showDetails ? "Hide Details" : "View Details"} <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 dark:border-gray-700"
                    >
                      <div className="p-6">
                        <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Order Items ({order.items?.length || 0})</h3>
                        <div className="space-y-3 mb-6">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                  <Package className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-white">{item.productName}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-semibold text-purple-600 dark:text-purple-400">{fmt(item.total)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Totals */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                          <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-300">
                            <span>Subtotal</span>
                            <span>{fmt(order.subtotal || order.total)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="font-semibold text-gray-800 dark:text-white">Total Paid</span>
                            <span className="font-bold text-xl text-purple-600">{fmt(order.total)}</span>
                          </div>
                        </div>

                        {/* Customer & Payment Info */}
                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                            <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-300 flex items-center gap-2"><Phone className="w-4 h-4" /> Customer</h4>
                            <p className="font-medium text-gray-800 dark:text-white">{order.customerName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerPhone}</p>
                            {order.customerEmail && <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerEmail}</p>}
                            {order.shippingAddress && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">📍 {order.shippingAddress}</p>}
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
                            <h4 className="font-semibold mb-3 text-green-800 dark:text-green-300 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</h4>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Status</span>
                              <span className={`font-medium ${order.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"}`}>{order.paymentStatus?.toUpperCase() || "PENDING"}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Method</span>
                              <span className="text-gray-800 dark:text-white capitalize">{order.paymentMethod?.replace("_", " ") || "MTN MoMo"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Date</span>
                              <span className="text-gray-800 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Link href={`/shop`} className="flex-1 py-3 bg-white dark:bg-gray-800 rounded-xl font-medium text-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors">
                  Continue Shopping
                </Link>
                <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                  Get Help
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!order && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Track Your Order</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Enter your order number or tracking number above to see the status of your order.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
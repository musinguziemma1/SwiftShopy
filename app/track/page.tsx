"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, Mail, ShoppingBag } from "lucide-react";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: ShoppingBag },
  { key: "paid", label: "Payment Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const getStepIndex = (status: string) => {
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
};

export default function TrackOrderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError("");
    setOrder(null);
    setTracking(null);

    try {
      const response = await fetch(`/api/orders/create?orderNumber=${encodeURIComponent(searchQuery)}&tracking=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.order) {
        setOrder(data.order);
        setTracking(data.tracking);
      } else {
        setError("Order not found. Please check your order number or tracking number and try again.");
      }
    } catch (err) {
      setError("Failed to search order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order number or tracking number</p>
        </div>
      </header>

      {/* Search Section */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter order number (e.g., ORD-XXXXX) or tracking number"
            className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </section>

      {/* Order Details */}
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 pb-12"
        >
          {/* Order Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Order {order.orderNumber}</h2>
                <p className="text-muted-foreground">Tracking: {order.trackingNumber}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                order.status === "delivered" || order.status === "completed" ? "bg-green-100 text-green-700" :
                order.status === "cancelled" || order.status === "failed" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Progress Timeline */}
            <div className="mb-8">
              <h3 className="font-medium mb-4">Order Status</h3>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isCompleted ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-xs text-center ${isCurrent ? "font-medium text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {tracking?.trackingHistory && tracking.trackingHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-4">Tracking History</h4>
                  <div className="space-y-4">
                    {tracking.trackingHistory.slice().reverse().map((event: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          {idx < tracking.trackingHistory.length - 1 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1"></div>}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{event.status.replace("_", " ").charAt(0).toUpperCase() + event.status.replace("_", " ").slice(1)}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          {event.location && <p className="text-xs text-muted-foreground mt-1">📍 {event.location}</p>}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.timestamp).toLocaleDateString()} at {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
            <h3 className="font-semibold mb-4">Order Items ({order.items?.length || 0})</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">{fmt(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-xl">{fmt(order.total)}</span>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Customer Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customerPhone}</span>
                </div>
                {order.customerEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
                {order.shippingAddress && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{order.shippingAddress}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="capitalize">{order.paymentMethod?.replace("_", " ") || "MTN MoMo"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, MessageCircle, Phone, Star, Package, Search, Minus, Plus, X, Check, Loader, CreditCard } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VerifiedBadge } from "@/components/ui/verified-badge";

interface CartItem { id: string; name: string; price: number; quantity: number; image: string; storeId: string; sellerId: string; }

const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

export default function StorefrontPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ orderNumber: string; trackingNumber: string; total: number; paymentMethod?: string; sellerOrderIds?: string[] } | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const store = useQuery(api.stores.getBySlug, { slug });
  const products = useQuery(api.products.getByStore, store?._id ? { storeId: store._id as any, activeOnly: true } : "skip");

  // Fetch seller user to check KYC verification status
  const sellerUser = useQuery(api.users.getById, store?.userId ? { id: store.userId as any } : "skip");
  const isSellerVerified = sellerUser?.kycStatus === "verified";

  const productList = products ?? [];
  const categories = ["All", ...Array.from(new Set(productList.map((p: any) => p.category ?? "General")))];
  const filtered = productList.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || (p.category ?? "General") === category;
    return matchSearch && matchCat;
  });

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product._id);
      if (existing) return prev.map((i) => i.id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product._id, name: product.name, price: product.price, quantity: 1, image: product.image ?? "", storeId: store?._id || "", sellerId: store?.userId || "" }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter((i) => i.quantity > 0));
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = async () => {
    if (!customerName || !customerPhone) {
      alert("Please enter your name and phone number.");
      return;
    }

    setIsProcessing(true);

    try {
      const items = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        storeId: item.storeId,
        sellerId: item.sellerId,
        storeName: store?.name,
      }));

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerName,
          customerPhone,
          customerEmail: customerEmail || undefined,
          shippingAddress: shippingAddress || undefined,
          paymentMethod: "mtn_momo",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderDetails({
          orderNumber: data.orderNumber,
          trackingNumber: data.trackingNumber,
          total: data.total,
          paymentMethod: data.paymentMethod,
          sellerOrderIds: data.sellerOrderIds,
        });
        setOrderPlaced(true);
        setCheckoutOpen(false);
        setCart([]);

        if (data.sellerOrderIds && data.sellerOrderIds.length > 0) {
          setTimeout(async () => {
            try {
              await fetch("/api/orders/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderNumber: data.orderNumber,
                  sendEmail: true,
                  sendWhatsApp: true,
                }),
              });
            } catch (e) {
              console.log("Confirmation send failed:", e);
            }
          }, 2000);
        }
      } else {
        alert(data.error || "Order failed. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const initiatePayment = async (orderNumber: string, amount: number) => {
    try {
      const response = await fetch("/api/orders/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          trackingNumber: orderDetails?.trackingNumber,
          amount,
          phone: customerPhone,
          paymentMethod: "mtn_momo",
        }),
      });

      const data = await response.json();
      if (data.referenceId) {
        alert("Payment request sent! Please approve on your MTN MoMo.");
      } else {
        alert(data.error || "Payment failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    }
  };

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Store Closed</h1>
          <p className="text-muted-foreground">This store is temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {store.name[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg">{store.name}</h1>
                {isSellerVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-xs text-muted-foreground">{store.description}</p>
            </div>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Banner */}
      {store.banner && (
        <div className="w-full h-48 md:h-64 relative overflow-hidden">
          <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Search & Categories */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat ? "bg-primary text-white" : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product: any) => (
            <motion.div key={product._id} whileHover={{ y: -4 }} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
              <img src={product.image ?? "https://via.placeholder.com/200"} alt={product.name} className="w-full h-40 object-cover" />
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
                <p className="text-primary font-bold mb-3">{fmt(product.price)}</p>
                <button onClick={() => addToCart(product)}
                  className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 z-50 flex flex-col shadow-xl">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold">Cart ({cartCount})</h2>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Your cart is empty</p>
                  </div>
                ) : cart.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-primary font-bold text-sm">{fmt(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{fmt(total)}</span>
                  </div>
                  <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                    className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors">
                    Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCheckoutOpen(false)}
              className="absolute inset-0 bg-black/50 pointer-events-auto" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl pointer-events-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Checkout</h2>
                <button onClick={() => setCheckoutOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your full name"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone (MTN) *</label>
                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="07XXXXXXXX"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="your@email.com"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping Address (Optional)</label>
                  <input type="text" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Delivery address"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-medium mb-3">Order Summary ({cart.length} items)</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                      <span className="font-medium">{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between mb-6 py-3 border-t border-b">
                <span className="font-medium">Total</span>
                <span className="font-bold text-xl">{fmt(total)}</span>
              </div>
              <button onClick={handleCheckout} disabled={isProcessing || !customerName || !customerPhone}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isProcessing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  "Place Order & Pay"
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                You will receive an MTN MoMo prompt to complete payment
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Success */}
      <AnimatePresence>
        {orderPlaced && orderDetails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold">Order Confirmed!</h2>
                <p className="text-green-100 text-sm mt-1">Thank you for your purchase</p>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-purple-100 dark:border-purple-800">
                    <div>
                      <p className="text-xs text-gray-500">Order Number</p>
                      <p className="font-mono font-semibold text-purple-600">{orderDetails.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Tracking</p>
                      <p className="font-mono text-sm text-gray-700">{orderDetails.trackingNumber}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-2xl font-bold text-purple-600">{fmt(orderDetails.total)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={() => initiatePayment(orderDetails.orderNumber, orderDetails.total)}
                    className="py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" /> Pay Now
                  </button>
                  <button onClick={() => window.location.href = `/track?tracking=${orderDetails.trackingNumber}`}
                    className="py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Package className="w-4 h-4" /> Track
                  </button>
                </div>
                <p className="text-center text-sm text-gray-500 mb-4">📧 Confirmation sent to your email & WhatsApp</p>
                <button onClick={() => { setOrderPlaced(false); setOrderDetails(null); setCustomerName(""); setCustomerPhone(""); setCustomerEmail(""); setShippingAddress(""); }}
                  className="w-full py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Float */}
      <a href={`https://wa.me/${store.phone?.replace(/\D/g, "") ?? ""}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30">
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </div>
  );
}

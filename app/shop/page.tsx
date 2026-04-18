"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeroMotionBackground } from "@/components/ui/hero-motion-background";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { TimelineContent } from "@/components/ui/timeline-animation";
import {
  ShoppingCart, Search, Filter, Grid, List, Star, Heart,
  ChevronDown, SlidersHorizontal, X, Package, Store,
  TrendingUp, Sparkles, ArrowRight, Eye, ShoppingBag,
  Zap, Clock, Award, Check, MapPin, Phone, ExternalLink, CreditCard
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  storeName: string;
  storeId: string;
  sellerId: string;
}

export default function ShopPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ orderNumber: string; trackingNumber: string; total: number; paymentMethod?: string; sellerOrderIds?: string[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch products from Convex (real-time updates)
  const products = useQuery(api.products.getAllActive, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery || undefined,
    sortBy,
    limit: 50,
  });

  const categories = useQuery(api.products.getCategories);

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add to cart
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product._id);
      if (existing) {
        return prev.map(item =>
          item.id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        quantity: 1,
        storeName: product.store?.name || "Unknown Store",
        storeId: product.storeId || "",
        sellerId: product.store?.userId || "",
      }];
    });
  };

  // Remove from cart
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Toggle wishlist
  const toggleWishlist = (id: string) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  // Update quantity
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

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
        storeName: item.storeName,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full glass border-b border-border/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">SwiftShopy</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products, stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 glass rounded-xl border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2.5 glass rounded-xl hover:bg-accent/50 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Motion Background */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        <HeroMotionBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Shop with Confidence</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.1}
                staggerFrom="first"
                containerClassName="justify-center"
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                Discover Amazing Products
              </VerticalCutReveal>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Shop from thousands of products from trusted sellers across Uganda.
              Fast delivery, secure payments, and quality guaranteed.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: <Package className="w-6 h-6" />, value: products?.length ?? 0, label: "Products" },
              { icon: <Store className="w-6 h-6" />, value: "50+", label: "Sellers" },
              { icon: <TrendingUp className="w-6 h-6" />, value: "10K+", label: "Orders" },
              { icon: <Award className="w-6 h-6" />, value: "4.9", label: "Rating" },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-4 glass rounded-xl text-center hover:shadow-elevated transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-white shadow-lg"
                  : "glass hover:bg-accent/50"
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1" />
              All Products
            </button>
            {categories?.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-lg"
                    : "glass hover:bg-accent/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & View */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 glass rounded-xl text-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <div className="flex glass rounded-xl overflow-hidden border border-border/50">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-all ${viewMode === "grid" ? "bg-primary text-white" : "hover:bg-accent/50"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-all ${viewMode === "list" ? "bg-primary text-white" : "hover:bg-accent/50"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products === undefined ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-6 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Check back later for new arrivals!"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className={`flex flex-wrap justify-center gap-4 md:gap-6`}
          >
            <AnimatePresence mode="popLayout">
              {products.map((product: any, index: number) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`glass rounded-2xl overflow-hidden group cursor-pointer ${
                    viewMode === "list" ? "flex w-full" : "w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-xs"
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 h-48" : "h-48 md:h-56"}`}>
                    <img
                      src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    
                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                        className={`p-2 rounded-full shadow-lg transition-all ${
                          wishlist.includes(product._id)
                            ? "bg-red-500 text-white"
                            : "bg-white/90 hover:bg-red-500 hover:text-white"
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={wishlist.includes(product._id) ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                        className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {product.sales && product.sales > 100 && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Hot
                        </span>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                          Only {product.stock} left
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-lg hover:bg-primary/90 flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1">
                    {/* Store Badge */}
                    {product.store && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center">
                          <Store className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          {product.store.name}
                        </span>
                      </div>
                    )}

                    <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    {product.category && (
                      <span className="inline-block px-2 py-0.5 bg-accent/50 text-muted-foreground text-xs rounded-full mb-2">
                        {product.category}
                      </span>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg md:text-xl font-bold text-primary">
                          {fmt(product.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>

                    {viewMode === "list" && product.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md glass border-l border-border/50 z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Cart ({cartCount})
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 p-3 glass rounded-xl"
                      >
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop"}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.storeName}</p>
                          <p className="font-bold text-primary mt-1">{fmt(item.price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-full glass flex items-center justify-center text-sm hover:bg-accent"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-full glass flex items-center justify-center text-sm hover:bg-accent"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto p-1 text-red-500 hover:bg-red-500/10 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-border/50">
                  <div className="flex justify-between mb-4">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold text-xl">{fmt(cartTotal)}</span>
                  </div>
                  <button onClick={() => setCheckoutOpen(true)} className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Secure payment powered by MTN MoMo
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full md:max-w-2xl glass rounded-2xl overflow-hidden pointer-events-auto"
            >
              <div className="md:flex">
                <div className="md:w-1/2 h-64 md:h-auto">
                  <img
                    src={quickViewProduct.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-6">
                  <button
                    onClick={() => setQuickViewProduct(null)}
                    className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-accent"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {quickViewProduct.store && (
                    <div className="flex items-center gap-2 mb-3">
                      <Store className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{quickViewProduct.store.name}</span>
                    </div>
                  )}

                  <h2 className="text-2xl font-bold mb-2">{quickViewProduct.name}</h2>
                  
                  {quickViewProduct.category && (
                    <span className="inline-block px-3 py-1 bg-accent/50 text-muted-foreground text-sm rounded-full mb-3">
                      {quickViewProduct.category}
                    </span>
                  )}

                  <p className="text-muted-foreground mb-4">
                    {quickViewProduct.description || "No description available."}
                  </p>

                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-3xl font-bold text-primary">{fmt(quickViewProduct.price)}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-medium">4.8</span>
                      <span className="text-muted-foreground text-sm">(128 reviews)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-500">In Stock ({quickViewProduct.stock} available)</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        addToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(quickViewProduct._id)}
                      className={`p-3 rounded-xl border transition-all ${
                        wishlist.includes(quickViewProduct._id)
                          ? "bg-red-500/10 border-red-500 text-red-500"
                          : "glass border-border hover:border-red-500 hover:text-red-500"
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={wishlist.includes(quickViewProduct._id) ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {quickViewProduct.store?.phone && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <a
                        href={`https://wa.me/${quickViewProduct.store.phone.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
                      >
                        <Phone className="w-4 h-4" />
                        Contact Seller on WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SwiftShopy</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Uganda's fastest growing e-commerce marketplace. Shop with confidence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-primary transition-colors">Start Selling</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Seller Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Payment Methods</h4>
              <div className="flex gap-2">
                <div className="px-3 py-2 glass rounded-lg text-sm font-medium">MTN MoMo</div>
                <div className="px-3 py-2 glass rounded-lg text-sm font-medium">Airtel Money</div>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            &copy; 2026 SwiftShopy. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutOpen(false)}
              className="absolute inset-0 bg-black/50 pointer-events-auto"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl pointer-events-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Checkout</h2>
                <button onClick={() => setCheckoutOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number (MTN) *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping Address (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Delivery address"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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
                <span className="font-bold text-xl">{fmt(cartTotal)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || !customerName || !customerPhone}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order & Pay
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                You will receive an MTN MoMo prompt to complete payment
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Success Modal */}
      <AnimatePresence>
        {orderPlaced && orderDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl"
            >
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold">Order Confirmed!</h2>
                <p className="text-green-100 text-sm mt-1">Thank you for your purchase</p>
              </div>

              {/* Order Details */}
              <div className="p-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-purple-100 dark:border-purple-800">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
                      <p className="font-mono font-semibold text-purple-600 dark:text-purple-400">{orderDetails.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tracking</p>
                      <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{orderDetails.trackingNumber}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{fmt(orderDetails.total)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => initiatePayment(orderDetails.orderNumber, orderDetails.total)}
                    className="py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Now
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `/track?tracking=${orderDetails.trackingNumber}`;
                    }}
                    className="py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Track
                  </button>
                </div>

                {/* Info Text */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <p>📧 Confirmation sent to your email & WhatsApp</p>
                  <p className="mt-1">💳 Complete payment to process your order</p>
                </div>

                <button
                  onClick={() => {
                    setOrderPlaced(false);
                    setOrderDetails(null);
                    setCustomerName("");
                    setCustomerPhone("");
                    setCustomerEmail("");
                    setShippingAddress("");
                  }}
                  className="w-full py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Need help? Contact us via WhatsApp or email
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

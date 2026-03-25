"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, MessageCircle, Phone, Star, Package, Search, Minus, Plus, X, Check } from "lucide-react";

interface CartItem { id: string; name: string; price: number; quantity: number; image: string; }

const STORE = {
  name: "Nakato Styles",
  slug: "nakato-styles",
  description: "Premium fashion and accessories at affordable prices",
  phone: "0700123456",
  logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop",
  banner: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&h=400&fit=crop",
};

const PRODUCTS = [
  { id: "1", name: "Premium Wireless Headphones", price: 250_000, stock: 45, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", category: "Electronics", description: "Crystal clear sound with active noise cancellation" },
  { id: "2", name: "Smart Watch Series 5", price: 450_000, stock: 23, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", category: "Electronics", description: "Track your health and stay connected" },
  { id: "3", name: "Designer Handbag", price: 180_000, stock: 67, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", category: "Fashion", description: "Genuine leather premium handbag" },
  { id: "4", name: "Running Shoes Pro", price: 120_000, stock: 89, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", category: "Fashion", description: "Lightweight and durable for all terrains" },
  { id: "5", name: "Sunglasses UV400", price: 85_000, stock: 34, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop", category: "Accessories", description: "Full UV protection with polarized lenses" },
  { id: "6", name: "Leather Belt Premium", price: 65_000, stock: 56, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop", category: "Accessories", description: "Genuine leather, handcrafted belt" },
];

const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

export default function StorefrontPage({ params }: { params: { slug: string } }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const categories = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];
  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const addToCart = (product: typeof PRODUCTS[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter((i) => i.quantity > 0));
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const buildWhatsAppMsg = () => {
    const items = cart.map((i) => `- ${i.name} x${i.quantity} = ${fmt(i.price * i.quantity)}`).join("\n");
    const phone = STORE.phone.replace(/^0/, "256");
    const msg = `Hello ${STORE.name}!\n\nI'd like to order:\n\n${items}\n\nTotal: ${fmt(total)}\n\nMy Name: ${customerName}\nMy Phone: ${customerPhone}\n\nPlease confirm my order. Thank you!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const handleWhatsAppOrder = () => {
    window.open(buildWhatsAppMsg(), "_blank");
    setOrderPlaced(true);
    setCheckoutOpen(false);
    setCart([]);
    setTimeout(() => setOrderPlaced(false), 5000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Banner */}
      <div style={{ position: "relative", height: "16rem", overflow: "hidden" }}>
        <img src={STORE.banner} alt="Store Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ffffff", textAlign: "center", padding: "1rem" }}>
          <img src={STORE.logo} alt={STORE.name} style={{ width: "5rem", height: "5rem", borderRadius: "9999px", objectFit: "cover", border: "3px solid #ffffff", marginBottom: "1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }} />
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>{STORE.name}</h1>
          <p style={{ opacity: 0.9, maxWidth: "32rem" }}>{STORE.description}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4" style={{ color: "#fbbf24", fill: "#fbbf24" }} />)}
            <span style={{ opacity: 0.9, fontSize: "0.875rem" }}>4.8 (124 reviews)</span>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <div style={{ position: "sticky", top: 0, backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", zIndex: 40, padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div style={{ flex: 1, position: "relative", maxWidth: "24rem" }}>
          <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#94a3b8" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." style={{ width: "100%", paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", border: "1px solid #e2e8f0", borderRadius: "9999px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => cartCount > 0 && setCartOpen(true)} style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "9999px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
          <ShoppingCart className="w-4 h-4" /> Cart
          {cartCount > 0 && <span style={{ position: "absolute", top: "-0.5rem", right: "-0.5rem", width: "1.25rem", height: "1.25rem", backgroundColor: "#ef4444", borderRadius: "9999px", fontSize: "0.625rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>{cartCount}</span>}
        </button>
      </div>

      {/* Categories */}
      <div style={{ padding: "1rem 1.5rem", display: "flex", gap: "0.5rem", overflowX: "auto", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "0.375rem 1rem", borderRadius: "9999px", border: "1px solid", borderColor: category === cat ? "#3b82f6" : "#e2e8f0", backgroundColor: category === cat ? "#3b82f6" : "#ffffff", color: category === cat ? "#ffffff" : "#374151", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>{filtered.length} products</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
          {filtered.map((product, i) => {
            const inCart = cart.find((c) => c.id === product.id);
            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", overflow: "hidden", cursor: "pointer" }}>
                <div style={{ position: "relative" }}>
                  <img src={product.image} alt={product.name} style={{ width: "100%", height: "12rem", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", padding: "0.25rem 0.625rem", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600 }}>{product.category}</div>
                </div>
                <div style={{ padding: "1rem" }}>
                  <h3 style={{ fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.875rem" }}>{product.name}</h3>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.75rem" }}>{product.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "#3b82f6" }}>{fmt(product.price)}</span>
                    <span style={{ fontSize: "0.75rem", color: product.stock < 10 ? "#ef4444" : "#22c55e" }}>Stock: {product.stock}</span>
                  </div>
                  {inCart ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem", backgroundColor: "#f1f5f9", borderRadius: "0.5rem" }}>
                      <button onClick={() => updateQty(product.id, -1)} style={{ width: "1.75rem", height: "1.75rem", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus className="w-3 h-3" /></button>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{inCart.quantity}</span>
                      <button onClick={() => updateQty(product.id, 1)} style={{ width: "1.75rem", height: "1.75rem", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "0.375rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(product)} style={{ width: "100%", padding: "0.625rem", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>Add to Cart</button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50 }} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: "24rem", backgroundColor: "#ffffff", zIndex: 51, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" }}>
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>Your Cart ({cartCount})</h2>
                <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X className="w-5 h-5" /></button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 0", color: "#64748b" }}>
                    <Package className="w-12 h-12" style={{ margin: "0 auto 1rem", color: "#cbd5e1" }} />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}>
                      <img src={item.image} alt={item.name} style={{ width: "4rem", height: "4rem", objectFit: "cover", borderRadius: "0.375rem" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                        <p style={{ fontSize: "0.875rem", color: "#3b82f6", fontWeight: 700, marginBottom: "0.5rem" }}>{fmt(item.price)}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <button onClick={() => updateQty(item.id, -1)} style={{ width: "1.5rem", height: "1.5rem", backgroundColor: "#f1f5f9", border: "none", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus className="w-3 h-3" /></button>
                          <span style={{ fontWeight: 600, fontSize: "0.875rem", minWidth: "1.5rem", textAlign: "center" }}>{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} style={{ width: "1.5rem", height: "1.5rem", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <button onClick={() => updateQty(item.id, -item.quantity)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><X className="w-4 h-4" /></button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <span style={{ fontWeight: 600 }}>Total:</span>
                    <span style={{ fontWeight: 700, color: "#3b82f6", fontSize: "1.125rem" }}>{fmt(total)}</span>
                  </div>
                  <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} style={{ width: "100%", padding: "0.875rem", backgroundColor: "#22c55e", color: "#ffffff", border: "none", borderRadius: "0.5rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                    <MessageCircle className="w-5 h-5" /> Order via WhatsApp
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
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCheckoutOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50 }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#ffffff", borderRadius: "0.75rem", padding: "1.5rem", width: "90%", maxWidth: "28rem", zIndex: 51, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h2 style={{ fontWeight: 700 }}>Complete Your Order</h2>
                <button onClick={() => setCheckoutOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X className="w-5 h-5" /></button>
              </div>
              <div style={{ backgroundColor: "#f8fafc", borderRadius: "0.5rem", padding: "1rem", marginBottom: "1.5rem" }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "0.75rem", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>Total</span><span style={{ color: "#3b82f6" }}>{fmt(total)}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your Name" style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none" }} />
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Your Phone (e.g. 0700 000 000)" style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none" }} />
              </div>
              <button onClick={handleWhatsAppOrder} disabled={!customerName || !customerPhone} style={{ width: "100%", padding: "0.875rem", backgroundColor: "#22c55e", color: "#ffffff", border: "none", borderRadius: "0.5rem", fontWeight: 700, cursor: !customerName || !customerPhone ? "not-allowed" : "pointer", opacity: !customerName || !customerPhone ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <MessageCircle className="w-5 h-5" /> Send Order via WhatsApp
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Success Toast */}
      <AnimatePresence>
        {orderPlaced && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", backgroundColor: "#22c55e", color: "#ffffff", padding: "1rem 1.5rem", borderRadius: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem", zIndex: 60, boxShadow: "0 8px 24px rgba(34,197,94,0.4)", fontWeight: 600 }}>
            <Check className="w-5 h-5" /> Order sent to WhatsApp successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

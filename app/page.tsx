"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, MessageCircle, TrendingUp, Users, Package, DollarSign,
  Check, Star, ArrowRight, Menu, X, Phone, Mail, MapPin,
  Facebook, Twitter, Instagram, Linkedin, ChevronDown, Zap, Shield,
  Smartphone, CreditCard, ArrowUp, MessageSquare, Store, Send, Activity
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: <ShoppingCart className="w-6 h-6" />, title: "Digital Storefront", description: "Create your online store in minutes. List products, manage inventory, and share your store link instantly." },
    { icon: <MessageCircle className="w-6 h-6" />, title: "WhatsApp Integration", description: "Seamlessly connect with customers via WhatsApp. Orders are sent directly to your phone with pre-filled messages." },
    { icon: <Smartphone className="w-6 h-6" />, title: "Mobile Money Payments", description: "Accept MTN MoMo payments instantly. Secure, fast, and trusted by millions across Uganda." },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Sales Analytics", description: "Track your revenue, monitor orders, and understand your business performance with real-time dashboards." },
    { icon: <Shield className="w-6 h-6" />, title: "Secure & Reliable", description: "Bank-level security for all transactions. Your data and your customers' information are always protected." },
    { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", description: "Built for speed. Your store loads instantly, and payments are processed in seconds." },
  ];

  const pricingTiers = [
    { name: "Starter", price: "Free", period: "forever", features: ["Up to 10 products", "Basic storefront", "WhatsApp integration", "Mobile money payments", "Basic analytics"], cta: "Get Started", highlighted: false },
    { name: "Business", price: "UGX 50,000", period: "per month", features: ["Unlimited products", "Custom store design", "Priority WhatsApp support", "Advanced analytics", "Multiple payment methods", "Custom domain", "Email notifications"], cta: "Start Free Trial", highlighted: true },
    { name: "Enterprise", price: "Custom", period: "contact us", features: ["Everything in Business", "Multi-store management", "API access", "Dedicated account manager", "Custom integrations", "White-label solution", "24/7 priority support"], cta: "Contact Sales", highlighted: false },
  ];

  const testimonials = [
    { name: "Sarah Nakato", role: "Fashion Boutique Owner", company: "Nakato Styles", content: "SwiftShopy transformed my business! I went from struggling with manual orders to processing 50+ orders daily. The WhatsApp integration is a game-changer.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop", rating: 5 },
    { name: "David Okello", role: "Electronics Retailer", company: "Tech Hub UG", content: "The mobile money integration is seamless. My customers love how easy it is to pay, and I love how quickly I receive payments. Highly recommend!", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop", rating: 5 },
    { name: "Grace Nambi", role: "Food Business Owner", company: "Grace's Kitchen", content: "I started with zero tech knowledge. SwiftShopy made it so simple to set up my store. Now I'm making more sales than ever before!", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop", rating: 5 },
  ];

  const faqs = [
    { question: "How quickly can I set up my store?", answer: "You can have your store up and running in less than 10 minutes! Simply sign up, add your products, and share your store link. No technical knowledge required." },
    { question: "What payment methods do you support?", answer: "We currently support MTN Mobile Money with plans to add Airtel Money soon. All payments are processed securely and instantly." },
    { question: "How does the WhatsApp integration work?", answer: "When a customer clicks 'Order on WhatsApp', they're redirected to WhatsApp with a pre-filled message containing their order details. You receive the order directly on your phone!" },
    { question: "Is there a transaction fee?", answer: "Our Starter plan is completely free with no transaction fees. Business and Enterprise plans have competitive rates. Check our pricing section for details." },
    { question: "Can I use my own domain?", answer: "Yes! Business and Enterprise plans include custom domain support, allowing you to use your own branded URL." },
    { question: "What kind of support do you offer?", answer: "We offer email support for all users, priority WhatsApp support for Business plan users, and 24/7 dedicated support for Enterprise customers." },
  ];

  const stats = [
    { label: "Active Sellers", value: "5,000+", icon: <Users className="w-5 h-5" /> },
    { label: "Products Listed", value: "50,000+", icon: <Package className="w-5 h-5" /> },
    { label: "Monthly Transactions", value: "UGX 500M+", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Customer Satisfaction", value: "98%", icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", color: "#0f172a" }}>
      {/* Navigation */}
      <nav style={{ position: "fixed", top: 0, width: "100%", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0", zIndex: 50 }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingCart className="w-5 h-5" style={{ color: "#ffffff" }} />
              </div>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, background: "linear-gradient(to right, #3b82f6, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SwiftShopy</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              {["#features", "#pricing", "#testimonials", "#faq"].map((href, i) => (
                <a key={i} href={href} style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", textDecoration: "none" }}>
                  {["Features", "Pricing", "Testimonials", "FAQ"][i]}
                </a>
              ))}
              <Link href="/login" style={{ padding: "0.5rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151", textDecoration: "none" }}>Login</Link>
              <Link href="/signup" style={{ padding: "0.5rem 1rem", backgroundColor: "#3b82f6", color: "#ffffff", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none" }}>Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: "8rem", paddingBottom: "5rem", padding: "8rem 1.5rem 5rem" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 1rem", backgroundColor: "rgba(59,130,246,0.1)", borderRadius: "9999px", marginBottom: "1.5rem" }}>
                <Zap className="w-4 h-4" style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#3b82f6" }}>Launch Your Store Today</span>
              </div>
              <h1 style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.5rem" }}>
                Sell on WhatsApp with{" "}
                <span style={{ background: "linear-gradient(to right, #3b82f6, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mobile Money</span>
              </h1>
              <p style={{ fontSize: "1.125rem", color: "#64748b", marginBottom: "2rem", lineHeight: 1.7 }}>
                The easiest way for Ugandan businesses to sell online. Create your store, accept mobile money payments, and manage orders through WhatsApp.
              </p>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
                <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "1rem 2rem", backgroundColor: "#3b82f6", color: "#ffffff", borderRadius: "0.75rem", fontWeight: 600, textDecoration: "none", fontSize: "1rem" }}>
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Link>
                <button style={{ padding: "1rem 2rem", border: "1px solid #e2e8f0", borderRadius: "0.75rem", fontWeight: 600, backgroundColor: "#ffffff", cursor: "pointer", fontSize: "1rem" }}>
                  Watch Demo
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
                {stats.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "#3b82f6" }}>{s.icon}</span>
                      <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{s.value}</span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div style={{ borderRadius: "1rem", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid #e2e8f0" }}>
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop" alt="SwiftShopy Dashboard" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "5rem 1.5rem", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: "1rem" }}>Everything You Need to Succeed</h2>
            <p style={{ fontSize: "1.125rem", color: "#64748b", maxWidth: "36rem", margin: "0 auto" }}>Built specifically for small businesses in Uganda. Simple, powerful, and affordable.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2rem" }}>
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.03, y: -4 }}
                style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", cursor: "pointer" }}>
                <div style={{ width: "3rem", height: "3rem", backgroundColor: "rgba(59,130,246,0.1)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>{f.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "5rem 1.5rem", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: "1rem" }}>Simple, Transparent Pricing</h2>
            <p style={{ fontSize: "1.125rem", color: "#64748b" }}>Start free, upgrade as you grow.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2rem", maxWidth: "64rem", margin: "0 auto" }}>
            {pricingTiers.map((tier, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ padding: "2rem", borderRadius: "0.75rem", border: tier.highlighted ? "2px solid #3b82f6" : "1px solid #e2e8f0", backgroundColor: "#ffffff", boxShadow: tier.highlighted ? "0 20px 40px rgba(59,130,246,0.15)" : "none", transform: tier.highlighted ? "scale(1.03)" : "scale(1)" }}>
                {tier.highlighted && <div style={{ display: "inline-block", padding: "0.25rem 0.75rem", backgroundColor: "#3b82f6", color: "#ffffff", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, marginBottom: "1rem" }}>Most Popular</div>}
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>{tier.name}</h3>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 700 }}>{tier.price}</span>
                  <span style={{ color: "#64748b", marginLeft: "0.5rem", fontSize: "0.875rem" }}>/ {tier.period}</span>
                </div>
                <ul style={{ listStyle: "none", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {tier.features.map((feat, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem" }}>
                      <Check className="w-4 h-4" style={{ color: "#3b82f6", flexShrink: 0, marginTop: "0.125rem" }} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{ display: "block", textAlign: "center", padding: "0.75rem", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", backgroundColor: tier.highlighted ? "#3b82f6" : "transparent", color: tier.highlighted ? "#ffffff" : "#374151", border: tier.highlighted ? "none" : "1px solid #e2e8f0" }}>{tier.cta}</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: "5rem 1.5rem", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: "1rem" }}>Loved by Business Owners</h2>
            <p style={{ fontSize: "1.125rem", color: "#64748b" }}>See what our customers have to say</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2rem" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4" style={{ color: "#f59e0b", fill: "#f59e0b" }} />)}
                </div>
                <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.875rem", lineHeight: 1.7 }}>{t.content}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <img src={t.avatar} alt={t.name} style={{ width: "3rem", height: "3rem", borderRadius: "9999px", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{t.role}, {t.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: "5rem 1.5rem", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: "1rem" }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "0.75rem", overflow: "hidden" }}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} style={{ width: "100%", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{faq.question}</span>
                  <ChevronDown className="w-5 h-5" style={{ transform: activeFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "#64748b", flexShrink: 0 }} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                      <p style={{ padding: "0 1.5rem 1rem", color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7 }}>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#ffffff", textAlign: "center" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: "1rem" }}>Ready to Grow Your Business?</h2>
          <p style={{ fontSize: "1.125rem", opacity: 0.9, marginBottom: "2rem" }}>Join 5,000+ Ugandan businesses already selling on SwiftShopy</p>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "1rem 2.5rem", backgroundColor: "#ffffff", color: "#3b82f6", borderRadius: "0.75rem", fontWeight: 700, textDecoration: "none", fontSize: "1rem" }}>
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "3rem 1.5rem", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ width: "2rem", height: "2rem", background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShoppingCart className="w-4 h-4" style={{ color: "#ffffff" }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: "1rem" }}>SwiftShopy</span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6, marginBottom: "1rem" }}>Empowering Ugandan businesses to sell online with ease.</p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" style={{ width: "2rem", height: "2rem", backgroundColor: "#ffffff", borderRadius: "0.5rem", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon className="w-4 h-4" style={{ color: "#64748b" }} /></a>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "Roadmap"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses"] },
            ].map((col, i) => (
              <div key={i}>
                <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.875rem" }}>{col.title}</h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {col.links.map((link, j) => <li key={j}><a href="#" style={{ fontSize: "0.875rem", color: "#64748b", textDecoration: "none" }}>{link}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>© 2024 SwiftShopy. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{ position: "fixed", bottom: "2rem", right: "2rem", width: "3rem", height: "3rem", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "9999px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, boxShadow: "0 4px 12px rgba(59,130,246,0.4)" }}>
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

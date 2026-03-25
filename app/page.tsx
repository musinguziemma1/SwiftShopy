"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { BackgroundPaths } from "@/components/ui/background-paths"
import AIChatCard from "@/components/ui/ai-chat"
import {
  ShoppingCart,
  MessageCircle,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Check,
  Star,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronDown,
  Zap,
  Shield,
  Smartphone,
  CreditCard,
  ArrowUp,
  MessageSquare,
  Store,
  Send,
  Activity,
} from "lucide-react"

// Types
interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface PricingTier {
  name: string
  price: string
  period: string
  features: string[]
  highlighted?: boolean
  cta: string
}

interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  avatar: string
  rating: number
}

interface FAQ {
  question: string
  answer: string
}

interface SwiftShopyLandingProps {
  className?: string
}

// Main Component
export function SwiftShopyLanding({ className = "" }: SwiftShopyLandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showChat, setShowChat] = useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const features: Feature[] = [
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Digital Storefront",
      description:
        "Create your online store in minutes. List products, manage inventory, and share your store link instantly.",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "WhatsApp Integration",
      description:
        "Seamlessly connect with customers via WhatsApp. Orders are sent directly to your phone with pre-filled messages.",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Money Payments",
      description:
        "Accept MTN MoMo payments instantly. Secure, fast, and trusted by millions across Uganda.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Sales Analytics",
      description:
        "Track your revenue, monitor orders, and understand your business performance with real-time dashboards.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description:
        "Bank-level security for all transactions. Your data and your customers' information are always protected.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Built for speed. Your store loads instantly, and payments are processed in seconds.",
    },
  ]

  const pricingTiers: PricingTier[] = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      features: [
        "Up to 10 products",
        "Basic storefront",
        "WhatsApp integration",
        "Mobile money payments",
        "Basic analytics",
      ],
      cta: "Get Started",
    },
    {
      name: "Business",
      price: "UGX 50,000",
      period: "per month",
      features: [
        "Unlimited products",
        "Custom store design",
        "Priority WhatsApp support",
        "Advanced analytics",
        "Multiple payment methods",
        "Custom domain",
        "Email notifications",
      ],
      highlighted: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      features: [
        "Everything in Business",
        "Multi-store management",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solution",
        "24/7 priority support",
      ],
      cta: "Contact Sales",
    },
  ]

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Nakato",
      role: "Fashion Boutique Owner",
      company: "Nakato Styles",
      content:
        "SwiftShopy transformed my business! I went from struggling with manual orders to processing 50+ orders daily. The WhatsApp integration is a game-changer.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      name: "David Okello",
      role: "Electronics Retailer",
      company: "Tech Hub UG",
      content:
        "The mobile money integration is seamless. My customers love how easy it is to pay, and I love how quickly I receive payments. Highly recommend!",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      rating: 5,
    },
    {
      name: "Grace Nambi",
      role: "Food Business Owner",
      company: "Grace's Kitchen",
      content:
        "I started with zero tech knowledge. SwiftShopy made it so simple to set up my store. Now I'm making more sales than ever before!",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      rating: 5,
    },
  ]

  const faqs: FAQ[] = [
    {
      question: "How quickly can I set up my store?",
      answer:
        "You can have your store up and running in less than 10 minutes! Simply sign up, add your products, and share your store link. No technical knowledge required.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "We currently support MTN Mobile Money with plans to add Airtel Money soon. All payments are processed securely and instantly.",
    },
    {
      question: "How does the WhatsApp integration work?",
      answer:
        "When a customer clicks 'Order on WhatsApp', they're redirected to WhatsApp with a pre-filled message containing their order details. You receive the order directly on your phone!",
    },
    {
      question: "Is there a transaction fee?",
      answer:
        "Our Starter plan is completely free with no transaction fees. Business and Enterprise plans have competitive rates. Check our pricing section for details.",
    },
    {
      question: "Can I use my own domain?",
      answer:
        "Yes! Business and Enterprise plans include custom domain support, allowing you to use your own branded URL.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We offer email support for all users, priority WhatsApp support for Business plan users, and 24/7 dedicated support for Enterprise customers.",
    },
  ]

  const stats = [
    { label: "Active Sellers", value: "5,000+", icon: <Users className="w-5 h-5" /> },
    { label: "Products Listed", value: "50,000+", icon: <Package className="w-5 h-5" /> },
    { label: "Monthly Transactions", value: "UGX 500M+", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Customer Satisfaction", value: "98%", icon: <Star className="w-5 h-5" /> },
  ]

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                SwiftShopy
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Pricing
              </a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Testimonials
              </a>
              <a href="#faq" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                FAQ
              </a>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent hover:scale-105 transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:scale-105 hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                <a href="#features" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  Features
                </a>
                <a href="#pricing" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  Pricing
                </a>
                <a href="#testimonials" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  Testimonials
                </a>
                <a href="#faq" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  FAQ
                </a>
                <Link
                  href="/dashboard"
                  className="w-full block px-4 py-2 text-sm font-medium text-center border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/signup"
                  className="w-full block px-4 py-2 text-sm font-medium text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BackgroundPaths />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5" />
        </div>
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Launch Your Store Today</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Sell on WhatsApp with{" "}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Mobile Money
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                The easiest way for Ugandan businesses to sell online. Create your store, accept
                mobile money payments, and manage orders through WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-8 py-4 border border-border rounded-lg font-medium hover:bg-accent hover:scale-105 hover:shadow-lg transition-all">
                  Watch Demo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="text-primary">{stat.icon}</div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                  alt="SwiftShopy Dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Social Proof Section */}
      <section className="py-16 bg-gradient-to-b from-accent/30 to-accent/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Users className="w-8 h-8" />, value: "5,000+", label: "Active Sellers", color: "text-blue-500" },
              { icon: <Package className="w-8 h-8" />, value: "50,000+", label: "Products Listed", color: "text-purple-500" },
              { icon: <DollarSign className="w-8 h-8" />, value: "UGX 500M+", label: "Monthly Volume", color: "text-green-500" },
              { icon: <Star className="w-8 h-8" />, value: "98%", label: "Satisfaction", color: "text-yellow-500" },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all cursor-pointer group"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4 group-hover:scale-110 transition-transform ${metric.color}`}
                >
                  {metric.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-muted-foreground mb-6">
              TRUSTED BY BUSINESSES ACROSS UGANDA
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { name: "SSL Secure", icon: <Shield className="w-6 h-6" />, color: "text-green-500" },
                { name: "99.9% Uptime", icon: <Activity className="w-6 h-6" />, color: "text-blue-500" },
                { name: "24/7 Support", icon: <MessageCircle className="w-6 h-6" />, color: "text-purple-500" },
                { name: "MTN Partner", icon: <CreditCard className="w-6 h-6" />, color: "text-yellow-500" },
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border hover:border-primary/50 transition-all cursor-pointer"
                >
                  <span className={badge.color}>{badge.icon}</span>
                  <span className="font-medium text-sm">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live Activity</span>
              </div>
              <div className="space-y-3">
                <LiveActivityItem message="Sarah from Kampala just made a sale" time="2 seconds ago" amount="UGX 450,000" />
                <LiveActivityItem message="New store 'Tech Hub UG' went live" time="5 seconds ago" type="store" />
                <LiveActivityItem message="David received payment via MoMo" time="12 seconds ago" amount="UGX 320,000" />
                <LiveActivityItem message="Grace's Kitchen got a 5-star review" time="18 seconds ago" type="review" />
              </div>
            </motion.div>
          </div>

          {/* Category Partners */}
          <div className="mt-12 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-6">
              SERVING BUSINESSES ACROSS ALL SECTORS
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12">
              {["Fashion", "Electronics", "Food & Beverage", "Beauty", "Home & Living"].map(
                (category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-lg font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {category}
                  </motion.div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <DashboardPreviewSection />

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for small businesses in Uganda. Simple, powerful, and affordable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-accent/50 overflow-hidden"
      >
        <DottedSurface className="absolute inset-0 opacity-30" />
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. Start free, upgrade as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`p-8 rounded-xl border cursor-pointer transition-all ${
                  tier.highlighted
                    ? "border-primary bg-card shadow-xl scale-105 hover:shadow-2xl"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-xl"
                }`}
              >
                {tier.highlighted && (
                  <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground ml-2">/ {tier.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`w-full block text-center py-3 rounded-lg font-medium transition-all hover:scale-105 ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg"
                      : "border border-border hover:bg-accent hover:shadow-lg"
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by Business Owners</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about SwiftShopy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/50">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about SwiftShopy
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="border border-border rounded-lg bg-card overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent/50 transition-all group"
                >
                  <span className="font-semibold group-hover:text-primary transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform group-hover:text-primary ${
                      activeFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-muted-foreground">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <DottedSurface className="absolute inset-0 opacity-20" />
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-lg text-muted-foreground">Have questions? We're here to help.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-muted-foreground">+256 700 000 000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">support@swiftshopy.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-muted-foreground">Kampala, Uganda</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-xl border border-border bg-card">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="How can we help?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Stay Updated with SwiftShopy</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get the latest tips, updates, and success stories delivered to your inbox. Join 5,000+
              sellers growing their business.
            </p>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Subscribe
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.form>
            <p className="text-xs text-muted-foreground mt-4">
              🔒 We respect your privacy. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-accent/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">SwiftShopy</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Empowering Ugandan businesses to sell online with ease.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 bg-background rounded-lg flex items-center justify-center hover:bg-accent transition-colors border border-border"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "Roadmap"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookie Policy", "Licenses"] },
            ].map((col, i) => (
              <div key={i}>
                <h3 className="font-semibold mb-4">{col.title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 SwiftShopy. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Fixed Chat Button */}
      <motion.button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-blue-600 text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </motion.button>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-8 z-[70]"
            >
              <AIChatCard />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-8 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// Live Activity Item Component
function LiveActivityItem({
  message,
  time,
  amount,
  type = "sale",
}: {
  message: string
  time: string
  amount?: string
  type?: "sale" | "store" | "review"
}) {
  const icons = {
    sale: <ShoppingCart className="w-4 h-4 text-green-500" />,
    store: <Store className="w-4 h-4 text-blue-500" />,
    review: <Star className="w-4 h-4 text-yellow-500" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <div>
          <p className="text-sm font-medium">{message}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
      {amount && <div className="text-sm font-semibold text-green-600">{amount}</div>}
    </motion.div>
  )
}

// Dashboard Preview Section Component
function DashboardPreviewSection() {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <DollarSign className="w-4 h-4" /> },
  ]

  const screenshots = {
    overview: {
      title: "Dashboard Overview",
      description: "Get a complete view of your business performance at a glance",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
      features: ["Real-time sales tracking", "Revenue analytics", "Order status overview", "Quick actions"],
    },
    products: {
      title: "Product Management",
      description: "Easily add, edit, and manage your product catalog",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
      features: ["Drag & drop product images", "Inventory management", "Bulk operations", "Product categories"],
    },
    orders: {
      title: "Order Management",
      description: "Track and manage all customer orders in one place",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop",
      features: ["Order tracking", "Payment status", "Customer details", "WhatsApp integration"],
    },
    analytics: {
      title: "Sales Analytics",
      description: "Deep insights into your business performance and trends",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
      features: ["Revenue charts", "Customer insights", "Product performance", "Export reports"],
    },
  }

  const currentScreenshot = screenshots[activeTab as keyof typeof screenshots]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powerful Dashboard for Your Business
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your entire business from one beautiful interface
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-card border border-border hover:bg-accent hover:scale-105"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Screenshot Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <motion.div
                className="relative rounded-2xl overflow-hidden shadow-2xl border border-border group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={currentScreenshot.image}
                  alt={currentScreenshot.title}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold mb-3">{currentScreenshot.title}</h3>
                  <p className="text-lg text-muted-foreground">{currentScreenshot.description}</p>
                </div>

                <div className="space-y-3">
                  {currentScreenshot.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 hover:scale-105 hover:shadow-xl transition-all flex items-center gap-2 group"
                >
                  Try Dashboard Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default function Page() {
  return <SwiftShopyLanding />
}

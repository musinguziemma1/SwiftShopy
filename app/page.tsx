"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { HeroMotionBackground } from "@/components/ui/hero-motion-background"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import PricingSectionNew from "@/components/ui/pricing-section"
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
  href?: string
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
function SwiftShopyLanding({ className = "" }: SwiftShopyLandingProps) {
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
      name: "Free",
      price: "UGX 0",
      period: "forever",
      features: [
        "Up to 10 products",
        "WhatsApp order button",
        "MTN Mobile Money payments",
        "Basic order tracking",
        "Simple dashboard",
        "SwiftShopy branding included",
      ],
      cta: "Start Free",
      href: "/signup",
    },
    {
      name: "Pro",
      price: "UGX 15,000",
      period: "per month",
      features: [
        "Everything in Free, plus:",
        "Remove SwiftShopy branding",
        "Custom store link",
        "Auto payment confirmation",
        "Daily & weekly analytics",
        "Customer insights",
        "Basic promotional tools",
      ],
      highlighted: true,
      cta: "Upgrade to Pro",
      href: "/pricing",
    },
    {
      name: "Business",
      price: "UGX 35,000",
      period: "per month",
      features: [
        "Everything in Pro, plus:",
        "Advanced analytics & trends",
        "Inventory management",
        "Stock tracking & alerts",
        "Discount & coupon system",
        "Bulk product upload",
        "Custom branding (logo, colors)",
      ],
      cta: "Get Business",
      href: "/pricing",
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
      <nav className="fixed top-0 w-full glass border-b border-border/50 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg glow-primary">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                SwiftShopy
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Features
              </a>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Pricing
              </Link>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Testimonials
              </a>
              <a href="#faq" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                FAQ
              </a>
              <div className="w-px h-6 bg-border mx-2" />
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent hover:scale-105 transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground rounded-xl hover:scale-105 hover:shadow-xl transition-all shadow-lg"
              >
                Get Started
              </Link>
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle />
              <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border glass"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                <a href="#features" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  Features
                </a>
                <Link href="/pricing" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  Pricing
                </Link>
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
                  className="w-full block px-4 py-2 text-sm font-medium text-center bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground rounded-xl transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        <HeroMotionBackground />
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 shadow-smooth"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium">Live in Uganda - Start selling today</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Sell on WhatsApp with{" "}
                <span className="text-gradient">
                  Mobile Money
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                The easiest way for Ugandan businesses to sell online. Create your store, accept
                mobile money payments, and manage orders through WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground rounded-xl font-medium hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-2 group shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-8 py-4 glass rounded-xl font-medium hover:bg-accent/50 hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </span>
                  Watch Demo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="text-center p-4 glass rounded-xl"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="text-primary">{stat.icon}</div>
                      <div className="text-xl font-bold">{stat.value}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
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
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-2xl glass border border-border/50"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                  alt="SwiftShopy Dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </motion.div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl" />
              
              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -left-8 top-1/4 glass rounded-xl p-4 shadow-elevated"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">+UGX 450,000</p>
                    <p className="text-xs text-muted-foreground">Payment received</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-4 bottom-1/3 glass rounded-xl p-4 shadow-elevated"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">New Order!</p>
                    <p className="text-xs text-muted-foreground">2 items - Pay now</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Social Proof Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-background" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
            {[
              { icon: <Users className="w-8 h-8" />, value: "5,000+", label: "Active Sellers", color: "from-blue-500 to-indigo-500" },
              { icon: <Package className="w-8 h-8" />, value: "50,000+", label: "Products Listed", color: "from-purple-500 to-pink-500" },
              { icon: <DollarSign className="w-8 h-8" />, value: "UGX 500M+", label: "Monthly Volume", color: "from-green-500 to-emerald-500" },
              { icon: <Star className="w-8 h-8" />, value: "98%", label: "Satisfaction", color: "from-amber-500 to-orange-500" },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="text-center p-6 glass rounded-2xl hover:shadow-elevated transition-all cursor-pointer group"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${metric.color} mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <div className="text-white">{metric.icon}</div>
                </div>
                <div className="text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
              Trusted by businesses across Uganda
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { name: "SSL Secure", icon: <Shield className="w-5 h-5" />, color: "text-green-500 bg-green-500/10" },
                { name: "99.9% Uptime", icon: <Activity className="w-5 h-5" />, color: "text-blue-500 bg-blue-500/10" },
                { name: "24/7 Support", icon: <MessageCircle className="w-5 h-5" />, color: "text-purple-500 bg-purple-500/10" },
                { name: "MTN Partner", icon: <CreditCard className="w-5 h-5" />, color: "text-yellow-500 bg-yellow-500/10" },
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-5 py-2.5 glass rounded-full hover:shadow-smooth transition-all cursor-pointer"
                >
                  <span className={`p-1.5 rounded-lg ${badge.color}`}>{badge.icon}</span>
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
              className="p-6 glass rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-sm font-semibold">Live Activity</span>
                <span className="text-xs text-muted-foreground ml-auto">Real-time updates</span>
              </div>
              <div className="space-y-2">
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
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <BackgroundPaths variant="section" className="absolute inset-0" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Powerful Features</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for small businesses in Uganda. Simple, powerful, and affordable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-6 glass rounded-2xl hover:shadow-elevated transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-xl flex items-center justify-center text-primary mb-5 group-hover:from-primary group-hover:to-indigo-500 group-hover:text-white transition-all shadow-lg">
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
      <PricingSectionNew />

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <BackgroundPaths variant="minimal" className="absolute inset-0" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6"
            >
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Customer Love</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Loved by <span className="text-gradient">Business Owners</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about SwiftShopy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 glass rounded-2xl hover:shadow-elevated transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
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
      <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/10 to-background" />
        <DottedSurface className="absolute inset-0 opacity-10" />
        <div className="container mx-auto max-w-3xl relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6"
            >
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">FAQ</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
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
                className="glass rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-accent/30 transition-all group"
                >
                  <span className="font-semibold group-hover:text-primary transition-colors pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: activeFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-muted-foreground border-t border-border/50 pt-4">
                        {faq.answer}
                      </div>
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
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <BackgroundPaths variant="minimal" className="absolute inset-0" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6"
              >
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Contact Us</span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Get in <span className="text-gradient">Touch</span>
              </h2>
              <p className="text-lg text-muted-foreground">Have questions? We&apos;re here to help.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  { icon: <Phone className="w-6 h-6" />, title: "Phone", value: "+256 700 000 000" },
                  { icon: <Mail className="w-6 h-6" />, title: "Email", value: "support@swiftshopy.com" },
                  { icon: <MapPin className="w-6 h-6" />, title: "Location", value: "Kampala, Uganda" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 glass rounded-xl hover:shadow-smooth transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-xl flex items-center justify-center text-primary shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 glass rounded-2xl"
              >
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                      placeholder="How can we help?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground rounded-xl font-medium hover:scale-105 hover:shadow-xl transition-all shadow-lg"
                  >
                    Send Message
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-indigo-500/10 to-purple-500/10" />
        <BackgroundPaths variant="minimal" className="absolute inset-0" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl mb-6 shadow-lg glow-primary">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Stay Updated with <span className="text-gradient">SwiftShopy</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get the latest tips, updates, and success stories delivered to your inbox. Join 5,000+
              sellers growing their business.
            </p>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl border border-border bg-card/50 glass focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground rounded-xl font-medium hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-2 group shadow-lg"
              >
                Subscribe
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.form>
            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              We respect your privacy. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">SwiftShopy</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Empowering Ugandan businesses to sell online with ease.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-accent/50 transition-all hover:scale-110"
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
                <h3 className="font-semibold mb-6">{col.title}</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SwiftShopy. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed Chat Button */}
      <motion.button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-2xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-28 right-8 z-[70]"
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
            className="fixed bottom-28 right-8 w-12 h-12 glass rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
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
    sale: <ShoppingCart className="w-4 h-4" />,
    store: <Store className="w-4 h-4" />,
    review: <Star className="w-4 h-4" />,
  }
  
  const colors = {
    sale: "bg-green-500/20 text-green-500",
    store: "bg-blue-500/20 text-blue-500",
    review: "bg-amber-500/20 text-amber-500",
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[type]}`}>
          {icons[type]}
        </div>
        <div>
          <p className="text-sm font-medium">{message}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
      {amount && (
        <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
          {amount}
        </span>
      )}
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

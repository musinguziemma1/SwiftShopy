"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { HeroMotionBackground } from "@/components/ui/hero-motion-background"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { DottedSurface } from "@/components/ui/dotted-surface"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { TimelineContent } from "@/components/ui/timeline-animation"
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal"
import NumberFlow from "@number-flow/react"
import {
  Check,
  X,
  Zap,
  ArrowRight,
  Star,
  Shield,
  ChevronDown,
  ChevronUp,
  Store,
  BarChart3,
  Package,
  CreditCard,
  Users,
  MessageSquare,
  TrendingUp,
  Gift,
  HelpCircle,
  Sparkles,
  Crown,
  Menu,
  ShoppingCart,
  Briefcase,
  Database,
} from "lucide-react"

interface Plan {
  id: string
  name: string
  price: number
  yearlyPrice: number
  priceDisplay: string
  period: string
  transactionFee: number
  productLimit: number | string
  highlighted: boolean
  badge?: string
  color: string
  cta: string
  icon: React.ReactNode
  features: string[]
  includes: string[]
  featureDescription: string
}

interface ComparisonFeature {
  name: string
  free: boolean | string
  pro: boolean | string
  business: boolean | string
  enterprise: boolean | string
  category: string
}

interface FAQ {
  question: string
  answer: string
}

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="relative z-10 mx-auto flex w-fit rounded-full glass border border-border p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={`relative z-10 w-fit sm:h-12 cursor-pointer h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors ${
            selected === "0"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-2 border-primary/30 bg-gradient-to-t from-primary/20 to-primary/10 shadow-lg shadow-primary/20"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={`relative z-10 w-fit cursor-pointer sm:h-12 h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors ${
            selected === "1"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-2 border-primary/30 bg-gradient-to-t from-primary/20 to-primary/10 shadow-lg shadow-primary/20"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-500">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  // Fetch active plans from Convex (dynamic)
  const activePlans = useQuery(api.plans.getActivePlans) ?? []

  const getDynamicPlans = (): Plan[] => {
    if (activePlans.length === 0) return getStaticPlans()
    return activePlans.map((plan: any, idx: number): Plan => ({
      id: plan._id || String(idx),
      name: plan.name,
      price: plan.price,
      yearlyPrice: Math.round(plan.price * 9.8),
      priceDisplay: `${plan.currency} ${plan.price.toLocaleString()}`,
      period: plan.interval === "yearly" ? "/year" : plan.interval === "lifetime" ? "one-time" : "/month",
      transactionFee: plan.transactionFee ?? 0,
      productLimit: plan.productLimit ?? 0,
      highlighted: plan.isPopular || false,
      color: ["gray", "blue", "purple", "orange", "green"][idx % 5],
      cta: plan.price === 0 ? "Start Free" : "Get Started",
      icon: idx === 3 ? <Crown className="w-6 h-6" /> : idx === 2 ? <TrendingUp className="w-6 h-6" /> : <Zap className="w-6 h-6" />,
      features: Array.isArray(plan.features) ? plan.features : [],
      includes: Array.isArray(plan.features) ? [plan.name + " includes:"] : [],
      featureDescription: plan.description || `Perfect plan for your business`,
    }))
  }

  const plans: Plan[] = getDynamicPlans()

  // Static plans fallback (used when no dynamic plans in DB)
  function getStaticPlans(): Plan[] {
    return [
      { id: "free", name: "Free", price: 0, yearlyPrice: 0, priceDisplay: "UGX 0", period: "Free forever", transactionFee: 4, productLimit: 10, highlighted: false, color: "gray", cta: "Start Free", icon: <Package className="w-6 h-6" />, features: ["Up to 10 products", "WhatsApp order button", "MTN Mobile Money payments"], includes: ["Free includes:", "Basic order tracking"], featureDescription: "Perfect for getting started" },
      { id: "pro", name: "Pro", price: 15000, yearlyPrice: 144000, priceDisplay: "UGX 15,000", period: "/month", transactionFee: 2.5, productLimit: 25, highlighted: true, badge: "MOST POPULAR", color: "blue", cta: "Upgrade to Pro", icon: <Zap className="w-6 h-6" />, features: ["Up to 25 products", "Custom store link", "Auto payment confirmation"], includes: ["Everything in Free, plus:", "Remove SwiftShopy branding"], featureDescription: "Best for growing businesses" },
      { id: "business", name: "Business", price: 35000, yearlyPrice: 336000, priceDisplay: "UGX 35,000", period: "/month", transactionFee: 1.5, productLimit: "50-75", highlighted: false, color: "purple", cta: "Get Business", icon: <TrendingUp className="w-6 h-6" />, features: ["50-75 products", "Inventory management"], includes: ["Everything in Pro, plus:", "Advanced analytics"], featureDescription: "For scaling businesses" },
      { id: "enterprise", name: "Enterprise", price: 60000, yearlyPrice: 576000, priceDisplay: "UGX 60,000", period: "/month", transactionFee: 1, productLimit: "Unlimited", highlighted: false, badge: "BEST VALUE", color: "orange", cta: "Contact Sales", icon: <Crown className="w-6 h-6" />, features: ["Unlimited products", "Multi-user/team accounts", "API access"], includes: ["Everything in Business, plus:", "Dedicated account manager"], featureDescription: "Full-featured for large operations" },
    ]
  }

  const comparisonFeatures: ComparisonFeature[] = [
    { 
      name: "Product Listings", 
      free: plans.find(p => p.name.toLowerCase().includes("free"))?.productLimit === -1 ? "Unlimited" : `${plans.find(p => p.name.toLowerCase().includes("free"))?.productLimit ?? 10} products`, 
      pro: plans.find(p => p.name.toLowerCase().includes("pro"))?.productLimit === -1 ? "Unlimited" : `${plans.find(p => p.name.toLowerCase().includes("pro"))?.productLimit ?? 25} products`, 
      business: plans.find(p => p.name.toLowerCase().includes("business"))?.productLimit === -1 ? "Unlimited" : `${plans.find(p => p.name.toLowerCase().includes("business"))?.productLimit ?? 75} products`, 
      enterprise: plans.find(p => p.name.toLowerCase().includes("enterprise"))?.productLimit === -1 ? "Unlimited" : `${plans.find(p => p.name.toLowerCase().includes("enterprise"))?.productLimit ?? "Unlimited"} products`, 
      category: "Store & Products" 
    },
    { name: "Store Customization", free: "Basic", pro: "Advanced", business: "Full brand control", enterprise: "White-label", category: "Store & Products" },
    { name: "Custom Store Link", free: false, pro: true, business: true, enterprise: true, category: "Store & Products" },
    { name: "Bulk Product Upload", free: false, pro: false, business: true, enterprise: true, category: "Store & Products" },
    { name: "Inventory Management", free: false, pro: false, business: true, enterprise: true, category: "Store & Products" },
    { 
      name: "Transaction Fee", 
      free: `${plans.find(p => p.name.toLowerCase().includes("free"))?.transactionFee ?? 4}%`, 
      pro: `${plans.find(p => p.name.toLowerCase().includes("pro"))?.transactionFee ?? 2.5}%`, 
      business: `${plans.find(p => p.name.toLowerCase().includes("business"))?.transactionFee ?? 1.5}%`, 
      enterprise: `${plans.find(p => p.name.toLowerCase().includes("enterprise"))?.transactionFee ?? 1}%`, 
      category: "Payments" 
    },
    { name: "MTN Mobile Money", free: true, pro: true, business: true, enterprise: true, category: "Payments" },
    { name: "Airtel Money", free: true, pro: true, business: true, enterprise: true, category: "Payments" },
    { name: "Auto Payment Confirmation", free: false, pro: true, business: true, enterprise: true, category: "Payments" },
    { name: "Priority Payment Processing", free: false, pro: false, business: false, enterprise: true, category: "Payments" },
    { name: "Basic Dashboard", free: true, pro: true, business: true, enterprise: true, category: "Analytics" },
    { name: "Daily & Weekly Analytics", free: false, pro: true, business: true, enterprise: true, category: "Analytics" },
    { name: "Monthly Reports & Trends", free: false, pro: false, business: true, enterprise: true, category: "Analytics" },
    { name: "Customer Insights", free: false, pro: "Basic", business: "Advanced", enterprise: "Full", category: "Analytics" },
    { name: "Export Reports (PDF/CSV)", free: false, pro: false, business: true, enterprise: true, category: "Analytics" },
    { name: "WhatsApp Order Button", free: true, pro: true, business: true, enterprise: true, category: "Marketing & Growth" },
    { name: "Promotional Tools", free: false, pro: "Basic", business: "Advanced", enterprise: "Full", category: "Marketing & Growth" },
    { name: "Discount & Coupon System", free: false, pro: false, business: true, enterprise: true, category: "Marketing & Growth" },
    { name: "Customer Tagging", free: false, pro: false, business: true, enterprise: true, category: "Marketing & Growth" },
    { name: "Email Support", free: true, pro: true, business: true, enterprise: true, category: "Support" },
    { name: "Priority Support", free: false, pro: false, business: true, enterprise: true, category: "Support" },
    { name: "Dedicated Account Manager", free: false, pro: false, business: false, enterprise: true, category: "Support" },
    { name: "API Access", free: false, pro: false, business: false, enterprise: true, category: "Support" },
  ];

  const faqs: FAQ[] = [
    { question: "Can I try SwiftShopy for free?", answer: "Yes! Our Free plan lets you create a store with up to 10 products and accept payments via MTN Mobile Money. No credit card required to start." },
    { question: "How do I pay for my subscription?", answer: "You can pay using MTN Mobile Money or Airtel Money. Simply enter your phone number, confirm the payment on your mobile, and your subscription activates immediately." },
    { question: "What happens when my subscription expires?", answer: "Your store will downgrade to the Free plan automatically. You'll still have access to your data and can renew anytime to regain premium features." },
    { question: "Can I upgrade or downgrade my plan anytime?", answer: "Yes! You can upgrade anytime and the new features activate immediately. If you downgrade, the change takes effect at your next billing cycle." },
    { question: "Are there any hidden fees?", answer: "No hidden fees. You only pay the monthly subscription fee and the transaction fee on successful payments. No setup fees, no cancellation fees." },
    { question: "How does the referral program work?", answer: "Share your unique referral code with other sellers. For every 3 sellers who join using your code, you get 1 month of Pro plan free!" },
    { question: "Can I get a discount?", answer: "Yes! If you process over UGX 2,000,000 in transactions per month, you qualify for a 10% discount on your next subscription. We also offer 20% off annual plans." },
    { question: "Is my payment data secure?", answer: "Absolutely. We use industry-standard encryption and work directly with MTN and Airtel payment systems. Your payment details are never stored on our servers." },
  ];

  const handleGetStarted = (planId: string) => {
    if (session) {
      router.push(`/dashboard?tab=settings&subtab=subscription&plan=${planId}`);
    } else {
      router.push(`/login?callbackUrl=/pricing`);
    }
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) return <Check className="w-5 h-5 text-green-500" />;
    if (value === false) return <X className="w-5 h-5 text-muted-foreground/30" />;
    return <span className="text-sm font-medium">{value}</span>;
  };

  const categories = [...new Set(comparisonFeatures.map((f) => f.category))];

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setBillingCycle(Number.parseInt(value) === 1 ? "yearly" : "monthly");

  const formatPrice = (price: number) => {
    if (price === 0) return "0";
    return price.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Navigation - Same as landing page */}
      <nav className="fixed top-0 w-full glass border-b border-border/50 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg glow-primary">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">SwiftShopy</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
               <Link href="/" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                 Home
               </Link>
               <Link href="/pricing" className="text-sm font-medium text-primary">
                 Pricing
               </Link>
               <Link href="/shop" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                 Shop
               </Link>
               <a href="/#features" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                 Features
               </a>
               <a href="/#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                 Testimonials
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
                 <Link href="/" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                   Home
                 </Link>
                 <Link href="/pricing" className="block py-2 text-sm font-medium text-primary">
                   Pricing
                 </Link>
                 <Link href="/shop" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                   Shop
                 </Link>
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

      {/* Hero Section with Motion Background */}
      <section className="relative pt-32 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <HeroMotionBackground />
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Simple, Transparent Pricing</span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <VerticalCutReveal
                  splitBy="words"
                  staggerDuration={0.15}
                  staggerFrom="first"
                  reverse={true}
                  containerClassName="justify-center"
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 40,
                    delay: 0,
                  }}
                >
                  Choose the Right Plan
                </VerticalCutReveal>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Start free, upgrade as you grow. No hidden fees, no contracts. Cancel anytime.
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <TimelineContent
              as="div"
              animationNum={1}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <PricingSwitch onSwitch={togglePricingPeriod} />
            </TimelineContent>
          </div>
        </div>
      </section>

      {/* Pricing Cards with Animations */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-20" ref={pricingRef}>
        <DottedSurface className="absolute inset-0 opacity-10" />
        <div className="container mx-auto relative z-10">
          <TimelineContent
            as="div"
            animationNum={2}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {plans.map((plan, index) => (
              <TimelineContent
                as="div"
                key={plan.id}
                animationNum={index + 3}
                timelineRef={pricingRef}
                customVariants={revealVariants}
              >
                <Card
                  className={`relative flex flex-col h-full transition-all duration-300 ${
                    plan.highlighted
                      ? "scale-105 lg:scale-110 ring-2 ring-primary bg-gradient-to-b from-primary/20 via-primary/10 to-transparent border-primary shadow-xl shadow-primary/20"
                      : "glass hover:shadow-lg hover:-translate-y-1"
                  }`}
                >
                  <CardContent className="pt-6 flex-1">
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                          plan.highlighted 
                            ? "bg-gradient-to-r from-primary to-indigo-600 text-white" 
                            : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                        }`}>
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="space-y-2 pb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-medium text-primary">UGX</span>
                        <span className="text-4xl font-bold">
                          <NumberFlow
                            value={billingCycle === "yearly" ? plan.yearlyPrice : plan.price}
                            className="text-4xl font-bold"
                          />
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{billingCycle === "yearly" ? "year" : "month"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{plan.transactionFee}% fee</span>
                        <span className="text-border">|</span>
                        <span>{plan.productLimit === -1 ? "Unlimited" : plan.productLimit} products</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        plan.highlighted 
                          ? "bg-primary/20 text-primary" 
                          : "bg-accent text-muted-foreground"
                      }`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6">
                      {plan.featureDescription}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <h4 className="font-medium text-sm">
                        {plan.includes[0]}
                      </h4>
                      <ul className="space-y-2">
                        {plan.includes.slice(1).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                              plan.highlighted 
                                ? "bg-primary/20 text-primary" 
                                : "bg-green-500/20 text-green-500"
                            }`}>
                              <Check className="h-3 w-3" />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-6 pt-0">
                    <button
                      onClick={() => handleGetStarted(plan.id)}
                      className={`w-full py-3.5 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 ${
                        plan.highlighted
                          ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 hover:shadow-xl"
                          : "glass hover:bg-accent/50 border border-border"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </CardFooter>
                </Card>
              </TimelineContent>
            ))}
          </TimelineContent>

          {/* Trust badges */}
          <TimelineContent
            as="div"
            animationNum={8}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="mt-16 text-center"
          >
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                24/7 support
              </span>
            </div>
          </TimelineContent>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <BackgroundPaths variant="minimal" className="absolute inset-0" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="text-center mb-12">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-bold mb-4">Compare All Features</motion.h2>
            <p className="text-muted-foreground">See exactly what each plan offers</p>
          </div>

          <div className="overflow-x-auto glass rounded-2xl p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-4 w-1/3">Feature</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4 bg-primary/5">Pro</th>
                  <th className="text-center py-4 px-4">Business</th>
                  <th className="text-center py-4 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <React.Fragment key={category}>
                    <tr>
                      <td colSpan={5} className="pt-6 pb-2 px-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          {category === "Store & Products" && <Store className="w-4 h-4" />}
                          {category === "Payments" && <CreditCard className="w-4 h-4" />}
                          {category === "Analytics" && <BarChart3 className="w-4 h-4" />}
                          {category === "Marketing & Growth" && <Gift className="w-4 h-4" />}
                          {category === "Support" && <HelpCircle className="w-4 h-4" />}
                          {category}
                        </div>
                      </td>
                    </tr>
                    {comparisonFeatures.filter((f) => f.category === category).map((feature, i) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium">{feature.name}</td>
                        <td className="py-3 px-4 text-center">{renderFeatureValue(feature.free)}</td>
                        <td className="py-3 px-4 text-center bg-primary/5">{renderFeatureValue(feature.pro)}</td>
                        <td className="py-3 px-4 text-center">{renderFeatureValue(feature.business)}</td>
                        <td className="py-3 px-4 text-center">{renderFeatureValue(feature.enterprise)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Growth Incentives */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <DottedSurface className="absolute inset-0 opacity-10" />
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="text-center mb-12">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-bold mb-4">Growth Incentives</motion.h2>
            <p className="text-muted-foreground">Earn rewards as your business grows</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "Refer & Earn",
                description: "Refer 3 sellers and get 1 month of Pro plan completely free!",
                reward: "1 Month Pro Free",
                color: "from-purple-500 to-indigo-500",
                bg: "bg-purple-500/20",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Performance Bonus",
                description: "Process UGX 2,000,000+ monthly and unlock a 10% discount.",
                reward: "10% Off Next Plan",
                color: "from-green-500 to-emerald-500",
                bg: "bg-green-500/20",
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Annual Savings",
                description: "Pay yearly and save 20% on any plan. Best value for serious sellers.",
                reward: "20% Annual Discount",
                color: "from-orange-500 to-amber-500",
                bg: "bg-orange-500/20",
              },
            ].map((incentive, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 glass rounded-2xl hover:shadow-elevated transition-all">
                <div className={`w-16 h-16 rounded-2xl ${incentive.bg} flex items-center justify-center mb-4`}>
                  <div className={`bg-gradient-to-br ${incentive.color} bg-clip-text text-transparent`}>
                    {incentive.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{incentive.title}</h3>
                <p className="text-muted-foreground mb-4">{incentive.description}</p>
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${incentive.color} text-white`}>
                  {incentive.reward}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <BackgroundPaths variant="section" className="absolute inset-0" />
        <div className="container mx-auto relative z-10 max-w-3xl">
          <div className="text-center mb-12">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-bold mb-4">Frequently Asked Questions</motion.h2>
            <p className="text-muted-foreground">Everything you need to know</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/30 transition-colors">
                  <span className="font-semibold pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-5 pb-5 text-muted-foreground border-t border-border/50 pt-4">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-indigo-500/10 to-purple-500/10" />
        <HeroMotionBackground className="opacity-50" />
        <div className="container mx-auto relative z-10 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of Ugandan businesses growing with SwiftShopy
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => handleGetStarted("free")}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-medium text-lg hover:scale-105 hover:shadow-xl transition-all shadow-lg flex items-center justify-center gap-2">
                Start Selling Free <ArrowRight className="w-5 h-5" />
              </button>
              <Link href="/login"
                className="w-full sm:w-auto px-8 py-4 glass rounded-xl font-medium text-lg hover:bg-accent/50 transition-all text-center">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-gradient-to-b from-background to-accent/20">
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
                      <a href="#" className="hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2024 SwiftShopy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { Package, Zap, Crown, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Get dynamic plan data for product limits and fees
const usePlanMetadata = () => {
  const activePlans = useQuery(api.plans.getActivePlans) ?? [];
  const metadata: Record<string, { productLimit: number; transactionFee: number }> = {};
  activePlans.forEach((plan: any) => {
    // Match by partial name (e.g., "FREE TRIAL" matches "Free")
    const key = plan.name.toLowerCase().replace(" trial", "").replace(" plan", "").replace(" ", "");
    const freeKey = plan.name.toLowerCase().includes("free") ? "free" : 
                   plan.name.toLowerCase().includes("pro") ? "pro" :
                   plan.name.toLowerCase().includes("business") ? "business" :
                   plan.name.toLowerCase().includes("enterprise") ? "enterprise" : key;
    metadata[freeKey] = {
      productLimit: plan.productLimit,
      transactionFee: plan.transactionFee,
    };
  });
  return metadata;
};

const plans = [
  {
    name: "Free",
    description:
      "Perfect for getting started with online selling. Create your store and accept payments.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Start Free",
    buttonVariant: "outline" as const,
    href: "/signup",
    icon: <Package size={24} />,
    features: [
      { text: "Up to 10 products", icon: <Package size={18} /> },
      { text: "MTN Mobile Money", icon: <Zap size={18} /> },
      { text: "Basic order tracking", icon: <Crown size={18} /> },
    ],
    includes: [
      "Free includes:",
      "WhatsApp order button",
      "Simple dashboard",
      "SwiftShopy branding included",
    ],
  },
  {
    name: "Pro",
    description:
      "Best for growing businesses. Remove branding and unlock advanced analytics.",
    price: 15000,
    yearlyPrice: 144000,
    buttonText: "Upgrade to Pro",
    buttonVariant: "outline" as const,
    href: "/pricing",
    icon: <Zap size={24} />,
    popular: true,
    features: [
      { text: "Up to 25 products", icon: <Package size={18} /> },
      { text: "Custom store link", icon: <Zap size={18} /> },
      { text: "Daily & weekly analytics", icon: <Crown size={18} /> },
    ],
    includes: [
      "Everything in Free, plus:",
      "Remove SwiftShopy branding",
      "Auto payment confirmation",
      "Customer insights",
    ],
  },
  {
    name: "Business",
    description:
      "For established businesses scaling up with advanced features and inventory management.",
    price: 35000,
    yearlyPrice: 336000,
    buttonText: "Get Business",
    buttonVariant: "outline" as const,
    href: "/pricing",
    icon: <Crown size={24} />,
    features: [
      { text: "50-75 products", icon: <Package size={18} /> },
      { text: "Inventory management", icon: <Zap size={18} /> },
      { text: "Advanced analytics", icon: <Crown size={18} /> },
    ],
    includes: [
      "Everything in Pro, plus:",
      "Discount & coupon system",
      "Bulk product upload",
      "Custom branding (logo, colors)",
    ],
  },
];

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
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-full glass border border-border p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit sm:h-12 cursor-pointer h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
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
          className={cn(
            "relative z-10 w-fit cursor-pointer sm:h-12 h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
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

export default function PricingSectionNew() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Get product limits and transaction fees from database
  const planMetadata = usePlanMetadata();

  // Merge metadata into static plans
  const getPlanKey = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("free")) return "free";
    if (n.includes("pro")) return "pro";
    if (n.includes("business")) return "business";
    if (n.includes("enterprise")) return "enterprise";
    return n;
  };
  
  const plansWithMeta = plans.map((plan) => {
    const key = getPlanKey(plan.name);
    const meta = planMetadata[key];
    return meta ? { ...plan, ...meta } : plan;
  });

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
    setIsYearly(Number.parseInt(value) === 1);

  const formatPrice = (price: number) => {
    if (price === 0) return "UGX 0";
    return `UGX ${price.toLocaleString()}`;
  };

  return (
    <section
      id="pricing"
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      ref={pricingRef}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <article className="flex sm:flex-row flex-col sm:pb-12 pb-8 sm:items-center items-start justify-between">
          <div className="text-left mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Simple Pricing</span>
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.15}
                staggerFrom="first"
                reverse={true}
                containerClassName="justify-start"
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 40,
                  delay: 0,
                }}
              >
                Plans & Pricing
              </VerticalCutReveal>
            </h2>

            <TimelineContent
              as="div"
              animationNum={0}
              timelineRef={pricingRef}
              customVariants={revealVariants}
              className="text-muted-foreground text-lg max-w-xl"
            >
              <p>Choose the plan that fits your business. Start free, upgrade as you grow. No hidden fees.</p>
            </TimelineContent>
          </div>

          <TimelineContent
            as="div"
            animationNum={1}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <PricingSwitch onSwitch={togglePricingPeriod} className="shrink-0" />
          </TimelineContent>
        </article>

        <TimelineContent
          as="div"
          animationNum={2}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="grid md:grid-cols-3 gap-6 mx-auto"
        >
          {plansWithMeta.map((plan, index) => (
            <TimelineContent
              as="div"
              key={plan.name}
              animationNum={index + 3}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <Card
                className={`relative flex-col flex justify-between h-full transition-all duration-300 ${
                  plan.popular
                    ? "scale-105 ring-2 ring-primary bg-gradient-to-b from-primary/20 via-primary/10 to-transparent border-primary shadow-xl shadow-primary/20"
                    : "glass hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-2 pb-4">
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-primary to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${plan.popular ? "text-foreground" : ""}`}>
                        {plan.price === 0 ? (
                          "Free"
                        ) : (
                          <>
                            <span className="text-lg">UGX </span>
                            <NumberFlow
                              value={isYearly ? plan.yearlyPrice : plan.price}
                              className="text-4xl font-bold"
                            />
                          </>
                        )}
                      </span>
                      {plan.price !== 0 && (
                        <span className={plan.popular ? "text-muted-foreground" : "text-muted-foreground"}>
                          /{isYearly ? "year" : "month"}
                        </span>
                      )}
                    </div>
                    {plan.productLimit !== undefined && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Products: {plan.productLimit === -1 ? "Unlimited" : plan.productLimit}</span>
                        <span>Fee: {plan.transactionFee}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.popular ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground"
                    }`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  
                  <p className={`text-sm mb-6 ${plan.popular ? "text-muted-foreground" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <h4 className="font-semibold text-sm">
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-3">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <span className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                            plan.popular 
                              ? "bg-primary/20 text-primary" 
                              : "bg-green-500/20 text-green-500"
                          }`}>
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/50">
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm">
                          <span className="text-primary">{feature.icon}</span>
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                
                <CardFooter className="p-6 pt-0">
                  <button
                    onClick={() => router.push(plan.href)}
                    className={`w-full py-4 rounded-xl font-semibold transition-all hover:scale-105 ${
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 hover:shadow-xl"
                        : "glass hover:bg-accent/50 border border-border"
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </CardFooter>
              </Card>
            </TimelineContent>
          ))}
        </TimelineContent>

        {/* Trust badges */}
        <TimelineContent
          as="div"
          animationNum={7}
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
          <p className="mt-4 text-muted-foreground">
            All prices are in UGX. Transaction fees apply per plan.
          </p>
        </TimelineContent>
      </div>
    </section>
  );
}

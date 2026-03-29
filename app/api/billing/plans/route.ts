import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      price: 0,
      productLimit: 10,
      transactionFee: 4,
      features: [
        "Up to 10 products",
        "4% transaction fee",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: 15000,
      productLimit: 25,
      transactionFee: 2.5,
      features: [
        "Up to 25 products",
        "2.5% transaction fee",
        "Advanced analytics",
        "WhatsApp integration",
        "Priority email support",
      ],
    },
    {
      id: "business",
      name: "Business Plan",
      price: 35000,
      productLimit: 38,
      transactionFee: 1.5,
      features: [
        "Up to 38 products",
        "1.5% transaction fee",
        "Advanced analytics",
        "WhatsApp integration",
        "Bulk product import",
        "Priority support",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: 60000,
      productLimit: "Unlimited",
      transactionFee: 1,
      features: [
        "Unlimited products",
        "1% transaction fee",
        "Full analytics suite",
        "WhatsApp integration",
        "Bulk product import/export",
        "Dedicated support",
        "API access",
      ],
    },
  ];

  if (userId) {
    try {
      const billingInfo = await convex.query(api.billing.getUserBillingInfo, { userId: userId as any });
      const discountInfo = await convex.query(api.billing.checkUsageDiscountEligibility, { userId: userId as any });
      
      return NextResponse.json({
        plans,
        userInfo: {
          currentPlan: billingInfo.plan,
          status: billingInfo.status,
          daysRemaining: billingInfo.daysRemaining,
          productCount: billingInfo.productCount,
          productLimit: billingInfo.productLimit,
          discountEligible: discountInfo.eligible,
          discountPercentage: discountInfo.discountPercentage,
        },
      });
    } catch (error) {
      return NextResponse.json({ plans, userInfo: null });
    }
  }

  return NextResponse.json({ plans });
}

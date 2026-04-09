import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { CreatePaymentSchema } from "@/types";
import { rateLimit } from "@/lib/rate-limit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

const MTN_BASE_URL = process.env.MTN_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com";
const MTN_API_USER_ID = process.env.MTN_API_USER_ID ?? "";
const MTN_API_KEY = process.env.MTN_API_KEY ?? "";
const MTN_ENVIRONMENT = process.env.MTN_ENVIRONMENT ?? "sandbox";

async function getMtnAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${MTN_API_USER_ID}:${MTN_API_KEY}`).toString("base64");
  
  const response = await fetch(`${MTN_BASE_URL}/collection/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get MTN access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

interface CreatePaymentRequest {
  userId: string;
  plan: "pro" | "business" | "enterprise";
  phone: string;
  provider?: "mtn_momo" | "airtel_money";
}

export async function POST(req: NextRequest) {
  // Apply rate limiting - 5 subscription requests per minute
  const rateLimitResult = rateLimit(req, 5, 60000);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
        }
      }
    );
  }
  
  try {
    const body = await req.json();
    
    // Validate input with Zod
    const validation = CreatePaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.error.errors.map(e => ({ field: e.path.join("."), message: e.message }))
      }, { status: 400 });
    }
    
    const { userId, plan, phone, provider = "mtn_momo" } = validation.data;

    const planPrices: Record<string, number> = {
      pro: 15000,
      business: 35000,
      enterprise: 60000,
    };

    const amount = planPrices[plan];
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const discountInfo = await convex.query(api.billing.checkUsageDiscountEligibility, { userId: userId as any });
    let finalAmount = amount;
    if (discountInfo.eligible) {
      finalAmount = amount * 0.9;
    }

    const externalRef = `SUB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const paymentId = await convex.mutation(api.payments.createPayment, {
      userId: userId as any,
      amount: finalAmount,
      currency: "UGX",
      phone,
      plan,
      provider,
      externalRef,
    });

    if (provider === "mtn_momo") {
      try {
        const accessToken = await getMtnAccessToken();

        const paymentRequest = {
          amount: finalAmount.toString(),
          currency: "UGX",
          externalId: externalRef,
          payer: {
            partyIdType: "MSISDN",
            partyId: phone.replace("+", ""),
          },
          payerMessage: `SwiftShopy ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
          payeeNote: `SwiftShopy subscription payment`,
        };

        const paymentResponse = await fetch(
          `${MTN_BASE_URL}/collection/v2/paymentrequests`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "X-Reference-Id": externalRef,
              "X-Target-Environment": MTN_ENVIRONMENT,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentRequest),
          }
        );

        if (!paymentResponse.ok) {
          const errorText = await paymentResponse.text();
          console.error("[MTN Payment] Failed:", errorText);
          await convex.mutation(api.payments.updatePaymentStatus, {
            id: paymentId,
            status: "failed",
            failureReason: `MTN API error: ${errorText}`,
          });
          return NextResponse.json(
            { error: "Failed to initiate payment", details: errorText },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          paymentId,
          externalRef,
          amount: finalAmount,
          status: "pending",
          message: "Payment request sent. Please approve on your phone.",
        });
      } catch (mtnError) {
        console.error("[MTN Payment] Error:", mtnError);
        await convex.mutation(api.payments.updatePaymentStatus, {
          id: paymentId,
          status: "failed",
          failureReason: mtnError instanceof Error ? mtnError.message : "Unknown error",
        });
        return NextResponse.json(
          { error: "Failed to process payment", details: mtnError instanceof Error ? mtnError.message : "Unknown error" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      paymentId,
      externalRef,
      amount: finalAmount,
      status: "pending",
      message: "Payment initiated",
    });
  } catch (err) {
    console.error("[Billing API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "SwiftShopy Billing API",
    status: "active",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}

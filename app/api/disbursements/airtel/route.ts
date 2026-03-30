import { NextRequest, NextResponse } from "next/server";

/**
 * Airtel Money Disbursement API
 * Transfers funds to seller Airtel Money accounts
 * Docs: https://www.airtel.africa/developers/
 */

const ENVIRONMENT = process.env.MTN_ENVIRONMENT ?? "sandbox";
const IS_SANDBOX = ENVIRONMENT === "sandbox";

const AIRTEL_BASE_URL = IS_SANDBOX
  ? (process.env.AIRTEL_SANDBOX_BASE_URL ?? "https://openapiuat.airtel.africa")
  : (process.env.AIRTEL_PRODUCTION_BASE_URL ?? "https://openapi.airtel.africa");

const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID ?? "";
const AIRTEL_CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET ?? "";

interface AirtelDisbursementRequest {
  payee: {
    msisdn: string;
  };
  reference: string;
  pin: string;
  transaction: {
    amount: number;
    country: string;
    currency: string;
    id: string;
  };
}

async function getAccessToken(): Promise<string> {
  if (!AIRTEL_CLIENT_ID || !AIRTEL_CLIENT_SECRET) {
    throw new Error("Airtel API credentials not configured");
  }

  const res = await fetch(`${AIRTEL_BASE_URL}/auth/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: AIRTEL_CLIENT_ID,
      client_secret: AIRTEL_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtel Token Error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ─── POST: Initiate Disbursement ───────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, externalId, phone, payeeNote } = body;

    if (!amount || !externalId || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: amount, externalId, phone" },
        { status: 400 }
      );
    }

    // Normalize phone number (Airtel Uganda prefixes: 070, 075)
    const normalizedPhone = phone.startsWith("256") ? phone : `256${phone.replace(/^0/, "")}`;

    const token = await getAccessToken();
    const transactionId = crypto.randomUUID();

    const payload: AirtelDisbursementRequest = {
      payee: {
        msisdn: normalizedPhone,
      },
      reference: externalId,
      pin: "0000", // Sandbox PIN
      transaction: {
        amount: Number(amount),
        country: "UG",
        currency: currency ?? "UGX",
        id: transactionId,
      },
    };

    console.log("[Airtel Disbursement] Sending:", { transactionId, amount, phone: normalizedPhone });

    const res = await fetch(`${AIRTEL_BASE_URL}/standard/v2/disbursements/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Country": "UG",
        "X-Currency": currency ?? "UGX",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[Airtel Disbursement] Failed:", data);
      return NextResponse.json(
        { error: data.message || "Airtel API error", transactionId },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      referenceId: transactionId,
      airtelRef: data.data?.transaction?.id,
      message: "Disbursement initiated successfully",
    });
  } catch (error: any) {
    console.error("[Airtel Disbursement] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process disbursement" },
      { status: 500 }
    );
  }
}

// ─── GET: Check Disbursement Status ────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { error: "Missing transactionId parameter" },
        { status: 400 }
      );
    }

    const token = await getAccessToken();

    const res = await fetch(
      `${AIRTEL_BASE_URL}/standard/v2/disbursements/${transactionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Country": "UG",
          "X-Currency": "UGX",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Status check failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      status: data.data?.transaction?.status,
      reference: data.data?.transaction?.airtel_money_id,
    });
  } catch (error: any) {
    console.error("[Airtel Disbursement Status] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check status" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

/**
 * MTN MoMo Disbursement API
 * Transfers funds to seller mobile money accounts
 * Docs: https://momodeveloper.mtn.com/
 */

const ENVIRONMENT = process.env.MTN_ENVIRONMENT ?? "sandbox";
const IS_SANDBOX = ENVIRONMENT === "sandbox";

const MTN_BASE_URL = IS_SANDBOX
  ? (process.env.MTN_SANDBOX_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com")
  : (process.env.MTN_PRODUCTION_BASE_URL ?? "https://api.momodeveloper.mtn.com");

const MTN_DISBURSEMENTS_KEY = IS_SANDBOX
  ? (process.env.MTN_SANDBOX_DISBURSEMENTS_KEY ?? "")
  : (process.env.MTN_PRODUCTION_DISBURSEMENTS_KEY ?? "");

const MTN_API_USER_ID = IS_SANDBOX
  ? (process.env.MTN_SANDBOX_API_USER_ID ?? "")
  : (process.env.MTN_PRODUCTION_API_USER_ID ?? "");

const MTN_API_KEY = IS_SANDBOX
  ? (process.env.MTN_SANDBOX_API_KEY ?? "")
  : (process.env.MTN_PRODUCTION_API_KEY ?? "");

const MTN_CALLBACK_URL = process.env.MTN_CALLBACK_URL ?? "";
const MTN_TARGET_ENV = IS_SANDBOX ? "sandbox" : "mtnuganda";

interface DisbursementRequest {
  amount: string;
  currency: string;
  externalId: string;
  payee: {
    partyIdType: "MSISDN";
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
}

async function getAccessToken(): Promise<string> {
  if (!MTN_API_USER_ID || !MTN_API_KEY) {
    throw new Error("MTN API credentials not configured");
  }

  const credentials = Buffer.from(`${MTN_API_USER_ID}:${MTN_API_KEY}`).toString("base64");

  const res = await fetch(`${MTN_BASE_URL}/disbursement/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": MTN_DISBURSEMENTS_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MTN Disbursement Token Error (${res.status}): ${text}`);
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

    // Normalize phone number
    const normalizedPhone = phone.startsWith("256") ? phone : `256${phone.replace(/^0/, "")}`;

    const token = await getAccessToken();
    const referenceId = crypto.randomUUID();

    const payload: DisbursementRequest = {
      amount: String(amount),
      currency: currency ?? "UGX",
      externalId,
      payee: {
        partyIdType: "MSISDN",
        partyId: normalizedPhone,
      },
      payerMessage: payeeNote ?? "SwiftShopy Payout",
      payeeNote: payeeNote ?? "Seller payout from SwiftShopy",
    };

    console.log("[MTN Disbursement] Sending:", { referenceId, amount, phone: normalizedPhone });

    const res = await fetch(`${MTN_BASE_URL}/disbursement/v1_0/transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": MTN_TARGET_ENV,
        "X-Callback-Url": MTN_CALLBACK_URL,
        "Ocp-Apim-Subscription-Key": MTN_DISBURSEMENTS_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok && res.status !== 202) {
      const text = await res.text();
      console.error("[MTN Disbursement] Failed:", text);
      return NextResponse.json(
        { error: `MTN API error: ${text}`, referenceId },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      referenceId,
      message: "Disbursement initiated successfully",
    });
  } catch (error: any) {
    console.error("[MTN Disbursement] Error:", error);
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
    const referenceId = searchParams.get("referenceId");

    if (!referenceId) {
      return NextResponse.json(
        { error: "Missing referenceId parameter" },
        { status: 400 }
      );
    }

    const token = await getAccessToken();

    const res = await fetch(
      `${MTN_BASE_URL}/disbursement/v1_0/transfer/${referenceId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": MTN_TARGET_ENV,
          "Ocp-Apim-Subscription-Key": MTN_DISBURSEMENTS_KEY,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Status check failed: ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      status: data.status,
      financialTransactionId: data.financialTransactionId,
      reason: data.reason,
    });
  } catch (error: any) {
    console.error("[MTN Disbursement Status] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check status" },
      { status: 500 }
    );
  }
}

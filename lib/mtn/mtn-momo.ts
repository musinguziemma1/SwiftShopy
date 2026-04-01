/**
 * MTN Mobile Money (MoMo) API Integration
 * Uganda — Collections API (Request to Pay)
 *
 * Docs: https://momodeveloper.mtn.com/
 * Sandbox base URL: https://sandbox.momodeveloper.mtn.com
 */

// Determine environment and load correct credentials
const ENVIRONMENT = process.env.MTN_ENVIRONMENT ?? "sandbox";
const IS_SANDBOX = ENVIRONMENT === "sandbox";

// Load credentials based on environment
const MTN_BASE_URL = IS_SANDBOX
  ? (process.env.MTN_SANDBOX_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com")
  : (process.env.MTN_PRODUCTION_BASE_URL ?? "https://api.momodeveloper.mtn.com");

const MTN_COLLECTIONS_PRIMARY_KEY = IS_SANDBOX
  ? (process.env.MTN_SANDBOX_COLLECTIONS_KEY ?? "")
  : (process.env.MTN_PRODUCTION_COLLECTIONS_KEY ?? "");

const MTN_DISBURSEMENTS_PRIMARY_KEY = IS_SANDBOX
  ? (process.env.MTN_SANDBOX_DISBURSEMENTS_KEY ?? "")
  : (process.env.MTN_PRODUCTION_DISBURSEMENTS_KEY ?? "");

const MTN_API_USER_ID = IS_SANDBOX
  ? (process.env.MTN_SANDBOX_API_USER_ID ?? "")
  : (process.env.MTN_PRODUCTION_API_USER_ID ?? "");

const MTN_API_KEY = IS_SANDBOX
  ? (process.env.MTN_SANDBOX_API_KEY ?? "")
  : (process.env.MTN_PRODUCTION_API_KEY ?? "");

const MTN_CALLBACK_URL = process.env.MTN_CALLBACK_URL ?? "https://swiftshopy.com/api/webhooks/mtn";
const MTN_TARGET_ENV = IS_SANDBOX ? "sandbox" : "mtnuganda";

// Debug logging (remove in production)
console.log("[MTN Config]", {
  environment: ENVIRONMENT,
  baseUrl: MTN_BASE_URL,
  hasCollectionsKey: !!MTN_COLLECTIONS_PRIMARY_KEY,
  hasApiUserId: !!MTN_API_USER_ID,
  hasApiKey: !!MTN_API_KEY,
});

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface MoMoRequestToPayPayload {
  amount: string;           // e.g. "5000"
  currency: string;         // "UGX"
  externalId: string;       // Your order ID
  partyId: string;          // Customer's MSISDN (e.g. "256700123456")
  partyIdType: "MSISDN";
  payerMessage: string;     // Shown to the customer on their phone
  payeeNote: string;        // Internal note
}

export interface MoMoTransactionStatus {
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  financialTransactionId?: string;
  externalId: string;
  amount: string;
  currency: string;
  payer: { partyIdType: string; partyId: string };
  reason?: string;
}

export interface MoMoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ────────────────────────────────────────────
// Core API Functions
// ────────────────────────────────────────────

/**
 * Initiates a "Request to Pay" (Collections) transaction.
 * Returns the referenceId (UUID) which can be used to check the status.
 */
export async function requestToPay(payload: MoMoRequestToPayPayload): Promise<string> {
  const token = await getAccessToken();
  const referenceId = generateUUID();

  const body = {
    amount: payload.amount,
    currency: payload.currency,
    externalId: payload.externalId,
    payer: {
      partyIdType: payload.partyIdType,
      partyId: payload.partyId,
    },
    payerMessage: payload.payerMessage,
    payeeNote: payload.payeeNote,
  };

  const res = await fetch(`${MTN_BASE_URL}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": MTN_TARGET_ENV,
      "X-Callback-Url": MTN_CALLBACK_URL,
      "Ocp-Apim-Subscription-Key": MTN_COLLECTIONS_PRIMARY_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MTN Request to Pay Error (${res.status}): ${text}`);
  }

  // 202 Accepted means the request was initiated successfully
  return referenceId;
}

/**
 * Gets the status of a previously initiated Request to Pay transaction.
 */
export async function getTransactionStatus(referenceId: string): Promise<MoMoTransactionStatus> {
  const token = await getAccessToken();

  const res = await fetch(
    `${MTN_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": MTN_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": MTN_COLLECTIONS_PRIMARY_KEY,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MTN Status Check Error (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Gets the account balance for the collections wallet.
 */
export async function getAccountBalance(): Promise<{ availableBalance: string; currency: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${MTN_BASE_URL}/collection/v1_0/account/balance`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Target-Environment": MTN_TARGET_ENV,
      "Ocp-Apim-Subscription-Key": MTN_COLLECTIONS_PRIMARY_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MTN Balance Error (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Normalizes a Uganda phone number to international MSISDN format.
 * e.g. "0700123456" → "256700123456"
 *      "+256700123456" → "256700123456"
 *      "256700123456" → "256700123456"
 */
export function normalizeUgandaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("256")) return digits;
  if (digits.startsWith("0")) return `256${digits.slice(1)}`;
  return `256${digits}`;
}

/**
 * Validates that a number is a valid MTN Uganda MSISDN.
 * MTN Uganda prefixes: 076, 077, 078, 039
 */
export function isMtnUgandaNumber(phone: string): boolean {
  const msisdn = normalizeUgandaPhone(phone);
  const mtnPrefixes = ["25676", "25677", "25678", "25639"];
  return mtnPrefixes.some((prefix) => msisdn.startsWith(prefix));
}

/**
 * Get current configuration status
 */
export function getConfigStatus() {
  return {
    environment: ENVIRONMENT,
    baseUrl: MTN_BASE_URL,
    isConfigured: !!(MTN_API_USER_ID && MTN_API_KEY && MTN_COLLECTIONS_PRIMARY_KEY),
    hasCollectionsKey: !!MTN_COLLECTIONS_PRIMARY_KEY,
    hasDisbursementsKey: !!MTN_DISBURSEMENTS_PRIMARY_KEY,
    hasApiUserId: !!MTN_API_USER_ID,
    hasApiKey: !!MTN_API_KEY,
  };
}
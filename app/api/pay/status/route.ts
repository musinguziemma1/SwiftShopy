/**
 * GET /api/pay/status?referenceId=xxx
 * Polls the status of an MTN MoMo Request to Pay transaction.
 *
 * Returns: { status: "PENDING" | "SUCCESSFUL" | "FAILED", financialTransactionId?, reason? }
 */

import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/mtn/mtn-momo";

export async function GET(req: NextRequest) {
  const referenceId = req.nextUrl.searchParams.get("referenceId");

  if (!referenceId) {
    return NextResponse.json({ error: "referenceId query param is required." }, { status: 400 });
  }

  try {
    const result = await getTransactionStatus(referenceId);

    return NextResponse.json({
      status: result.status,
      financialTransactionId: result.financialTransactionId ?? null,
      externalId: result.externalId,
      amount: result.amount,
      currency: result.currency,
      reason: result.reason ?? null,
    });
  } catch (err: unknown) {
    console.error("[/api/pay/status] Error:", err);
    const message = err instanceof Error ? err.message : "Status check failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

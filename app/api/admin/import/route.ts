import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { requireAdmin } from "@/lib/api-auth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const { type, action, ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    let successCount = 0;
    let failedCount = 0;

    for (const id of ids) {
      try {
        switch (type) {
          case "sellers":
          case "users": {
            if (action === "approve") {
              await convex.mutation(api.users.toggleActive, { id: id as any, isActive: true });
            } else if (action === "suspend") {
              await convex.mutation(api.users.toggleActive, { id: id as any, isActive: false });
            }
            break;
          }
          case "products": {
            if (action === "activate") {
              await convex.mutation(api.products.toggleActive, { id: id as any, isActive: true });
            } else if (action === "deactivate") {
              await convex.mutation(api.products.toggleActive, { id: id as any, isActive: false });
            } else if (action === "delete") {
              await convex.mutation(api.products.remove, { id: id as any });
            }
            break;
          }
          case "orders": {
            if (action === "cancel") {
              await convex.mutation(api.orders.updateStatus, { id: id as any, status: "cancelled" });
            } else if (action === "paid") {
              await convex.mutation(api.orders.updateStatus, { id: id as any, status: "paid" });
            }
            break;
          }
          default:
            throw new Error(`Unknown type: ${type}`);
        }
        results.push({ id, success: true });
        successCount++;
      } catch (e) {
        results.push({ id, success: false, error: e instanceof Error ? e.message : "Unknown error" });
        failedCount++;
      }
    }

    return NextResponse.json({
      type,
      action,
      totalCount: ids.length,
      successCount,
      failedCount,
      results,
      executedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[api/admin/import] Error:", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

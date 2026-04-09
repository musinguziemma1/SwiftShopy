import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { rateLimit } from "@/lib/rate-limit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  try {
    const orders = await convex.query("orders:list" as any);
    const allOrders = orders.slice(0, 100).map((o: any) => ({
      ...o,
      _id: o._id.toString(),
    }));

    const stats = {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter((o: any) => o.status === "pending").length,
      paidOrders: allOrders.filter((o: any) => o.status === "paid").length,
      totalRevenue: allOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
    };

    return NextResponse.json({ orders: allOrders, stats });
  } catch (err: any) {
    console.error("Get admin orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 30, 60000);
  if (rateLimitResult.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const { orderId, status, deliveryStatus, paymentStatus } = body;

    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

    await convex.mutation("orders:updateStatus" as any, {
      id: orderId,
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      deliveryStatus: deliveryStatus || undefined,
    });

    return NextResponse.json({ success: true, message: "Order updated" });
  } catch (err: any) {
    console.error("Update order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
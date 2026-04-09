import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId");
  const admin = searchParams.get("admin");

  try {
    if (admin === "true") {
      const orders = await convex.query("orders:list" as any);
      return NextResponse.json({ 
        orders: orders.slice(0, 100).map((o: any) => ({ ...o, _id: o._id.toString() }))
      });
    }

    if (sellerId) {
      const stores = await convex.query("stores:list" as any);
      const sellerStores = stores.filter((s: any) => s.userId === sellerId);
      
      const allOrders: any[] = [];
      for (const store of sellerStores) {
        const orders = await convex.query("orders:getByStore" as any, { storeId: store._id, limit: 50 });
        allOrders.push(...orders);
      }

      return NextResponse.json({ 
        orders: allOrders.map((o: any) => ({ ...o, _id: o._id.toString() }))
      });
    }

    return NextResponse.json({ error: "sellerId or admin=true required" }, { status: 400 });
  } catch (err: any) {
    console.error("Get orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
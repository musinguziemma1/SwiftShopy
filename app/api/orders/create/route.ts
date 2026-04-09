import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { rateLimit } from "@/lib/rate-limit";
import { requestToPay, normalizeUgandaPhone, isMtnUgandaNumber } from "@/lib/mtn/mtn-momo";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function generateTrackingNumber(): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TRK-${random}`;
}

async function sendConfirmations(orderNumber: string, trackingNumber: string, total: number, customerEmail: string | null, customerPhone: string | null, items: any[], now: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  if (customerPhone) {
    try {
      const phone = customerPhone.replace(/\D/g, "");
      await fetch(`${appUrl}/api/notify/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          message: `*SwiftShopy Order Confirmed!*\n\n📦 Order: ${orderNumber}\n🔍 Tracking: ${trackingNumber}\n💰 Total: UGX ${total.toLocaleString()}\n\nTrack: ${appUrl}/track?${trackingNumber}`,
        }),
      });
    } catch (e) { console.log("WhatsApp error:", e); }
  }

  if (customerEmail) {
    try {
      const itemsHTML = items.map((item: any) => 
        `<tr><td>${item.productName || item.name}</td><td>${item.quantity}</td><td>UGX ${item.price}</td><td>UGX ${item.price * item.quantity}</td></tr>`
      ).join('');

      const invoiceHTML = `<html><body style="font-family: Arial; max-width: 600px;">
  <h2>SwiftShopy - Order Confirmed</h2>
  <p>Order: ${orderNumber} | Tracking: ${trackingNumber}</p>
  <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${itemsHTML}</tbody></table>
  <p><strong>Total: UGX ${total.toLocaleString()}</strong></p>
  <p>Track: ${appUrl}/track?${trackingNumber}</p>
</body></html>`;

      await fetch(`${appUrl}/api/notify/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: customerEmail, subject: `Order ${orderNumber} Confirmed`, html: invoiceHTML }),
      });
    } catch (e) { console.log("Email error:", e); }
  }
}

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 20, 60000);
  if (rateLimitResult.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const { items, customerName, customerPhone, customerEmail, shippingAddress, paymentMethod = "mtn_momo" } = body;

    if (!items?.length) return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    if (!customerName || !customerPhone) return NextResponse.json({ error: "Name and phone required" }, { status: 400 });

    const now = Date.now();
    const orderNumber = generateOrderNumber();
    const trackingNumber = generateTrackingNumber();
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // For now, create a single order for the first item's store (simplified)
    const firstItem = items[0];
    const storeId = firstItem?.storeId || "default";

    // Using convex.mutation with string reference
    const orderId = await convex.mutation("orders:create" as any, {
      storeId,
      orderNumber,
      trackingNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      shippingAddress: shippingAddress || undefined,
      items: items.map((item: any) => ({
        productId: item.productId || item.id,
        productName: item.productName || item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      subtotal: total,
      total,
      status: "pending",
      paymentMethod,
      paymentStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Create tracking
    try {
      await convex.mutation("order_tracking:create" as any, {
        orderId,
        storeId,
        sellerId: firstItem?.sellerId || "",
        status: "pending",
        trackingHistory: [{ status: "pending", description: "Order placed", timestamp: now }],
        createdAt: now,
        updatedAt: now,
      });
    } catch (e) { console.log("Tracking error:", e); }

    // Send confirmations
    if (customerEmail || customerPhone) {
      setTimeout(() => sendConfirmations(orderNumber, trackingNumber, total, customerEmail, customerPhone, items, now), 2000);
    }

    return NextResponse.json({ 
      success: true, 
      orderId,
      orderNumber,
      trackingNumber,
      total,
      status: "pending",
      paymentMethod,
      paymentStatus: "pending",
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      items: items.map((item: any) => ({ productId: item.productId || item.id, productName: item.productName || item.name, price: item.price, quantity: item.quantity, total: item.price * item.quantity })),
      createdAt: now,
      message: "Order created!"
    });
  } catch (err: any) {
    console.error("Order error:", err);
    return NextResponse.json({ error: err.message || "Order failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  const tracking = searchParams.get("tracking");

  try {
    let order;
    if (orderNumber) {
      order = await convex.query("orders:getByOrderNumber" as any, { orderNumber });
    } else if (tracking) {
      const orders = await convex.query("orders:list" as any);
      order = orders.find((o: any) => o.trackingNumber === tracking);
    }

    if (order) {
      return NextResponse.json({ order: { ...order, _id: order._id.toString() } });
    }
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  } catch (err: any) {
    console.error("Get orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
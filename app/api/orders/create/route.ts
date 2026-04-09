import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function generateTrackingNumber(): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TRK-${random}`;
}

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 20, 60000);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await req.json();
    const { 
      items, 
      customerName, 
      customerPhone, 
      customerEmail, 
      shippingAddress,
      paymentMethod = "mtn_momo" 
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart." }, { status: 400 });
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: "Customer name and phone are required." }, { status: 400 });
    }

    const now = Date.now();
    const orderNumber = generateOrderNumber();
    const trackingNumber = generateTrackingNumber();

    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => 
      sum + (item.price * item.quantity), 0);
    const total = subtotal;

    return NextResponse.json({
      success: true,
      orderId: orderNumber,
      orderNumber,
      trackingNumber,
      total,
      status: "pending",
      message: "Order created. Payment processing available.",
    });
  } catch (err: unknown) {
    console.error("[/api/orders/create] Error:", err);
    const message = err instanceof Error ? err.message : "Order creation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    orders: [],
    message: "Use order number or tracking number to search. This is a demo endpoint."
  });
}
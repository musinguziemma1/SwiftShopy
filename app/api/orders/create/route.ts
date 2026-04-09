import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { requestToPay, normalizeUgandaPhone, isMtnUgandaNumber } from "@/lib/mtn/mtn-momo";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function generateTrackingNumber(): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TRK-${random}`;
}

async function sendConfirmations(orderNumber: string, trackingNumber: string, total: number, customerEmail: string | null, customerPhone: string | null, items: any[], now: number, storeIds: string[]) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  // Send WhatsApp to customer
  if (customerPhone) {
    try {
      const phone = customerPhone.replace(/\D/g, "");
      await fetch(`${appUrl}/api/notify/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          message: `*SwiftShopy Order Confirmed!*\n\n📦 Order: ${orderNumber}\n🔍 Tracking: ${trackingNumber}\n💰 Total: UGX ${total.toLocaleString()}\n\nTrack: ${appUrl}/track?${trackingNumber}\n\nThank you!`,
        }),
      });
    } catch (e) { console.log("WhatsApp error:", e); }
  }

  // Send Email with invoice to customer
  if (customerEmail) {
    try {
      const itemsHTML = items.map((item: any) => 
        `<tr><td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName || item.name}</td><td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td><td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">UGX ${item.price.toLocaleString()}</td><td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">UGX ${(item.price * item.quantity).toLocaleString()}</td></tr>`
      ).join('');

      const invoiceHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #6b21a8;">🛒 SwiftShopy</h1><p style="color: #666;">ORDER CONFIRMATION</p></div>
  <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
    <p><strong>Order #:</strong> ${orderNumber}</p><p><strong>Tracking #:</strong> ${trackingNumber}</p><p><strong>Date:</strong> ${new Date(now).toLocaleDateString()}</p></div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;"><thead><tr style="background: #6b21a8; color: white;"><th style="padding: 12px; text-align: left;">Item</th><th style="padding: 12px;">Qty</th><th style="padding: 12px; text-align: right;">Price</th><th style="padding: 12px; text-align: right;">Total</th></tr></thead><tbody>${itemsHTML}</tbody></table>
  <div style="text-align: right; font-size: 24px; margin-bottom: 30px; color: #6b21a8;"><strong>Total: UGX ${total.toLocaleString()}</strong></div>
  <div style="text-align: center; padding: 20px; border-top: 2px solid #6b21a8;">
    <p>📍 Track: ${appUrl}/track?${trackingNumber}</p><p>💬 Questions? Reply to this email</p><p>🙏 Thank you for shopping with SwiftShopy!</p></div>
</body></html>`.trim();

      await fetch(`${appUrl}/api/notify/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: customerEmail, subject: `Order ${orderNumber} Confirmed - UGX ${total.toLocaleString()}`, html: invoiceHTML }),
      });
    } catch (e) { console.log("Email error:", e); }
  }

  // Notify sellers (by storing their store IDs for their dashboard)
  for (const storeId of storeIds) {
    console.log(`📢 Notifying seller of store ${storeId} about order ${orderNumber}`);
  }

  // Notify admin
  try {
    await fetch(`${appUrl}/api/notify/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "admin",
        message: `🛒 *New Order!*\n\nOrder: ${orderNumber}\nCustomer: ${customerPhone}\nTotal: UGX ${total.toLocaleString()}\nItems: ${items.length}\nSellers: ${storeIds.length}`,
      }),
    });
  } catch (e) { console.log("Admin notification error:", e); }
}

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req, 20, 60000);
  if (rateLimitResult.limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { items, customerName, customerPhone, customerEmail, shippingAddress, paymentMethod = "mtn_momo" } = body;

    if (!items?.length) return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    if (!customerName || !customerPhone) return NextResponse.json({ error: "Name and phone required" }, { status: 400 });

    const now = Date.now();
    const orderNumber = generateOrderNumber();
    const trackingNumber = generateTrackingNumber();
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Group items by store for multi-seller orders
    const storeMap = new Map<string, { items: any[], sellerId: string }>();
    for (const item of items) {
      const storeId = item.storeId || "default";
      if (!storeMap.has(storeId)) {
        storeMap.set(storeId, { items: [], sellerId: item.sellerId || "" });
      }
      storeMap.get(storeId)!.items.push(item);
    }
    const storeIds = Array.from(storeMap.keys());

    // Create order data
    const orderData = {
      orderId: `ord_${now}`,
      orderNumber,
      trackingNumber,
      total,
      subtotal: total,
      status: "pending" as const,
      paymentMethod,
      paymentStatus: "pending" as const,
      deliveryStatus: "pending" as const,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      shippingAddress: shippingAddress || null,
      items: items.map((item: any) => ({
        productId: item.productId || item.id,
        productName: item.productName || item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        storeId: item.storeId,
        sellerId: item.sellerId,
      })),
      sellerIds: storeIds.map(id => storeMap.get(id)!.sellerId),
      storeIds,
      createdAt: now,
      updatedAt: now,
    };

    // Store in memory
    if (!global.orderStorage) global.orderStorage = new Map();
    global.orderStorage.set(orderNumber, orderData);
    global.orderStorage.set(trackingNumber, orderData);

    // Also store by seller ID for their dashboard
    for (const storeId of storeIds) {
      if (!global.sellerOrders) global.sellerOrders = new Map();
      const sellerId = storeMap.get(storeId)!.sellerId;
      if (sellerId) {
        if (!global.sellerOrders.has(sellerId)) global.sellerOrders.set(sellerId, []);
        global.sellerOrders.get(sellerId)!.push(orderData);
      }
    }

    // Store for admin dashboard
    if (!global.allOrders) global.allOrders = [];
    global.allOrders.push(orderData);

    // Send confirmations
    if (customerEmail || customerPhone) {
      setTimeout(() => sendConfirmations(orderNumber, trackingNumber, total, customerEmail, customerPhone, items, now, storeIds), 2000);
    }

    return NextResponse.json({ 
      success: true, 
      ...orderData, 
      message: "Order created! Check your phone for confirmation."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  const tracking = searchParams.get("tracking");
  const sellerId = searchParams.get("sellerId");

  // Get orders for a specific seller
  if (sellerId && global.sellerOrders?.has(sellerId)) {
    return NextResponse.json({ orders: global.sellerOrders.get(sellerId) });
  }

  // Get all orders (for admin)
  if (!orderNumber && !tracking) {
    return NextResponse.json({ orders: global.allOrders || [] });
  }

  // Find specific order
  const order = global.orderStorage?.get(orderNumber || tracking);
  if (order) {
    return NextResponse.json({ order: { ...order, _id: order.orderId } });
  }

  return NextResponse.json({ error: "Order not found" }, { status: 404 });
}
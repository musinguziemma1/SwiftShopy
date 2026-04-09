import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: any;
  orderNumber: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: number;
}

function generateInvoiceHTML(order: Order, storeName: string = "SwiftShopy"): string {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">UGX ${item.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">UGX ${item.total.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${order.orderNumber}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6b21a8;">${storeName}</h1>
    <p style="color: #666;">INVOICE</p>
  </div>
  
  <div style="margin-bottom: 30px;">
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
    <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
  </div>

  <div style="margin-bottom: 30px;">
    <h3>Customer Details</h3>
    <p><strong>Name:</strong> ${order.customerName}</p>
    <p><strong>Phone:</strong> ${order.customerPhone}</p>
    ${order.customerEmail ? `<p><strong>Email:</strong> ${order.customerEmail}</p>` : ''}
    ${order.shippingAddress ? `<p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>` : ''}
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    <thead>
      <tr style="background: #f9f9f9;">
        <th style="padding: 12px; text-align: left;">Item</th>
        <th style="padding: 12px; text-align: center;">Qty</th>
        <th style="padding: 12px; text-align: right;">Price</th>
        <th style="padding: 12px; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <div style="text-align: right; margin-bottom: 30px;">
    <p><strong>Subtotal:</strong> UGX ${order.subtotal.toLocaleString()}</p>
    <p style="font-size: 18px;"><strong>Total:</strong> UGX ${order.total.toLocaleString()}</p>
  </div>

  <div style="text-align: center; color: #666; font-size: 12px; border-top: 2px solid #6b21a8; padding-top: 20px;">
    <p>Thank you for shopping with ${storeName}!</p>
    <p>For questions, contact us via WhatsApp or email.</p>
  </div>
</body>
</html>
  `.trim();
}

function generateInvoiceText(order: Order): string {
  const itemsText = order.items.map(item => 
    `${item.productName} x${item.quantity} = UGX ${item.total.toLocaleString()}`
  ).join('\n');

  return `
INVOICE - ${order.orderNumber}
================================
Store: SwiftShopy
Order: ${order.orderNumber}
Tracking: ${order.trackingNumber}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status.toUpperCase()}

CUSTOMER
--------
Name: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerEmail ? `Email: ${order.customerEmail}` : ''}
${order.shippingAddress ? `Address: ${order.shippingAddress}` : ''}

ITEMS
-----
${itemsText}

--------------------------------
Subtotal: UGX ${order.subtotal.toLocaleString()}
TOTAL: UGX ${order.total.toLocaleString()}
--------------------------------

Thank you for shopping with SwiftShopy!
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, sendEmail = true, sendWhatsApp = true } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: "orderNumber is required." }, { status: 400 });
    }

    const orders = await convex.query(api.orders.list);
    const order = orders.find((o: any) => 
      o.orderNumber === orderNumber || o.orderNumber.startsWith(orderNumber)
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const results: { email: boolean; whatsapp: boolean } = { email: false, whatsapp: false };

    if (sendEmail && order.customerEmail) {
      try {
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notify/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: order.customerEmail,
            subject: `Order Confirmation - ${order.orderNumber}`,
            html: generateInvoiceHTML(order as Order),
            text: generateInvoiceText(order as Order),
          }),
        });
        results.email = emailResponse.ok;
      } catch (err) {
        console.error("Email send error:", err);
        results.email = false;
      }
    }

    if (sendWhatsApp && order.customerPhone) {
      try {
        const message = `*SwiftShopy Order Confirmation*\n\n` +
          `Order: ${order.orderNumber}\n` +
          `Tracking: ${order.trackingNumber}\n` +
          `Total: UGX ${order.total.toLocaleString()}\n\n` +
          `Thank you for your order! Track at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track?${order.trackingNumber}`;

        const waResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notify/whatsapp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: order.customerPhone.replace(/\D/g, ''),
            message,
          }),
        });
        results.whatsapp = waResponse.ok;
      } catch (err) {
        console.error("WhatsApp send error:", err);
        results.whatsapp = false;
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      emailSent: results.email,
      whatsappSent: results.whatsapp,
      invoiceHTML: generateInvoiceHTML(order as Order),
    });
  } catch (err: unknown) {
    console.error("[/api/orders/confirm] Error:", err);
    const message = err instanceof Error ? err.message : "Confirmation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
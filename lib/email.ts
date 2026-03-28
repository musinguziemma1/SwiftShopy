import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[Email] No API key, skipping:", { to, subject });
    return { id: "mock", success: true };
  }
  try {
    const result = await resend.emails.send({
      from: "SwiftShopy <noreply@swiftshopy.com>",
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error("[Email] Error:", error);
    throw error;
  }
}

export async function sendOrderConfirmation(to: string, orderNumber: string, amount: number, customerName: string) {
  return sendEmail(to, `Order Confirmed - ${orderNumber}`, `
    <h2>Order Confirmation</h2>
    <p>Hi ${customerName},</p>
    <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
    <p>Amount: UGX ${amount.toLocaleString()}</p>
    <p>Thank you for shopping with SwiftShopy!</p>
  `);
}

export async function sendPaymentReceived(to: string, orderNumber: string, amount: number) {
  return sendEmail(to, `Payment Received - ${orderNumber}`, `
    <h2>Payment Received</h2>
    <p>We've received your payment of UGX ${amount.toLocaleString()} for order ${orderNumber}.</p>
    <p>Your order is being processed.</p>
  `);
}

export async function sendNewSellerAlert(adminEmail: string, sellerName: string, storeName: string) {
  return sendEmail(adminEmail, `New Seller Registered - ${storeName}`, `
    <h2>New Seller Registration</h2>
    <p><strong>${sellerName}</strong> has registered a store: <strong>${storeName}</strong></p>
    <p>Please review and approve the seller in the admin dashboard.</p>
  `);
}

export async function sendLowStockAlert(to: string, productName: string, stock: number) {
  return sendEmail(to, `Low Stock Alert - ${productName}`, `
    <h2>Low Stock Alert</h2>
    <p>Product <strong>${productName}</strong> has only ${stock} units remaining.</p>
    <p>Please restock soon to avoid running out.</p>
  `);
}

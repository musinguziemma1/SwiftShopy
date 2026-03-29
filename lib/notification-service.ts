// ─── Notification Service ──────────────────────────────────────────────
// Centralized service for sending email and WhatsApp notifications
// Called from API routes or client-side components

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://swiftshopy.com";

// ─── Email Templates ──────────────────────────────────────────────────
export const emailTemplates = {
  newUser: (name: string, email: string, role: string) => ({
    subject: `Welcome to SwiftShopy, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to SwiftShopy!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hi ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">Your account has been created successfully as a <strong>${role}</strong>.</p>
          <p style="color: #4b5563; line-height: 1.6;">Start building your online store and accept payments via WhatsApp and Mobile Money.</p>
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Go to Dashboard</a>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>SwiftShopy - WhatsApp Commerce + Mobile Money Payments</p>
        </div>
      </div>
    `,
  }),

  newOrder: (orderNumber: string, customerName: string, total: string, items: string) => ({
    subject: `New Order #${orderNumber} - UGX ${total}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🛒 New Order!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Order #${orderNumber}</h2>
          <p style="color: #4b5563;"><strong>Customer:</strong> ${customerName}</p>
          <p style="color: #4b5563;"><strong>Total:</strong> UGX ${total}</p>
          <p style="color: #4b5563;"><strong>Items:</strong> ${items}</p>
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Order</a>
        </div>
      </div>
    `,
  }),

  orderPaid: (orderNumber: string, total: string) => ({
    subject: `Payment Received - Order #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Payment Received!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Order #${orderNumber}</h2>
          <p style="color: #4b5563; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">UGX ${total}</p>
          <p style="color: #4b5563; text-align: center;">Payment has been confirmed successfully!</p>
          <a href="${SITE_URL}/dashboard" style="display: block; text-align: center; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Dashboard</a>
        </div>
      </div>
    `,
  }),

  paymentSuccess: (provider: string, amount: string, transactionId: string) => ({
    subject: `Payment Confirmed - UGX ${amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">💰 Payment Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #4b5563;"><strong>Provider:</strong> ${provider}</p>
          <p style="color: #4b5563;"><strong>Amount:</strong> UGX ${amount}</p>
          <p style="color: #4b5563;"><strong>Transaction ID:</strong> ${transactionId}</p>
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Dashboard</a>
        </div>
      </div>
    `,
  }),

  paymentFailed: (provider: string, amount: string, reason: string) => ({
    subject: `Payment Failed - UGX ${amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">❌ Payment Failed</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #4b5563;"><strong>Provider:</strong> ${provider}</p>
          <p style="color: #4b5563;"><strong>Amount:</strong> UGX ${amount}</p>
          <p style="color: #4b5563;"><strong>Reason:</strong> ${reason}</p>
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Try Again</a>
        </div>
      </div>
    `,
  }),

  lowStock: (productName: string, stock: number) => ({
    subject: `Low Stock Alert - ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Low Stock Alert!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #4b5563; font-size: 18px;"><strong>"${productName}"</strong> has only <strong>${stock} units</strong> remaining.</p>
          <p style="color: #4b5563;">Consider restocking soon to avoid running out.</p>
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Update Stock</a>
        </div>
      </div>
    `,
  }),

  outOfStock: (productName: string) => ({
    subject: `Out of Stock - ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚨 Out of Stock!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #4b5563; font-size: 18px;"><strong>"${productName}"</strong> is now out of stock.</p>
          <p style="color: #4b5563;">Restock immediately to continue accepting orders.</p>
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Restock Now</a>
        </div>
      </div>
    `,
  }),

  subscriptionCreated: (plan: string, endDate: string) => ({
    subject: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Activated!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Subscription Activated!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; text-align: center;">${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</h2>
          <p style="color: #4b5563; text-align: center;">Your subscription is active until ${endDate}</p>
          <p style="color: #4b5563; text-align: center;">Enjoy your new premium features!</p>
          <a href="${SITE_URL}/dashboard" style="display: block; text-align: center; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Explore Features</a>
        </div>
      </div>
    `,
  }),

  subscriptionExpiring: (plan: string, daysRemaining: number) => ({
    subject: `Your ${plan} plan expires in ${daysRemaining} days`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⏰ Subscription Expiring Soon</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; text-align: center;">${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</h2>
          <p style="color: #4b5563; text-align: center; font-size: 18px;">Expires in <strong>${daysRemaining} days</strong></p>
          <p style="color: #4b5563; text-align: center;">Renew now to keep your premium features.</p>
          <a href="${SITE_URL}/dashboard?tab=settings&subtab=subscription" style="display: block; text-align: center; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Renew Now</a>
        </div>
      </div>
    `,
  }),

  referralBonus: (reward: string) => ({
    subject: `Referral Bonus Earned! 🎁`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎁 Referral Bonus Earned!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; text-align: center;">Congratulations!</h2>
          <p style="color: #4b5563; text-align: center; font-size: 18px;">You've earned: <strong>${reward}</strong></p>
          <p style="color: #4b5563; text-align: center;">Keep sharing your referral code to earn more rewards!</p>
          <a href="${SITE_URL}/dashboard?tab=settings&subtab=subscription" style="display: block; text-align: center; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Rewards</a>
        </div>
      </div>
    `,
  }),

  storeCreated: (storeName: string) => ({
    subject: `Your store "${storeName}" is live!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🏪 Store Created!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; text-align: center;">"${storeName}"</h2>
          <p style="color: #4b5563; text-align: center;">Your store has been created successfully!</p>
          <p style="color: #4b5563; text-align: center;">Start adding products and share your store link.</p>
          <a href="${SITE_URL}/dashboard" style="display: block; text-align: center; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Add Products</a>
        </div>
      </div>
    `,
  }),
};

// ─── WhatsApp Message Templates ────────────────────────────────────────
export const whatsappTemplates = {
  newOrder: (orderNumber: string, customerName: string, total: string) =>
    `🛒 *New Order!*\n\nOrder #${orderNumber}\nCustomer: ${customerName}\nTotal: UGX ${total}\n\nView your dashboard for details.`,

  orderPaid: (orderNumber: string, total: string) =>
    `✅ *Payment Received!*\n\nOrder #${orderNumber} has been paid.\nAmount: UGX ${total}\n\nThank you for your business!`,

  orderFailed: (orderNumber: string) =>
    `❌ *Payment Failed*\n\nOrder #${orderNumber} payment failed.\nPlease contact the customer.`,

  newUser: (name: string, role: string) =>
    `👋 *New User Registered!*\n\n${name} just signed up as a ${role}.\nWelcome them to SwiftShopy!`,

  lowStock: (productName: string, stock: number) =>
    `⚠️ *Low Stock Alert!*\n\n"${productName}" has only ${stock} units remaining.\nConsider restocking soon.`,

  outOfStock: (productName: string) =>
    `🚨 *Out of Stock!*\n\n"${productName}" is now out of stock.\nRestock to continue accepting orders.`,

  paymentSuccess: (provider: string, amount: string) =>
    `💰 *Payment Confirmed!*\n\n${provider} payment of UGX ${amount} received successfully.`,

  paymentFailed: (provider: string, amount: string) =>
    `❌ *Payment Failed*\n\n${provider} payment of UGX ${amount} failed.\nPlease retry or contact support.`,

  subscriptionCreated: (plan: string) =>
    `🎉 *Subscription Activated!*\n\nYour ${plan} plan is now active.\nEnjoy your new features!`,

  subscriptionExpiring: (plan: string, days: number) =>
    `⏰ *Subscription Expiring*\n\nYour ${plan} plan expires in ${days} days.\nRenew now to keep premium features.`,

  referralBonus: (reward: string) =>
    `🎁 *Referral Bonus Earned!*\n\nCongratulations! You've earned: ${reward}\n\nKeep sharing to earn more!`,

  storeCreated: (storeName: string) =>
    `🏪 *Store Created!*\n\n"${storeName}" is now live!\nStart adding products now.`,
};

// ─── Send Functions ────────────────────────────────────────────────────
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch(`${SITE_URL}/api/notify/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
    return await response.json();
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error };
  }
}

export async function sendWhatsApp(to: string, message: string) {
  try {
    const response = await fetch(`${SITE_URL}/api/notify/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message }),
    });
    return await response.json();
  } catch (error) {
    console.error("WhatsApp send failed:", error);
    return { success: false, error };
  }
}

// ─── Convenience Functions ─────────────────────────────────────────────
export async function notifyNewUser(email: string, phone: string, name: string, role: string) {
  const emailContent = emailTemplates.newUser(name, email, role);
  const waMessage = whatsappTemplates.newUser(name, role);

  await Promise.all([
    sendEmail(email, emailContent.subject, emailContent.html),
    phone ? sendWhatsApp(phone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifyNewOrder(
  sellerEmail: string,
  sellerPhone: string,
  orderNumber: string,
  customerName: string,
  total: string,
  items: string
) {
  const emailContent = emailTemplates.newOrder(orderNumber, customerName, total, items);
  const waMessage = whatsappTemplates.newOrder(orderNumber, customerName, total);

  await Promise.all([
    sendEmail(sellerEmail, emailContent.subject, emailContent.html),
    sellerPhone ? sendWhatsApp(sellerPhone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifyOrderPaid(
  sellerEmail: string,
  sellerPhone: string,
  orderNumber: string,
  total: string
) {
  const emailContent = emailTemplates.orderPaid(orderNumber, total);
  const waMessage = whatsappTemplates.orderPaid(orderNumber, total);

  await Promise.all([
    sendEmail(sellerEmail, emailContent.subject, emailContent.html),
    sellerPhone ? sendWhatsApp(sellerPhone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifyPaymentSuccess(
  email: string,
  phone: string,
  provider: string,
  amount: string,
  transactionId: string
) {
  const emailContent = emailTemplates.paymentSuccess(provider, amount, transactionId);
  const waMessage = whatsappTemplates.paymentSuccess(provider, amount);

  await Promise.all([
    sendEmail(email, emailContent.subject, emailContent.html),
    phone ? sendWhatsApp(phone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifyPaymentFailed(
  email: string,
  phone: string,
  provider: string,
  amount: string,
  reason: string
) {
  const emailContent = emailTemplates.paymentFailed(provider, amount, reason);
  const waMessage = whatsappTemplates.paymentFailed(provider, amount);

  await Promise.all([
    sendEmail(email, emailContent.subject, emailContent.html),
    phone ? sendWhatsApp(phone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifyLowStock(
  email: string,
  phone: string,
  productName: string,
  stock: number
) {
  const emailContent = emailTemplates.lowStock(productName, stock);
  const waMessage = whatsappTemplates.lowStock(productName, stock);

  await Promise.all([
    sendEmail(email, emailContent.subject, emailContent.html),
    phone ? sendWhatsApp(phone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifyOutOfStock(
  email: string,
  phone: string,
  productName: string
) {
  const emailContent = emailTemplates.outOfStock(productName);
  const waMessage = whatsappTemplates.outOfStock(productName);

  await Promise.all([
    sendEmail(email, emailContent.subject, emailContent.html),
    phone ? sendWhatsApp(phone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifySubscriptionCreated(
  email: string,
  phone: string,
  plan: string,
  endDate: string
) {
  const emailContent = emailTemplates.subscriptionCreated(plan, endDate);
  const waMessage = whatsappTemplates.subscriptionCreated(plan);

  await Promise.all([
    sendEmail(email, emailContent.subject, emailContent.html),
    phone ? sendWhatsApp(phone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifySubscriptionExpiring(
  email: string,
  phone: string,
  plan: string,
  daysRemaining: number
) {
  const emailContent = emailTemplates.subscriptionExpiring(plan, daysRemaining);
  const waMessage = whatsappTemplates.subscriptionExpiring(plan, daysRemaining);

  await Promise.all([
    sendEmail(email, emailContent.subject, emailContent.html),
    phone ? sendWhatsApp(phone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifyReferralBonus(
  email: string,
  phone: string,
  reward: string
) {
  const emailContent = emailTemplates.referralBonus(reward);
  const waMessage = whatsappTemplates.referralBonus(reward);

  await Promise.all([
    sendEmail(email, emailContent.subject, emailContent.html),
    phone ? sendWhatsApp(phone, waMessage) : Promise.resolve(),
  ]);
}

export async function notifyStoreCreated(
  email: string,
  phone: string,
  storeName: string
) {
  const emailContent = emailTemplates.storeCreated(storeName);
  const waMessage = whatsappTemplates.storeCreated(storeName);

  await Promise.all([
    sendEmail(email, emailContent.subject, emailContent.html),
    phone ? sendWhatsApp(phone, waMessage) : Promise.resolve(),
  ]);
}

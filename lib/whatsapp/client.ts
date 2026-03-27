/**
 * WhatsApp Cloud API Client
 * 
 * This module provides functions to interact with the Meta WhatsApp Cloud API.
 * It handles:
 * - Sending text messages
 * - Sending media messages
 * - Sending templates
 * - Managing QR code for account linking
 * - Fetching business account info
 * 
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_VERSION = "v18.0";

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
}

interface SendMessageOptions {
  to: string;
  type: "text" | "image" | "audio" | "video" | "document" | "interactive" | "template";
  content: any;
  previewUrl?: boolean;
}

interface WhatsAppResponse {
  messaging_product: string;
  to: string;
  type: string;
  text?: { body: string };
  image?: { id: string; caption?: string };
  template?: any;
  interactive?: any;
}

export class WhatsAppClient {
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    this.accessToken = config.accessToken;
    this.phoneNumberId = config.phoneNumberId;
    this.businessAccountId = config.businessAccountId;
    this.baseUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;
  }

  /**
   * Send a text message to a WhatsApp user
   */
  async sendTextMessage(to: string, body: string, previewUrl: boolean = false): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to: this.normalizePhone(to),
      type: "text",
      content: { body },
      previewUrl,
    });
  }

  /**
   * Send an image message using a URL or media ID
   */
  async sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to: this.normalizePhone(to),
      type: "image",
      content: { link: imageUrl, caption },
    });
  }

  /**
   * Send a document message
   */
  async sendDocumentMessage(to: string, documentUrl: string, filename?: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to: this.normalizePhone(to),
      type: "document",
      content: { link: documentUrl, filename },
    });
  }

  /**
   * Send an audio message
   */
  async sendAudioMessage(to: string, audioUrl: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to: this.normalizePhone(to),
      type: "audio",
      content: { link: audioUrl },
    });
  }

  /**
   * Send a video message
   */
  async sendVideoMessage(to: string, videoUrl: string, caption?: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to: this.normalizePhone(to),
      type: "video",
      content: { link: videoUrl, caption },
    });
  }

  /**
   * Send interactive buttons message
   */
  async sendInteractiveMessage(
    to: string, 
    body: string, 
    buttons: Array<{ id: string; title: string }>,
    header?: string
  ): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to: this.normalizePhone(to),
      type: "interactive",
      content: {
        type: "button",
        header: header ? { type: "text", text: header } : undefined,
        body: { text: body },
        action: {
          buttons: buttons.map(btn => ({
            type: "reply",
            reply: { id: btn.id, title: btn.title }
          }))
        }
      }
    });
  }

  /**
   * Send a list message
   */
  async sendListMessage(
    to: string,
    body: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>
  ): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to: this.normalizePhone(to),
      type: "interactive",
      content: {
        type: "list",
        body: { text: body },
        action: {
          button: buttonText,
          sections
        }
      }
    });
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(to: string, templateName: string, language: string = "en_US", components?: any[]): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to: this.normalizePhone(to),
      type: "template",
      content: {
        name: templateName,
        language: { code: language },
        components
      }
    });
  }

  /**
   * Send a location message
   */
  async sendLocationMessage(to: string, latitude: number, longitude: number, title?: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to: this.normalizePhone(to),
      type: "interactive",
      content: {
        type: "location",
        location: {
          latitude,
          longitude,
          title
        }
      }
    });
  }

  /**
   * Generate QR code for WhatsApp Business account linking
   */
  async generateQRCode(): Promise<{ qrCode: string; expiresAt: number }> {
    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/qr_code`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefilled_message: "Hello from SwiftShopy!"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to generate QR code: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return {
      qrCode: data.qr_code,
      expiresAt: Date.now() + (data.expires_after || 300) * 1000
    };
  }

  /**
   * Register a webhook for incoming messages
   */
  async registerWebhook(callbackUrl: string, verifyToken: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${this.businessAccountId}/subscribed_apps`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook_url: callbackUrl,
        webhook_verify_token: verifyToken
      })
    });

    return response.ok;
  }

  /**
   * Upload media for sending
   */
  async uploadMedia(mediaUrl: string, type: "image" | "audio" | "video" | "document"): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/media`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_url: mediaUrl,
        type,
        messaging_product: "whatsapp"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to upload media: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Get business account info
   */
  async getBusinessInfo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${this.businessAccountId}`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
      }
    });

    if (!response.ok) {
      throw new Error("Failed to get business info");
    }

    return response.json();
  }

  /**
   * Get phone number info
   */
  async getPhoneNumberInfo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
      }
    });

    if (!response.ok) {
      throw new Error("Failed to get phone number info");
    }

    return response.json();
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId
      })
    });

    return response.ok;
  }

  /**
   * Internal method to send messages via the API
   */
  private async sendMessage(options: SendMessageOptions): Promise<WhatsAppResponse> {
    const payload: any = {
      messaging_product: "whatsapp",
      to: options.to,
      type: options.type,
    };

    if (options.type === "text") {
      payload.text = options.content;
      if (options.previewUrl) {
        payload.text.preview_url = true;
      }
    } else if (options.type === "template") {
      payload.template = options.content;
    } else if (options.type === "interactive") {
      payload.interactive = options.content;
    } else {
      payload[options.type] = options.content;
    }

    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API error: ${error.error?.message || "Unknown error"}`);
    }

    return response.json();
  }

  /**
   * Normalize phone number to WhatsApp format (with country code, no +)
   */
  private normalizePhone(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, "");
    
    // If it doesn't start with country code, add Uganda's +256
    if (!cleaned.startsWith("256")) {
      if (cleaned.startsWith("0")) {
        cleaned = "256" + cleaned.slice(1);
      } else {
        cleaned = "256" + cleaned;
      }
    }
    
    return cleaned;
  }
}

/**
 * Factory function to create WhatsApp client from stored credentials
 */
export async function createWhatsAppClient(accessToken: string, phoneNumberId: string, businessAccountId: string): Promise<WhatsAppClient> {
  return new WhatsAppClient({
    accessToken,
    phoneNumberId,
    businessAccountId
  });
}

/**
 * Quick reply templates for common responses
 */
export const QUICK_REPLY_TEMPLATES = {
  greeting: "Hello! Thank you for contacting us. How can I help you today?",
  orderConfirm: "Your order has been confirmed! Order #{orderNumber}. Total: {amount}. We'll notify you when it's ready for delivery.",
  paymentRequest: "Please complete your payment of {amount} using MTN MoMo to {phone}. Your order will be processed once payment is confirmed.",
  thanks: "Thank you for your order! We appreciate your business.",
  away: "Thank you for your message. Our team will get back to you within 24 hours.",
  shipping: "Your order has been shipped! Expected delivery: {date}. Track your order: {trackingLink}",
};

/**
 * Default away message
 */
export const DEFAULT_AWAY_MESSAGE = "Hello! Thanks for reaching out. We're currently away from our phones. We'll respond to your message as soon as possible, usually within 24 hours.";
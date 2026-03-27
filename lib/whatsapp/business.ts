/**
 * WhatsApp Business Features
 * 
 * Includes: Short links, labels, broadcasts, templates workflow
 */

import crypto from "crypto";

// ─── WhatsApp Short Links ───────────────────────────────────
export function generateWhatsAppShortLink(phoneNumber: string, message?: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const baseUrl = `https://wa.me/${cleanPhone}`;
  
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  
  return baseUrl;
}

export function generatePrefilledMessageLink(
  phoneNumber: string,
  message: string,
  businessName?: string
): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

// ─── Chat Labels/Tags Management ─────────────────────────────
export interface ChatLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export const DEFAULT_LABELS: ChatLabel[] = [
  { id: "new", name: "New Lead", color: "#22C55E", description: "New customer inquiry" },
  { id: "prospect", name: "Prospect", color: "#3B82F6", description: "Potential customer" },
  { id: "customer", name: "Customer", color: "#8B5CF6", description: "Existing customer" },
  { id: "followup", name: "Follow Up", color: "#F59E0B", description: "Needs follow-up" },
  { id: "urgent", name: "Urgent", color: "#EF4444", description: "Urgent inquiry" },
  { id: "resolved", name: "Resolved", color: "#6B7280", description: "Issue resolved" },
];

export function getLabelColor(labelId: string): string {
  return DEFAULT_LABELS.find(l => l.id === labelId)?.color || "#6B7280";
}

// ─── Broadcast Management ─────────────────────────────────────
export interface BroadcastCampaign {
  id: string;
  storeId: string;
  name: string;
  message: string;
  segmentIds: string[];
  recipientCount: number;
  status: "draft" | "scheduled" | "sending" | "completed" | "failed";
  scheduledAt?: number;
  sentAt?: number;
  createdAt: number;
}

export interface BroadcastSegment {
  id: string;
  storeId: string;
  name: string;
  filters: {
    tags?: string[];
    hasOrders?: boolean;
    lastMessageAfter?: number;
    lastMessageBefore?: number;
  };
  estimatedCount: number;
}

// ─── Message Templates ───────────────────────────────────────
export interface TemplateMessage {
  name: string;
  language: string;
  components: TemplateComponent[];
}

export interface TemplateComponent {
  type: "header" | "body" | "footer" | "button";
  subtype?: "image" | "video" | "document";
  parameters?: TemplateParameter[];
  buttons?: TemplateButton[];
}

export interface TemplateParameter {
  type: "text" | "currency" | "date_time" | "image" | "document";
  text?: string;
  currency?: { code: string; amount: number };
  date_time?: { day_of_week?: number; day_of_month?: number; month_of_year?: number; year?: number; hour?: number; minute?: number };
}

export interface TemplateButton {
  type: "url" | "phone_number" | "quick_reply" | "otp";
  text: string;
  url?: string;
  phone_number?: string;
  payload?: string;
}

// ─── Pre-built Template Library ──────────────────────────────
export const TEMPLATE_LIBRARY: Record<string, TemplateMessage> = {
  order_confirmation: {
    name: "order_confirmation",
    language: "en_US",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "{{1}}" },
          { type: "text", text: "{{2}}" },
          { type: "text", text: "{{3}}" },
        ],
      },
      {
        type: "footer",
        parameters: [],
      },
    ],
  },
  payment_request: {
    name: "payment_request",
    language: "en_US",
    components: [
      {
        type: "header",
        parameters: [{ type: "text", text: "Payment Request" }],
      },
      {
        type: "body",
        parameters: [
          { type: "text", text: "{{1}}" },
          { type: "currency", currency: { code: "UGX", amount: 0 } },
        ],
      },
    ],
  },
  shipping_notification: {
    name: "shipping_notification",
    language: "en_US",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "{{1}}" },
          { type: "text", text: "{{2}}" },
        ],
      },
    ],
  },
};

// ─── Interactive Message Builder ─────────────────────────────
export interface ButtonOption {
  id: string;
  title: string;
}

export interface ListSection {
  title?: string;
  rows: {
    id: string;
    title: string;
    description?: string;
  }[];
}

export function buildInteractiveButtonsMessage(
  bodyText: string,
  buttons: ButtonOption[],
  headerText?: string
): any {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      header: headerText ? { type: "text", text: headerText } : undefined,
      body: { text: bodyText },
      action: {
        buttons: buttons.map(btn => ({
          type: "reply",
          reply: { id: btn.id, title: btn.title.substring(20) },
        })),
      },
    },
  };
}

export function buildListMessage(
  bodyText: string,
  buttonText: string,
  sections: ListSection[]
): any {
  return {
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: bodyText },
      action: {
        button: buttonText,
        sections: sections.map(section => ({
          title: section.title,
          rows: section.rows,
        })),
      },
    },
  };
}

// ─── Quick Reply with Variables ─────────────────────────────
export function fillQuickReplyTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let filled = template;
  
  for (const [key, value] of Object.entries(variables)) {
    filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return filled;
}

// ─── Campaign Analytics ─────────────────────────────────────
export interface CampaignAnalytics {
  campaignId: string;
  totalRecipients: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
  avgResponseTime?: number;
}

export function calculateCampaignMetrics(
  campaign: BroadcastCampaign,
  messageStatuses: Map<string, string>
): CampaignAnalytics {
  let delivered = 0;
  let read = 0;
  let replied = 0;
  let failed = 0;

  for (const [, status] of messageStatuses) {
    switch (status) {
      case "delivered":
        delivered++;
        break;
      case "read":
        read++;
        break;
      case "replied":
        replied++;
        break;
      case "failed":
        failed++;
        break;
    }
  }

  return {
    campaignId: campaign.id,
    totalRecipients: campaign.recipientCount,
    delivered,
    read,
    replied,
    failed,
  };
}
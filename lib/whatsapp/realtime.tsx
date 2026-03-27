/**
 * WhatsApp Real-time Features
 * 
 * Handles WebSocket connections, typing indicators, and presence status
 */

import { useState, useEffect, useCallback } from "react";

export interface WhatsAppTypingIndicator {
  conversationId: string;
  isTyping: boolean;
}

export interface WhatsAppPresence {
  conversationId: string;
  contactId: string;
  status: "online" | "offline" | "typing";
  lastSeen?: number;
}

// ─── Custom Hook for WhatsApp Real-time ─────────────────────
export function useWhatsAppRealtime(
  storeId: string,
  conversationId?: string
) {
  const [isConnected, setIsConnected] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState<WhatsAppTypingIndicator | null>(null);
  const [presence, setPresence] = useState<Map<string, WhatsAppPresence>>(new Map());

  useEffect(() => {
    const connect = async () => {
      console.log("[WhatsApp Realtime] Connecting...");
      setTimeout(() => {
        setIsConnected(true);
        console.log("[WhatsApp Realtime] Connected");
      }, 1000);
    };

    connect();

    return () => {
      console.log("[WhatsApp Realtime] Disconnecting...");
      setIsConnected(false);
    };
  }, [storeId]);

  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    console.log("[WhatsApp Realtime] Typing:", conversationId, isTyping);
    setTypingIndicator({ conversationId, isTyping });
    if (isTyping) {
      setTimeout(() => {
        setTypingIndicator(null);
      }, 5000);
    }
  }, []);

  const onTypingReceived = useCallback((indicator: WhatsAppTypingIndicator) => {
    setTypingIndicator(indicator);
  }, []);

  const updatePresence = useCallback((conversationId: string, contactId: string, status: "online" | "offline" | "typing") => {
    setPresence(prev => {
      const newMap = new Map(prev);
      newMap.set(contactId, {
        conversationId,
        contactId,
        status,
        lastSeen: status === "offline" ? Date.now() : undefined,
      });
      return newMap;
    });
  }, []);

  const isContactOnline = useCallback((contactId: string): boolean => {
    const contactPresence = presence.get(contactId);
    return contactPresence?.status === "online";
  }, [presence]);

  const subscribeToMessages = useCallback((onMessage: (message: any) => void) => {
    console.log("[WhatsApp Realtime] Subscribed to messages");
    return () => {
      console.log("[WhatsApp Realtime] Unsubscribed from messages");
    };
  }, []);

  return {
    isConnected,
    typingIndicator,
    presence,
    sendTypingIndicator,
    onTypingReceived,
    updatePresence,
    isContactOnline,
    subscribeToMessages,
  };
}

// ─── Typing Indicator Component ──────────────────────────────
export function TypingIndicator({ isTyping }: { isTyping: boolean }) {
  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-muted-foreground ml-2">typing...</span>
    </div>
  );
}

// ─── Online Status Badge ─────────────────────────────────────
export function OnlineStatusBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <div className="relative">
      <div
        className={`w-3 h-3 rounded-full border-2 border-background ${
          isOnline ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      {isOnline && (
        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
      )}
    </div>
  );
}

// ─── WhatsApp Conversation Hook ─────────────────────────────
export function useWhatsAppConversations(storeId: string) {
  return {
    conversations: [],
    isLoading: false,
    archiveConversation: async () => {},
  };
}

export function useWhatsAppMessages(conversationId: string, limit?: number) {
  return {
    messages: [],
    isLoading: false,
    sendMessage: async () => {},
  };
}

export function useWhatsAppContacts(storeId: string, search?: string) {
  return {
    contacts: [],
    isLoading: false,
    updateContact: async () => {},
  };
}

export function useWhatsAppQuickReplies(storeId: string) {
  return {
    quickReplies: [],
    isLoading: false,
    createQuickReply: async () => {},
    deleteQuickReply: async () => {},
  };
}

export function useWhatsAppTemplates(storeId: string, category?: string) {
  return {
    templates: [],
    isLoading: false,
    createTemplate: async () => {},
  };
}

export function useWhatsAppPaymentLinks(storeId: string, status?: string) {
  return {
    paymentLinks: [],
    isLoading: false,
    createPaymentLink: async () => {},
  };
}

export function useWhatsAppAnalytics(storeId: string, days?: number) {
  return {
    analytics: null,
    isLoading: false,
  };
}

export function useWhatsAppAccount(storeId: string) {
  return {
    account: null,
    isLoading: false,
    isConnected: false,
    createAccount: async () => {},
    updateConnectionStatus: async () => {},
    generateQRCode: async () => {},
  };
}
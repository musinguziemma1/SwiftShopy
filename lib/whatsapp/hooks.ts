/**
 * WhatsApp Integration Hooks for Seller Dashboard
 * 
 * Provides React hooks to connect the existing UI to Convex backend
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

// ─── Conversation Hooks ─────────────────────────────────────
export function useWhatsAppConversations(storeId: string) {
  const conversations = useQuery(api.whatsapp.getConversations, { storeId: storeId as any });
  const archiveConversation = useMutation(api.whatsapp.archiveConversation);

  return {
    conversations: conversations || [],
    isLoading: conversations === undefined,
    archiveConversation,
  };
}

export function useWhatsAppConversation(conversationId: string) {
  const conversation = useQuery(api.whatsapp.getConversation, { id: conversationId as any });

  return {
    conversation,
    isLoading: conversation === undefined,
  };
}

// ─── Messages Hooks ────────────────────────────────────────
export function useWhatsAppMessages(conversationId: string, limit?: number) {
  const messages = useQuery(api.whatsapp.getMessages, { 
    conversationId: conversationId as any, 
    limit: limit || 50 
  });
  const sendMessage = useMutation(api.whatsapp.sendMessage);

  const send = useCallback(async (
    content: string,
    type: "text" | "image" | "audio" | "video" | "document" | "location" | "interactive" = "text",
    mediaUrl?: string
  ) => {
    // This would need to be called with the correct IDs
    console.log("Send message:", content);
  }, [conversationId]);

  return {
    messages: messages || [],
    isLoading: messages === undefined,
    sendMessage: sendMessage,
  };
}

// ─── Contacts Hooks ─────────────────────────────────────────
export function useWhatsAppContacts(storeId: string, search?: string) {
  const contacts = useQuery(api.whatsapp.getContacts, { storeId: storeId as any, search });
  const updateContact = useMutation(api.whatsapp.updateContact);

  return {
    contacts: contacts || [],
    isLoading: contacts === undefined,
    updateContact,
  };
}

// ─── Quick Replies Hooks ───────────────────────────────────
export function useWhatsAppQuickReplies(storeId: string) {
  const quickReplies = useQuery(api.whatsapp.getQuickReplies, { storeId: storeId as any });
  const createQuickReply = useMutation(api.whatsapp.createQuickReply);
  const deleteQuickReply = useMutation(api.whatsapp.deleteQuickReply);

  return {
    quickReplies: quickReplies || [],
    isLoading: quickReplies === undefined,
    createQuickReply,
    deleteQuickReply,
  };
}

// ─── Templates Hooks ────────────────────────────────────────
export function useWhatsAppTemplates(storeId: string, category?: string) {
  const templates = useQuery(api.whatsapp.getTemplates, { storeId: storeId as any, category });
  const createTemplate = useMutation(api.whatsapp.createTemplate);

  return {
    templates: templates || [],
    isLoading: templates === undefined,
    createTemplate,
  };
}

// ─── Payment Links Hooks ─────────────────────────────────────
export function useWhatsAppPaymentLinks(storeId: string, status?: string) {
  const paymentLinks = useQuery(api.whatsapp.getPaymentLinks, { storeId: storeId as any, status });
  const createPaymentLink = useMutation(api.whatsapp.createPaymentLink);

  const createLink = useCallback(async (
    amount: number,
    description: string,
    orderId?: string,
    conversationId?: string
  ) => {
    return await createPaymentLink({
      storeId: storeId as any,
      amount,
      currency: "UGX",
      description,
      orderId: orderId as any,
      conversationId: conversationId as any,
    });
  }, [storeId, createPaymentLink]);

  return {
    paymentLinks: paymentLinks || [],
    isLoading: paymentLinks === undefined,
    createPaymentLink: createLink,
  };
}

// ─── Analytics Hooks ───────────────────────────────────────
export function useWhatsAppAnalytics(storeId: string, days?: number) {
  const analytics = useQuery(api.whatsapp.getWhatsAppAnalytics, { storeId: storeId as any, days });

  return {
    analytics,
    isLoading: analytics === undefined,
  };
}

// ─── Account Hooks ─────────────────────────────────────────
export function useWhatsAppAccount(storeId: string) {
  const account = useQuery(api.whatsapp.getByStore, { storeId: storeId as any });
  const createAccount = useMutation(api.whatsapp.createAccount);
  const updateConnectionStatus = useMutation(api.whatsapp.updateConnectionStatus);
  const generateQRCode = useMutation(api.whatsapp.generateQRCode);

  return {
    account,
    isLoading: account === undefined,
    isConnected: account?.isConnected || false,
    createAccount,
    updateConnectionStatus,
    generateQRCode,
  };
}

// ─── Search Hooks ─────────────────────────────────────────
export function useWhatsAppSearch(storeId: string) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    
    if (!query.trim()) {
      setIsSearching(false);
      return [];
    }

    try {
      setIsSearching(false);
      return [];
    } catch (error) {
      setIsSearching(false);
      return [];
    }
  }, [storeId]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    isSearching,
    search,
    clearSearch,
  };
}

// ─── Combined WhatsApp Provider Hook ───────────────────────────
export function useWhatsApp(storeId: string) {
  const {
    conversations,
    isLoading: conversationsLoading,
    archiveConversation,
  } = useWhatsAppConversations(storeId);

  const {
    quickReplies,
    isLoading: quickRepliesLoading,
    createQuickReply,
    deleteQuickReply,
  } = useWhatsAppQuickReplies(storeId);

  const {
    paymentLinks,
    isLoading: paymentLinksLoading,
    createPaymentLink,
  } = useWhatsAppPaymentLinks(storeId);

  const {
    analytics,
    isLoading: analyticsLoading,
  } = useWhatsAppAnalytics(storeId);

  const {
    account,
    isLoading: accountLoading,
    isConnected,
    generateQRCode,
  } = useWhatsAppAccount(storeId);

  return {
    // Conversations
    conversations,
    conversationsLoading,
    archiveConversation,

    // Quick Replies
    quickReplies,
    quickRepliesLoading,
    createQuickReply,
    deleteQuickReply,

    // Payment Links
    paymentLinks,
    paymentLinksLoading,
    createPaymentLink,

    // Analytics
    analytics,
    analyticsLoading,

    // Account
    account,
    accountLoading,
    isConnected,
    generateQRCode,

    // Loading state
    isLoading: conversationsLoading || quickRepliesLoading || paymentLinksLoading || analyticsLoading || accountLoading,
  };
}
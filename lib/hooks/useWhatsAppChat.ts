import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCallback } from "react";

export const useWhatsAppChat = (storeId: string | null | undefined) => {
  const hasValidId = storeId && !storeId.includes("store");

  const conversations = useQuery(
    api.whatsapp.getConversations,
    hasValidId ? { storeId: storeId as any } : "skip"
  );

  const sendMessage = useMutation(api.whatsapp.sendMessage);

  const send = useCallback(async (
    conversationId: string,
    contactId: string,
    content: string,
    type: "text" | "image" | "audio" | "video" | "document" | "location" | "interactive" = "text"
  ) => {
    if (!hasValidId) return;
    return await sendMessage({
      storeId: storeId as any,
      conversationId: conversationId as any,
      contactId: contactId as any,
      type,
      content,
    });
  }, [storeId, hasValidId, sendMessage]);

  return {
    conversations: conversations ?? [],
    isLoading: conversations === undefined,
    sendMessage: send,
  };
};

export const useWhatsAppMessages = (conversationId: string | null | undefined) => {
  const hasValidId = conversationId && conversationId.length > 10;

  const messages = useQuery(
    api.whatsapp.getMessages,
    hasValidId ? { conversationId: conversationId as any, limit: 50 } : "skip"
  );

  return {
    messages: messages ?? [],
    isLoading: messages === undefined,
  };
};

export const useWhatsAppContacts = (storeId: string | null | undefined) => {
  const hasValidId = storeId && !storeId.includes("store");

  const contacts = useQuery(
    api.whatsapp.getContacts,
    hasValidId ? { storeId: storeId as any } : "skip"
  );

  return {
    contacts: contacts ?? [],
    isLoading: contacts === undefined,
  };
};

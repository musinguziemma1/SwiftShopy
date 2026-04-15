import { action } from "./_generated/server";
import { v } from "convex/values";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ response: string; needsEscalation?: boolean; issueSummary?: string }> => {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("GROQ_API_KEY available:", !!apiKey, "key prefix:", apiKey?.slice(0, 10));
    
    if (!apiKey) {
      return {
        response: "Hello! 👋 I'm the SwiftShopy AI assistant. I can help you with:\n\n• Setting up your store\n• MTN & Airtel payments\n• Subscription plans & pricing\n• Order management\n• KYC verification\n\nWhat would you like to know?",
      };
    }

    const systemPrompt = `You are a helpful AI assistant for SwiftShopy, an e-commerce platform in Uganda. Your role is to:

1. Answer questions about SwiftShopy platform features, pricing, and how to use it
2. Help users with account issues, store setup, payments (MTN MoMo, Airtel Money), and order management
3. Guide users through the KYC verification process
4. Explain subscription plans and billing

If a user asks to speak to a human, wants to escalate, or if you cannot answer their question, you MUST respond with exactly: [ESCALATE_TO_HUMAN]
Then provide a brief summary of their issue. Do NOT fabricate responses.

Keep responses concise and helpful. If the user is asking about something you don't know, suggest they create a support ticket for more detailed assistance.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...args.messages,
    ];

    try {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3-70b-8192",
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!groqResponse.ok) {
        const error = await groqResponse.text();
        console.error("Groq API error:", error);
        return {
          response: "Hello! 👋 I'm the SwiftShopy AI assistant. I can help you with:\n\n• Setting up your store\n• MTN & Airtel payments\n• Subscription plans & pricing\n• Order management\n• KYC verification\n\nWhat would you like to know?",
        };
      }

      const data = await groqResponse.json();
      const assistantResponse = data.choices?.[0]?.message?.content;

      if (!assistantResponse) {
        return { response: "I didn't get a proper response. Please try again." };
      }

      if (assistantResponse.includes("[ESCALATE_TO_HUMAN]")) {
        const issueSummary = assistantResponse
          .replace("[ESCALATE_TO_HUMAN]", "")
          .trim()
          .slice(0, 500);

        return {
          response: issueSummary + "\n\nI've escalated your request to our support team. They will contact you shortly.",
          needsEscalation: true,
          issueSummary,
        };
      }

      return { response: assistantResponse };
    } catch (error) {
      console.error("Agent error:", error);
      return {
        response: "I encountered an error processing your request. Please try again or contact support@swiftshopy.com for help.",
      };
    }
  },
});
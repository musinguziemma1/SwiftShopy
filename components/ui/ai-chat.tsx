"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, X, Loader2, ShoppingCart } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  "How do I set up my store?",
  "How does WhatsApp ordering work?",
  "What are your pricing plans?",
  "How do I accept MoMo payments?",
]

const botResponses: Record<string, string> = {
  default:
    "Thanks for reaching out! I'm the SwiftShopy assistant. I can help you with setting up your store, payments, WhatsApp integration, and more. What would you like to know?",
  store:
    "Setting up your SwiftShopy store is super easy! 🚀 Just sign up, add your products with photos and prices, and share your store link. It takes less than 10 minutes. Ready to get started?",
  whatsapp:
    "WhatsApp ordering is seamless! 📱 When a customer wants to buy, they click 'Order on WhatsApp' and a pre-filled message with their order details is sent straight to your phone. You just confirm and arrange delivery!",
  pricing:
    "We have 3 plans: \n\n✅ Starter — Free forever (up to 10 products)\n🚀 Business — UGX 50,000/month (unlimited products + analytics)\n🏢 Enterprise — Custom pricing (multi-store + API)\n\nStart free and upgrade when you're ready!",
  payment:
    "We support MTN Mobile Money for instant, secure payments! 💰 Airtel Money is coming soon. Payments reflect in your account in real-time. No hidden fees on the Starter plan!",
  hello:
    "Hello! 👋 Welcome to SwiftShopy! I'm here to help you grow your business online. What can I assist you with today?",
}

function getResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("store") || lower.includes("set up") || lower.includes("setup"))
    return botResponses.store
  if (lower.includes("whatsapp") || lower.includes("order"))
    return botResponses.whatsapp
  if (lower.includes("pric") || lower.includes("plan") || lower.includes("cost"))
    return botResponses.pricing
  if (lower.includes("pay") || lower.includes("momo") || lower.includes("money") || lower.includes("mtn"))
    return botResponses.payment
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey"))
    return botResponses.hello
  return botResponses.default
}

export function AIChatCard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! 👋 I'm SwiftShopy's AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simulate AI response delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700))

    const response = getResponse(text)
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }

    setIsTyping(false)
    setMessages((prev) => [...prev, assistantMsg])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div
      style={{
        width: "360px",
        height: "520px",
        backgroundColor: "#ffffff",
        borderRadius: "1.25rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingCart className="w-5 h-5" style={{ color: "#ffffff" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.9rem" }}>
            SwiftShopy Assistant
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <div
              style={{
                width: "0.5rem",
                height: "0.5rem",
                backgroundColor: "#4ade80",
                borderRadius: "50%",
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}>
              Online — typically replies instantly
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          backgroundColor: "#f8fafc",
        }}
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              gap: "0.5rem",
              alignItems: "flex-end",
            }}
          >
            {msg.role === "assistant" && (
              <div
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  backgroundColor: "#3b82f6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Bot className="w-3 h-3" style={{ color: "#ffffff" }} />
              </div>
            )}
            <div
              style={{
                maxWidth: "75%",
                padding: "0.625rem 0.875rem",
                borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                backgroundColor: msg.role === "user" ? "#3b82f6" : "#ffffff",
                color: msg.role === "user" ? "#ffffff" : "#0f172a",
                fontSize: "0.8125rem",
                lineHeight: 1.6,
                border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                whiteSpace: "pre-line",
              }}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User className="w-3 h-3" style={{ color: "#64748b" }} />
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  backgroundColor: "#3b82f6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot className="w-3 h-3" style={{ color: "#ffffff" }} />
              </div>
              <div
                style={{
                  padding: "0.625rem 0.875rem",
                  backgroundColor: "#ffffff",
                  borderRadius: "1rem 1rem 1rem 0.25rem",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  gap: "0.25rem",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: "0.375rem",
                      height: "0.375rem",
                      backgroundColor: "#94a3b8",
                      borderRadius: "50%",
                    }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "0.375rem",
            flexWrap: "wrap",
          }}
        >
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              style={{
                padding: "0.25rem 0.625rem",
                backgroundColor: "rgba(59,130,246,0.08)",
                color: "#3b82f6",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "9999px",
                fontSize: "0.7rem",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "0.75rem 1rem",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isTyping}
          style={{
            flex: 1,
            padding: "0.625rem 0.875rem",
            border: "1px solid #e2e8f0",
            borderRadius: "9999px",
            fontSize: "0.8125rem",
            outline: "none",
            backgroundColor: "#f8fafc",
            color: "#0f172a",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          style={{
            width: "2.25rem",
            height: "2.25rem",
            backgroundColor: input.trim() && !isTyping ? "#3b82f6" : "#e2e8f0",
            borderRadius: "50%",
            border: "none",
            cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background-color 0.2s",
          }}
        >
          {isTyping ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#64748b" }} />
          ) : (
            <Send className="w-4 h-4" style={{ color: input.trim() ? "#ffffff" : "#94a3b8" }} />
          )}
        </button>
      </form>
    </div>
  )
}

export default AIChatCard

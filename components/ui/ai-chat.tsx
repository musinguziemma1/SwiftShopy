"use client"

import React, { useState, useRef, useEffect } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Loader2, ShoppingCart, HeadphonesIcon } from "lucide-react"

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
  const [ticketCreated, setTicketCreated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatAction = useAction(api.agent.chat as any)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

    try {
      const convexMessages = messages.map(m => ({ role: m.role, content: m.content }))
      convexMessages.push({ role: "user" as const, content: text.trim() })

      const result = await chatAction({
        messages: convexMessages,
      })

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      }

      if (result.ticketCreated) {
        setTicketCreated(true)
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again or contact support directly.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    }
  }

  const handleEscalate = async () => {
    await sendMessage("I need to speak to a human about my issue")
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
              Online — AI powered
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

        <div ref={messagesEndRef} />
      </div>

      {/* Ticket created notification */}
      {ticketCreated && (
        <div
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dcfce7",
            borderTop: "1px solid #86efac",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "#166534",
          }}
        >
          <HeadphonesIcon className="w-4 h-4" />
          <span>Support ticket created! Our team will contact you shortly.</span>
        </div>
      )}

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

      {/* Talk to human button */}
      <div
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          onClick={handleEscalate}
          style={{
            padding: "0.375rem 0.75rem",
            backgroundColor: "transparent",
            color: "#64748b",
            border: "1px solid #e2e8f0",
            borderRadius: "9999px",
            fontSize: "0.7rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          <HeadphonesIcon className="w-3 h-3" />
          Talk to human
        </button>
      </div>

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
          disabled={!input.trim()}
          style={{
            width: "2.25rem",
            height: "2.25rem",
            backgroundColor: input.trim() ? "#3b82f6" : "#e2e8f0",
            borderRadius: "50%",
            border: "none",
            cursor: input.trim() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Send className="w-4 h-4" style={{ color: input.trim() ? "#ffffff" : "#94a3b8" }} />
        </button>
      </form>
    </div>
  )
}

export default AIChatCard
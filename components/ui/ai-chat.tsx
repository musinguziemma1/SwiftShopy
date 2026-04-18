"use client"

import React, { useState, useRef, useEffect } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Loader2, ShoppingCart, HeadphonesIcon } from "lucide-react"
import { useSession } from "next-auth/react"

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
  const { data: session } = useSession()
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
  const [ticketCreated, setTicketCreated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatAction = useAction(api.agent.chat)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      const convexMessages = messages.map(m => ({ role: m.role, content: m.content }))
      convexMessages.push({ role: "user" as const, content: text.trim() })

      const result = await chatAction({
        messages: convexMessages,
        userId: session?.user?.id || session?.user?.email || undefined,
        userName: session?.user?.name || undefined,
        userEmail: session?.user?.email || undefined,
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
    } finally {
      setIsTyping(false)
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
      className="flex flex-col bg-card border border-border shadow-2xl rounded-2xl overflow-hidden"
      style={{
        width: "360px",
        height: "520px",
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-indigo-600 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">SwiftShopy Assistant</div>
          <div className="flex items-center gap-1.5 text-white/80 text-[10px]">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full border border-white/20" />
            Online — AI powered
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-muted/30">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 ${
              msg.role === "assistant" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>
              {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-card border border-border text-foreground rounded-tl-none"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-sm bg-primary text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce delay-200" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ticket created notification */}
      <AnimatePresence>
        {ticketCreated && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-4 py-2 bg-green-500/10 border-t border-green-500/20 flex items-center gap-2 text-[11px] text-green-600 font-medium"
          >
            <HeadphonesIcon className="w-3.5 h-3.5" />
            <span>Support ticket created! We'll contact you at your email.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions Footer */}
      <div className="p-3 bg-card border-t border-border space-y-3">
        {/* Suggested questions */}
        {messages.length <= 1 && !isTyping && (
          <div className="flex gap-1.5 flex-wrap">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-full text-[10px] font-medium hover:bg-primary/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Escalate button */}
        {!ticketCreated && (
          <div className="flex justify-center">
            <button
              onClick={handleEscalate}
              className="px-3 py-1 text-muted-foreground border border-border rounded-full text-[10px] font-medium hover:bg-accent transition-colors flex items-center gap-1.5"
            >
              <HeadphonesIcon className="w-3 h-3" />
              Talk to human
            </button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !isTyping 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default AIChatCard
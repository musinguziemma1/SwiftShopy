"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, ShoppingCart, Users, DollarSign, AlertCircle, CheckCircle, X, Settings } from "lucide-react"

interface Notification {
  id: string
  type: "order" | "seller" | "payment" | "alert" | "system"
  title: string
  message: string
  time: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New Order Placed",
    message: "Order #12345 — UGX 450,000 from Nakato Styles",
    time: "Just now",
    read: false,
  },
  {
    id: "2",
    type: "seller",
    title: "New Seller Registered",
    message: "Tech Store UG has just signed up and awaits verification",
    time: "5 min ago",
    read: false,
  },
  {
    id: "3",
    type: "payment",
    title: "Payment Processed",
    message: "UGX 890,000 received via MTN MoMo — Tech Hub UG",
    time: "12 min ago",
    read: false,
  },
  {
    id: "4",
    type: "alert",
    title: "Support Ticket Critical",
    message: "TKT-001: Payment not received — Sarah Nakato",
    time: "30 min ago",
    read: true,
  },
  {
    id: "5",
    type: "system",
    title: "System Health",
    message: "All services operating normally. Uptime 99.99%",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "6",
    type: "payment",
    title: "Failed Payment Alert",
    message: "Transaction TXN-004 failed — JM Electronics",
    time: "2 hours ago",
    read: true,
  },
]

const iconMap = {
  order: <ShoppingCart className="w-4 h-4" />,
  seller: <Users className="w-4 h-4" />,
  payment: <DollarSign className="w-4 h-4" />,
  alert: <AlertCircle className="w-4 h-4" />,
  system: <CheckCircle className="w-4 h-4" />,
}

const colorMap = {
  order: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
  seller: { bg: "rgba(168,85,247,0.1)", color: "#a855f7" },
  payment: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  alert: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
  system: { bg: "rgba(234,179,8,0.1)", color: "#eab308" },
}

export function NotificationsCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          padding: "0.5rem",
          borderRadius: "0.5rem",
          border: "none",
          background: open ? "#f1f5f9" : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Bell className="w-5 h-5" style={{ color: "#374151" }} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: "0.25rem",
              right: "0.25rem",
              width: "1rem",
              height: "1rem",
              backgroundColor: "#ef4444",
              borderRadius: "9999px",
              fontSize: "0.625rem",
              fontWeight: 700,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 60,
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: "calc(100% + 0.5rem)",
                right: 0,
                width: "22rem",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.75rem",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                zIndex: 70,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h3 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        padding: "0.125rem 0.5rem",
                        backgroundColor: "rgba(147,51,234,0.1)",
                        color: "#9333ea",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        fontSize: "0.75rem",
                        color: "#9333ea",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      padding: "0.25rem",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#94a3b8",
                      borderRadius: "0.375rem",
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div style={{ maxHeight: "24rem", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "3rem 1.25rem",
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "0.875rem",
                    }}
                  >
                    <Bell className="w-8 h-8" style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
                    <div>No notifications</div>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const colors = colorMap[notif.type]
                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => markRead(notif.id)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          padding: "0.875rem 1.25rem",
                          borderBottom: "1px solid #f1f5f9",
                          cursor: "pointer",
                          backgroundColor: notif.read ? "transparent" : "rgba(147,51,234,0.02)",
                          transition: "background-color 0.15s",
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            width: "2.25rem",
                            height: "2.25rem",
                            borderRadius: "0.5rem",
                            backgroundColor: colors.bg,
                            color: colors.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {iconMap[notif.type]}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "0.125rem",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "0.8125rem",
                                fontWeight: notif.read ? 500 : 700,
                                color: "#0f172a",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "12rem",
                              }}
                            >
                              {notif.title}
                            </p>
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                color: "#94a3b8",
                                flexShrink: 0,
                                marginLeft: "0.5rem",
                              }}
                            >
                              {notif.time}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#64748b",
                              lineHeight: 1.5,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {notif.message}
                          </p>
                        </div>

                        {/* Unread dot + dismiss */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "0.5rem",
                            flexShrink: 0,
                          }}
                        >
                          {!notif.read && (
                            <div
                              style={{
                                width: "0.5rem",
                                height: "0.5rem",
                                backgroundColor: "#9333ea",
                                borderRadius: "9999px",
                              }}
                            />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              dismiss(notif.id)
                            }}
                            style={{
                              padding: "0.125rem",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              color: "#cbd5e1",
                              borderRadius: "0.25rem",
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "0.75rem 1.25rem",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "#9333ea",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  View all notifications
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.75rem",
                    color: "#64748b",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Preferences
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationsCenter

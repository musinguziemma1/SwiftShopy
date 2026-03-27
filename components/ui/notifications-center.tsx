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
  order: { bg: "bg-blue-500/20", color: "text-blue-500" },
  seller: { bg: "bg-purple-500/20", color: "text-purple-500" },
  payment: { bg: "bg-green-500/20", color: "text-green-500" },
  alert: { bg: "bg-red-500/20", color: "text-red-500" },
  system: { bg: "bg-amber-500/20", color: "text-amber-500" },
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
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-lg transition-colors ${
          open ? "bg-accent/50" : "hover:bg-accent/30"
        }`}
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center"
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
              className="fixed inset-0 z-60"
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-80 glass rounded-xl shadow-elevated z-70 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 rounded-full text-xs font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-purple-500 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 hover:bg-accent/50 rounded transition-colors text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground text-sm">
                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
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
                        className={`flex items-start gap-3 p-4 border-b border-border/30 cursor-pointer transition-colors ${
                          notif.read ? "" : "bg-purple-500/5"
                        } hover:bg-accent/30`}
                      >
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-lg ${colors.bg} ${colors.color} flex items-center justify-center shrink-0`}>
                          {iconMap[notif.type]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-sm truncate max-w-[12rem] ${
                              notif.read ? "font-medium" : "font-bold text-foreground"
                            }`}>
                              {notif.title}
                            </p>
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notif.message}
                          </p>
                        </div>

                        {/* Unread dot + dismiss */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          {!notif.read && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              dismiss(notif.id)
                            }}
                            className="p-1 hover:bg-accent/50 rounded text-muted-foreground/50 hover:text-muted-foreground transition-colors"
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
              <div className="p-3 border-t border-border/50 flex items-center justify-between">
                <button className="text-sm font-medium text-purple-500 hover:underline">
                  View all notifications
                </button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
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

"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bell, ShoppingCart, Users, DollarSign, AlertCircle, CheckCircle, X, Settings, MessageSquare,
  Package, Store, CreditCard, UserPlus, UserMinus, Gift, TrendingUp, ArrowUpRight, 
  Percent, HelpCircle, FileText, Wallet, Star, Zap, Clock
} from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSession } from "next-auth/react"

interface NotificationsCenterProps {
  adminMode?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  order_new: <ShoppingCart className="w-4 h-4" />,
  order_paid: <CheckCircle className="w-4 h-4" />,
  order_failed: <AlertCircle className="w-4 h-4" />,
  order_updated: <ShoppingCart className="w-4 h-4" />,
  payment_received: <DollarSign className="w-4 h-4" />,
  product_low_stock: <AlertCircle className="w-4 h-4" />,
  product_out_of_stock: <AlertCircle className="w-4 h-4" />,
  product_created: <Package className="w-4 h-4" />,
  product_updated: <Package className="w-4 h-4" />,
  whatsapp_message: <MessageSquare className="w-4 h-4" />,
  whatsapp_connected: <CheckCircle className="w-4 h-4" />,
  system_alert: <Settings className="w-4 h-4" />,
  sla_breach: <AlertCircle className="w-4 h-4" />,
  user_registered: <UserPlus className="w-4 h-4" />,
  user_suspended: <UserMinus className="w-4 h-4" />,
  user_activated: <CheckCircle className="w-4 h-4" />,
  store_created: <Store className="w-4 h-4" />,
  transaction_new: <CreditCard className="w-4 h-4" />,
  customer_inquiry: <HelpCircle className="w-4 h-4" />,
  customer_chat: <MessageSquare className="w-4 h-4" />,
  payout_requested: <Wallet className="w-4 h-4" />,
  payout_completed: <CheckCircle className="w-4 h-4" />,
  subscription_created: <Zap className="w-4 h-4" />,
  subscription_renewed: <Zap className="w-4 h-4" />,
  subscription_expired: <AlertCircle className="w-4 h-4" />,
  subscription_upgraded: <ArrowUpRight className="w-4 h-4" />,
  subscription_downgraded: <TrendingUp className="w-4 h-4" />,
  payment_pending: <Clock className="w-4 h-4" />,
  payment_success: <CheckCircle className="w-4 h-4" />,
  payment_failed: <AlertCircle className="w-4 h-4" />,
  product_limit_reached: <AlertCircle className="w-4 h-4" />,
  referral_bonus: <Gift className="w-4 h-4" />,
  usage_discount_applied: <Percent className="w-4 h-4" />,
  support_ticket: <MessageSquare className="w-4 h-4" />,
  ticket_update: <MessageSquare className="w-4 h-4" />,
  ticket_reply: <MessageSquare className="w-4 h-4" />,
  support_ticket_created: <CheckCircle className="w-4 h-4" />,
}

const colorMap: Record<string, { bg: string; color: string }> = {
  order_new: { bg: "bg-blue-500/20", color: "text-blue-500" },
  order_paid: { bg: "bg-green-500/20", color: "text-green-500" },
  order_failed: { bg: "bg-red-500/20", color: "text-red-500" },
  order_updated: { bg: "bg-blue-500/20", color: "text-blue-500" },
  payment_received: { bg: "bg-green-500/20", color: "text-green-500" },
  product_low_stock: { bg: "bg-amber-500/20", color: "text-amber-500" },
  product_out_of_stock: { bg: "bg-red-500/20", color: "text-red-500" },
  product_created: { bg: "bg-blue-500/20", color: "text-blue-500" },
  product_updated: { bg: "bg-blue-500/20", color: "text-blue-500" },
  whatsapp_message: { bg: "bg-green-500/20", color: "text-green-500" },
  whatsapp_connected: { bg: "bg-green-500/20", color: "text-green-500" },
  system_alert: { bg: "bg-purple-500/20", color: "text-purple-500" },
  sla_breach: { bg: "bg-red-500/20", color: "text-red-500" },
  user_registered: { bg: "bg-green-500/20", color: "text-green-500" },
  user_suspended: { bg: "bg-red-500/20", color: "text-red-500" },
  user_activated: { bg: "bg-green-500/20", color: "text-green-500" },
  store_created: { bg: "bg-blue-500/20", color: "text-blue-500" },
  transaction_new: { bg: "bg-blue-500/20", color: "text-blue-500" },
  customer_inquiry: { bg: "bg-purple-500/20", color: "text-purple-500" },
  customer_chat: { bg: "bg-green-500/20", color: "text-green-500" },
  payout_requested: { bg: "bg-amber-500/20", color: "text-amber-500" },
  payout_completed: { bg: "bg-green-500/20", color: "text-green-500" },
  subscription_created: { bg: "bg-purple-500/20", color: "text-purple-500" },
  subscription_renewed: { bg: "bg-purple-500/20", color: "text-purple-500" },
  subscription_expired: { bg: "bg-red-500/20", color: "text-red-500" },
  subscription_upgraded: { bg: "bg-green-500/20", color: "text-green-500" },
  subscription_downgraded: { bg: "bg-amber-500/20", color: "text-amber-500" },
  payment_pending: { bg: "bg-amber-500/20", color: "text-amber-500" },
  payment_success: { bg: "bg-green-500/20", color: "text-green-500" },
  payment_failed: { bg: "bg-red-500/20", color: "text-red-500" },
  product_limit_reached: { bg: "bg-red-500/20", color: "text-red-500" },
  referral_bonus: { bg: "bg-purple-500/20", color: "text-purple-500" },
  usage_discount_applied: { bg: "bg-green-500/20", color: "text-green-500" },
  support_ticket: { bg: "bg-blue-500/20", color: "text-blue-500" },
  ticket_update: { bg: "bg-blue-500/20", color: "text-blue-500" },
  ticket_reply: { bg: "bg-blue-500/20", color: "text-blue-500" },
  support_ticket_created: { bg: "bg-green-500/20", color: "text-green-500" },
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationsCenter({ adminMode = false }: NotificationsCenterProps) {
  const { data: session } = useSession()
  const userId = adminMode ? "admin" : (session?.user as any)?.id
  const [open, setOpen] = useState(false)

  // For admin mode, use getAllAdmin; for seller mode, use getByUser
  const adminNotifications = useQuery(
    api.notifications.getAllAdmin,
    adminMode ? { limit: 50 } : "skip"
  )

  const userNotifications = useQuery(
    api.notifications.getByUser,
    !adminMode && userId ? { userId, limit: 50 } : "skip"
  )

  const adminUnreadCount = useQuery(
    api.notifications.getUnreadCount,
    adminMode ? { userId: "admin" } : "skip"
  )

  const userUnreadCount = useQuery(
    api.notifications.getUnreadCount,
    !adminMode && userId ? { userId } : "skip"
  )

  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  const deleteNotification = useMutation(api.notifications.delete_)

  const notifList = adminMode ? (adminNotifications ?? []) : (userNotifications ?? [])
  const unreadCount = adminMode ? adminUnreadCount : userUnreadCount
  const effectiveUserId = adminMode ? "admin" : userId

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
        {(unreadCount ?? 0) > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center"
          >
            {(unreadCount ?? 0) > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} className="fixed inset-0 z-60" />
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
                  {(unreadCount ?? 0) > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 rounded-full text-xs font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(unreadCount ?? 0) > 0 && effectiveUserId && (
                    <button
                      onClick={() => markAllAsRead({ userId: effectiveUserId })}
                      className="text-xs text-purple-500 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="p-1 hover:bg-accent/50 rounded transition-colors text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifList.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground text-sm">
                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <div>No notifications yet</div>
                  </div>
                ) : (
                  notifList.map((notif) => {
                    const colors = colorMap[notif.type] ?? { bg: "bg-gray-500/20", color: "text-gray-500" }
                    const icon = iconMap[notif.type] ?? <Bell className="w-4 h-4" />
                    return (
                      <motion.div
                        key={notif._id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => markAsRead({ id: notif._id })}
                        className={`flex items-start gap-3 p-4 border-b border-border/30 cursor-pointer transition-colors ${
                          notif.isRead ? "" : "bg-purple-500/5"
                        } hover:bg-accent/30`}
                      >
                        <div className={`w-9 h-9 rounded-lg ${colors.bg} ${colors.color} flex items-center justify-center shrink-0`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-sm truncate max-w-[12rem] ${notif.isRead ? "font-medium" : "font-bold text-foreground"}`}>
                              {notif.title}
                            </p>
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                              {getTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          {!notif.isRead && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification({ id: notif._id }) }}
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

              <div className="p-3 border-t border-border/50">
                <button className="text-sm font-medium text-purple-500 hover:underline w-full text-center">
                  View all notifications
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

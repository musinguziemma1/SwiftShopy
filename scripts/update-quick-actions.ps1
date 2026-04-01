$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw

$old = @"
              {/* Quick Actions */}
              {whatsappSubTab === "quick-actions" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Send Catalog", desc: "Share your product catalog with a customer", icon: <Package className="w-6 h-6" />, color: "from-blue-500 to-indigo-500" },
                    { title: "Send Payment Link", desc: "Generate and send a payment link via MTN MoMo", icon: <CreditCard className="w-6 h-6" />, color: "from-yellow-500 to-orange-500" },
                    { title: "Auto Reply Setup", desc: "Configure automated welcome & away messages", icon: <MessageSquare className="w-6 h-6" />, color: "from-green-500 to-emerald-500" },
                    { title: "Broadcast Message", desc: "Send a message to multiple customers at once", icon: <Send className="w-6 h-6" />, color: "from-purple-500 to-pink-500" },
                    { title: "Order Confirmation", desc: "Send order confirmation with tracking details", icon: <Check className="w-6 h-6" />, color: "from-teal-500 to-cyan-500" },
                    { title: "Feedback Request", desc: "Ask customers to rate their purchase experience", icon: <Star className="w-6 h-6" />, color: "from-amber-500 to-yellow-500" },
                  ].map((action, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-6 glass rounded-xl text-left hover:shadow-lg transition-all group">
"@

$new = @"
              {/* Quick Actions - Interactive */}
              {whatsappSubTab === "quick-actions" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { 
                      title: "Send Catalog", 
                      desc: "Share your product catalog with a customer", 
                      icon: <Package className="w-6 h-6" />, 
                      color: "from-blue-500 to-indigo-500",
                      action: () => {
                        if (selectedChat) {
                          const catalogMsg = "Check out our latest products:\n\n" + (products ?? []).map((p: any) => `- ${p.name}: UGX ${p.price?.toLocaleString()}`).join("\n");
                          handleSendQuickReply(catalogMsg);
                        }
                      }
                    },
                    { 
                      title: "Send Payment Link", 
                      desc: "Generate and send a payment link via MTN MoMo", 
                      icon: <CreditCard className="w-6 h-6" />, 
                      color: "from-yellow-500 to-orange-500",
                      action: () => setShowPaymentLinkModal(true)
                    },
                    { 
                      title: "Auto Reply Setup", 
                      desc: "Configure automated welcome & away messages", 
                      icon: <MessageSquare className="w-6 h-6" />, 
                      color: "from-green-500 to-emerald-500",
                      action: () => setShowQuickRepliesModal(true)
                    },
                    { 
                      title: "Broadcast Message", 
                      desc: "Send a message to multiple customers at once", 
                      icon: <Send className="w-6 h-6" />, 
                      color: "from-purple-500 to-pink-500",
                      action: () => {
                        alert("Broadcast feature coming soon!");
                      }
                    },
                    { 
                      title: "Order Confirmation", 
                      desc: "Send order confirmation with tracking details", 
                      icon: <Check className="w-6 h-6" />, 
                      color: "from-teal-500 to-cyan-500",
                      action: () => {
                        if (selectedChat) {
                          const confirmMsg = "Your order has been confirmed! Thank you for shopping with us. We'll notify you when your order ships.";
                          handleSendQuickReply(confirmMsg);
                        }
                      }
                    },
                    { 
                      title: "Feedback Request", 
                      desc: "Ask customers to rate their purchase experience", 
                      icon: <Star className="w-6 h-6" />, 
                      color: "from-amber-500 to-yellow-500",
                      action: () => {
                        if (selectedChat) {
                          const feedbackMsg = "We hope you enjoyed your purchase! Would you mind taking a moment to rate your experience? Your feedback helps us improve!";
                          handleSendQuickReply(feedbackMsg);
                        }
                      }
                    },
                  ].map((action, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      onClick={action.action}
                      className="p-6 glass rounded-xl text-left hover:shadow-lg transition-all group">
"@

if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    Set-Content -Path $path -Value $content -NoNewline
    Write-Host "Successfully updated Quick Actions"
} else {
    Write-Host "Old pattern not found"
}

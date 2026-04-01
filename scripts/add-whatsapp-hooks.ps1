$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw

# Use the exact string with CRLF
$old = "  // Get WhatsApp conversations from Convex`r`n  const { conversations, sendMessage } = useWhatsAppChat(storeId);`r`n  const { messages } = useWhatsAppMessages(selectedChat);"

$new = @" 
  // Get WhatsApp data from Convex`r`n  const { conversations, sendMessage } = useWhatsAppChat(storeId);`r`n  const { messages } = useWhatsAppMessages(selectedChat);`r`n  const { account: waAccount, isConnected: waIsConnected } = useWhatsAppAccount(storeId);`r`n  const { analytics: waAnalytics } = useWhatsAppAnalytics(storeId);`r`n  const { quickReplies } = useWhatsAppQuickReplies(storeId);`r`n  const { paymentLinks } = useWhatsAppPaymentLinks(storeId);`r`n  `r`n  // WhatsApp UI state`r`n  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);`r`n  const [showQuickRepliesModal, setShowQuickRepliesModal] = useState(false);`r`n  const [paymentLinkAmount, setPaymentLinkAmount] = useState("");`r`n  const [paymentLinkDesc, setPaymentLinkDesc] = useState("");`r`n  `r`n  // Handle send payment link`r`n  const handleSendPaymentLink = async () => {`r`n    if (!selectedChat || !paymentLinkAmount) return;`r`n    const conv = conversations?.find((c: any) => c._id === selectedChat);`r`n    if (conv) {`r`n      const message = `Payment Request\n\nAmount: UGX ${parseInt(paymentLinkAmount).toLocaleString()}\nDescription: ${paymentLinkDesc || 'Payment for order'}\n\nClick to pay via MTN MoMo: pay.swiftshopy.com/pay/${Date.now()}`;`r`n      await sendMessage(selectedChat, conv.contactId, message);`r`n      setShowPaymentLinkModal(false);`r`n      setPaymentLinkAmount("");`r`n      setPaymentLinkDesc("");`r`n    }`r`n  };`r`n  `r`n  // Handle send quick reply`r`n  const handleSendQuickReply = async (msg: string) => {`r`n    if (!selectedChat) return;`r`n    const conv = conversations?.find((c: any) => c._id === selectedChat);`r`n    if (conv) {`r`n      await sendMessage(selectedChat, conv.contactId, msg);`r`n      setShowQuickRepliesModal(false);`r`n    }`r`n  };
"@

if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    Set-Content -Path $path -Value $content -NoNewline
    Write-Host "Successfully added WhatsApp hooks"
} else {
    Write-Host "Old pattern not found"
}

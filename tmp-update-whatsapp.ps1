$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw

$oldCode = @'
  // Get WhatsApp conversations from Convex
  const { conversations, sendMessage } = useWhatsAppChat(storeId);
  const { messages } = useWhatsAppMessages(selectedChat);
  useEffect(() => {
'@

$newCode = @'
  // Get WhatsApp data from Convex
  const { conversations, sendMessage } = useWhatsAppChat(storeId);
  const { messages } = useWhatsAppMessages(selectedChat);
  const { account: waAccount, isConnected: waIsConnected } = useWhatsAppAccount(storeId);
  const { analytics: waAnalytics } = useWhatsAppAnalytics(storeId);
  const { quickReplies } = useWhatsAppQuickReplies(storeId);
  const { paymentLinks } = useWhatsAppPaymentLinks(storeId);
  
  // WhatsApp UI state
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [showQuickRepliesModal, setShowQuickRepliesModal] = useState(false);
  const [paymentLinkAmount, setPaymentLinkAmount] = useState("");
  const [paymentLinkDesc, setPaymentLinkDesc] = useState("");
  
  // Handle send payment link
  const handleSendPaymentLink = async () => {
    if (!selectedChat || !paymentLinkAmount) return;
    const conv = conversations?.find((c: any) => c._id === selectedChat);
    if (conv) {
      const message = "Payment Request\n\nAmount: UGX " + parseInt(paymentLinkAmount).toLocaleString() + "\nDescription: " + (paymentLinkDesc || "Payment for order") + "\n\nClick to pay via MTN MoMo: pay.swiftshopy.com/pay/" + Date.now();
      await sendMessage(selectedChat, conv.contactId, message);
      setShowPaymentLinkModal(false);
      setPaymentLinkAmount("");
      setPaymentLinkDesc("");
    }
  };
  
  // Handle send quick reply
  const handleSendQuickReply = async (message) => {
    if (!selectedChat) return;
    const conv = conversations?.find((c) => c._id === selectedChat);
    if (conv) {
      await sendMessage(selectedChat, conv.contactId, message);
      setShowQuickRepliesModal(false);
    }
  };
  
  useEffect(() => {
'@

$content = $content.Replace($oldCode, $newCode)
Set-Content -Path $path -Value $content -NoNewline
Write-Host "Updated WhatsApp hooks and state"

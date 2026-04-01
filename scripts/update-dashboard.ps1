$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$lines = Get-Content $path

# Find the line with "Get WhatsApp conversations"
$targetLine = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "Get WhatsApp conversations from Convex") {
        $targetLine = $i
        Write-Host "Found target at line $($i+1)"
        break
    }
}

if ($targetLine -ge 0) {
    # Build new content
    $newLines = @()
    for ($i = 0; $i -lt $targetLine; $i++) {
        $newLines += $lines[$i]
    }
    
    # Add new WhatsApp hooks code
    $newLines += '  // Get WhatsApp data from Convex'
    $newLines += '  const { conversations, sendMessage } = useWhatsAppChat(storeId);'
    $newLines += '  const { messages } = useWhatsAppMessages(selectedChat);'
    $newLines += '  const { account: waAccount, isConnected: waIsConnected } = useWhatsAppAccount(storeId);'
    $newLines += '  const { analytics: waAnalytics } = useWhatsAppAnalytics(storeId);'
    $newLines += '  const { quickReplies } = useWhatsAppQuickReplies(storeId);'
    $newLines += '  const { paymentLinks } = useWhatsAppPaymentLinks(storeId);'
    $newLines += ''
    $newLines += '  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);'
    $newLines += '  const [showQuickRepliesModal, setShowQuickRepliesModal] = useState(false);'
    $newLines += '  const [paymentLinkAmount, setPaymentLinkAmount] = useState("");'
    $newLines += '  const [paymentLinkDesc, setPaymentLinkDesc] = useState("");'
    $newLines += ''
    $newLines += '  const handleSendPaymentLink = async () => {'
    $newLines += '    if (!selectedChat || !paymentLinkAmount) return;'
    $newLines += '    const conv = conversations?.find((c) => c._id === selectedChat);'
    $newLines += '    if (conv) {'
    $newLines += '      await sendMessage(selectedChat, conv.contactId, "Payment Request: UGX " + parseInt(paymentLinkAmount).toLocaleString());'
    $newLines += '      setShowPaymentLinkModal(false);'
    $newLines += '    }'
    $newLines += '  };'
    $newLines += ''
    $newLines += '  const handleSendQuickReply = async (msg) => {'
    $newLines += '    if (!selectedChat) return;'
    $newLines += '    const conv = conversations?.find((c) => c._id === selectedChat);'
    $newLines += '    if (conv) {'
    $newLines += '      await sendMessage(selectedChat, conv.contactId, msg);'
    $newLines += '      setShowQuickRepliesModal(false);'
    $newLines += '    }'
    $newLines += '  };'
    
    # Skip old lines until we find useEffect
    $skipUntilUseEffect = $true
    for ($i = $targetLine; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "useEffect\(\(\) =>") {
            $newLines += ''
            $newLines += '  useEffect(() => {'
            $skipUntilUseEffect = $false
            # Add remaining lines from i+1 onwards
            for ($j = $i + 1; $j -lt $lines.Count; $j++) {
                $newLines += $lines[$j]
            }
            break
        }
    }
    
    # Write new content
    $newLines | Set-Content $path -NoNewline
    Write-Host "Successfully updated WhatsApp hooks in dashboard"
} else {
    Write-Host "Target line not found"
}

$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw
$old = @"
  // Get WhatsApp conversations from Convex
  const { conversations, sendMessage } = useWhatsAppChat(storeId);
  const { messages } = useWhatsAppMessages(selectedChat);
  useEffect(() => {
    if (store) {
"@
if ($content.Contains($old)) {
    Write-Host "Found old pattern"
} else {
    Write-Host "Old pattern not found"
    Write-Host "Looking for 'WhatsApp conversations'..."
    if ($content.Contains("WhatsApp conversations")) {
        Write-Host "Found 'WhatsApp conversations' in file"
        $idx = $content.IndexOf("WhatsApp conversations")
        Write-Host "At index: $idx"
        Write-Host "Content around it: $($content.Substring($idx, 200))"
    }
}

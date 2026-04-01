$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw
$old = 'import { useWhatsAppChat, useWhatsAppMessages } from "@/lib/hooks/useWhatsAppChat";'
$new = 'import { useWhatsAppChat, useWhatsAppMessages, useWhatsAppAccount, useWhatsAppQuickReplies, useWhatsAppPaymentLinks, useWhatsAppAnalytics } from "@/lib/hooks/useWhatsAppChat";'
$content = $content.Replace($old, $new)
Set-Content -Path $path -Value $content -NoNewline
Write-Host "Updated imports"

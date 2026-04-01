$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw

# Replace hardcoded stats with dynamic ones
$content = $content.Replace('value: "142", change: "+23%", icon: <MessageSquare', 'value: waAnalytics?.messagesToday?.toString() ?? "0", change: "+23%", icon: <MessageSquare')
$content = $content.Replace('value: "28", change: "+5", icon: <Users', 'value: waAnalytics?.activeConversations?.toString() ?? "0", change: "+5", icon: <Users')
$content = $content.Replace('value: "94%", change: "+2%", icon: <Check', 'value: (waAnalytics?.responseRate ?? 0) + "%", change: "+2%", icon: <Check')
$content = $content.Replace('value: "2m", change: "-30s", icon: <Clock', 'value: (waAnalytics?.avgResponseTime ? Math.round(waAnalytics.avgResponseTime / 60) + "m" : "0m"), change: "-30s", icon: <Clock')

Set-Content -Path $path -Value $content -NoNewline
Write-Host "Updated WhatsApp stats values"

$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw

$old = @"
              {/* WhatsApp Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Messages Today", value: "142", change: "+23%", icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-green-500", bg: "bg-green-500/10" },
                  { label: "Active Chats", value: "28", change: "+5", icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Response Rate", value: "94%", change: "+2%", icon: <Check className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { label: "Avg Response", value: "2m", change: "-30s", icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-orange-500", bg: "bg-orange-500/10" },
                ].map((stat, i) => (
"@

$new = @"
              {/* WhatsApp Stats - Real Data from Convex */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Messages Today", value: waAnalytics?.messagesToday?.toString() ?? "0", change: "+23%", icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-green-500", bg: "bg-green-500/10" },
                  { label: "Active Chats", value: waAnalytics?.activeConversations?.toString() ?? "0", change: "+5", icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Response Rate", value: (waAnalytics?.responseRate ?? 0) + "%", change: "+2%", icon: <Check className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { label: "Avg Response", value: (waAnalytics?.avgResponseTime ? Math.round(waAnalytics.avgResponseTime / 60) + "m" : "0m"), change: "-30s", icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-orange-500", bg: "bg-orange-500/10" },
                ].map((stat, i) => (
"@

if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    Set-Content -Path $path -Value $content -NoNewline
    Write-Host "Successfully updated WhatsApp stats"
} else {
    Write-Host "Old pattern not found - checking for variations..."
}

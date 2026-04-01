$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw

# Fix the property name
$content = $content.Replace('waAnalytics?.messagesToday?.toString() ?? "0"', 'waAnalytics?.totalMessages?.toString() ?? "0"')

Set-Content -Path $path -Value $content -NoNewline
Write-Host "Fixed analytics property name"

$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw

$start = $content.IndexOf("// Get WhatsApp conversations")
$end = $start + 250
$section = $content.Substring($start, 250)

Write-Host "Section (first 250 chars after comment):"
Write-Host $section
Write-Host ""
Write-Host "Replaced as hex: $([System.BitConverter]::ToString([System.Text.Encoding]::UTF8.GetBytes($section)))"

$filePath = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\page.tsx'
$lines = Get-Content $filePath

# Find the line with Pricing link
$pricingIndex = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'href="/pricing"' -and $lines[$i] -match 'text-sm font-medium') {
        $pricingIndex = $i
        break
    }
}

if ($pricingIndex -ge 0) {
    Write-Host "Found Pricing link at line $($pricingIndex + 1)"
    
    # Insert Shop link after Pricing link
    $shopLink = @(
        '              <Link href="/shop" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 flex items-center gap-1">'
        '                <ShoppingCart className="w-4 h-4" />'
        '                Shop'
        '              </Link>'
    )
    
    # Insert after the closing </Link> of Pricing
    $insertIndex = $pricingIndex + 3  # After Pricing line and closing tag
    
    # Build new content
    $newLines = @()
    $newLines += $lines[0..($insertIndex - 1)]
    $newLines += $shopLink
    $newLines += $lines[$insertIndex..($lines.Count - 1)]
    
    Set-Content -Path $filePath -Value $newLines -NoNewline
    Write-Host "Shop button added to landing page navigation!"
} else {
    Write-Host "Could not find Pricing link"
}

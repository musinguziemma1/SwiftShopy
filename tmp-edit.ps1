$filePath = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\page.tsx'
$content = Get-Content $filePath -Raw

$oldText = @'
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Pricing
              </Link>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Testimonials
              </a>
'@

$newText = @'
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Pricing
              </Link>
              <Link href="/shop" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Shop
              </Link>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Testimonials
              </a>
'@

if ($content.Contains($oldText)) {
    $content = $content.Replace($oldText, $newText)
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "Landing page updated with Shop link"
} else {
    Write-Host "Pattern not found in file"
}

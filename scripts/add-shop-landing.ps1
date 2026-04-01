$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\page.tsx'
$content = Get-Content $path -Raw

$old = '              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Pricing
              </Link>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">'

$new = '              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Pricing
              </Link>
              <Link href="/shop" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Shop
              </Link>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">'

if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    Set-Content -Path $path -Value $content -NoNewline
    Write-Host "Shop link added to landing page"
} else {
    Write-Host "Pattern not found"
}

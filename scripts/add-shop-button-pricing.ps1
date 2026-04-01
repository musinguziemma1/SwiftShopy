$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\pricing\page.tsx'
$content = Get-Content $path -Raw

# Add Shop button to desktop navigation (after Pricing)
$oldDesktop = @'
              <Link href="/pricing" className="text-sm font-medium text-primary">
                Pricing
              </Link>
              <a href="/#features" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Features
              </a>
'@

$newDesktop = @'
              <Link href="/pricing" className="text-sm font-medium text-primary">
                Pricing
              </Link>
              <Link href="/shop" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Shop
              </Link>
              <a href="/#features" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Features
              </a>
'@

if ($content.Contains($oldDesktop)) {
    $content = $content.Replace($oldDesktop, $newDesktop)
    Write-Host "Added Shop to pricing page desktop navigation"
} else {
    Write-Host "Desktop pattern not found"
}

# Add Shop button to mobile navigation (after Pricing)
$oldMobile = @'
                <Link href="/pricing" className="block py-2 text-sm font-medium text-primary">
                  Pricing
                </Link>
                <Link
                  href="/dashboard"
'@

$newMobile = @'
                <Link href="/pricing" className="block py-2 text-sm font-medium text-primary">
                  Pricing
                </Link>
                <Link href="/shop" className="block py-2 text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Shop
                </Link>
                <Link
                  href="/dashboard"
'@

if ($content.Contains($oldMobile)) {
    $content = $content.Replace($oldMobile, $newMobile)
    Write-Host "Added Shop to pricing page mobile navigation"
} else {
    Write-Host "Mobile pattern not found"
}

Set-Content -Path $path -Value $content -NoNewline
Write-Host "Pricing page updated successfully!"

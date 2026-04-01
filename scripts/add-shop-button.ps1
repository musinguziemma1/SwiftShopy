$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\page.tsx'
$content = Get-Content $path -Raw

# Add Shop button to desktop navigation (after Pricing)
$oldDesktop = @'
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Pricing
              </Link>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Testimonials
              </a>
'@

$newDesktop = @'
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

if ($content.Contains($oldDesktop)) {
    $content = $content.Replace($oldDesktop, $newDesktop)
    Write-Host "Added Shop to desktop navigation"
}

# Add Shop button to mobile navigation (after Pricing)
$oldMobile = @'
                <Link href="/pricing" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  Pricing
                </Link>
                <a href="#testimonials" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  Testimonials
                </a>
'@

$newMobile = @'
                <Link href="/pricing" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link href="/shop" className="block py-2 text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Shop
                </Link>
                <a href="#testimonials" className="block py-2 text-sm font-medium hover:text-primary transition-colors">
                  Testimonials
                </a>
'@

if ($content.Contains($oldMobile)) {
    $content = $content.Replace($oldMobile, $newMobile)
    Write-Host "Added Shop to mobile navigation"
}

Set-Content -Path $path -Value $content -NoNewline
Write-Host "Landing page updated successfully!"

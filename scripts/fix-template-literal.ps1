$path = 'D:\Web Projects\Projects\Swift2\SwiftShopy\app\(dashboard)\dashboard\page.tsx'
$content = Get-Content $path -Raw

$old = '      const message = Payment Request\n\nAmount: UGX \nDescription: \n\nClick to pay via MTN MoMo: pay.swiftshopy.com/pay/;'

$new = '      const message = "Payment Request\n\nAmount: UGX " + parseInt(paymentLinkAmount).toLocaleString() + "\nDescription: " + (paymentLinkDesc || "Payment for order") + "\n\nClick to pay via MTN MoMo: pay.swiftshopy.com/pay/" + Date.now();'

if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    Set-Content -Path $path -Value $content -NoNewline
    Write-Host "Successfully fixed template literal"
} else {
    Write-Host "Old pattern not found"
}

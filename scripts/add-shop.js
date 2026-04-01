const fs = require('fs');
const path = 'D:\\Web Projects\\Projects\\Swift2\\SwiftShopy\\app\\page.tsx';

const content = fs.readFileSync(path, 'utf-8');

const oldStr = `              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Pricing
              </Link>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Testimonials
              </a>`;

const newStr = `              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Pricing
              </Link>
              <Link href="/shop" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Shop
              </Link>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-all hover:scale-105">
                Testimonials
              </a>`;

if (content.includes(oldStr)) {
  const updated = content.replace(oldStr, newStr);
  fs.writeFileSync(path, updated, 'utf-8');
  console.log('Shop link added to landing page');
} else {
  console.log('Pattern not found');
}

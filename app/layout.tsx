import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SwiftShopy — WhatsApp Commerce + Mobile Money for Uganda",
  description: "Create your online store, sell via WhatsApp, and accept MTN Mobile Money payments. Built for Ugandan small businesses.",
  keywords: ["Uganda", "WhatsApp Commerce", "MTN MoMo", "online store", "mobile money"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://cdn.tailwindcss.com" async></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      border: 'hsl(var(--border))',
                      input: 'hsl(var(--input))',
                      ring: 'hsl(var(--ring))',
                      background: 'hsl(var(--background))',
                      foreground: 'hsl(var(--foreground))',
                      primary: {
                        DEFAULT: 'hsl(var(--primary))',
                        foreground: 'hsl(var(--primary-foreground))',
                      },
                      secondary: {
                        DEFAULT: 'hsl(var(--secondary))',
                        foreground: 'hsl(var(--secondary-foreground))',
                      },
                      destructive: {
                        DEFAULT: 'hsl(var(--destructive))',
                        foreground: 'hsl(var(--destructive-foreground))',
                      },
                      muted: {
                        DEFAULT: 'hsl(var(--muted))',
                        foreground: 'hsl(var(--muted-foreground))',
                      },
                      accent: {
                        DEFAULT: 'hsl(var(--accent))',
                        foreground: 'hsl(var(--accent-foreground))',
                      },
                      card: {
                        DEFAULT: 'hsl(var(--card))',
                        foreground: 'hsl(var(--card-foreground))',
                      },
                    },
                    borderRadius: {
                      lg: 'var(--radius)',
                      md: 'calc(var(--radius) - 2px)',
                      sm: 'calc(var(--radius) - 4px)',
                    },
                    keyframes: {
                      'accordion-down': {
                        from: { height: '0' },
                        to: { height: 'var(--radix-accordion-content-height)' },
                      },
                      'accordion-up': {
                        from: { height: 'var(--radix-accordion-content-height)' },
                        to: { height: '0' },
                      },
                    },
                    animation: {
                      'accordion-down': 'accordion-down 0.2s ease-out',
                      'accordion-up': 'accordion-up 0.2s ease-out',
                    },
                  },
                },
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";

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
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --border: 214.3 31.8% 91.4%;
            --primary: 221.2 83.2% 53.3%;
            --primary-foreground: 210 40% 98%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96.1%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --ring: 221.2 83.2% 53.3%;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; }
          .bg-background { background-color: #ffffff; }
          .bg-card { background-color: #ffffff; }
          .bg-accent { background-color: #f1f5f9; }
          .bg-primary { background-color: #3b82f6; }
          .text-foreground { color: #0f172a; }
          .text-muted-foreground { color: #64748b; }
          .text-primary { color: #3b82f6; }
          .text-primary-foreground { color: #ffffff; }
          .border-border { border-color: #e2e8f0; }
          .sidebar-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; transition: all 0.15s; text-decoration: none; color: #374151; }
          .sidebar-link:hover { background-color: #f1f5f9; }
          .sidebar-link-active { background-color: #3b82f6 !important; color: #ffffff !important; }
          .sidebar-link-inactive { color: #374151; }
          .sidebar-link-inactive:hover { background-color: #f1f5f9; }
          .badge { display: inline-flex; align-items: center; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
          .stat-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.5rem; transition: box-shadow 0.2s; }
          .stat-card:hover { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        ` }} />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

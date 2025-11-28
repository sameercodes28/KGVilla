import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlobalErrorHandler } from "@/components/ui/GlobalErrorHandler";
import packageJson from "../../package.json";

// Premium font configuration
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "JB Villan Kalkyl",
  description: "AI-powered quantity take-off for Swedish residential construction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-slate-50 min-h-screen antialiased notranslate`}>
        <GlobalErrorHandler>
          <LanguageProvider>
            <main className="min-h-screen pb-20">
              {children}
            </main>
            <BottomNav />
            <div className="fixed bottom-1 left-2 z-[60] text-[11px] font-mono text-red-600 opacity-90 hover:opacity-100 pointer-events-none select-none font-bold">
              v{packageJson.version}
            </div>
          </LanguageProvider>
        </GlobalErrorHandler>
      </body>
    </html>
  );
}

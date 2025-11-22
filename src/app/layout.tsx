import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { BottomNav } from "@/components/v3/BottomNav";
import { ClarificationInterface } from "@/components/qto/ClarificationInterface";

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
    <html lang="sv">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-slate-50 min-h-screen antialiased`}>
        <LanguageProvider>
          <main className="min-h-screen">
            {children}
          </main>
          <ClarificationInterface />
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}

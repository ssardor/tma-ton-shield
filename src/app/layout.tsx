import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TonConnectProvider } from "@/providers/TonConnectProvider";
import { TelegramProvider } from "@/providers/TelegramProvider";
import { AppProvider } from "@/lib/i18n/AppContext";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TON Shield AI",
  description: "AI-powered security scanner for TON blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}
      >
        <AppProvider>
          <TonConnectProvider>
            <TelegramProvider>
              <main className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                {children}
              </main>
              <Navigation />
            </TelegramProvider>
          </TonConnectProvider>
        </AppProvider>
      </body>
    </html>
  );
}

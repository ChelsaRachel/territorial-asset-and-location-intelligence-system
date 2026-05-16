import type { Metadata } from "next";
import { Lora, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ActiveProfileProvider } from "@/lib/store/ActiveProfileProvider";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TALIS PoC",
  applicationName: "TALIS",
  description: "Territorial Agricultural & Land Intelligence System — Proof of Concept",
  icons: {
    icon: [{ url: "/talis-logo-mark.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/talis-logo-mark.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${lora.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <Suspense>
          <NuqsAdapter>
            <ActiveProfileProvider>
              <AppShell>{children}</AppShell>
            </ActiveProfileProvider>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  );
}

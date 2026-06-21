import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * DEPLOYMENT NOTE: this build environment cannot reach fonts.googleapis.com,
 * so globals.css falls back to system font stacks. On your own server/host
 * (Vercel, etc.) you have normal internet access — restore real webfonts by
 * uncommenting the block below and adding the className back onto <html>:
 *
 *   import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
 *   const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], weight: ["500","600","700"] });
 *   const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400","500","600"] });
 *   const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], weight: ["400","500"] });
 *   // <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
 *
 * Then in globals.css, switch --font-display/--font-body/--font-mono back to
 * var(--font-space-grotesk) / var(--font-inter) / var(--font-jetbrains-mono).
 */

export const metadata: Metadata = {
  title: "NeiroAI",
  description: "NeiroAI — multi-model AI workspace with live preview and roundtable discussion.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { aventa, orlean } from "./fonts";

export const metadata: Metadata = {
  title: "xatelier.eu — Web • 3D • Design • SEO",
  description: "Nowoczesne portfolio agencji xatelier.eu."
};

export const viewport: Viewport = { themeColor: "#0b1020" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Uwaga: nie wołamy getLocale() w root – locale ogarnia app/[locale]/layout.tsx
  return (
    <html lang="fr" suppressHydrationWarning className={`${aventa.variable} ${orlean.variable}`}>
      <body className="bg-[#0b1020] text-[#e8ecf7] antialiased">{children}</body>
    </html>
  );
}

// app/layout.tsx
import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "The Vault",
  description: "Bespoke jewelry commissions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cormorant.variable}>
      <body className="bg-[#0a0a0a] text-[#e5e5e5] antialiased font-sans">
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#1a1a1a]">
          <Link href="/" className="text-[#C5A880] font-serif text-xl tracking-widest">
            THE VAULT
          </Link>
          <div className="flex gap-6 text-xs tracking-widest uppercase text-[#888]">
            <Link href="/collection" className="hover:text-[#C5A880] transition-colors">
              Showroom
            </Link>
            <Link href="/contact" className="hover:text-[#C5A880] transition-colors">
              Commission
            </Link>
          </div>
        </nav>
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}

import Link from "next/link";
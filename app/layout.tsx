import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans" 
});

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500"],
  variable: "--font-serif" 
});

export const metadata: Metadata = {
  title: "THE VAULT | Fine High-Jewelry Storefront",
  description: "A private viewing room for bespoke high-jewelry collections.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} scroll-smooth`}>
      <body className="bg-[#0A0A0A] text-zinc-100 antialiased selection:bg-[#C5A880]/20 selection:text-[#C5A880]">
        {/* Minimal Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900/50 bg-[#0A0A0A]/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="/collection" className="font-serif text-lg tracking-[0.3em] uppercase text-zinc-200 hover:text-white transition-colors duration-300">
              The Vault
            </a>
            <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
              <a href="/collection" className="hover:text-[#C5A880] transition-colors">The Showroom</a>
              <span className="text-zinc-800">|</span>
              <span className="text-zinc-600 cursor-not-allowed">Private Ateliers</span>
            </nav>
          </div>
        </header>

        {/* Content Viewport Wrapper */}
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
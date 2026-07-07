import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans" 
});

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif" 
});

export const metadata: Metadata = {
  title: "THE VAULT | Fine High-Jewelry",
  description: "A private viewing room for bespoke high-jewelry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} scroll-smooth`}>
      <body className="bg-[#050505] text-zinc-100 antialiased selection:bg-[#C5A880]/20 selection:text-[#C5A880] min-h-screen flex flex-col overflow-x-hidden">
        
        {/* Architectural Background Grid (The Marcelo Touch) */}
        <div className="fixed inset-0 pointer-events-none z-0 flex justify-center">
          <div className="w-full max-w-[1400px] h-full border-l border-r border-zinc-900/40 flex justify-between">
            <div className="w-[1px] h-full bg-zinc-900/20" />
            <div className="w-[1px] h-full bg-zinc-900/20 hidden md:block" />
            <div className="w-[1px] h-full bg-zinc-900/20" />
          </div>
        </div>

        {/* Ultra-Minimal Glassmorphism Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900/60 bg-[#050505]/40 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/20">
          <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">
            
            {/* Left: Micro Utility Text */}
            <div className="hidden md:flex items-center gap-6 text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-sans">
              <span className="hover:text-zinc-300 transition-colors cursor-pointer">Index</span>
              <span className="hover:text-zinc-300 transition-colors cursor-pointer">Archive</span>
            </div>

            {/* Center: The Brand Mark */}
            <a href="/collection" className="font-serif text-xl md:text-2xl tracking-[0.25em] uppercase text-zinc-100 hover:text-[#C5A880] transition-colors duration-500 absolute left-1/2 -translate-x-1/2">
              The Vault
            </a>

            {/* Right: The Toggle/Action Area */}
            <div className="flex items-center gap-6 text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-sans">
              <span className="hover:text-zinc-300 transition-colors cursor-pointer">Client [0]</span>
            </div>
            
          </div>
        </header>

        {/* Content Viewport - Full Bleed */}
        <main className="relative z-10 flex-grow pt-[72px]">
          {children}
        </main>

      </body>
    </html>
  );
}
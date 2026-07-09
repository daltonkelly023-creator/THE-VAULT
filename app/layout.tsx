// app/layout.tsx
import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
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
      <body className="bg-[#02040a] text-[#e5e5e5] antialiased font-sans relative overflow-x-hidden">
        {/* Global Abyss Atmosphere */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-[#040818] to-[#02040a]" />
          
          {/* Depth layers */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#061025]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#010208]/60 to-transparent" />
          
          {/* Ambient glow from top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(74,144,217,0.03)_0%,transparent_70%)]" />
          
          {/* Floating particles — sparse, slow */}
          <div className="absolute top-[15%] left-[20%] w-0.5 h-0.5 bg-[#4a90d9]/20 rounded-full animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-[35%] left-[75%] w-1 h-1 bg-[#5ba3e8]/15 rounded-full animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
          <div className="absolute top-[60%] left-[30%] w-0.5 h-0.5 bg-[#4a90d9]/25 rounded-full animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
          <div className="absolute top-[80%] left-[60%] w-1 h-1 bg-[#c94040]/20 rounded-full animate-pulse" style={{ animationDuration: '5s', animationDelay: '3s' }} />
          <div className="absolute top-[45%] left-[50%] w-0.5 h-0.5 bg-[#5ba3e8]/20 rounded-full animate-pulse" style={{ animationDuration: '9s', animationDelay: '0.5s' }} />
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-[#02040a]/80 backdrop-blur-sm border-b border-[#0a1a3a]">
          <Link href="/" className="text-[#8ab4e8] font-serif text-xl tracking-widest hover:text-[#5ba3e8] transition-colors">
            THE VAULT
          </Link>
          <div className="flex gap-6 text-xs tracking-widest uppercase text-[#3a5570]">
            <Link href="/collection" className="hover:text-[#8ab4e8] transition-colors">
              Showroom
            </Link>
            <Link href="/contact" className="hover:text-[#8ab4e8] transition-colors">
              Commission
            </Link>
          </div>
        </nav>

        {/* Content with padding for nav */}
        <div className="pt-16 relative" style={{ zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
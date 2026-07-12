import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Atelier — Bespoke Jewelry",
  description: "Commission individually crafted jewelry. No two pieces alike.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0a] text-white cursor-none`}>
        <CustomCursor config={{ type: "default", color: "#c9a96e", size: 12, trailLength: 5 }} />
        {children}
      </body>
    </html>
  );
}
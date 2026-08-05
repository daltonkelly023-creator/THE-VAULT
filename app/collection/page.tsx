"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabaseServer as supabase } from "@/lib/supabaseServer";
import Skeleton from "@/components/Skeleton";

const categories = [
  { key: "all", label: "All" },
  { key: "ring", label: "Rings" },
  { key: "necklace", label: "Necklaces" },
  { key: "bracelet", label: "Bracelets" },
  { key: "earring", label: "Earrings" },
  { key: "watch", label: "Timepieces" },
];

const categoryColors: Record<string, { glow: string; text: string; border: string }> = {
  ring: { glow: "shadow-blue-500/30", text: "text-blue-300", border: "border-blue-500/30" },
  necklace: { glow: "shadow-amber-500/30", text: "text-amber-300", border: "border-amber-500/30" },
  bracelet: { glow: "shadow-emerald-500/30", text: "text-emerald-300", border: "border-emerald-500/30" },
  earring: { glow: "shadow-rose-500/30", text: "text-rose-300", border: "border-rose-500/30" },
  watch: { glow: "shadow-slate-400/30", text: "text-slate-300", border: "border-slate-400/30" },
};

/* ---------- ORNATE CORNER FRAME SVG ---------- */
function OrnateFrame({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Top-left corner */}
      <path
        d="M 0 15 Q 0 0 15 0 L 25 0 L 25 2 L 15 2 Q 2 2 2 15 L 2 25 L 0 25 Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M 0 8 Q 0 0 8 0 L 12 0 L 12 1.5 L 8 1.5 Q 1.5 1.5 1.5 8 L 1.5 12 L 0 12 Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* Top-right corner */}
      <path
        d="M 100 15 Q 100 0 85 0 L 75 0 L 75 2 L 85 2 Q 98 2 98 15 L 98 25 L 100 25 Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M 100 8 Q 100 0 92 0 L 88 0 L 88 1.5 L 92 1.5 Q 98.5 1.5 98.5 8 L 98.5 12 L 100 12 Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* Bottom-left corner */}
      <path
        d="M 0 85 Q 0 100 15 100 L 25 100 L 25 98 L 15 98 Q 2 98 2 85 L 2 75 L 0 75 Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M 0 92 Q 0 100 8 100 L 12 100 L 12 98.5 L 8 98.5 Q 1.5 98.5 1.5 92 L 1.5 88 L 0 88 Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* Bottom-right corner */}
      <path
        d="M 100 85 Q 100 100 85 100 L 75 100 L 75 98 L 85 98 Q 98 98 98 85 L 98 75 L 100 75 Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M 100 92 Q 100 100 92 100 L 88 100 L 88 98.5 L 92 98.5 Q 98.5 98.5 98.5 92 L 98.5 88 L 100 88 Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* Decorative flourishes */}
      <circle cx="5" cy="5" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="95" cy="5" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="5" cy="95" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="95" cy="95" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export default function Collection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }

      const { data, error } = await query;

      if (error) {
        setError("Error loading collection.");
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [activeCategory]);

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`;
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#111]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#050505]/60 to-transparent" />
      </div>

      {/* NAV HEADER — Same as homepage */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a]/50 backdrop-blur-sm bg-[#0a0a0a]/80">
        <Link href="/" className="text-[#c9a96e] text-sm tracking-[0.4em] font-light uppercase">
          Atelier
        </Link>
        <nav className="flex gap-8 text-xs tracking-[0.2em] text-gray-500">
          <Link href="/collection" className="text-[#c9a96e]">Showroom</Link>
          <Link href="/commission" className="hover:text-[#c9a96e] transition-colors">Commission</Link>
        </nav>
      </header>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col pt-24">
        {/* Header */}
        <div className="text-center pt-20 pb-10">
          <h1 className="text-5xl md:text-6xl font-serif text-[#c9a96e] tracking-widest mb-3">
            The Showroom
          </h1>
          <p className="text-xs text-gray-600 tracking-[0.3em] uppercase">
            Select a category to filter
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 px-4">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setLoading(true);
              }}
              className={`px-5 py-2 text-[10px] tracking-[0.2em] uppercase border transition-all duration-300 ${activeCategory === cat.key
                ? "border-[#c9a96e] text-[#c9a96e] bg-[#c9a96e]/10"
                : "border-[#1a1a1a] text-gray-600 hover:border-[#c9a96e]/30 hover:text-gray-400"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          /* SKELETON LOADING */
          <div className="flex-1 flex items-center justify-center pb-24 px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex-shrink-0">
                  <div className="relative w-full aspect-[3/4] overflow-hidden border border-[#1a1a1a] bg-[#111]">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="mt-6 space-y-2 text-center">
                    <Skeleton className="w-16 h-2 mx-auto" />
                    <Skeleton className="w-24 h-3 mx-auto" />
                    <Skeleton className="w-12 h-2 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center pb-24">
            <p className="text-gray-600">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex-1 flex items-center justify-center pb-24">
            <p className="text-gray-600 text-sm tracking-widest">No pieces found in this category.</p>
          </div>
        ) : (
          /* Gallery Grid with Ornate Frames */
          <div className="flex-1 pb-24 px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
              {products.map((piece) => {
                const imageUrl = getImageUrl(piece.hero_image_path);
                const colors = categoryColors[piece.category] || { glow: "shadow-[#c9a96e]/20", text: "text-gray-400", border: "border-gray-700" };

                return (
                  <Link
                    key={piece.id}
                    href={`/piece/${piece.id}`}
                    className="group block"
                  >
                    {/* Ornate Frame Container */}
                    <div className="relative">
                      {/* Outer decorative border */}
                      <div className="absolute -inset-3 border border-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

                      {/* Main card with ornate corners */}
                      <div className="relative aspect-[3/4] bg-[#111] border border-[#222] overflow-hidden group-hover:border-[#c9a96e]/40 transition-all duration-500">
                        {/* Ornate corner SVG overlay */}
                        <div className="absolute inset-0 text-[#c9a96e] z-20 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                          <OrnateFrame />
                        </div>

                        {/* Inner border line */}
                        <div className="absolute inset-3 border border-[#2a2a2a]/50 z-10 pointer-events-none group-hover:border-[#c9a96e]/20 transition-colors duration-500" />

                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={piece.name}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[#2a2a2a] text-[10px] tracking-widest">NO IMAGE</span>
                          </div>
                        )}

                        {/* Glass sheen */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#c9a96e]/[0.03] via-transparent to-transparent pointer-events-none" />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                        {/* Corner accent dots */}
                        <div className="absolute top-4 left-4 w-1 h-1 bg-[#c9a96e]/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-4 right-4 w-1 h-1 bg-[#c9a96e]/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-4 left-4 w-1 h-1 bg-[#c9a96e]/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-4 right-4 w-1 h-1 bg-[#c9a96e]/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* View button on hover */}
                        <div className="absolute bottom-6 left-0 right-0 text-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-30">
                          <span className="text-[10px] text-[#c9a96e] tracking-[0.3em] uppercase border border-[#c9a96e]/50 px-4 py-2 bg-[#0a0a0a]/80">
                            View Piece
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="mt-5 text-center">
                      <p className="text-[9px] text-gray-700 tracking-[0.2em] uppercase mb-1">{piece.collection}</p>
                      <h3 className="text-gray-300 font-serif text-sm md:text-base mb-1 transition-colors duration-500 group-hover:text-[#c9a96e] group-hover:tracking-wider">{piece.name}</h3>
                      <p className="text-gray-600 text-[10px] tracking-widest">
                        {piece.price_cents === 0 ? "Upon Request" : `$${(piece.price_cents / 100).toLocaleString()}`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
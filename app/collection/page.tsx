"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Skeleton from "@/components/Skeleton";
import Particles from "@/components/Particles";
import OrnateCorner from "@/components/OrnateCorner";

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
      <Particles />

      {/* Background atmosphere — radial gold glows matching configure panel */}
      <div className="fixed inset-0 pointer-events-none z-[2]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.12),transparent_60%)]" />
        <div className="absolute top-0 left-0 w-[30vw] h-[30vh] bg-[radial-gradient(ellipse_at_top_left,rgba(201,169,110,0.08),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[35vw] h-[40vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(201,169,110,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/10 via-transparent to-[#0a0a0a]/60" />
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
      <div className="relative min-h-screen flex flex-col pt-24 z-[3]">
        {/* Ornate corners for the showroom stage */}
        <div className="pointer-events-none fixed top-28 left-6 z-40 w-14 h-14 opacity-70 text-[#c9a96e]">
          <OrnateCorner position="top-left" />
        </div>
        <div className="pointer-events-none fixed top-28 right-6 z-40 w-14 h-14 opacity-70 text-[#c9a96e]">
          <OrnateCorner position="top-right" />
        </div>
        <div className="pointer-events-none fixed bottom-10 left-6 z-40 w-14 h-14 opacity-60 text-[#c9a96e]">
          <OrnateCorner position="bottom-left" />
        </div>
        <div className="pointer-events-none fixed bottom-10 right-6 z-40 w-14 h-14 opacity-60 text-[#c9a96e]">
          <OrnateCorner position="bottom-right" />
        </div>

        {/* Header */}
        <div className="text-center pt-20 pb-10 relative">
          <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.22),transparent_70%)] blur-md" />
          <p className="text-[9px] tracking-[0.5em] text-[#c9a96e]/80 uppercase mb-5">
            ★  Private Collection  ★
          </p>
          <h1 className="text-5xl md:text-6xl font-serif tracking-[0.25em] leading-none mb-3"
            style={{
              color: "#c9a96e",
              textShadow: "0 0 30px rgba(201,169,110,0.25), 0 2px 20px rgba(0,0,0,0.8)",
            }}
          >
            THE SHOWROOM
          </h1>
          <div className="flex items-center justify-center gap-4 mt-5 mb-2">
            <span className="w-16 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/50 to-transparent" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse" />
            <span className="w-16 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/50 to-transparent" />
          </div>
          <p className="text-xs text-gray-500 tracking-[0.35em] uppercase">
            Select a category to explore
          </p>
        </div>

        {/* Category Filters — "alive": hover lift + glow, sliding underline, pulsing active dot */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 px-4">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  if (isActive) return;
                  setActiveCategory(cat.key);
                  setLoading(true);
                }}
                className={`group/cat relative px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase border transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
                  isActive
                    ? "border-[#c9a96e] text-[#c9a96e] bg-[#c9a96e]/10 shadow-[0_0_18px_rgba(201,169,110,0.2)]"
                    : "border-[#1a1a1a] text-gray-600 hover:border-[#c9a96e]/40 hover:text-gray-300 hover:shadow-[0_0_12px_rgba(201,169,110,0.1)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-1 h-1 rounded-full bg-[#c9a96e] transition-all duration-300 ${
                      isActive ? "opacity-100 scale-100 animate-pulse" : "opacity-0 scale-0"
                    }`}
                  />
                  {cat.label}
                </span>
                <span
                  className={`pointer-events-none absolute left-1/2 -bottom-px h-px -translate-x-1/2 bg-[#c9a96e] transition-all duration-300 ease-out ${
                    isActive
                      ? "w-2/3 opacity-100"
                      : "w-0 opacity-0 group-hover/cat:w-1/3 group-hover/cat:opacity-60"
                  }`}
                />
              </button>
            );
          })}
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
                    {/* Card frame */}
                    <div className="relative">
                      {/* Soft gold glow that blooms outward on hover — reads as premium at
                          thumbnail scale, where fine filigree just turns into visual noise */}
                      <div className="absolute -inset-2 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.35),transparent_70%)] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="absolute -inset-px border border-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

                      {/* Main card */}
                      <div className="relative aspect-[3/4] bg-[#111] border border-[#222] overflow-hidden group-hover:border-[#c9a96e]/60 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.15)] transition-all duration-500">
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
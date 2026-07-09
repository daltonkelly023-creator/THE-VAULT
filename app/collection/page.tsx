// app/collection/page.tsx
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 60;

const categories = [
  { key: "all", label: "All" },
  { key: "ring", label: "Rings" },
  { key: "necklace", label: "Necklaces" },
  { key: "bracelet", label: "Bracelets" },
  { key: "earring", label: "Earrings" },
  { key: "watch", label: "Timepieces" },
];

const categoryColors: Record<string, { glow: string; shadow: string }> = {
  ring: { glow: "from-blue-500/20", shadow: "shadow-blue-500/20" },
  necklace: { glow: "from-amber-500/20", shadow: "shadow-amber-500/20" },
  bracelet: { glow: "from-emerald-500/20", shadow: "shadow-emerald-500/20" },
  earring: { glow: "from-rose-500/20", shadow: "shadow-rose-500/20" },
  watch: { glow: "from-slate-400/20", shadow: "shadow-slate-400/20" },
};

export default async function Collection({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const activeCategory = searchParams.category || "all";

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (activeCategory !== "all") {
    query = query.eq("category", activeCategory);
  }

  const { data: products, error } = await query;

  if (error) {
    return (
      <main className="min-h-screen bg-[#0f0d0a] flex items-center justify-center">
        <p className="text-[#666]">Error loading collection.</p>
      </main>
    );
  }

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`;
  };

  return (
    <main className="min-h-screen bg-[#0f0d0a] text-[#e5e5e5] relative overflow-hidden">
      {/* Auction hall background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(197,168,128,0.02)_1px,transparent_1px)] bg-[length:200px_100%]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#1a1612]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-20 pb-10">
          <h1 className="text-5xl md:text-6xl font-serif text-[#C5A880] tracking-widest mb-3">
            The Showroom
          </h1>
          <p className="text-xs text-[#555] tracking-[0.3em] uppercase">
            Select a category to filter
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 px-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={cat.key === "all" ? "/collection" : `/collection?category=${cat.key}`}
              className={`px-5 py-2 text-[10px] tracking-[0.2em] uppercase border transition-all duration-300 ${
                activeCategory === cat.key
                  ? "border-[#C5A880] text-[#C5A880] bg-[#C5A880]/10"
                  : "border-[#2a2520] text-[#555] hover:border-[#C5A880]/50 hover:text-[#888]"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {(!products || products.length === 0) && (
          <p className="text-center text-[#666] py-24">No pieces in this category yet.</p>
        )}

        {/* Gallery Floor — Horizontal Scroll */}
        <div className="flex-1 flex items-center pb-24 px-4">
          <div 
            className="flex items-end gap-6 md:gap-10 lg:gap-12 max-w-full mx-auto overflow-x-auto snap-x snap-mandatory pb-8 px-4"
            style={{ 
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {products?.map((piece, index) => {
              const imageUrl = getImageUrl(piece.hero_image_path);
              const colors = categoryColors[piece.category] || { glow: "from-[#C5A880]/20", shadow: "shadow-[#C5A880]/20" };
              const total = products.length;
              const center = Math.floor(total / 2);
              const distance = Math.abs(index - center);
              const isCenter = index === center;

              const scale = isCenter ? 1.15 : Math.max(0.7, 1 - distance * 0.15);
              const translateY = isCenter ? 0 : distance * 15;
              const brightness = isCenter ? 100 : Math.max(35, 100 - distance * 25);
              const zIndex = isCenter ? 20 : 20 - distance;

              return (
                <Link
                  key={piece.id}
                  href={`/piece/${piece.id}`}
                  className="group relative transition-all duration-700 ease-out flex-shrink-0 snap-center"
                  style={{
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    filter: `brightness(${brightness}%)`,
                    zIndex,
                  }}
                >
                  {/* The Piece Container */}
                  <div className="relative transition-all duration-700 ease-out group-hover:-translate-y-6 group-hover:scale-110 group-hover:z-20">
                    
                    {/* Shadow */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/60 rounded-full blur-xl transition-all duration-700 group-hover:w-32 group-hover:blur-2xl group-hover:bg-black/40" />

                    {/* Floor glow on hover */}
                    <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-16 bg-gradient-to-t ${colors.glow} to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl`} />

                    {/* Image */}
                    <div className={`relative overflow-hidden border border-[#2a2520] group-hover:border-[#C5A880]/30 transition-all duration-700 bg-[#0a0a0a] ${isCenter ? 'w-44 h-56 md:w-52 md:h-68' : 'w-32 h-40 md:w-40 md:h-52'}`}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={piece.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 160px, 192px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#333] text-[10px] tracking-widest">NO IMAGE</span>
                        </div>
                      )}

                      {/* Glass sheen */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Hover glow border */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none shadow-2xl ${colors.shadow}`} />
                  </div>

                  {/* Info */}
                  <div className={`mt-6 text-center transition-all duration-700 group-hover:mt-8 ${isCenter ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>
                    <p className="text-[9px] text-[#555] tracking-[0.2em] uppercase mb-1">{piece.collection}</p>
                    <h3 className="text-[#C5A880] font-serif text-sm md:text-base mb-1 transition-colors duration-700">{piece.name}</h3>
                    <p className="text-[#444] text-[10px] tracking-widest transition-colors duration-700 group-hover:text-[#666]">
                      {piece.price_cents === 0 ? "Upon Request" : `$${(piece.price_cents / 100).toLocaleString()}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
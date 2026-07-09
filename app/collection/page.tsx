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

const categoryColors: Record<string, { glow: string; text: string }> = {
  ring: { glow: "shadow-blue-500/30", text: "text-blue-300" },
  necklace: { glow: "shadow-amber-500/30", text: "text-amber-300" },
  bracelet: { glow: "shadow-emerald-500/30", text: "text-emerald-300" },
  earring: { glow: "shadow-rose-500/30", text: "text-rose-300" },
  watch: { glow: "shadow-slate-400/30", text: "text-slate-300" },
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
      {/* ALIVE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Warm ambient glow from above — like gallery track lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.06)_0%,transparent_70%)]" />
        
        {/* Subtle floor reflection glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#1a1209]/40 via-transparent to-transparent" />
        
        {/* Wall texture — very subtle vertical grain */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 199px, rgba(197,168,128,0.5) 199px, rgba(197,168,128,0.5) 200px)`
        }} />
        
        {/* Floating dust particles (CSS only) */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#C5A880]/20 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-[#C5A880]/15 rounded-full animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-1/2 w-1 h-1 bg-[#C5A880]/10 rounded-full animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-0.5 h-0.5 bg-[#C5A880]/20 rounded-full animate-pulse" style={{ animationDuration: '7s', animationDelay: '0.5s' }} />
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

        {/* Gallery Floor — Horizontal Scroll, ALL SAME SIZE, DRAMATIC HOVER */}
        <div className="flex-1 flex items-center pb-24 px-4">
          <div 
            className="flex items-end gap-6 md:gap-10 lg:gap-14 max-w-full mx-auto overflow-x-auto snap-x snap-mandatory pb-12 px-8"
            style={{ 
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {products?.map((piece) => {
              const imageUrl = getImageUrl(piece.hero_image_path);
              const colors = categoryColors[piece.category] || { glow: "shadow-[#C5A880]/20", text: "text-[#C5A880]" };

              return (
                <Link
                  key={piece.id}
                  href={`/piece/${piece.id}`}
                  className="group relative transition-all duration-500 ease-out flex-shrink-0 snap-center"
                >
                  {/* DRAMATIC HOVER CONTAINER */}
                  <div className="relative transition-all duration-500 ease-out group-hover:-translate-y-8">
                    
                    {/* AMBIENT SHADOW — always there, subtle */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-black/50 rounded-full blur-xl" />
                    
                    {/* HOVER SHADOW — expands dramatically */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/30 rounded-full blur-lg transition-all duration-500 group-hover:w-40 group-hover:h-8 group-hover:blur-2xl group-hover:bg-[#C5A880]/10" />

                    {/* FLOOR GLOW ON HOVER — warm pool of light */}
                    <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 w-40 h-20 bg-gradient-to-t ${colors.glow.replace('shadow-', 'from-').replace('/30', '/15')} to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl`} />

                    {/* SPOTLIGHT BEAM ON HOVER — cone from above */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700">
                      <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_100%,transparent,rgba(197,168,128,0.08),transparent)]" />
                    </div>

                    {/* IMAGE CONTAINER — ALL SAME SIZE */}
                    <div className="relative w-44 h-56 md:w-52 md:h-64 lg:w-56 lg:h-72 overflow-hidden border border-[#2a2520] group-hover:border-[#C5A880]/40 transition-all duration-500 bg-[#0a0a0a] group-hover:shadow-2xl group-hover:shadow-[#C5A880]/10">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={piece.name}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 176px, (max-width: 1024px) 208px, 224px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#333] text-[10px] tracking-widest">NO IMAGE</span>
                        </div>
                      )}

                      {/* Glass sheen — always */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                      
                      {/* Extra sheen on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#C5A880]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>

                    {/* CATEGORY BADGE — appears on hover */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <span className={`text-[8px] tracking-[0.3em] uppercase ${colors.text} bg-black/80 px-3 py-1 border border-[#333]`}>
                        {piece.category}
                      </span>
                    </div>
                  </div>

                  {/* INFO — lifts with the piece */}
                  <div className="mt-6 text-center transition-all duration-500 group-hover:mt-8">
                    <p className="text-[9px] text-[#444] tracking-[0.2em] uppercase mb-1 transition-colors duration-500 group-hover:text-[#666]">{piece.collection}</p>
                    <h3 className="text-[#888] font-serif text-sm md:text-base mb-1 transition-all duration-500 group-hover:text-[#C5A880] group-hover:tracking-wider">{piece.name}</h3>
                    <p className="text-[#333] text-[10px] tracking-widest transition-colors duration-500 group-hover:text-[#555]">
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
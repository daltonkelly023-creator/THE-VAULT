import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Skeleton from "@/components/Skeleton";

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
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#444]">Error loading collection.</p>
      </main>
    );
  }

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`;
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-[#e5e5e5] relative overflow-hidden">
      {/* DEEP OCEAN ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient — abyssal blue-black */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-[#040818] to-[#02040a]" />
        
        {/* Subtle depth layers */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#061025]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#010208]/80 to-transparent" />
        
        {/* BIOLUMINESCENT FIELD — 18 dots, 40% red, slow breathing drift */}
        {(() => {
          const particles = [
            // Blue (60%) — deep, slow, wide drift
            { top: '15%', left: '12%', size: 'w-1 h-1', color: 'bg-[#4a90d9]', breathe: '5.2s', bDel: '0s', drift: '14s', dDel: '0s' },
            { top: '22%', left: '78%', size: 'w-0.5 h-0.5', color: 'bg-[#5ba3e8]', breathe: '6.8s', bDel: '1.2s', drift: '18s', dDel: '3s' },
            { top: '35%', left: '25%', size: 'w-1.5 h-1.5', color: 'bg-[#3d7bc7]', breathe: '4.5s', bDel: '2.1s', drift: '12s', dDel: '1s' },
            { top: '18%', left: '55%', size: 'w-0.5 h-0.5', color: 'bg-[#6bb3f0]', breathe: '7.3s', bDel: '0.7s', drift: '20s', dDel: '5s' },
            { top: '45%', left: '88%', size: 'w-1 h-1', color: 'bg-[#4a90d9]', breathe: '5.8s', bDel: '3.4s', drift: '15s', dDel: '2s' },
            { top: '62%', left: '15%', size: 'w-0.5 h-0.5', color: 'bg-[#5ba3e8]', breathe: '6.2s', bDel: '1.8s', drift: '16s', dDel: '4s' },
            { top: '28%', left: '42%', size: 'w-1 h-1', color: 'bg-[#3d7bc7]', breathe: '4.9s', bDel: '0.3s', drift: '13s', dDel: '6s' },
            { top: '55%', left: '70%', size: 'w-1.5 h-1.5', color: 'bg-[#6bb3f0]', breathe: '5.5s', bDel: '2.7s', drift: '17s', dDel: '1.5s' },
            { top: '72%', left: '35%', size: 'w-0.5 h-0.5', color: 'bg-[#4a90d9]', breathe: '7.8s', bDel: '4.1s', drift: '22s', dDel: '7s' },
            { top: '38%', left: '92%', size: 'w-1 h-1', color: 'bg-[#5ba3e8]', breathe: '6.1s', bDel: '1.1s', drift: '14s', dDel: '3.5s' },
            { top: '82%', left: '60%', size: 'w-0.5 h-0.5', color: 'bg-[#3d7bc7]', breathe: '5.4s', bDel: '3.8s', drift: '19s', dDel: '2.5s' },
            
            // Red (40%) — warmer, slightly faster, more erratic
            { top: '25%', left: '88%', size: 'w-1 h-1', color: 'bg-[#c94040]', breathe: '3.8s', bDel: '0.5s', drift: '11s', dDel: '1s' },
            { top: '48%', left: '30%', size: 'w-1.5 h-1.5', color: 'bg-[#d45555]', breathe: '3.2s', bDel: '2.3s', drift: '10s', dDel: '4s' },
            { top: '68%', left: '75%', size: 'w-0.5 h-0.5', color: 'bg-[#b83030]', breathe: '4.1s', bDel: '1.5s', drift: '13s', dDel: '2s' },
            { top: '12%', left: '45%', size: 'w-1 h-1', color: 'bg-[#c94040]', breathe: '3.5s', bDel: '3.1s', drift: '9s', dDel: '5s' },
            { top: '58%', left: '52%', size: 'w-1.5 h-1.5', color: 'bg-[#d45555]', breathe: '3.9s', bDel: '0.9s', drift: '12s', dDel: '3s' },
            { top: '85%', left: '20%', size: 'w-0.5 h-0.5', color: 'bg-[#b83030]', breathe: '3.3s', bDel: '2.8s', drift: '8s', dDel: '6s' },
            { top: '32%', left: '65%', size: 'w-1 h-1', color: 'bg-[#c94040]', breathe: '4.4s', bDel: '4.2s', drift: '11s', dDel: '2s' },
          ];

          return particles.map((p, i) => (
            <div
              key={i}
              className={`absolute ${p.size} ${p.color} rounded-full animate-biolum`}
              style={{
                top: p.top,
                left: p.left,
                '--breathe-dur': p.breathe,
                '--breathe-del': p.bDel,
                '--drift-dur': p.drift,
                '--drift-del': p.dDel,
              } as React.CSSProperties}
            />
          ));
        })()}
        
        {/* Subtle light rays from above */}
        <div className="absolute top-0 left-1/4 w-px h-[300px] bg-gradient-to-b from-[#4a90d9]/5 to-transparent" />
        <div className="absolute top-0 left-1/2 w-px h-[400px] bg-gradient-to-b from-[#5ba3e8]/8 to-transparent" />
        <div className="absolute top-0 left-3/4 w-px h-[250px] bg-gradient-to-b from-[#4a90d9]/5 to-transparent" />
        
        {/* Floor glow — bioluminescent sediment */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-[#0a1a3a]/30 via-[#061025]/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-20 pb-10">
          <h1 className="text-5xl md:text-6xl font-serif text-[#8ab4e8] tracking-widest mb-3">
            The Showroom
          </h1>
          <p className="text-xs text-[#3a5570] tracking-[0.3em] uppercase">
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
                  ? "border-[#4a90d9] text-[#8ab4e8] bg-[#4a90d9]/10"
                  : "border-[#0a1a3a] text-[#3a5570] hover:border-[#4a90d9]/50 hover:text-[#5ba3e8]"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {(!products || products.length === 0) ? (
          /* SKELETON LOADING */
          <div className="flex-1 flex items-center pb-24 px-4">
            <div className="flex items-end gap-6 md:gap-10 lg:gap-14 max-w-full mx-auto overflow-x-auto snap-x snap-mandatory pb-12 px-8"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-shrink-0 snap-center">
                  <div className="relative w-44 h-56 md:w-52 md:h-64 lg:w-56 lg:h-72 overflow-hidden border border-[#0a1a3a] bg-[#02040a]">
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
        ) : (
          /* Gallery Floor — Horizontal Scroll, MAGNETIC HOVER */
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
                const colors = categoryColors[piece.category] || { glow: "shadow-[#4a90d9]/20", text: "text-[#8ab4e8]" };

                return (
                  <Link
                    key={piece.id}
                    href={`/piece/${piece.id}`}
                    className="group relative transition-all duration-500 ease-out flex-shrink-0 snap-center"
                  >
                    {/* MAGNETIC HOVER CONTAINER — stays grounded, glows */}
                    <div className="relative transition-all duration-500 ease-out">
                      
                      {/* Ambient shadow — always there */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-black/60 rounded-full blur-xl transition-all duration-500 group-hover:w-32 group-hover:blur-2xl" />
                      
                      {/* Hover shadow — expands dramatically */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 rounded-full blur-lg transition-all duration-500 group-hover:w-40 group-hover:h-8 group-hover:blur-3xl group-hover:bg-[#4a90d9]/15" />

                      {/* Floor glow on hover — bioluminescent pool */}
                      <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 w-40 h-20 bg-gradient-to-t ${colors.glow.replace('shadow-', 'from-').replace('/30', '/20')} to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl`} />

                      {/* Spotlight beam on hover */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700">
                        <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_100%,transparent,rgba(138,180,232,0.06),transparent)]" />
                      </div>

                      {/* IMAGE CONTAINER — MAGNETIC: scale + glow, no lift */}
                      <div className="relative w-44 h-56 md:w-52 md:h-64 lg:w-56 lg:h-72 overflow-hidden border border-[#0a1a3a] group-hover:border-[#4a90d9]/50 transition-all duration-500 bg-[#02040a] group-hover:shadow-2xl group-hover:shadow-[#4a90d9]/20 group-hover:scale-[1.03]">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={piece.name}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 176px, (max-width: 1024px) 208px, 224px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[#1a2a4a] text-[10px] tracking-widest">NO IMAGE</span>
                          </div>
                        )}

                        {/* Glass sheen */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4a90d9]/[0.04] via-transparent to-transparent pointer-events-none" />
                        
                        {/* Extra sheen on hover — blue tint */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#4a90d9]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        
                        {/* Inner glow border on hover */}
                        <div className="absolute inset-0 border border-[#4a90d9]/0 group-hover:border-[#4a90d9]/30 transition-all duration-500 pointer-events-none" />
                      </div>

                      {/* Category badge — appears on hover */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <span className={`text-[8px] tracking-[0.3em] uppercase ${colors.text} bg-[#02040a]/90 px-3 py-1 border border-[#0a1a3a]`}>
                          {piece.category}
                        </span>
                      </div>
                    </div>

                    {/* INFO — stays visible, brightens on hover */}
                    <div className="mt-6 text-center transition-all duration-500">
                      <p className="text-[9px] text-[#1a3a5a] tracking-[0.2em] uppercase mb-1 transition-colors duration-500 group-hover:text-[#3a5570]">{piece.collection}</p>
                      <h3 className="text-[#5a7a9a] font-serif text-sm md:text-base mb-1 transition-all duration-500 group-hover:text-[#8ab4e8] group-hover:tracking-wider">{piece.name}</h3>
                      <p className="text-[#1a3a5a] text-[10px] tracking-widest transition-colors duration-500 group-hover:text-[#3a5570]">
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
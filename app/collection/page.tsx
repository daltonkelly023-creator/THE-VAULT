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
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
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
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] relative overflow-hidden">
      {/* Warm bronze background gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,rgba(197,168,128,0.08)_0%,rgba(10,10,10,1)_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,90,43,0.05)_0%,transparent_60%)]" />
      </div>

      {/* Content */}
      <div className="relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="text-center pt-24 pb-12">
          <h1 className="text-5xl md:text-7xl font-serif text-[#C5A880] mb-4 tracking-widest">
            The Showroom
          </h1>
          <p className="text-sm text-[#666] tracking-[0.3em] uppercase">
            Select a category to filter
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-20 px-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={cat.key === "all" ? "/collection" : `/collection?category=${cat.key}`}
              className={`px-6 py-2.5 text-xs tracking-[0.2em] uppercase border transition-all duration-300 ${
                activeCategory === cat.key
                  ? "border-[#C5A880] text-[#C5A880] bg-[#C5A880]/10"
                  : "border-[#333] text-[#666] hover:border-[#C5A880] hover:text-[#C5A880]"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {(!products || products.length === 0) && (
          <p className="text-center text-[#666] py-24">No pieces in this category yet.</p>
        )}

        {/* Showroom Floor — Curved Arrangement */}
        <div className="relative pb-32 px-4">
          {/* Spotlight beam effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] pointer-events-none">
            <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_0deg,rgba(197,168,128,0.03)_20deg,rgba(197,168,128,0.08)_40deg,rgba(197,168,128,0.03)_60deg,transparent_80deg)]" />
          </div>

          {/* Pieces arranged in arc */}
          <div className="flex items-end justify-center gap-4 md:gap-8 lg:gap-12 max-w-6xl mx-auto relative" style={{ perspective: "1000px" }}>
            {products?.map((piece, index) => {
              const imageUrl = getImageUrl(piece.hero_image_path);
              const colors = categoryColors[piece.category] || { glow: "shadow-[#C5A880]/20", text: "text-[#C5A880]" };
              const total = products.length;
              const center = Math.floor(total / 2);
              const distance = Math.abs(index - center);
              const isCenter = index === center;

              // Arc positioning: center piece forward, sides recede
              const zOffset = isCenter ? 40 : 40 - distance * 15;
              const yOffset = isCenter ? 0 : distance * 8;
              const scale = isCenter ? 1 : Math.max(0.75, 1 - distance * 0.1);
              const brightness = isCenter ? 100 : Math.max(40, 100 - distance * 20);

              return (
                <Link
                  key={piece.id}
                  href={`/piece/${piece.id}`}
                  className="group relative transition-all duration-700 ease-out"
                  style={{
                    transform: `translateY(${yOffset}px) translateZ(${zOffset}px) scale(${scale})`,
                    filter: `brightness(${brightness}%)`,
                    zIndex: isCenter ? 10 : 10 - distance,
                  }}
                >
                  {/* Spotlight on hover */}
                  <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-32 h-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}>
                    <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_100%,transparent,rgba(197,168,128,0.15),transparent)]" />
                  </div>

                  {/* Glass case effect */}
                  <div className={`relative border border-[#222] group-hover:border-[#C5A880]/50 transition-all duration-500 ${colors.glow} group-hover:shadow-2xl`}>
                    {/* Top reflection highlight */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-48 md:w-56 lg:w-64 aspect-[3/4] relative overflow-hidden bg-[#0d0d0d]">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={piece.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#333] text-xs tracking-widest">NO IMAGE</span>
                        </div>
                      )}

                      {/* Bottom reflection */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#C5A880]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[9px] tracking-[0.2em] uppercase ${colors.text} bg-black/70 px-2 py-1 backdrop-blur-sm`}>
                        {piece.category}
                      </span>
                    </div>
                  </div>

                  {/* Info below */}
                  <div className="mt-4 text-center opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[10px] text-[#666] tracking-widest uppercase mb-1">{piece.collection}</p>
                    <h3 className="text-[#C5A880] font-serif text-sm md:text-base mb-1">{piece.name}</h3>
                    <p className="text-[#888] text-xs tracking-widest">
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
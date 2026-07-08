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
      {/* Warm bronze atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(197,168,128,0.06)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#1a1209]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-16 pb-8">
          <h1 className="text-5xl md:text-6xl font-serif text-[#C5A880] tracking-widest mb-3">
            The Showroom
          </h1>
          <p className="text-xs text-[#666] tracking-[0.3em] uppercase">
            Select a category to filter
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 px-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={cat.key === "all" ? "/collection" : `/collection?category=${cat.key}`}
              className={`px-5 py-2 text-[10px] tracking-[0.2em] uppercase border transition-all duration-300 ${
                activeCategory === cat.key
                  ? "border-[#C5A880] text-[#C5A880] bg-[#C5A880]/10"
                  : "border-[#2a2a2a] text-[#555] hover:border-[#C5A880]/50 hover:text-[#888]"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {(!products || products.length === 0) && (
          <p className="text-center text-[#666] py-24">No pieces in this category yet.</p>
        )}

        {/* Showroom Stage */}
        <div className="flex-1 flex flex-col items-center justify-end pb-16 px-4 relative">
          
          {/* Hanging Fixture */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-32 flex flex-col items-center">
            {/* Cord */}
            <div className="w-px h-24 bg-gradient-to-b from-transparent to-[#333]" />
            {/* Fixture body */}
            <div className="relative">
              <div className="w-16 h-8 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-t-full border border-[#333]" />
              <div className="w-12 h-4 bg-[#C5A880]/20 mx-auto rounded-b-lg" />
              {/* Bulb glow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#C5A880]/30 rounded-full blur-md" />
            </div>
          </div>

          {/* Light Cone */}
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none">
            <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_0deg,rgba(197,168,128,0.04)_30deg,rgba(197,168,128,0.08)_60deg,rgba(197,168,128,0.04)_90deg,transparent_120deg)]" />
          </div>

          {/* Floor Glow */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* Pieces on Stage */}
          <div className="flex items-end justify-center gap-2 md:gap-6 lg:gap-10 max-w-5xl mx-auto relative">
            {products?.map((piece, index) => {
              const imageUrl = getImageUrl(piece.hero_image_path);
              const total = products.length;
              const center = Math.floor(total / 2);
              const distance = Math.abs(index - center);
              const isCenter = index === center;

              // Stage positioning
              const scale = isCenter ? 1.15 : Math.max(0.7, 1 - distance * 0.15);
              const translateY = isCenter ? 0 : distance * 15;
              const brightness = isCenter ? 100 : Math.max(35, 100 - distance * 25);
              const zIndex = isCenter ? 20 : 20 - distance;

              return (
                <Link
                  key={piece.id}
                  href={`/piece/${piece.id}`}
                  className="group relative transition-all duration-700 ease-out"
                  style={{
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    filter: `brightness(${brightness}%)`,
                    zIndex,
                  }}
                >
                  {/* Pedestal */}
                  <div className={`relative mx-auto mb-2 transition-all duration-500 ${isCenter ? 'w-32 md:w-40' : 'w-20 md:w-28'}`}>
                    {/* Pedestal top */}
                    <div className="h-2 bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] rounded-sm" />
                    {/* Pedestal body */}
                    <div className="h-8 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] mx-2" />
                    {/* Pedestal base */}
                    <div className="h-1 bg-[#333] rounded-sm" />
                  </div>

                  {/* Glass Case */}
                  <div className={`relative border transition-all duration-500 group-hover:border-[#C5A880]/40 ${isCenter ? 'border-[#333] shadow-2xl shadow-[#C5A880]/10' : 'border-[#222]/50'}`}>
                    
                    {/* Top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A880]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className={`relative overflow-hidden bg-[#0d0d0d] ${isCenter ? 'w-40 h-52 md:w-48 md:h-64' : 'w-24 h-32 md:w-32 md:h-40'}`}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={piece.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 160px, 192px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#333] text-[10px] tracking-widest">NO IMAGE</span>
                        </div>
                      )}

                      {/* Glass reflection */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Bottom reflection on floor */}
                    <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-[#C5A880]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                  </div>

                  {/* Info */}
                  <div className={`mt-4 text-center transition-all duration-500 ${isCenter ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>
                    <p className="text-[9px] text-[#666] tracking-[0.2em] uppercase mb-1">{piece.collection}</p>
                    <h3 className="text-[#C5A880] font-serif text-xs md:text-sm mb-1">{piece.name}</h3>
                    <p className="text-[#555] text-[10px] tracking-widest">
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
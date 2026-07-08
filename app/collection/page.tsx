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

const categoryColors: Record<string, { border: string; badge: string; tint: string }> = {
  ring: { border: "hover:shadow-blue-900/20", badge: "text-blue-400/80", tint: "bg-blue-950/15" },
  necklace: { border: "hover:shadow-amber-900/20", badge: "text-amber-400/80", tint: "bg-amber-950/15" },
  bracelet: { border: "hover:shadow-emerald-900/20", badge: "text-emerald-400/80", tint: "bg-emerald-950/15" },
  earring: { border: "hover:shadow-rose-900/20", badge: "text-rose-400/80", tint: "bg-rose-950/15" },
  watch: { border: "hover:shadow-slate-600/20", badge: "text-slate-400/80", tint: "bg-slate-900/15" },
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
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-24 max-w-[1400px] mx-auto">
      <h1 className="text-4xl md:text-5xl font-serif text-[#C5A880] text-center mb-4 tracking-widest">
        The Showroom
      </h1>
      <p className="text-center text-[#666] text-sm tracking-widest mb-12 uppercase">
        Select a category to filter
      </p>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-20">
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
        <p className="text-center text-[#666]">No pieces in this category yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products?.map((piece) => {
          const imageUrl = getImageUrl(piece.hero_image_path);
          const colors = categoryColors[piece.category] || { border: "hover:shadow-[#C5A880]/20", badge: "text-[#C5A880]", tint: "bg-[#C5A880]/20" };

          return (
            <Link
              key={piece.id}
              href={`/piece/${piece.id}`}
              className={`group border border-[#222] hover:border-[#C5A880]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${colors.border}`}
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-[#111]">
                {imageUrl ? (
                  <>
                    <Image
                      src={imageUrl}
                      alt={piece.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Color tint overlay — fades out on hover */}
                    <div className={`absolute inset-0 ${colors.tint} transition-opacity duration-500 group-hover:opacity-0`} />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#333] text-sm tracking-widest">NO IMAGE</span>
                  </div>
                )}
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className={`text-[10px] tracking-[0.2em] uppercase ${colors.badge} bg-black/80 px-3 py-1.5 backdrop-blur-sm border border-[#333]`}>
                    {piece.category}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <p className="text-xs text-[#666] tracking-widest uppercase mb-2">
                  {piece.collection}
                </p>
                <h2 className="text-[#C5A880] font-serif text-2xl mb-2">{piece.name}</h2>
                <p className="text-[#666] text-sm mb-3 capitalize">{piece.category}</p>
                <p className="text-[#888] text-xs tracking-widest">
                  {piece.price_cents === 0 ? "Upon Request" : `$${(piece.price_cents / 100).toLocaleString()}`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
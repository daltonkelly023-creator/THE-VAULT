import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Particles from "@/components/Particles";

export const revalidate = 60;

export default async function Home() {
  const { data: featured } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`;
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-[#e5e5e5]">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[70vh] text-center px-4 overflow-hidden">
        <Particles />
        <div className="relative" style={{ zIndex: 2 }}>
          <h1 className="text-6xl md:text-8xl font-serif tracking-widest text-[#8ab4e8] mb-6">
            THE VAULT
          </h1>
          <p className="text-lg text-[#5a7a9a] max-w-lg mb-10 font-light tracking-wide leading-relaxed">
            Bespoke commissions from the atelier of master craftsmen. 
            Each piece forged once, never repeated.
          </p>
          <Link
            href="/collection"
            className="px-10 py-4 border border-[#4a90d9] text-[#4a90d9] hover:bg-[#4a90d9] hover:text-[#02040a] transition-all duration-300 tracking-[0.2em] text-sm uppercase"
          >
            Enter the Showroom
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="w-24 h-px bg-[#0a1a3a] mx-auto mb-20" />

      {/* Selected Works */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <h2 className="text-center text-3xl font-serif text-[#8ab4e8] mb-16 tracking-widest">
          Selected Works
        </h2>
        
        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((piece) => {
              const imageUrl = getImageUrl(piece.hero_image_path);
              return (
                <Link
                  key={piece.id}
                  href={`/piece/${piece.id}`}
                  className="group border border-[#0a1a3a] hover:border-[#4a90d9] transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="aspect-square bg-[#02040a] relative overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={piece.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[#1a3a5a] text-sm tracking-widest">NO IMAGE</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-[#3a5570] tracking-widest uppercase mb-2">
                      {piece.collection}
                    </p>
                    <h3 className="text-[#8ab4e8] font-serif text-xl mb-1">{piece.name}</h3>
                    <p className="text-[#3a5570] text-sm mb-3 capitalize">{piece.category}</p>
                    <p className="text-[#5a7a9a] text-xs tracking-widest">
                      {piece.price_cents === 0 ? "Upon Request" : `$${(piece.price_cents / 100).toLocaleString()}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-[#3a5570]">The vault is being curated.</p>
        )}

        <div className="text-center mt-12">
          <Link
            href="/collection"
            className="inline-block text-xs text-[#3a5570] hover:text-[#8ab4e8] transition-colors tracking-widest uppercase border-b border-[#0a1a3a] hover:border-[#4a90d9] pb-1"
          >
            View Full Collection →
          </Link>
        </div>
      </section>
    </main>
  );
}
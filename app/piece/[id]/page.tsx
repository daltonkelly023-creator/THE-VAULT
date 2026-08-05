import { supabase } from "@/lib/supabaseServer";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function PiecePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: piece } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!piece) notFound();

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const heroUrl = piece.hero_image_path && base
    ? `${base}/storage/v1/object/public/vault-assets/${piece.hero_image_path}`
    : null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-6 md:px-8 py-6">
        <Link
          href="/collection"
          className="text-xs text-gray-500 hover:text-[#c9a96e] tracking-widest uppercase transition-colors"
        >
          &larr; Back to Showroom
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-[#111] border border-[#1a1a1a] overflow-hidden relative">
              {heroUrl ? (
                <Image
                  src={heroUrl}
                  alt={piece.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                  No Image
                </div>
              )}
            </div>

            {piece.gallery_paths && piece.gallery_paths.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {piece.gallery_paths.map((path: string, i: number) => (
                  <div key={i} className="aspect-square bg-[#111] border border-[#1a1a1a] overflow-hidden relative">
                    <Image
                      src={`${base}/storage/v1/object/public/vault-assets/${path}`}
                      alt={`${piece.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] tracking-[0.2em] text-[#c9a96e] border border-[#c9a96e]/30 px-3 py-1 uppercase">
                {piece.collection === "altera" ? "Atelier — Workshop Crafted" : "Terra — Earth Sourced"}
              </span>
              <span className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">
                {piece.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-wider">
              {piece.name}
            </h1>

            <p className="text-2xl text-[#c9a96e] mb-10 font-light">
              ${(piece.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs tracking-widest text-gray-500 uppercase mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {piece.description || "No description available."}
                </p>
              </div>

              {piece.story && (
                <div className="border-l-2 border-[#c9a96e]/30 pl-6">
                  <h3 className="text-xs tracking-widest text-[#c9a96e] uppercase mb-3">The Story</h3>
                  <p className="text-gray-400 leading-relaxed text-sm italic">
                    {piece.story}
                  </p>
                </div>
              )}

              {piece.specifications && (
                <div>
                  <h3 className="text-xs tracking-widest text-gray-500 uppercase mb-3">Specifications</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {piece.specifications}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-[#1a1a1a]">
              <Link
                href={`/configure/${piece.id}`}
                className="inline-block px-8 py-4 bg-[#c9a96e] text-black text-sm tracking-widest uppercase font-medium hover:bg-[#b8985d] transition-colors"
              >
                Configure This Piece
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
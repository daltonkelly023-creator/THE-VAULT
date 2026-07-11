import { supabase } from "@/lib/supabaseServer";
import Link from "next/link";
import { notFound } from "next/navigation";
import Particles from "@/components/Particles";

export default async function PiecePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: piece } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!piece) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <Particles />

      <div className="relative z-10">
        <header className="flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a]">
          <Link href="/" className="text-[#c9a96e] text-sm tracking-[0.4em] font-light uppercase">
            Atelier
          </Link>
          <nav className="flex gap-8 text-xs tracking-[0.2em] text-gray-500">
            <Link href="/collection" className="hover:text-[#c9a96e] transition-colors">Showroom</Link>
            <Link href="/commission" className="hover:text-[#c9a96e] transition-colors">Commission</Link>
          </nav>
        </header>

        <section className="px-8 py-16 max-w-6xl mx-auto">
          <Link href="/collection" className="text-xs text-gray-500 tracking-widest hover:text-[#c9a96e] transition-colors uppercase">
            &larr; Back to Showroom
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-[#111] border border-[#1a1a1a] overflow-hidden">
                {piece.hero_image_path ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${piece.hero_image_path}`}
                    alt={piece.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Image</div>
                )}
              </div>
              {piece.gallery_paths && piece.gallery_paths.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {piece.gallery_paths.map((path: string, i: number) => (
                    <img
                      key={i}
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`}
                      alt=""
                      className="w-full h-20 object-cover rounded border border-[#1a1a1a]"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-8">
              {/* Collection badge */}
              <div className="flex items-center gap-3">
                <span className={`text-[10px] tracking-[0.3em] uppercase px-3 py-1 border ${piece.collection === 'altera'
                    ? 'border-[#c9a96e] text-[#c9a96e]'
                    : 'border-gray-600 text-gray-400'
                  }`}>
                  {piece.collection === 'altera' ? 'Atelier — Workshop Crafted' : 'Terra — Earth Sourced'}
                </span>
                <span className="text-[10px] tracking-[0.3em] uppercase text-gray-600">
                  {piece.category}
                </span>
              </div>

              {/* Name & Price */}
              <div>
                <h1 className="text-3xl font-light tracking-wider">{piece.name}</h1>
                <p className="text-2xl text-[#c9a96e] mt-4">${(piece.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                {piece.price_type && (
                  <p className="text-xs text-gray-600 mt-1 tracking-wider">{piece.price_type}</p>
                )}
              </div>

              {/* Description */}
              {piece.description ? (
                <div className="space-y-2">
                  <h3 className="text-xs tracking-widest text-gray-500 uppercase">Description</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{piece.description}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-xs tracking-widest text-gray-500 uppercase">Description</h3>
                  <p className="text-gray-600 text-sm italic">No description available.</p>
                </div>
              )}

              {/* Story */}
              {piece.story && (
                <div className="space-y-3 border-l-2 border-[#c9a96e] pl-6 py-2">
                  <h3 className="text-xs tracking-widest text-[#c9a96e] uppercase">The Story</h3>
                  <p className="text-gray-300 text-sm leading-relaxed italic">{piece.story}</p>
                </div>
              )}

              {/* Specs */}
              <div className="space-y-4">
                <h3 className="text-xs tracking-widest text-gray-500 uppercase">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {piece.metal && (
                    <div className="bg-[#111] border border-[#1a1a1a] p-4">
                      <p className="text-[10px] tracking-widest text-gray-600 uppercase mb-1">Metal</p>
                      <p className="text-sm text-white">{piece.metal}</p>
                    </div>
                  )}
                  {piece.stone && (
                    <div className="bg-[#111] border border-[#1a1a1a] p-4">
                      <p className="text-[10px] tracking-widest text-gray-600 uppercase mb-1">Stone</p>
                      <p className="text-sm text-white">{piece.stone}</p>
                    </div>
                  )}
                  {piece.carat && (
                    <div className="bg-[#111] border border-[#1a1a1a] p-4">
                      <p className="text-[10px] tracking-widest text-gray-600 uppercase mb-1">Carat</p>
                      <p className="text-sm text-white">{piece.carat}</p>
                    </div>
                  )}
                  {piece.length && (
                    <div className="bg-[#111] border border-[#1a1a1a] p-4">
                      <p className="text-[10px] tracking-widest text-gray-600 uppercase mb-1">Length</p>
                      <p className="text-sm text-white">{piece.length}</p>
                    </div>
                  )}
                </div>
              </div>

              {piece.specifications && (
                <div className="space-y-2">
                  <h3 className="text-xs tracking-widest text-gray-500 uppercase">Specifications</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{piece.specifications}</p>
                </div>
              )}

              <Link
                href={`/configure/${piece.id}`}
                className="inline-block w-full text-center px-8 py-4 bg-[#c9a96e] text-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#b8985d] transition-colors"
              >
                Configure & Commission
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
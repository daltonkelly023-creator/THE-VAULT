"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PieceDetail() {
  const params = useParams();
  const [piece, setPiece] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    async function fetchPiece() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();
      setPiece(data);
      setLoading(false);
    }
    fetchPiece();
  }, [params.id]);

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`;
  };

  const heroUrl = getImageUrl(piece?.hero_image_path);
  const galleryUrls = (piece?.gallery_paths || [])
    .map((p: string) => getImageUrl(p))
    .filter(Boolean);
  const allImages = heroUrl ? [heroUrl, ...galleryUrls] : galleryUrls;

  function handleImageChange(index: number) {
    if (index === activeImage || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveImage(index);
      setIsTransitioning(false);
    }, 400);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#666] tracking-widest text-sm">Entering the vault...</p>
      </main>
    );
  }

  if (!piece) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#666]">Piece not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] relative overflow-hidden">
      {/* Spotlight vignette effect */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(10,10,10,0.8)_70%,rgba(10,10,10,0.95)_100%)]" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-[#1a1a1a]">
        <Link
          href="/collection"
          className="text-xs text-[#666] hover:text-[#C5A880] transition-colors tracking-widest uppercase"
        >
          ← Back to Showroom
        </Link>
        <span className="text-[#C5A880] font-serif tracking-widest text-sm">THE VAULT</span>
        <span className="text-xs text-[#666] tracking-widest uppercase">{piece.collection}</span>
      </div>

      <div className="pt-20 min-h-screen flex flex-col lg:flex-row items-center justify-center">
        {/* Left: Image Gallery */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative" style={{ zIndex: 2 }}>
          {/* Main Image with spotlight */}
          <div className="relative w-full max-w-lg aspect-square mb-8">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-[#C5A880]/5 blur-3xl rounded-full scale-75" />
            
            {/* Image container */}
            <div className="relative w-full h-full border border-[#222] bg-[#0d0d0d] overflow-hidden">
              {allImages.length > 0 ? (
                <div className={`w-full h-full transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
                  <Image
                    src={allImages[activeImage]}
                    alt={`${piece.name} view ${activeImage + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[#333] text-sm tracking-widest">NO IMAGE</span>
                </div>
              )}
            </div>

            {/* Angle indicator */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1">
              <span className="text-[10px] text-[#666] tracking-widest uppercase">
                View {activeImage + 1} / {allImages.length}
              </span>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {allImages.length > 1 && (
            <div className="flex gap-3">
              {allImages.map((url: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleImageChange(i)}
                  className={`relative w-16 h-16 border overflow-hidden transition-all duration-300 ${
                    activeImage === i
                      ? "border-[#C5A880] shadow-lg shadow-[#C5A880]/20"
                      : "border-[#222] hover:border-[#444] opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`View ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Single image message */}
          {allImages.length === 1 && (
            <p className="text-[#333] text-xs tracking-widest mt-4">
              Additional angles available upon request
            </p>
          )}
        </div>

        {/* Right: Details */}
        <div className="w-full lg:w-[420px] p-8 lg:p-12 lg:border-l border-[#1a1a1a] relative" style={{ zIndex: 2 }}>
          <div className="mb-8">
            <p className="text-[10px] text-[#666] tracking-[0.3em] uppercase mb-3">
              {piece.collection} — {piece.category}
            </p>
            <h1 className="text-4xl lg:text-5xl font-serif text-[#C5A880] mb-6 leading-tight">
              {piece.name}
            </h1>

            {piece.stone && (
              <p className="text-sm text-[#888] mb-1">
                <span className="text-[#666]">Stone:</span> {piece.stone}
              </p>
            )}
            {piece.carat && (
              <p className="text-sm text-[#888] mb-1">
                <span className="text-[#666]">Carat:</span> {piece.carat}
              </p>
            )}
            {piece.metal && (
              <p className="text-sm text-[#888] mb-6">
                <span className="text-[#666]">Metal:</span> {piece.metal}
              </p>
            )}
          </div>

          <p className="text-[#999] leading-relaxed mb-8">
            {piece.description}
          </p>

          {piece.story && (
            <div className="border-l border-[#C5A880]/30 pl-6 mb-10">
              <p className="text-[#888] italic leading-relaxed text-sm">{piece.story}</p>
            </div>
          )}

          {piece.specifications && piece.specifications.length > 0 && (
            <div className="mb-10">
              <p className="text-[10px] text-[#666] tracking-[0.3em] uppercase mb-4">Specifications</p>
              <ul className="space-y-3">
                {(Array.isArray(piece.specifications) ? piece.specifications : []).map(
                  (spec: string, i: number) => (
                    <li key={i} className="text-sm text-[#888] flex items-start gap-3">
                      <span className="w-1 h-1 bg-[#C5A880]/50 rounded-full mt-1.5 flex-shrink-0" />
                      {spec}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <div className="pt-6 border-t border-[#222]">
            <p className="text-[10px] text-[#666] tracking-widest uppercase mb-4">
              {piece.price_cents === 0 ? "Price Upon Request" : `$${(piece.price_cents / 100).toLocaleString()}`}
            </p>

            <Link
              href={`/configure/${piece.id}`}
              className="block w-full text-center px-8 py-4 border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-[#0a0a0a] transition-all duration-300 tracking-[0.2em] text-sm uppercase mb-4"
            >
              Configure This Piece
            </Link>

            <a
              href={`mailto:goblinsharkyellow@gmail.com?subject=Commission Request: ${piece.name}&body=I am interested in commissioning ${piece.name} from the ${piece.collection} collection.%0D%0A%0D%0APlease contact me to discuss details.`}
              className="block w-full text-center px-8 py-3 bg-[#C5A880] text-[#0a0a0a] hover:bg-[#b89a70] transition-colors tracking-[0.2em] text-sm uppercase font-medium"
            >
              Request Commission
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
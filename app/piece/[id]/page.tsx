"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseServer";

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
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#3a5570] tracking-widest text-sm">Entering the vault...</p>
      </main>
    );
  }

  if (!piece) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#444]">Piece not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#02040a] text-[#e5e5e5] relative overflow-hidden">
      {/* Abyss vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,4,10,0.8)_70%,rgba(2,4,10,0.95)_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(74,144,217,0.04)_0%,transparent_70%)]" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#02040a]/80 backdrop-blur-sm border-b border-[#0a1a3a]">
        <Link
          href="/collection"
          className="text-xs text-[#3a5570] hover:text-[#8ab4e8] transition-colors tracking-widest uppercase"
        >
          ← Back to Showroom
        </Link>
        <span className="text-[#8ab4e8] font-serif tracking-widest text-sm">THE VAULT</span>
        <span className="text-xs text-[#3a5570] tracking-widest uppercase capitalize">{piece.collection}</span>
      </div>

      <div className="pt-20 min-h-screen flex flex-col lg:flex-row items-center justify-center">
        {/* Left: Image Gallery */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative" style={{ zIndex: 2 }}>
          {/* Main Image */}
          <div className="relative w-full max-w-lg aspect-[3/4] mb-6">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-[#4a90d9]/5 blur-3xl rounded-full scale-75" />

            {/* Image container */}
            <div className="relative w-full h-full border border-[#0a1a3a] bg-[#02040a] overflow-hidden">
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
                  <span className="text-[#1a3a5a] text-sm tracking-widest">NO IMAGE</span>
                </div>
              )}
            </div>

            {/* View indicator */}
            {allImages.length > 1 && (
              <div className="absolute top-4 right-4 bg-[#02040a]/80 backdrop-blur-sm border border-[#0a1a3a] px-3 py-1">
                <span className="text-[10px] text-[#3a5570] tracking-widest uppercase">
                  {activeImage + 1} / {allImages.length}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {allImages.length > 1 ? (
            <div className="flex gap-3">
              {allImages.map((url: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleImageChange(i)}
                  className={`relative w-16 h-16 border overflow-hidden transition-all duration-300 ${activeImage === i
                    ? "border-[#4a90d9] shadow-lg shadow-[#4a90d9]/20"
                    : "border-[#0a1a3a] hover:border-[#1a3a5a] opacity-40 hover:opacity-100"
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
          ) : (
            <div className="flex items-center gap-2 text-[#1a3a5a] text-xs tracking-widest">
              <span className="w-1 h-1 bg-[#4a90d9]/30 rounded-full" />
              Gallery images available upon request
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="w-full lg:w-[420px] p-8 lg:p-12 lg:border-l border-[#0a1a3a] relative" style={{ zIndex: 2 }}>
          <div className="mb-8">
            <p className="text-[10px] text-[#3a5570] tracking-[0.3em] uppercase mb-3">
              {piece.collection} — {piece.category}
            </p>
            <h1 className="text-4xl lg:text-5xl font-serif text-[#8ab4e8] mb-6 leading-tight">
              {piece.name}
            </h1>

            {piece.stone && (
              <p className="text-sm text-[#5a7a9a] mb-1">
                <span className="text-[#3a5570]">Stone:</span> {piece.stone}
              </p>
            )}
            {piece.carat && (
              <p className="text-sm text-[#5a7a9a] mb-1">
                <span className="text-[#3a5570]">Carat:</span> {piece.carat}
              </p>
            )}
            {piece.metal && (
              <p className="text-sm text-[#5a7a9a] mb-6">
                <span className="text-[#3a5570]">Metal:</span> {piece.metal}
              </p>
            )}
          </div>

          <p className="text-[#5a7a9a] leading-relaxed mb-8">
            {piece.description}
          </p>

          {piece.story && (
            <div className="border-l border-[#4a90d9]/30 pl-6 mb-10">
              <p className="text-[#5ba3e8] italic leading-relaxed text-sm">{piece.story}</p>
            </div>
          )}

          {piece.specifications && piece.specifications.length > 0 && (
            <div className="mb-10">
              <p className="text-[10px] text-[#3a5570] tracking-[0.3em] uppercase mb-4">Specifications</p>
              <ul className="space-y-3">
                {(Array.isArray(piece.specifications) ? piece.specifications : []).map(
                  (spec: string, i: number) => (
                    <li key={i} className="text-sm text-[#5a7a9a] flex items-start gap-3">
                      <span className="w-1 h-1 bg-[#4a90d9]/50 rounded-full mt-1.5 flex-shrink-0" />
                      {spec}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <div className="pt-6 border-t border-[#0a1a3a]">
            <p className="text-xl font-serif text-[#8ab4e8] mb-6">
              {piece.price_cents === 0 ? "Price Upon Request" : `$${(piece.price_cents / 100).toLocaleString()}`}
            </p>

            <Link
              href={`/configure/${piece.id}`}
              className="block w-full text-center px-8 py-4 border border-[#4a90d9] text-[#4a90d9] hover:bg-[#4a90d9] hover:text-[#02040a] transition-all duration-300 tracking-[0.2em] text-sm uppercase mb-4"
            >
              Configure This Piece
            </Link>

            <a
              href={`mailto:goblinsharkyellow@gmail.com?subject=Commission Request: ${piece.name}&body=I am interested in commissioning ${piece.name} from the ${piece.collection} collection.%0D%0A%0D%0APlease contact me to discuss details.`}
              className="block w-full text-center px-8 py-3 bg-[#4a90d9] text-[#02040a] hover:bg-[#5ba3e8] transition-colors tracking-[0.2em] text-sm uppercase font-medium"
            >
              Request Commission
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
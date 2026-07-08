// app/piece/[id]/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getPiece(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data;
}

export default function PieceDetail({ params }: { params: { id: string } }) {
  const [piece, setPiece] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");

  // Fetch on mount
  useState(() => {
    getPiece(params.id).then((data) => {
      setPiece(data);
      setLoading(false);
    });
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#666] tracking-widest text-sm">Loading...</p>
      </main>
    );
  }

  if (!piece) {
    notFound();
  }

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`;
  };

  const heroUrl = getImageUrl(piece.hero_image_path);
  const galleryUrls = (piece.gallery_paths || [])
    .map((p: string) => getImageUrl(p))
    .filter(Boolean);
  const allImages = heroUrl ? [heroUrl, ...galleryUrls] : galleryUrls;
  const hasMultiple = allImages.length > 1;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setFormError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      pieceName: piece.name,
      collection: piece.collection,
    };

    try {
      const res = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to send");
      }

      setFormState("success");
    } catch (err: any) {
      setFormState("error");
      setFormError(err.message || "Something went wrong");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-24 max-w-6xl mx-auto">
      <Link
        href="/collection"
        className="text-xs text-[#666] hover:text-[#C5A880] transition-colors tracking-widest uppercase mb-12 inline-block"
      >
        ← Back to Showroom
      </Link>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] relative overflow-hidden border border-[#222] bg-[#111]">
            {allImages.length > 0 ? (
              <Image
                src={allImages[0]}
                alt={piece.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#333] text-sm tracking-widest">NO IMAGE</span>
              </div>
            )}
          </div>

          {hasMultiple && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((url: string, i: number) => (
                <button
                  key={i}
                  className="relative w-20 h-20 flex-shrink-0 border border-[#333] hover:border-[#C5A880] transition-colors overflow-hidden bg-[#111]"
                >
                  <Image
                    src={url}
                    alt={`${piece.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}

          {!hasMultiple && allImages.length === 1 && (
            <p className="text-[#333] text-xs tracking-widest text-center">
              Additional angles available upon request
            </p>
          )}
        </div>

        {/* Right: Details + Form */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-xs text-[#666] tracking-[0.2em] uppercase mb-3">
              {piece.collection} — {piece.category}
            </p>
            <h1 className="text-5xl font-serif text-[#C5A880] mb-6 leading-tight">
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

          <p className="text-[#999] leading-relaxed mb-8 text-lg">
            {piece.description}
          </p>

          {piece.story && (
            <div className="border-l-2 border-[#C5A880] pl-6 mb-10">
              <p className="text-[#888] italic leading-relaxed">{piece.story}</p>
            </div>
          )}

          {piece.specifications && piece.specifications.length > 0 && (
            <div className="mb-10">
              <p className="text-xs text-[#666] tracking-[0.2em] uppercase mb-4">
                Specifications
              </p>
              <ul className="space-y-3">
                {(Array.isArray(piece.specifications) ? piece.specifications : []).map(
                  (spec: string, i: number) => (
                    <li key={i} className="text-sm text-[#888] flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-[#C5A880] rounded-full mt-1.5 flex-shrink-0" />
                      {spec}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Commission Form */}
          <div className="pt-6 border-t border-[#222]">
            <p className="text-xs text-[#666] tracking-widest uppercase mb-6">
              {piece.price_cents === 0
                ? "Price Upon Request"
                : `$${(piece.price_cents / 100).toLocaleString()}`}
            </p>

            {formState === "success" ? (
              <div className="border border-[#C5A880] p-8 text-center">
                <p className="text-[#C5A880] font-serif text-xl mb-2">Request Received</p>
                <p className="text-[#888] text-sm">
                  A master jeweler will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#666] tracking-widest uppercase mb-2">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666] tracking-widest uppercase mb-2">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666] tracking-widest uppercase mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e5e5e5] focus:border-[#C5A880] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {formState === "error" && (
                  <p className="text-red-400 text-xs">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="w-full py-4 bg-[#C5A880] text-[#0a0a0a] hover:bg-[#b89a70] transition-colors tracking-[0.2em] text-sm uppercase font-medium disabled:opacity-50"
                >
                  {formState === "submitting" ? "Sending..." : "Request Commission"}
                </button>
              </form>
            )}

            {formState !== "success" && (
              <p className="text-[#444] text-xs text-center mt-4 tracking-widest">
                Response within 24 hours
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
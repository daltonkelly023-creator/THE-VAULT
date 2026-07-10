"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (error || !data) {
        setError("Product not found");
        setLoading(false);
        return;
      }
      
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validate price is a number
    const priceCents = parseInt(product.price_cents);
    if (isNaN(priceCents) || priceCents < 0) {
      setError("Price must be a valid number");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: product.name,
        story: product.story,
        price_cents: priceCents,
        is_published: product.is_published,
      })
      .eq("id", params.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Force refresh and redirect
    router.refresh();
    router.push("/admin/products");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#3a5570] tracking-widest text-sm">Loading...</p>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#c94040]">{error}</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#444]">Product not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#02040a] text-[#e5e5e5] pt-16">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#02040a]/90 backdrop-blur-sm border-b border-[#0a1a3a]">
        <button
          onClick={() => router.push("/admin/products")}
          className="text-xs text-[#3a5570] hover:text-[#8ab4e8] transition-colors tracking-widest uppercase"
        >
          ← Back
        </button>
        <span className="text-[#8ab4e8] font-serif tracking-widest text-sm">EDIT PRODUCT</span>
        <span className="text-xs text-[#3a5570]">{product.name}</span>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 border border-[#c94040]/30 bg-[#c94040]/10 px-4 py-3">
            <p className="text-[#c94040] text-xs tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-[#3a5570] tracking-widest uppercase mb-2">Name</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-[#3a5570] tracking-widest uppercase mb-2">Story</label>
            <textarea
              value={product.story || ""}
              onChange={(e) => setProduct({ ...product, story: e.target.value })}
              rows={4}
              className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#3a5570] tracking-widest uppercase mb-2">Price (cents)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={product.price_cents}
              onChange={(e) => setProduct({ ...product, price_cents: e.target.value })}
              className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
            />
            <p className="text-[#1a3a5a] text-[10px] mt-1">
              Display: ${(parseInt(product.price_cents || 0) / 100).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={product.is_published}
              onChange={(e) => setProduct({ ...product, is_published: e.target.checked })}
              className="accent-[#4a90d9] w-4 h-4"
            />
            <label className="text-xs text-[#3a5570] tracking-widest uppercase">Published</label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#4a90d9] text-[#02040a] hover:bg-[#5ba3e8] transition-colors tracking-[0.2em] text-sm uppercase font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
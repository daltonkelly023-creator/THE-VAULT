"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    story: "",
    price_cents: 0,
    is_published: false,
  });

  // Fetch once on mount
  useEffect(() => {
    let mounted = true;
    
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (!mounted) return;
      
      if (error || !data) {
        setError("Product not found");
        setLoading(false);
        return;
      }
      
      setFormData({
        name: data.name,
        story: data.story || "",
        price_cents: data.price_cents,
        is_published: data.is_published,
      });
      setLoading(false);
    }
    
    fetchProduct();
    return () => { mounted = false; };
  }, [params.id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const priceCents = parseInt(String(formData.price_cents));
    if (isNaN(priceCents) || priceCents < 0) {
      setError("Price must be a valid number");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: formData.name,
        story: formData.story,
        price_cents: priceCents,
        is_published: formData.is_published,
      })
      .eq("id", params.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Small delay to let Supabase propagate
    await new Promise(r => setTimeout(r, 500));
    router.push("/admin/products");
  }, [formData, params.id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#3a5570] tracking-widest text-sm">Loading...</p>
      </main>
    );
  }

  if (error && !formData.name) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#c94040]">{error}</p>
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
        <span className="text-xs text-[#3a5570]">{formData.name}</span>
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-[#3a5570] tracking-widest uppercase mb-2">Story</label>
            <textarea
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              rows={4}
              className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#3a5570] tracking-widest uppercase mb-2">Price (cents)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.price_cents}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, price_cents: val === "" ? 0 : parseInt(val) });
              }}
              className="w-full bg-[#02040a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
            />
            <p className="text-[#1a3a5a] text-[10px] mt-1">
              Display: ${(formData.price_cents / 100).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
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
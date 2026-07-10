"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const categories = ["ring", "necklace", "bracelet", "earring", "watch"];
const collections = ["altera", "terra"];

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    collection: "altera",
    category: "ring",
    price: "",
    story: "",
    specifications: "",
    is_published: false,
  });

  useEffect(() => {
    if (sessionStorage.getItem("admin-auth") !== "true") {
      router.push("/admin");
    }
  }, [router]);

  function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setHeroFile(e.target.files[0]);
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setGalleryFiles(files);
    }
  }

  async function uploadImage(file: File, folder: string, itemSlug: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const path = `${folder}/${itemSlug}/${fileName}`;

    const { error } = await supabase.storage.from("vault-assets").upload(path, file);
    if (error) throw error;

    return path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!heroFile) {
      alert("Hero image required");
      return;
    }

    setLoading(true);

    try {
      // Create slug from name
      const itemSlug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // Upload hero
      const heroPath = await uploadImage(heroFile, form.collection, itemSlug);

      // Upload gallery
      const galleryPaths: string[] = [];
      for (const file of galleryFiles) {
        const path = await uploadImage(file, form.collection, itemSlug);
        galleryPaths.push(path);
      }

      // Insert product
      const { error } = await supabase.from("products").insert({
        name: form.name,
        collection: form.collection,
        category: form.category,
        price_cents: Math.round(parseFloat(form.price || "0") * 100),
        story: form.story || null,
        specifications: form.specifications ? form.specifications.split(",").map((s) => s.trim()) : [],
        hero_image_path: heroPath,
        gallery_paths: galleryPaths,
        is_published: form.is_published,
      });

      if (error) throw error;

      router.push("/admin/products");
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#02040a] text-[#e5e5e5]">
      {/* Header */}
      <div className="border-b border-[#0a1a3a] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif text-[#8ab4e8] tracking-widest">New Piece</h1>
          <p className="text-[10px] text-[#3a5570] tracking-[0.2em] uppercase">Add to the vault</p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs text-[#3a5570] hover:text-[#8ab4e8] transition-colors tracking-widest uppercase"
        >
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Name */}
        <div>
          <label className="block text-[10px] text-[#3a5570] tracking-[0.2em] uppercase mb-2">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
          />
        </div>

        {/* Collection & Category */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] text-[#3a5570] tracking-[0.2em] uppercase mb-2">Collection</label>
            <select
              value={form.collection}
              onChange={(e) => setForm({ ...form, collection: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm appearance-none"
            >
              {collections.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-[#3a5570] tracking-[0.2em] uppercase mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm appearance-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-[10px] text-[#3a5570] tracking-[0.2em] uppercase mb-2">Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0.00"
            className="w-full bg-[#0a0a0a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
          />
          <p className="text-[#1a3a5a] text-[10px] mt-1">Leave 0 for "Upon Request"</p>
        </div>

        {/* Story */}
        <div>
          <label className="block text-[10px] text-[#3a5570] tracking-[0.2em] uppercase mb-2">Story</label>
          <textarea
            rows={4}
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
            placeholder="The legend behind this piece..."
            className="w-full bg-[#0a0a0a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm resize-none"
          />
        </div>

        {/* Specifications */}
        <div>
          <label className="block text-[10px] text-[#3a5570] tracking-[0.2em] uppercase mb-2">Specifications</label>
          <input
            type="text"
            value={form.specifications}
            onChange={(e) => setForm({ ...form, specifications: e.target.value })}
            placeholder="18k gold, 2.5ct diamond, handcrafted..."
            className="w-full bg-[#0a0a0a] border border-[#0a1a3a] px-4 py-3 text-[#e5e5e5] focus:border-[#4a90d9] focus:outline-none transition-colors text-sm"
          />
          <p className="text-[#1a3a5a] text-[10px] mt-1">Comma-separated list</p>
        </div>

        {/* Hero Image */}
        <div>
          <label className="block text-[10px] text-[#3a5570] tracking-[0.2em] uppercase mb-2">Hero Image *</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={handleHeroChange}
            className="w-full text-[#3a5570] text-sm file:mr-4 file:px-4 file:py-2 file:border file:border-[#0a1a3a] file:bg-[#0a0a0a] file:text-[#8ab4e8] file:text-xs file:tracking-widest file:uppercase hover:file:border-[#4a90d9]"
          />
          {heroFile && (
            <p className="text-[#4a90d9] text-xs mt-2">{heroFile.name}</p>
          )}
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-[10px] text-[#3a5570] tracking-[0.2em] uppercase mb-2">Gallery Images (Max 3)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="w-full text-[#3a5570] text-sm file:mr-4 file:px-4 file:py-2 file:border file:border-[#0a1a3a] file:bg-[#0a0a0a] file:text-[#8ab4e8] file:text-xs file:tracking-widest file:uppercase hover:file:border-[#4a90d9]"
          />
          {galleryFiles.length > 0 && (
            <p className="text-[#4a90d9] text-xs mt-2">{galleryFiles.length} selected</p>
          )}
        </div>

        {/* Published Toggle */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setForm({ ...form, is_published: !form.is_published })}
            className={`w-12 h-6 border transition-all duration-300 relative ${
              form.is_published ? "border-[#4a90d9] bg-[#4a90d9]/20" : "border-[#0a1a3a] bg-[#0a0a0a]"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-[#8ab4e8] transition-all duration-300 ${
                form.is_published ? "left-6" : "left-0.5"
              }`}
            />
          </button>
          <span className="text-xs text-[#3a5570] tracking-widest uppercase">
            {form.is_published ? "Published" : "Draft"}
          </span>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#0a1a3a]">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#4a90d9] text-[#02040a] hover:bg-[#5ba3e8] transition-colors tracking-[0.2em] text-sm uppercase font-medium disabled:opacity-50"
          >
            {loading ? "Forging..." : "Add to Vault"}
          </button>
        </div>
      </form>
    </main>
  );
}
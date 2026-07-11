"use client";

import { useState } from "react";
import Link from "next/link";
import { updateProduct, deleteProduct } from "./actions";

interface Product {
  id: string;
  name: string;
  price_cents: number;
  category: string;
  collection: string;
  description: string | null;
  metal: string | null;
  asset_type: string;
  hero_image_path: string | null;
  turntable_folder_path: string | null;
  model3d_path: string | null;
  is_published: boolean;
  stone: string | null;
  carat: string | null;
  story: string | null;
  specifications: string[] | null;
  gallery_paths: string[] | null;
  created_at: string;
  updated_at: string;
}

export default function EditProductPage({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [specs, setSpecs] = useState<string[]>(product.specifications || []);
  const [galleryPaths, setGalleryPaths] = useState<string[]>(product.gallery_paths || []);
  const [heroImage, setHeroImage] = useState<string | null>(product.hero_image_path);
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "assets">("basic");
  const priceDollars = (product.price_cents / 100).toFixed(2);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      formData.set("specifications", JSON.stringify(specs));
      formData.set("gallery_paths", JSON.stringify(galleryPaths));
      if (heroImage) formData.set("hero_image_path", heroImage);
      await updateProduct(formData);
    } catch (err) {
      alert("Failed to save: " + (err as Error).message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product permanently?")) return;
    const formData = new FormData();
    formData.set("id", product.id);
    await deleteProduct(formData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "hero" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", type === "hero" ? "heroes" : "gallery");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        if (type === "hero") setHeroImage(data.url);
        else setGalleryPaths((prev) => [...prev, data.url]);
      }
    } catch {
      alert("Upload failed");
    }
  };

  const addSpec = () => {
    const val = prompt("Add specification:");
    if (!val) return;
    setSpecs((prev) => [...prev, val.trim()]);
  };

  const removeSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const tabs = [
    { key: "basic" as const, label: "BASIC" },
    { key: "content" as const, label: "CONTENT" },
    { key: "assets" as const, label: "ASSETS" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e6e3]">
      <div className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="text-[#3a5570] hover:text-[#5a7a9a] text-sm tracking-widest transition-colors">
            ← BACK
          </Link>
          <h1 className="text-lg tracking-[0.2em] font-light">EDIT PRODUCT</h1>
        </div>
        <button onClick={handleDelete} className="text-xs tracking-widest text-red-400 hover:text-red-300 border border-red-900/30 px-4 py-2 transition-colors">
          DELETE
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-1 mb-8 border-b border-[#1a1a1a]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-6 py-3 text-xs tracking-[0.2em] transition-all ${activeTab === t.key ? "text-[#e8e6e3] border-b border-[#3a5570]" : "text-[#3a5570] hover:text-[#5a7a9a]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="id" value={product.id} />

          {/* BASIC TAB */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Field label="Product Name" name="name" defaultValue={product.name} required />
                <div className="space-y-2">
                  <label className="text-[10px] tracking-[0.25em] text-[#3a5570] uppercase">Category</label>
                  <select name="category" defaultValue={product.category} className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-sm tracking-wide focus:border-[#3a5570] focus:outline-none transition-colors">
                    {["ring", "watch", "necklace", "bracelet", "earring"].map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] tracking-[0.25em] text-[#3a5570] uppercase">Price ($)</label>
                  <input name="price" type="number" step="0.01" defaultValue={priceDollars} required
                    className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-sm tracking-wide focus:border-[#3a5570] focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] tracking-[0.25em] text-[#3a5570] uppercase">Collection</label>
                  <select name="collection" defaultValue={product.collection} className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-sm tracking-wide focus:border-[#3a5570] focus:outline-none transition-colors">
                    <option value="atelier">Atelier</option>
                    <option value="terra">Terra</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] tracking-[0.25em] text-[#3a5570] uppercase">Asset Type</label>
                  <select name="asset_type" defaultValue={product.asset_type} className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-sm tracking-wide focus:border-[#3a5570] focus:outline-none transition-colors">
                    <option value="photo_only">Photo Only</option>
                    <option value="parametric">Parametric (3D Generated)</option>
                    <option value="turntable">Turntable (Image Spin)</option>
                    <option value="model3d">3D Model (.glb)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Field label="Metal" name="metal" defaultValue={product.metal || ""} placeholder="e.g. yellow-gold, platinum" />
                <Field label="Stone" name="stone" defaultValue={product.stone || ""} placeholder="e.g. VVS1 Diamond" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Field label="Carat" name="carat" defaultValue={product.carat || ""} placeholder="e.g. 1.25 ct" />
                <div className="flex items-center gap-3 py-8">
                  <input type="checkbox" name="is_published" defaultChecked={product.is_published} className="w-4 h-4 accent-[#3a5570]" />
                  <label className="text-sm tracking-widest">Published (visible in showroom)</label>
                </div>
              </div>

              <Field label="Description" name="description" defaultValue={product.description || ""} textarea />
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <Field label="Story" name="story" defaultValue={product.story || ""} textarea placeholder="The editorial narrative shown on the private viewing page..." />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-[0.25em] text-[#3a5570] uppercase">Specifications</p>
                  <button type="button" onClick={addSpec} className="text-xs tracking-widest border border-[#3a5570]/30 px-4 py-2 hover:border-[#3a5570] transition-colors">
                    + ADD SPEC
                  </button>
                </div>

                {specs.length === 0 && (
                  <p className="text-sm text-[#3a5570] py-8 text-center">No specifications added.</p>
                )}

                <div className="space-y-2">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#111] border border-[#1a1a1a] px-4 py-3">
                      <span className="text-sm tracking-wide">{spec}</span>
                      <button type="button" onClick={() => removeSpec(i)} className="text-xs text-red-400 hover:text-red-300 transition-colors">REMOVE</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ASSETS TAB */}
          {activeTab === "assets" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.25em] text-[#3a5570] uppercase">Hero Image</label>
                <div className="flex items-center gap-4">
                  {heroImage && (
                    <div className="w-24 h-24 bg-[#111] border border-[#1a1a1a] overflow-hidden">
                      <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "hero")}
                    className="bg-[#111] border border-[#1a1a1a] px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:tracking-widest file:bg-[#3a5570] file:text-white" />
                </div>
                {heroImage && <input type="hidden" name="hero_image_path" value={heroImage} />}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.25em] text-[#3a5570] uppercase">Gallery Images</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "gallery")}
                  className="w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:tracking-widest file:bg-[#3a5570] file:text-white" />

                {galleryPaths.length === 0 ? (
                  <p className="text-sm text-[#3a5570] py-4">No gallery images.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {galleryPaths.map((url, i) => (
                      <div key={i} className="relative group aspect-square bg-[#111] border border-[#1a1a1a]">
                        <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setGalleryPaths((prev) => prev.filter((u) => u !== url))}
                          className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Field label="Turntable Folder Path" name="turntable_folder_path" defaultValue={product.turntable_folder_path || ""} placeholder="turntables/{product_id}/" />
              <Field label="3D Model Path (.glb)" name="model3d_path" defaultValue={product.model3d_path || ""} placeholder="models/ring.glb" />
            </div>
          )}

          <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#1a1a1a] pt-4 pb-6 mt-8 -mx-6 px-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-[0.2em] text-[#3a5570]">
                UPDATED: {new Date(product.updated_at).toLocaleDateString()}
              </p>
              <div className="flex gap-3">
                <Link href="/admin/products" className="text-xs tracking-widest border border-[#1a1a1a] px-6 py-3 hover:border-[#3a5570] transition-colors">CANCEL</Link>
                <button type="submit" disabled={loading}
                  className="text-xs tracking-widest bg-[#3a5570] text-white px-8 py-3 hover:bg-[#5a7a9a] transition-colors disabled:opacity-50">
                  {loading ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, defaultValue, required, textarea, placeholder }: {
  label: string; name: string; defaultValue?: string; required?: boolean; textarea?: boolean; placeholder?: string;
}) {
  const base = "w-full bg-[#111] border border-[#1a1a1a] px-4 py-3 text-sm tracking-wide focus:border-[#3a5570] focus:outline-none transition-colors";
  return (
    <div className="space-y-2">
      <label className="text-[10px] tracking-[0.25em] text-[#3a5570] uppercase">{label}</label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} rows={6} placeholder={placeholder} className={base + " resize-none"} />
      ) : (
        <input name={name} defaultValue={defaultValue} required={required} placeholder={placeholder} className={base} />
      )}
    </div>
  );
}
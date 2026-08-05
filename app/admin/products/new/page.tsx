"use client";

import { useState } from "react";
import { createProduct } from "./actions";
import { supabase } from "@/lib/supabaseClient";
import Particles from "@/components/Particles";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [heroPath, setHeroPath] = useState("");
  const [galleryPaths, setGalleryPaths] = useState<string[]>([]);

  const categories = ["ring", "necklace", "bracelet", "earring", "watch"];
  const collections = ["altera", "terra"];
  const assetTypes = ["parametric", "turntable"];

  async function uploadToServer(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.path || null;
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = await uploadToServer(file);
    if (path) setHeroPath(path);
    else alert("Upload failed");
    setUploading(false);
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newPaths: string[] = [];
    for (const file of Array.from(files)) {
      const path = await uploadToServer(file);
      if (path) newPaths.push(path);
    }
    setGalleryPaths((prev) => [...prev, ...newPaths]);
    setUploading(false);
  }

  async function handleSubmit(formData: FormData) {
    try {
      const result = await createProduct(formData);
      if (result.success) {
        window.location.href = "/admin/products";
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <Particles />
      <div className="relative z-10 p-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-light tracking-wider text-[#c9a96e] mb-8">
            NEW PRODUCT
          </h1>

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase">Name</label>
              <input name="name" required className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs tracking-widest text-gray-500 uppercase">Category</label>
                <select name="category" defaultValue="ring" className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs tracking-widest text-gray-500 uppercase">Collection</label>
                <select name="collection" defaultValue="altera" className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none">
                  {collections.map((c) => <option key={c} value={c}>{c === "altera" ? "Atelier — Workshop Crafted" : "Terra — Earth Sourced"}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs tracking-widest text-gray-500 uppercase">Price ($)</label>
                <input name="price" type="number" step="0.01" required className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs tracking-widest text-gray-500 uppercase">Asset Type</label>
                <select name="asset_type" defaultValue="parametric" className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none">
                  {assetTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase">Metal</label>
              <input name="metal" placeholder="e.g. 18K White Gold" className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs tracking-widest text-gray-500 uppercase">Stone</label>
                <input name="stone" placeholder="e.g. Diamond" className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs tracking-widest text-gray-500 uppercase">Carat</label>
                <input name="carat" placeholder="e.g. 2.5" className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase">Hero Image</label>
              <input type="file" accept="image/*" onChange={handleHeroUpload} className="text-sm text-gray-400" />
              {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
              {heroPath && (
                <div className="relative w-32 h-32 mt-2">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${heroPath}`}
                    alt="Preview"
                    fill
                    className="object-cover rounded border border-[#1a1a1a]"
                    sizes="128px"
                  />
                </div>
              )}
              <input type="hidden" name="hero_image_path" value={heroPath} />
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase">Gallery Images</label>
              <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="text-sm text-gray-400" />
              {galleryPaths.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {galleryPaths.map((path, i) => (
                    <div key={i} className="relative w-full h-20">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`}
                        alt=""
                        fill
                        className="object-cover rounded border border-[#1a1a1a]"
                        sizes="(max-width: 768px) 25vw, 150px"
                      />
                    </div>
                  ))}
                </div>
              )}
              <input type="hidden" name="gallery_paths" value={JSON.stringify(galleryPaths)} />
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase">Description</label>
              <textarea name="description" rows={3} className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase">The Story</label>
              <textarea name="story" rows={4} placeholder="The inspiration, craftsmanship, legacy..." className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase">Specifications</label>
              <textarea name="specifications" rows={3} placeholder="Technical details, dimensions, materials..." className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none" />
            </div>

            <button type="submit" className="px-6 py-3 bg-[#c9a96e] text-black text-sm font-medium rounded hover:bg-[#b8985d] transition-colors">
              Create Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
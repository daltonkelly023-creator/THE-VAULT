"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct, deleteProduct } from "./actions";
import { supabase } from "@/lib/supabaseClient";

interface Product {
    id: string;
    name: string;
    category: string;
    collection: string;
    asset_type: string;
    price_cents: number;
    description: string;
    metal: string;
    stone: string;
    carat: string;
    length: string;
    price_type: string;
    story: string;
    specifications: string;
    hero_image_path: string;
    gallery_paths: string[];
    is_published: boolean;
}

export default function EditProductForm({ product }: { product: Product }) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [heroPath, setHeroPath] = useState(product.hero_image_path || "");
    const [galleryPaths, setGalleryPaths] = useState<string[]>(product.gallery_paths || []);
    const [deleting, setDeleting] = useState(false);

    const categories = ["ring", "necklace", "bracelet", "earring", "watch"];
    const collections = ["altera", "terra"];
    const assetTypes = ["parametric", "turntable"];
    const priceTypes = ["Fixed", "Starting at", "Estimate"];

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

    async function handleDelete() {
        if (!confirm("Permanently delete this product?")) return;
        setDeleting(true);

        const formData = new FormData();
        formData.append("id", product.id);

        try {
            await deleteProduct(formData);
        } catch (err: any) {
            alert("Delete failed: " + err.message);
            setDeleting(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* Live Preview Card */}
            <div className="bg-[#111] border border-[#1a1a1a] rounded p-6 flex gap-6">
                {heroPath ? (
                    <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${heroPath}`}
                        alt={product.name}
                        className="w-32 h-32 object-cover rounded border border-[#1a1a1a]"
                    />
                ) : (
                    <div className="w-32 h-32 bg-[#0a0a0a] border border-[#1a1a1a] rounded flex items-center justify-center text-gray-600 text-xs">
                        No Image
                    </div>
                )}
                <div className="flex-1">
                    <h2 className="text-lg tracking-wider text-white">{product.name}</h2>
                    <p className="text-sm text-[#c9a96e] mt-1">${(product.price_cents / 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                        {product.category} — {product.collection === "altera" ? "Atelier" : "Terra"}
                    </p>
                    <div className="mt-3 flex gap-2">
                        <span className={`text-[10px] px-2 py-1 rounded border ${product.is_published
                                ? "border-green-800 text-green-400 bg-green-900/20"
                                : "border-gray-700 text-gray-500 bg-gray-900/20"
                            }`}>
                            {product.is_published ? "Live" : "Draft"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <form action={updateProduct} className="space-y-6">
                <input type="hidden" name="id" value={product.id} />

                {/* Name */}
                <div className="space-y-2">
                    <label className="text-xs tracking-widest text-gray-500 uppercase">Name</label>
                    <input
                        name="name"
                        defaultValue={product.name}
                        required
                        className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                    />
                </div>

                {/* Category + Collection */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs tracking-widest text-gray-500 uppercase">Category</label>
                        <select
                            name="category"
                            defaultValue={product.category}
                            className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs tracking-widest text-gray-500 uppercase">Collection</label>
                        <select
                            name="collection"
                            defaultValue={product.collection}
                            className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                        >
                            {collections.map((c) => (
                                <option key={c} value={c}>{c === "altera" ? "Atelier — Workshop Crafted" : "Terra — Earth Sourced"}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Price + Asset Type */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs tracking-widest text-gray-500 uppercase">Price ($)</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={(product.price_cents / 100).toFixed(2)}
                            required
                            className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs tracking-widest text-gray-500 uppercase">Asset Type</label>
                        <select
                            name="asset_type"
                            defaultValue={product.asset_type}
                            className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                        >
                            {assetTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Metal */}
                <div className="space-y-2">
                    <label className="text-xs tracking-widest text-gray-500 uppercase">Metal</label>
                    <input
                        name="metal"
                        defaultValue={product.metal || ""}
                        placeholder="e.g. 18K White Gold"
                        className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                    />
                </div>

                {/* Stone + Carat */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs tracking-widest text-gray-500 uppercase">Stone</label>
                        <input
                            name="stone"
                            defaultValue={product.stone || ""}
                            placeholder="e.g. Diamond"
                            className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs tracking-widest text-gray-500 uppercase">Carat</label>
                        <input
                            name="carat"
                            defaultValue={product.carat || ""}
                            placeholder="e.g. 2.5"
                            className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                        />
                    </div>
                </div>

                {/* Length + Price Type */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs tracking-widest text-gray-500 uppercase">Length</label>
                        <input
                            name="length"
                            defaultValue={product.length || ""}
                            placeholder="e.g. 18 inches"
                            className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs tracking-widest text-gray-500 uppercase">Price Type</label>
                        <select
                            name="price_type"
                            defaultValue={product.price_type || "Fixed"}
                            className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                        >
                            {priceTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="space-y-2">
                    <label className="text-xs tracking-widest text-gray-500 uppercase">Hero Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroUpload}
                        className="text-sm text-gray-400"
                    />
                    {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
                    {heroPath && (
                        <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${heroPath}`}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded border border-[#1a1a1a] mt-2"
                        />
                    )}
                    <input type="hidden" name="hero_image_path" value={heroPath} />
                </div>

                {/* Gallery Images */}
                <div className="space-y-2">
                    <label className="text-xs tracking-widest text-gray-500 uppercase">Gallery Images</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="text-sm text-gray-400"
                    />
                    {galleryPaths.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {galleryPaths.map((path, i) => (
                                <img
                                    key={i}
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${path}`}
                                    alt=""
                                    className="w-full h-20 object-cover rounded border border-[#1a1a1a]"
                                />
                            ))}
                        </div>
                    )}
                    <input type="hidden" name="gallery_paths" value={JSON.stringify(galleryPaths)} />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs tracking-widest text-gray-500 uppercase">Description</label>
                    <textarea
                        name="description"
                        defaultValue={product.description || ""}
                        rows={3}
                        className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                    />
                </div>

                {/* Story */}
                <div className="space-y-2">
                    <label className="text-xs tracking-widest text-gray-500 uppercase">The Story</label>
                    <textarea
                        name="story"
                        defaultValue={product.story || ""}
                        rows={4}
                        placeholder="The inspiration, craftsmanship, legacy..."
                        className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                    />
                </div>

                {/* Specifications */}
                <div className="space-y-2">
                    <label className="text-xs tracking-widest text-gray-500 uppercase">Specifications</label>
                    <textarea
                        name="specifications"
                        defaultValue={product.specifications || ""}
                        rows={3}
                        placeholder="Technical details, dimensions, materials..."
                        className="w-full bg-[#111] border border-[#1a1a1a] rounded px-4 py-3 text-sm focus:border-[#c9a96e] outline-none"
                    />
                </div>

                {/* Published Toggle */}
                <div className="flex items-center gap-4 py-4 border-t border-[#1a1a1a]">
                    <input
                        type="checkbox"
                        name="is_published"
                        defaultChecked={product.is_published}
                        className="w-4 h-4 accent-[#c9a96e]"
                    />
                    <label className="text-xs tracking-widest text-gray-500 uppercase">
                        Published (visible in showroom)
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        className="flex-1 px-6 py-4 bg-[#c9a96e] text-black text-sm tracking-widest uppercase font-medium rounded hover:bg-[#b8985d] transition-colors"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-6 py-4 border border-red-900 text-red-400 text-sm tracking-widest uppercase rounded hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </form>
        </div>
    );
}
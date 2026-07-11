"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Product {
  id: string;
  name: string;
  collection: string;
  category: string;
  price_cents: number;
  is_published: boolean;
  hero_image_path: string | null;
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("admin-auth") !== "true") {
      router.push("/admin");
      return;
    }
    fetchProducts();
  }, [router]);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("id, name, collection, category, price_cents, is_published, hero_image_path")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this piece permanently?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from("products").update({ is_published: !current }).eq("id", id);
    fetchProducts();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <p className="text-[#3a5570] tracking-widest">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#02040a] text-[#e5e5e5]">
      {/* Header */}
      <div className="border-b border-[#0a1a3a] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif text-[#8ab4e8] tracking-widest">Admin</h1>
          <p className="text-[10px] text-[#3a5570] tracking-[0.2em] uppercase">The Vault Management</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 border border-[#4a90d9] text-[#4a90d9] hover:bg-[#4a90d9] hover:text-[#02040a] transition-all tracking-widest text-xs uppercase"
          >
            + New Piece
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem("admin-auth");
              router.push("/admin");
            }}
            className="text-xs text-[#3a5570] hover:text-[#8ab4e8] transition-colors tracking-widest uppercase"
          >
            Exit
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="flex gap-8 mb-10 text-xs tracking-widest">
          <div>
            <span className="text-[#3a5570] uppercase">Total</span>
            <span className="text-[#8ab4e8] ml-2 text-lg font-serif">{products.length}</span>
          </div>
          <div>
            <span className="text-[#3a5570] uppercase">Published</span>
            <span className="text-[#4a90d9] ml-2 text-lg font-serif">
              {products.filter((p) => p.is_published).length}
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div className="border border-[#0a1a3a] overflow-hidden">
          <div className="grid grid-cols-[1fr,120px,120px,100px,80px,120px] gap-4 px-4 py-3 bg-[#0a0a0a] border-b border-[#0a1a3a] text-[10px] text-[#3a5570] tracking-[0.2em] uppercase">
            <span>Name</span>
            <span>Collection</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[1fr,120px,120px,100px,80px,120px] gap-4 px-4 py-4 border-b border-[#0a1a3a]/50 items-center hover:bg-[#0a0a0a]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {product.hero_image_path ? (
                  <div className="w-10 h-10 bg-[#0a0a0a] border border-[#0a1a3a] overflow-hidden flex-shrink-0">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${product.hero_image_path}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-[#0a0a0a] border border-[#0a1a3a] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#1a3a5a] text-[8px]">NO IMG</span>
                  </div>
                )}
                <span className="text-sm text-[#8ab4e8] font-serif truncate">{product.name}</span>
              </div>

              <span className="text-xs text-[#5ba3e8] capitalize">{product.collection}</span>
              <span className="text-xs text-[#3a5570] capitalize">{product.category}</span>
              <span className="text-xs text-[#888]">
                {product.price_cents === 0 ? "—" : `$${(product.price_cents / 100).toLocaleString()}`}
              </span>

              <button
                onClick={() => togglePublish(product.id, product.is_published)}
                className={`text-[10px] tracking-widest uppercase px-2 py-1 border transition-all ${product.is_published
                  ? "border-[#4a90d9] text-[#4a90d9]"
                  : "border-[#1a3a5a] text-[#1a3a5a]"
                  }`}
              >
                {product.is_published ? "Live" : "Draft"}
              </button>

              <div className="flex gap-2 justify-end">
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="text-[10px] text-[#3a5570] hover:text-[#8ab4e8] transition-colors tracking-widest uppercase"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="text-[10px] text-[#3a5570] hover:text-[#c94040] transition-colors tracking-widest uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
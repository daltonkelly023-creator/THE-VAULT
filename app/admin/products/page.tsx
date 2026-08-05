import { supabase } from "@/lib/supabaseServer";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const revalidate = 0;

function checkAdminAuth() {
  const cookieStore = cookies();
  const adminAuth = cookieStore.get("admin-auth")?.value;
  return adminAuth === "vault-admin-2024";
}

export default async function AdminProductsPage() {
  if (!checkAdminAuth()) {
    redirect("/admin");
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-red-400">Error loading products: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a]">
        <Link href="/" className="text-[#c9a96e] text-sm tracking-[0.4em] font-light uppercase">
          Atelier
        </Link>
        <nav className="flex gap-8 text-xs tracking-[0.2em] text-gray-500">
          <Link href="/admin/products" className="text-[#c9a96e]">Products</Link>
          <Link href="/admin/commissions" className="hover:text-[#c9a96e] transition-colors">Commissions</Link>
        </nav>
      </header>

      <main className="p-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-light tracking-wider text-[#c9a96e]">PRODUCTS</h1>
          <Link
            href="/admin/products/new"
            className="px-6 py-3 bg-[#c9a96e] text-black text-sm font-medium rounded hover:bg-[#b8985d] transition-colors"
          >
            + New Product
          </Link>
        </div>

        {(!products || products.length === 0) ? (
          <div className="text-center py-20 text-gray-600 border border-[#1a1a1a] border-dashed rounded">
            <p className="text-sm tracking-widest">No products yet.</p>
            <Link href="/admin/products/new" className="text-[#c9a96e] text-xs mt-4 inline-block hover:underline">
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-6 bg-[#111] border border-[#1a1a1a] rounded p-4 hover:border-[#c9a96e]/30 transition-colors"
              >
                <div className="w-16 h-16 bg-[#0a0a0a] rounded overflow-hidden flex-shrink-0 relative">
                  {product.hero_image_path ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vault-assets/${product.hero_image_path}`}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-[10px]">No Img</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm tracking-wider text-white truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                    {product.category} — {product.collection === "altera" ? "Atelier" : "Terra"}
                  </p>
                  <p className="text-xs text-[#c9a96e] mt-1">${(product.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="flex-shrink-0">
                  <span
                    className={`text-[10px] px-2 py-1 rounded border ${
                      product.is_published
                        ? "border-green-800 text-green-400 bg-green-900/20"
                        : "border-gray-700 text-gray-500 bg-gray-900/20"
                    }`}
                  >
                    {product.is_published ? "Live" : "Draft"}
                  </span>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="px-3 py-2 text-xs text-[#c9a96e] border border-[#c9a96e]/30 rounded hover:bg-[#c9a96e]/10 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/piece/${product.id}`}
                    target="_blank"
                    className="px-3 py-2 text-xs text-gray-500 border border-gray-800 rounded hover:text-white transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
import { supabase } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between px-8 py-6 border-b border-[#1a1a1a]">
        <Link href="/" className="text-[#c9a96e] text-sm tracking-[0.4em] font-light uppercase">
          Atelier
        </Link>
        <nav className="flex gap-8 text-xs tracking-[0.2em] text-gray-500">
          <Link href="/admin/products" className="hover:text-[#c9a96e] transition-colors">
            &larr; Back to Products
          </Link>
        </nav>
      </header>

      <main className="p-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-light tracking-wider text-[#c9a96e] mb-2">
          EDIT PRODUCT
        </h1>
        <p className="text-xs text-gray-500 tracking-widest mb-8 uppercase">
          {product.name}
        </p>

        <EditProductForm product={product} />
      </main>
    </div>
  );
}
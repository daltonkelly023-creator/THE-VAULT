"use server";

import { supabase } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const price_cents = Math.round(
    parseFloat((formData.get("price") as string) || "0") * 100
  ) || 0;

  const { data, error } = await supabase.from("products").insert({
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    collection: formData.get("collection") as string,
    asset_type: formData.get("asset_type") as string,
    price_cents,
    description: formData.get("description") as string || null,
    metal: formData.get("metal") as string || null,
    stone: formData.get("stone") as string || null,
    carat: formData.get("carat") as string || null,
    story: formData.get("story") as string || null,
    specifications: formData.get("specifications") as string || null,
    hero_image_path: (formData.get("hero_image_path") as string) || null,
    gallery_paths: (() => {
      const raw = formData.get("gallery_paths") as string;
      if (!raw || raw === "") return [];
      try { return JSON.parse(raw); } catch { return []; }
    })(),
    is_published: false,
  }).select();

  if (error) throw new Error(error.message);

  // Revalidate EVERYTHING
  revalidatePath("/admin/products");
  revalidatePath("/collection");
  revalidatePath("/");
  
  // Return the created product ID
  return { success: true, id: data?.[0]?.id };
}
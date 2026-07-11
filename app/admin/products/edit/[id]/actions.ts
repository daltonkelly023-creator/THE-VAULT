"use server";

import { supabase } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  
  const { error } = await supabase
    .from("products")
    .update({
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      collection: formData.get("collection") as string,
      asset_type: formData.get("asset_type") as string,
      price_cents: Math.round(parseFloat((formData.get("price") as string) || "0") * 100),
      description: formData.get("description") as string,
      metal: formData.get("metal") as string,
      designer: formData.get("designer") as string,
      stone: formData.get("stone") as string,
      carat: formData.get("carat") as string,
      length: formData.get("length") as string,
      price_type: formData.get("price_type") as string,
      story: formData.get("story") as string,
      specifications: formData.get("specifications") as string,
      hero_image_path: (formData.get("hero_image_path") as string) || null,
      gallery_paths: JSON.parse((formData.get("gallery_paths") as string) || "[]"),
      is_published: formData.get("is_published") === "on",
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/piece/${id}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
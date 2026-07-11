"use server";

import { supabase } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BUCKET = "vault-assets";

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const priceDollars = parseFloat(formData.get("price") as string) || 0;
  const price_cents = Math.round(priceDollars * 100);
  const category = formData.get("category") as string;
  const collection = formData.get("collection") as string;
  const description = formData.get("description") as string;
  const metal = formData.get("metal") as string;
  const asset_type = formData.get("asset_type") as string;
  const is_published = formData.get("is_published") === "on";
  const stone = formData.get("stone") as string;
  const carat = formData.get("carat") as string;
  const story = formData.get("story") as string;
  const turntable_folder_path = formData.get("turntable_folder_path") as string;
  const model3d_path = formData.get("model3d_path") as string;

  let specifications: string[] = [];
  try {
    const specRaw = formData.get("specifications") as string;
    if (specRaw) specifications = JSON.parse(specRaw);
  } catch {
    specifications = [];
  }

  let gallery_paths: string[] = [];
  try {
    const galleryRaw = formData.get("gallery_paths") as string;
    if (galleryRaw) gallery_paths = JSON.parse(galleryRaw);
  } catch {
    gallery_paths = [];
  }

  const hero_image_path = formData.get("hero_image_path") as string;

  const { error } = await supabase

    .from("products")
    .update({
      name,
      price_cents,
      category,
      collection,
      description,
      metal,
      asset_type,
      is_published,
      stone,
      carat,
      story,
      specifications,
      turntable_folder_path,
      model3d_path,
      gallery_paths,
      hero_image_path,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Update error:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/showroom");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get("id") as string;

  const { error } = await supabase
.from("products").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/showroom");
  redirect("/admin/products");
}

export async function uploadToVault(formData: FormData) {
  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string || "products";

  if (!file) throw new Error("Missing file");

  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase
.storage
    .from(BUCKET)
    .upload(fileName, file);

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase
.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return { url: publicUrl, path: fileName };
}
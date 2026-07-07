import { supabase } from "@/lib/supabaseClient";

export type Category = "necklace" | "bracelet" | "earring" | "ring" | "watch";
export type CollectionKind = "atelier" | "terra";
export type AssetType = "parametric" | "turntable" | "model3d" | "photo_only";

/** Shape of a row in the `products` table (see supabase/migrations). */
export interface ProductRow {
  id: string;
  name: string;
  category: Category;
  collection: CollectionKind;
  price_cents: number;
  description: string | null;
  metal: string | null;
  asset_type: AssetType;
  hero_image_path: string;
  turntable_folder_path: string | null;
  model3d_path: string | null;
  stone: string | null;
  carat: string | null;
  story: string | null;
  specifications: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** View-friendly shape, close to the old static JewelryPiece so the existing
 *  presentational JSX in the collection pages barely has to change. */
export interface Piece {
  id: string;
  name: string;
  priceLabel: string; // formatted, e.g. "$4,850"
  material: string; // maps from `metal`, falls back to a neutral label
  stone: string;
  carat: string;
  story: string;
  specifications: string[];
  category: Category;
  collection: CollectionKind;
  assetType: AssetType;
  heroImageUrl: string;
  turntableFrameUrls: string[]; // empty if not a turntable piece
  model3dUrl: string | null;
}

const BUCKET = "vault-assets";

function publicAssetUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Turntable frames are uploaded to `${turntable_folder_path}000-name.jpg`,
 *  `001-name.jpg`, etc. (see app/admin/page.tsx). We list the folder rather
 *  than guessing filenames, since the original filenames vary. */
async function listTurntableFrames(folderPath: string): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(folderPath, {
    sortBy: { column: "name", order: "asc" },
  });
  if (error || !data) return [];
  return data.map((file) => publicAssetUrl(`${folderPath}${file.name}`));
}

async function rowToPiece(row: ProductRow): Promise<Piece> {
  const turntableFrameUrls =
    row.asset_type === "turntable" && row.turntable_folder_path
      ? await listTurntableFrames(row.turntable_folder_path)
      : [];

  return {
    id: row.id,
    name: row.name,
    priceLabel: formatPrice(row.price_cents),
    material: row.metal ?? "Fine metal, finish to be confirmed",
    stone: row.stone ?? "—",
    carat: row.carat ?? "—",
    story: row.story ?? "",
    specifications: row.specifications ?? [],
    category: row.category,
    collection: row.collection,
    assetType: row.asset_type,
    heroImageUrl: publicAssetUrl(row.hero_image_path),
    turntableFrameUrls,
    model3dUrl: row.model3d_path ? publicAssetUrl(row.model3d_path) : null,
  };
}

/** All published pieces, newest first. Used by the gallery grid. RLS already
 *  restricts anonymous reads to is_published = true, but we filter
 *  explicitly too so this stays correct even if RLS is ever loosened. */
export async function getPublishedPieces(): Promise<Piece[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error.message);
    return [];
  }

  return Promise.all((data as ProductRow[]).map(rowToPiece));
}

/** A single published piece by id, or null if it doesn't exist / isn't
 *  published. Used by the Private Viewing Room page. */
export async function getPublishedPieceById(id: string): Promise<Piece | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;
  return rowToPiece(data as ProductRow);
}

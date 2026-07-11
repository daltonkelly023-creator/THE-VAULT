import { supabase } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

const BUCKET = "vault-assets";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string || "products";

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase
.storage
    .from(BUCKET)
    .upload(fileName, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase
.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl, path: fileName });
}
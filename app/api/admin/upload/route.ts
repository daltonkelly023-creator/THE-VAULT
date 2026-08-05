// app/api/admin/upload/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `products/${Date.now()}.${fileExt}`;
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // 1. Upload
    const { error: uploadError } = await supabaseServer.storage
      .from("vault-assets")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 2. VERIFY the file is publicly accessible (permanent fix)
    const { data: publicUrlData } = supabaseServer.storage
      .from("vault-assets")
      .getPublicUrl(fileName);

    // Try to HEAD the file to confirm it exists
    const headRes = await fetch(publicUrlData.publicUrl, { method: "HEAD" });
    if (!headRes.ok) {
      // Rollback: delete the orphaned file
      await supabaseServer.storage.from("vault-assets").remove([fileName]);
      return NextResponse.json(
        { error: `File uploaded but not publicly accessible. Check bucket permissions.` },
        { status: 500 }
      );
    }

    return NextResponse.json({ path: fileName });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}